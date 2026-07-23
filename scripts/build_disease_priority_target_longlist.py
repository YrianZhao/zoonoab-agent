#!/usr/bin/env python3
"""Build a disease-to-target longlist for local library planning.

This script reads the 1000-disease planning longlist and enriches each disease
with:

1. The top Open Targets disease association.
2. The strongest local-covered target found in the top Open Targets rows.
3. A display-oriented target recommendation that can prefer a strong local or
   antibody-oriented target when it stays reasonably close to the disease's
   primary association signal.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import difflib
import json
import math
import random
import re
import sys
import time
import urllib.error
import urllib.request
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_INPUT = ROOT / "pdb" / "disease-priority-longlist.md"
DEFAULT_OUTPUT = ROOT / "pdb" / "disease-priority-target-longlist.md"
LOCAL_CATALOG_PATH = ROOT / "pdb" / "local-structure-catalog.json"

OPEN_TARGETS_GRAPHQL_URL = "https://api.platform.opentargets.org/api/v4/graphql"
OPEN_TARGETS_DOCS_URL = "https://platform-docs.opentargets.org/data-access/graphql-api.md"

SEARCH_QUERY = """
query diseaseSearch($q:String!, $page: Pagination) {
  search(queryString: $q, entityNames: ["disease"], page: $page) {
    hits {
      id
      name
      entity
      description
    }
  }
}
"""

DISEASE_TARGETS_QUERY = """
query diseaseTargets($id:String!, $page: Pagination) {
  disease(efoId: $id) {
    id
    name
    associatedTargets(page: $page) {
      count
      rows {
        score
        target {
          id
          approvedSymbol
          approvedName
          tractability {
            modality
            value
            label
          }
        }
      }
    }
  }
}
"""

SEARCH_OVERRIDES = {
    "Ischaemic heart disease": "myocardial ischemia",
    "Preterm birth complications": "preterm birth",
    "Birth asphyxia and birth trauma": "birth asphyxia",
    "Austism and Asperger syndrome": "autism spectrum disorder",
    "Cirrhosis due to alcohol use": "alcoholic cirrhosis",
    "Cirrhosis due to hepatitis B": "cirrhosis of liver",
    "Cirrhosis due to hepatitis C": "cirrhosis of liver",
    "Mouth and oropharynx cancers": "head and neck cancer",
    "Sickle cell disorders and trait": "sickle cell disease",
    "Malignant skin melanoma": "cutaneous melanoma",
    "Amphetamine use disorders": "methamphetamine dependence",
    "Gential Herpes": "genital herpes",
    "Gallbladder and biliary tract cancer": "gallbladder cancer",
    "Gonorrhoea": "gonorrhea",
    "Oesophagus cancer": "esophageal cancer",
    "Thalassaemias": "thalassemia",
    "Upper respiratory infections": "upper respiratory tract infection",
    "Lower respiratory infections": "lower respiratory tract infection",
    "Corpus uteri cancer": "endometrial carcinoma",
    "Diarrhoeal diseases": "diarrhea",
    "HIV/AIDS": "AIDS",
    "Neonatal sepsis and infections": "neonatal sepsis",
    "Drug use disorders": "drug misuse",
    "Alcohol use disorders": "alcohol dependence",
    "Acute hepatitis A": "hepatitis A virus infection",
    "Acute hepatitis B": "acute hepatitis B virus infection",
    "Acute hepatitis C": "hepatitis C virus infection",
    "Acute hepatitis E": "hepatitis E virus infection",
    "Intestinal infection due to other Vibrio": "vibrio infectious disease",
    "Intestinal infections due to Shigella": "shigellosis",
    "Intestinal infections due to Escherichia coli": "escherichia coli infection",
}

STRONG_AB_LABELS = {
    "Approved Drug",
    "Advanced Clinical",
    "Phase 1 Clinical",
    "UniProt loc high conf",
    "UniProt loc med conf",
    "UniProt SigP or TMHMM",
    "Human Protein Atlas loc",
}

AB_CLINICAL_LABELS = {
    "Approved Drug",
    "Advanced Clinical",
    "Phase 1 Clinical",
}

DISEASE_CANDIDATE_PENALTY_TERMS = {
    "measurement",
    "trait",
    "response",
    "status",
    "history",
    "occurrence",
    "exposure",
    "finding",
}

GENERIC_SIGNAL_TOKENS = {
    "acute",
    "and",
    "birth",
    "cancer",
    "cancers",
    "chronic",
    "complication",
    "complications",
    "condition",
    "conditions",
    "deficiency",
    "deficiencies",
    "disease",
    "diseases",
    "disorder",
    "disorders",
    "due",
    "failure",
    "infection",
    "infections",
    "infectious",
    "malignant",
    "other",
    "primary",
    "secondary",
    "specific",
    "syndrome",
    "syndromes",
    "trait",
    "tract",
    "tumor",
    "tumors",
    "tumour",
    "tumours",
    "use",
    "virus",
    "with",
    "without",
}

ONCOLOGY_TOKENS = {
    "adenocarcinoma",
    "carcinoma",
    "cancer",
    "cancers",
    "glioma",
    "leukemia",
    "lymphoma",
    "melanoma",
    "neoplasm",
    "neoplasms",
    "sarcoma",
    "tumor",
    "tumour",
}

PATHOGEN_SIGNAL_TOKENS = {
    "chlamydia",
    "cholera",
    "coli",
    "dengue",
    "gonorrhea",
    "gonorrhoea",
    "hepatitis",
    "herpes",
    "hookworm",
    "leishmaniasis",
    "malaria",
    "onchocerciasis",
    "rabies",
    "shigella",
    "syphilis",
    "trachoma",
    "tuberculosis",
    "vibrio",
    "yellow",
}

QUALIFIER_PENALTY_TERMS = {
    "familial": 0.18,
    "hereditary": 0.14,
    "susceptibility": 0.18,
}


def normalize_text(text: str) -> str:
    text = text.lower().replace("\xa0", " ")
    text = text.replace("&", " and ")
    text = text.replace("α", " alpha ")
    text = text.replace("β", " beta ")
    text = text.replace("γ", " gamma ")
    text = text.replace("δ", " delta ")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def markdown_escape(text: str) -> str:
    return text.replace("|", "\\|")


def ordered_unique(items: list[str]) -> list[str]:
    seen = set()
    result = []
    for item in items:
        item = item.strip()
        if not item or item in seen:
            continue
        seen.add(item)
        result.append(item)
    return result


def split_gene_tokens(gene: str | None) -> list[str]:
    if not gene:
        return []
    rough_parts = re.split(r"[/,;]|(?:\s+\|\s+)|(?:\s+and\s+)|(?:\s+\+\s+)", gene)
    tokens = []
    for part in rough_parts:
        part = part.strip()
        if not part:
            continue
        tokens.append(part)
        normalized = re.sub(r"\s+", "", part)
        if normalized != part:
            tokens.append(normalized)
    return tokens


def signal_tokens(text: str) -> set[str]:
    return {
        token
        for token in normalize_text(text).split()
        if len(token) >= 4 and token not in GENERIC_SIGNAL_TOKENS
    }


def parse_disease_longlist(path: Path) -> list[dict[str, object]]:
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| "):
            continue
        if line.startswith("| #") or line.startswith("| ---"):
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) < 5:
            continue
        rank = int(cells[0])
        rows.append(
            {
                "rank": rank,
                "disease": cells[1],
                "source_tier": cells[2],
                "priority_basis": cells[3],
                "reference": cells[4],
            }
        )
    return rows


def build_local_target_index(path: Path) -> tuple[dict[str, list[dict[str, str]]], dict[str, int]]:
    catalog = json.loads(path.read_text(encoding="utf-8"))
    route_presets = catalog.get("routePresets", [])
    library_assets = catalog.get("libraryAssets", [])
    index: dict[str, list[dict[str, str]]] = defaultdict(list)
    stats = {"routeable": 0, "asset_only": 0}

    def add_name(name: str, payload: dict[str, str]) -> None:
        norm = normalize_text(name)
        if not norm:
            return
        index[norm].append(payload)

    for entry in route_presets:
        if entry.get("organismTaxId") not in (None, 9606):
            continue
        status = "routeable" if entry.get("routeable") else "asset_only"
        stats[status] += 1
        payload = {
            "status": status,
            "label": entry.get("target") or entry.get("gene") or entry.get("routeId", ""),
            "routeId": entry.get("routeId", ""),
        }
        for name in [entry.get("target", ""), entry.get("gene", ""), *entry.get("aliases", [])]:
            if isinstance(name, str):
                add_name(name, payload)
        gene = entry.get("gene")
        if isinstance(gene, str):
            for token in split_gene_tokens(gene):
                add_name(token, payload)

    for entry in library_assets:
        if entry.get("organismTaxId") not in (None, 9606):
            continue
        stats["asset_only"] += 1
        payload = {
            "status": "asset_only",
            "label": entry.get("target") or entry.get("gene") or entry.get("context", ""),
            "routeId": entry.get("context", ""),
        }
        for name in [entry.get("target", ""), entry.get("gene", ""), *entry.get("aliases", [])]:
            if isinstance(name, str):
                add_name(name, payload)
        gene = entry.get("gene")
        if isinstance(gene, str):
            for token in split_gene_tokens(gene):
                add_name(token, payload)

    return index, stats


def merge_local_matches(matches: list[dict[str, str]]) -> tuple[str, list[str]]:
    if not matches:
        return "none", []
    routeable = sorted(
        {
            f"{item['label']} [{item['routeId']}]".strip()
            for item in matches
            if item["status"] == "routeable"
        }
    )
    asset_only = sorted(
        {
            f"{item['label']} [{item['routeId']}]".strip()
            for item in matches
            if item["status"] == "asset_only"
        }
    )
    if routeable:
        return "routeable", routeable + asset_only
    return "asset_only", asset_only


def lookup_local_target(
    local_index: dict[str, list[dict[str, str]]],
    approved_symbol: str,
    approved_name: str,
) -> tuple[str, list[str]]:
    raw_matches: list[dict[str, str]] = []
    for probe in (approved_symbol, approved_name):
        norm = normalize_text(probe)
        raw_matches.extend(local_index.get(norm, []))
    return merge_local_matches(raw_matches)


def similarity_score(query_text: str, hit_name: str) -> float:
    query_norm = normalize_text(query_text)
    hit_norm = normalize_text(hit_name)
    if not query_norm or not hit_norm:
        return 0.0
    if query_norm == hit_norm:
        return 10.0
    query_tokens = set(query_norm.split())
    hit_tokens = set(hit_norm.split())
    overlap = len(query_tokens & hit_tokens)
    jaccard = overlap / max(1, len(query_tokens | hit_tokens))
    seq = difflib.SequenceMatcher(None, query_norm, hit_norm).ratio()
    contains_bonus = 0.0
    if query_norm in hit_norm or hit_norm in query_norm:
        contains_bonus = 0.25
    return seq * 0.65 + jaccard * 0.35 + contains_bonus


def candidate_prefix_bonus(candidate_id: str) -> float:
    if candidate_id.startswith("MONDO_"):
        return 0.18
    if candidate_id.startswith("EFO_"):
        return 0.12
    if candidate_id.startswith("Orphanet_"):
        return 0.08
    if candidate_id.startswith("HP_"):
        return -0.05
    return 0.0


def candidate_label_penalty(candidate_name: str, disease_name: str) -> float:
    name_norm = normalize_text(candidate_name)
    disease_norm = normalize_text(disease_name)
    penalty = 0.0
    for term in DISEASE_CANDIDATE_PENALTY_TERMS:
        if term in name_norm:
            penalty += 0.15
    for term, value in QUALIFIER_PENALTY_TERMS.items():
        if term in name_norm and term not in disease_norm:
            penalty += value
    return penalty


def candidate_signal_penalty(
    disease_name: str,
    search_query: str,
    candidate_name: str,
) -> float:
    query_tokens = signal_tokens(disease_name) | signal_tokens(search_query)
    candidate_tokens = signal_tokens(candidate_name)
    if not query_tokens or not candidate_tokens:
        return 0.0

    penalty = 0.0
    if not (query_tokens & candidate_tokens):
        penalty += 0.22

    if (query_tokens & ONCOLOGY_TOKENS) and not (candidate_tokens & ONCOLOGY_TOKENS):
        penalty += 0.35

    query_pathogens = query_tokens & PATHOGEN_SIGNAL_TOKENS
    candidate_pathogens = candidate_tokens & PATHOGEN_SIGNAL_TOKENS
    if query_pathogens and not (query_pathogens & candidate_tokens):
        penalty += 0.22
        if candidate_pathogens and not (query_pathogens & candidate_pathogens):
            penalty += 0.18

    return penalty


def generate_search_queries(disease_name: str) -> list[str]:
    queries = []
    override = SEARCH_OVERRIDES.get(disease_name)
    if override:
        queries.append(override)
    queries.append(disease_name)

    base = disease_name
    normalized_substitutions = [
        (" disorders", " disorder"),
        (" diseases", " disease"),
        (" cancers", " cancer"),
        (" conditions", " condition"),
        (" anomalies", " anomaly"),
        (" infections", " infection"),
        (" syndromes", " syndrome"),
    ]
    for old, new in normalized_substitutions:
        if old in base:
            queries.append(base.replace(old, new))

    # Trim explanatory tails that often prevent ontology lookup.
    for separator in [
        " due to ",
        " associated with ",
        " specific to ",
        " with ",
        " without ",
        " excluding ",
        " from ",
    ]:
        if separator in base.lower():
            left = re.split(separator, base, flags=re.IGNORECASE)[0].strip()
            if left:
                queries.append(left)

    # Probe individual components for composite disease groups.
    fragments = re.split(r",|/|;|\band\b|\bor\b", base, flags=re.IGNORECASE)
    for fragment in fragments:
        fragment = fragment.strip()
        if len(fragment) >= 4:
            queries.append(fragment)

    # Try dropping common intensity qualifiers.
    stripped = re.sub(
        r"\b(acute|chronic|primary|secondary|other|recurrent|idiopathic|syndromic)\b",
        "",
        base,
        flags=re.IGNORECASE,
    )
    stripped = re.sub(r"\s+", " ", stripped).strip(" ,;/")
    if stripped and stripped != base:
        queries.append(stripped)

    return ordered_unique(queries)


def graphql_post(query: str, variables: dict[str, object]) -> dict[str, object]:
    payload = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    last_error: Exception | None = None
    for attempt in range(4):
        req = urllib.request.Request(
            OPEN_TARGETS_GRAPHQL_URL,
            data=payload,
            headers={
                "content-type": "application/json",
                "user-agent": "zoonoab-disease-target-planner/1.0",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            if "errors" in data:
                raise RuntimeError(json.dumps(data["errors"], ensure_ascii=False))
            return data["data"]
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, RuntimeError) as err:
            last_error = err
            backoff = (2**attempt) * 0.6 + random.random() * 0.2
            time.sleep(backoff)
    raise RuntimeError(f"Open Targets request failed after retries: {last_error}")


def search_disease_candidates(disease_name: str) -> list[dict[str, str]]:
    candidates = []
    seen_ids = set()
    for query_text in generate_search_queries(disease_name):
        data = graphql_post(
            SEARCH_QUERY,
            {
                "q": query_text,
                "page": {"index": 0, "size": 8},
            },
        )
        hits = data["search"]["hits"]
        for hit in hits:
            if hit.get("entity") != "disease":
                continue
            hit_id = hit.get("id", "")
            if hit_id in seen_ids:
                continue
            seen_ids.add(hit_id)
            candidates.append(
                {
                    "id": hit_id,
                    "name": hit.get("name", ""),
                    "description": hit.get("description", ""),
                    "query": query_text,
                }
            )
    return candidates


def choose_disease_hit(disease_name: str, candidates: list[dict[str, str]]) -> tuple[dict[str, str] | None, str, float]:
    if not candidates:
        return None, "unresolved", 0.0
    search_query = SEARCH_OVERRIDES.get(disease_name, disease_name)
    scored = []
    for candidate in candidates:
        score = max(
            similarity_score(disease_name, candidate["name"]),
            similarity_score(search_query, candidate["name"]),
        )
        score += candidate_prefix_bonus(candidate["id"])
        score -= candidate_label_penalty(candidate["name"], disease_name)
        score -= candidate_signal_penalty(disease_name, search_query, candidate["name"])
        scored.append((score, candidate))
    scored.sort(key=lambda item: item[0], reverse=True)
    best_score, best_candidate = scored[0]
    if similarity_score(search_query, best_candidate["name"]) >= 9.5:
        return best_candidate, "exact", best_score
    if best_score >= 0.42:
        return best_candidate, "fuzzy", best_score
    return None, "unresolved", best_score


def disease_targets(disease_id: str, page_size: int) -> list[dict[str, object]]:
    data = graphql_post(
        DISEASE_TARGETS_QUERY,
        {
            "id": disease_id,
            "page": {"index": 0, "size": page_size},
        },
    )
    disease = data.get("disease")
    if not disease:
        return []
    return disease["associatedTargets"]["rows"]


def summarize_ab_tractability(tractability: list[dict[str, object]]) -> tuple[bool, bool, list[str]]:
    positive_labels = sorted(
        {
            item["label"]
            for item in tractability
            if item.get("modality") == "AB" and item.get("value") is True
        }
    )
    strong = any(label in STRONG_AB_LABELS for label in positive_labels)
    clinical = any(label in AB_CLINICAL_LABELS for label in positive_labels)
    return strong, clinical, positive_labels


def annotate_targets(
    rows: list[dict[str, object]],
    local_index: dict[str, list[dict[str, str]]],
) -> list[dict[str, object]]:
    annotated = []
    for row in rows:
        target = row.get("target") or {}
        approved_symbol = target.get("approvedSymbol", "")
        approved_name = target.get("approvedName", "")
        local_status, local_matches = lookup_local_target(local_index, approved_symbol, approved_name)
        ab_strong, ab_clinical, ab_labels = summarize_ab_tractability(target.get("tractability", []))
        annotated.append(
            {
                "score": float(row.get("score") or 0.0),
                "approvedSymbol": approved_symbol,
                "approvedName": approved_name,
                "localStatus": local_status,
                "localMatches": local_matches,
                "abStrong": ab_strong,
                "abClinical": ab_clinical,
                "abLabels": ab_labels,
            }
        )
    return annotated


def pick_recommended_display_target(rows: list[dict[str, object]]) -> tuple[dict[str, object] | None, str]:
    if not rows:
        return None, "no_target_rows"
    primary = rows[0]
    top_score = primary["score"]

    def score_gap_ok(candidate_score: float, max_gap: float, min_ratio: float) -> bool:
        if top_score < 0.35 or candidate_score < 0.40:
            return False
        return candidate_score >= max(top_score - max_gap, top_score * min_ratio)

    if primary["localStatus"] != "none":
        return primary, "primary_already_local"

    local_routeable = [
        row for row in rows
        if row["localStatus"] == "routeable" and score_gap_ok(row["score"], 0.12, 0.80)
    ]
    if local_routeable:
        return local_routeable[0], "switched_to_local_routeable"

    local_asset = [
        row for row in rows
        if row["localStatus"] == "asset_only" and score_gap_ok(row["score"], 0.10, 0.85)
    ]
    if local_asset:
        return local_asset[0], "switched_to_local_asset"

    return primary, "fallback_primary"


def format_target_cell(row: dict[str, object] | None) -> str:
    if not row:
        return "needs_review"
    return f"{row['approvedSymbol']} ({row['approvedName']})"


def summarize_local_matches(matches: list[str], limit: int = 3) -> str:
    if not matches:
        return "-"
    shown = matches[:limit]
    suffix = ""
    if len(matches) > limit:
        suffix = f" +{len(matches) - limit} more"
    return "; ".join(shown) + suffix


def render_markdown(
    input_path: Path,
    output_path: Path,
    rows: list[dict[str, object]],
    results: list[dict[str, object]],
    local_stats: dict[str, int],
) -> str:
    exact_matches = sum(1 for item in results if item["matchStatus"] == "exact")
    fuzzy_matches = sum(1 for item in results if item["matchStatus"] == "fuzzy")
    unresolved = sum(1 for item in results if item["matchStatus"] == "unresolved")
    local_routeable = sum(1 for item in results if item["recommendedLocalStatus"] == "routeable")
    local_asset = sum(1 for item in results if item["recommendedLocalStatus"] == "asset_only")
    no_local = sum(1 for item in results if item["recommendedLocalStatus"] == "none")

    lines = [
        "# Disease Priority Target Longlist",
        "",
        "用于把疾病优先级长名单接到“逐病种选主靶点”和“本地结构库复用/补库”流程上。",
        "该文件不是 route-backed 结构库真源，也不会自动改动现有本地 PDB 路由。",
        "",
        "## Method",
        "",
        f"- Disease input: [{input_path.name}]({input_path.name})",
        "- Disease-to-target evidence source: Open Targets Platform GraphQL API.",
        "- Primary target: the top Open Targets disease association returned for the matched disease entity.",
        "- Best local-covered target: the strongest target among the queried Open Targets rows that already matches the local structure catalog by target name, gene symbol, or alias.",
        "- Recommended display target: stays with the Open Targets primary target by default, and only switches when a strong human local-covered target remains reasonably close to the disease's top evidence signal.",
        "- Local status values: `routeable` means a prepared route-backed local target already exists; `asset_only` means local structure assets exist but are not yet a fully prepared route; `none` means no current local target match was found.",
        "- Match status values: `exact` means the disease name matched the Open Targets disease name directly after normalization; `fuzzy` means the best available ontology hit was selected by string similarity; `unresolved` means no reliable disease hit was accepted automatically.",
        "",
        "## Sources",
        "",
        f"- Open Targets GraphQL API docs: [{OPEN_TARGETS_DOCS_URL}]({OPEN_TARGETS_DOCS_URL})",
        f"- Open Targets GraphQL endpoint: [{OPEN_TARGETS_GRAPHQL_URL}]({OPEN_TARGETS_GRAPHQL_URL})",
        "",
        "## Summary",
        "",
        f"- Input diseases: {len(rows)}",
        f"- Open Targets disease matches: exact `{exact_matches}`, fuzzy `{fuzzy_matches}`, unresolved `{unresolved}`",
        f"- Recommended display target local coverage: routeable `{local_routeable}`, asset_only `{local_asset}`, none `{no_local}`",
        f"- Local catalog entries scanned: routeable `{local_stats['routeable']}`, asset_only `{local_stats['asset_only']}`",
        "",
        f"## Longlist ({len(results)} items)",
        "",
        "| # | Disease | Match status | Open Targets disease | Primary OT target | Best local-covered target | Recommended display target | Recommended local status | Local matches | Decision |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ]

    for item in results:
        lines.append(
            "| "
            + " | ".join(
                [
                    str(item["rank"]),
                    markdown_escape(item["disease"]),
                    item["matchStatus"],
                    markdown_escape(item["matchedDiseaseLabel"]),
                    markdown_escape(item["primaryTargetLabel"]),
                    markdown_escape(item["bestLocalTargetLabel"]),
                    markdown_escape(item["recommendedTargetLabel"]),
                    item["recommendedLocalStatus"],
                    markdown_escape(item["localMatchSummary"]),
                    markdown_escape(item["decision"]),
                ]
            )
            + " |"
        )

    return "\n".join(lines) + "\n"


def process_disease_row(
    row: dict[str, object],
    local_index: dict[str, list[dict[str, str]]],
    target_page_size: int,
) -> dict[str, object]:
    disease_name = str(row["disease"])
    candidates = search_disease_candidates(disease_name)
    matched_hit, match_status, match_score = choose_disease_hit(disease_name, candidates)
    if not matched_hit:
        return {
            "rank": row["rank"],
            "disease": disease_name,
            "matchStatus": "unresolved",
            "matchedDiseaseLabel": "needs_review",
            "primaryTargetLabel": "needs_review",
            "bestLocalTargetLabel": "-",
            "recommendedTargetLabel": "needs_review",
            "recommendedLocalStatus": "none",
            "localMatchSummary": "-",
            "decision": f"unresolved_search_match (score={match_score:.2f})",
        }

    targets = annotate_targets(disease_targets(matched_hit["id"], target_page_size), local_index)
    if not targets:
        return {
            "rank": row["rank"],
            "disease": disease_name,
            "matchStatus": match_status,
            "matchedDiseaseLabel": f"{matched_hit['name']} [{matched_hit['id']}]",
            "primaryTargetLabel": "needs_review",
            "bestLocalTargetLabel": "-",
            "recommendedTargetLabel": "needs_review",
            "recommendedLocalStatus": "none",
            "localMatchSummary": "-",
            "decision": "matched_disease_but_no_target_rows",
        }

    primary = targets[0]
    local_candidates = [
        target
        for target in targets
        if target["localStatus"] != "none"
        and target["score"] >= max(0.05, primary["score"] * 0.15)
    ]
    best_local = local_candidates[0] if local_candidates else None
    recommended, decision = pick_recommended_display_target(targets)
    if best_local and decision == "fallback_primary" and recommended == primary:
        decision = "fallback_primary_local_candidate_preserved"
    return {
        "rank": row["rank"],
        "disease": disease_name,
        "matchStatus": match_status,
        "matchedDiseaseLabel": f"{matched_hit['name']} [{matched_hit['id']}]",
        "primaryTargetLabel": f"{format_target_cell(primary)} · score {primary['score']:.3f}",
        "bestLocalTargetLabel": (
            f"{format_target_cell(best_local)} · score {best_local['score']:.3f}"
            if best_local
            else "-"
        ),
        "recommendedTargetLabel": (
            f"{format_target_cell(recommended)} · score {recommended['score']:.3f}"
            if recommended
            else "needs_review"
        ),
        "recommendedLocalStatus": recommended["localStatus"] if recommended else "none",
        "localMatchSummary": summarize_local_matches(best_local["localMatches"] if best_local else []),
        "decision": decision,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--limit", type=int, default=1000)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--target-page-size", type=int, default=40)
    args = parser.parse_args()

    if args.limit <= 0:
        raise SystemExit("--limit must be positive")
    if args.workers <= 0:
        raise SystemExit("--workers must be positive")
    if args.target_page_size <= 0:
        raise SystemExit("--target-page-size must be positive")

    diseases = parse_disease_longlist(args.input)[: args.limit]
    local_index, local_stats = build_local_target_index(LOCAL_CATALOG_PATH)

    results: list[dict[str, object]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        future_map = {
            executor.submit(process_disease_row, disease, local_index, args.target_page_size): disease
            for disease in diseases
        }
        completed = 0
        total = len(future_map)
        for future in concurrent.futures.as_completed(future_map):
            disease = future_map[future]
            completed += 1
            try:
                result = future.result()
            except Exception as err:  # pragma: no cover - surfaced in CLI output
                result = {
                    "rank": disease["rank"],
                    "disease": disease["disease"],
                    "matchStatus": "unresolved",
                    "matchedDiseaseLabel": "needs_review",
                    "primaryTargetLabel": "needs_review",
                    "bestLocalTargetLabel": "-",
                    "recommendedTargetLabel": "needs_review",
                    "recommendedLocalStatus": "none",
                    "localMatchSummary": "-",
                    "decision": f"processing_error: {err}",
                }
            results.append(result)
            if completed % 25 == 0 or completed == total:
                print(f"[progress] {completed}/{total}", file=sys.stderr)

    results.sort(key=lambda item: int(item["rank"]))
    content = render_markdown(args.input, args.output, diseases, results, local_stats)
    args.output.write_text(content, encoding="utf-8")
    print(f"Wrote {len(results)} entries to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
