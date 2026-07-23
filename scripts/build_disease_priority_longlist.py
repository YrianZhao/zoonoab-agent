#!/usr/bin/env python3
"""Build a disease-priority markdown longlist for target scouting.

This planning artifact is intentionally separate from the route-backed local
structure catalog. It combines:

1. WHO Global Health Estimates 2021 DALY rankings for a burden-ranked core.
2. WHO ICD-11 MMS simple tabulation for a disease-term expansion layer.

The output is a 1000-item Markdown longlist that can be used for later
target-selection work.
"""

from __future__ import annotations

import argparse
import csv
import io
import re
import tempfile
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT = ROOT / "pdb" / "disease-priority-longlist.md"

WHO_GHE_DALY_GLOBAL_URL = (
    "https://cdn.who.int/media/docs/default-source/gho-documents/"
    "global-health-estimates/ghe2021_daly_global_new.xlsx?sfvrsn=cbefe871_3"
)
ICD11_SIMPLE_TABULATION_URL = (
    "https://icdcdn.who.int/static/releasefiles/2025-01/"
    "SimpleTabulation-ICD-11-MMS-en.zip"
)

NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


WHO_CORE_LOCAL_COVERAGE_KEYWORDS = [
    "covid-19",
    "diabetes",
    "diabetes mellitus",
    "type 1 diabetes",
    "type 2 diabetes",
    "obesity",
    "depressive disorders",
    "attention deficit/hyperactivity",
    "trachea, bronchus, lung cancers",
    "lung cancer",
    "small-cell lung cancer",
    "colon and rectum cancers",
    "colorectal",
    "breast cancer",
    "stomach cancer",
    "gastric cancer",
    "pancreas cancer",
    "pancreatic cancer",
    "ovary cancer",
    "ovarian cancer",
    "cervix uteri cancer",
    "cervical cancer",
    "prostate cancer",
    "multiple myeloma",
    "lymphoma",
    "leukaemia",
    "leukemia",
    "alzheimer disease",
    "parkinson disease",
    "asthma",
    "migraine",
    "osteoarthritis",
    "liver cancer",
    "hepatocellular",
    "kidney cancer",
    "renal cell carcinoma",
    "bladder cancer",
    "urothelial cancer",
    "inflammatory bowel disease",
    "crohn",
    "ulcerative colitis",
    "lupus",
    "sle",
    "mesothelioma",
    "graves disease",
    "thyroid eye disease",
    "myasthenia gravis",
]

WHO_CORE_BROAD_EXCLUDES = {
    "Communicable, maternal, perinatal and nutritional conditions",
    "Infectious and parasitic diseases",
    "Respiratory Infectious",
    "Neonatal conditions",
    "Mental and substance use disorders",
    "Musculoskeletal diseases",
    "Neurological conditions",
    "Respiratory diseases",
    "Digestive diseases",
    "Genitourinary diseases",
    "Sense organ diseases",
    "Endocrine, blood, immune disorders",
    "Skin diseases",
    "Oral conditions",
    "Intentional injuries",
    "Unintentional injuries",
    "Injuries",
    "Noncommunicable diseases",
    "Cardiovascular diseases",
    "Malignant neoplasms",
    "Congenital anomalies",
    "Other circulatory diseases",
    "Other musculoskeletal disorders",
    "Other malignant neoplasms",
    "Other neonatal conditions",
    "Other infectious diseases",
    "Other respiratory diseases",
    "Other urinary diseases",
    "Other mental and behavioural disorders",
    "Other oral disorders",
    "Other COVID-19 pandemic-related outcomes",
    "Kidney diseases",
}

WHO_CORE_TITLE_EXCLUDES = {
    "Back and neck pain",
    "Chronic kidney disease due to diabetes",
    "Parasitic and vector diseases",
    "Nutritional deficiencies",
    "Periodontal disease",
    "Other hearing loss",
    "Falls",
    "Gynecological diseases",
    "Uncorrected refractive errors",
    "Other digestive diseases",
    "Maternal conditions",
    "Childhood-cluster diseases",
    "Other endocrine, blood and immune disorders",
    "Edentulism",
    "Fire, heat and hot substances",
    "Gallbladder and biliary diseases",
    "STDs excluding HIV",
    "Childhood behavioural disorders",
    "Lip and oral cavity",
    "Nasopharynx",
    "Dental caries",
    "Benign prostatic hyperplasia",
    "Other vision loss",
    "Infertility",
    "Hepatitis",
    "Non-migrane headache",
    "Other nutritional deficiencies",
    "Other STDs",
}

WHO_CORE_NON_DISEASE_KEYWORDS = [
    "injury",
    "poisoning",
    "burn",
    "exposure to ",
    "self-harm",
    "violence",
    "drowning",
    " falls",
    "fall ",
    "transport accident",
    "legal intervention",
    "disaster",
    "other unintentional injuries",
    "other hearing loss",
    "uncorrected refractive errors",
]

ICD_LOCAL_COVERAGE_KEYWORDS = [
    "diabetes",
    "pancreatic cancer",
    "pancreas cancer",
    "stomach cancer",
    "gastric cancer",
    "gastro-oesophageal",
    "gastroesophageal",
    "ovarian cancer",
    "ovary cancer",
    "breast cancer",
    "lung cancer",
    "trachea, bronchus, lung",
    "colorectal",
    "colon and rectum cancer",
    "cervix uteri cancer",
    "cervical cancer",
    "prostate cancer",
    "multiple myeloma",
    "myeloma",
    "lymphoma",
    "leukaemia",
    "leukemia",
    "alzheimer",
    "parkinson",
    "asthma",
    "migraine",
    "osteoarthritis",
    "depressive disorder",
    "depressive disorders",
    "attention deficit hyperactivity disorder",
    "psoriasis",
    "crohn",
    "ulcerative colitis",
    "lupus",
    "neuromyelitis",
    "nmosd",
    "hepatocellular",
    "liver cancer",
    "renal cell carcinoma",
    "kidney cancer",
    "bladder cancer",
    "urothelial cancer",
    "mesothelioma",
    "type 1 diabetes",
    "type 2 diabetes",
    "diabetes mellitus",
    "obesity",
    "graves disease",
    "thyroid eye disease",
    "myasthenia gravis",
    "acute myeloid leukemia",
    "acute myeloid leukaemia",
    "acute lymphoblastic leukemia",
    "acute lymphoblastic leukaemia",
    "b-cell malignancy",
    "b cell malignancy",
    "neuroblastoma",
]

ICD_NON_DISEASE_KEYWORDS = [
    "injury",
    "poisoning",
    "burn",
    "exposure to ",
    "self-harm",
    "violence",
    "drowning",
    "transport accident",
    "legal intervention",
    "disaster",
    "fracture",
    "sprain",
    "dislocation",
    "malfunction",
    "prosthesis",
    "prosthetic",
    "aftercare",
    "status post",
]

ICD_TITLE_EXCLUDES = [
    "other forms of ",
    "other specified ",
    "without specification",
    "without specification of",
    "other diseases of ",
    "other disorders of ",
    "not elsewhere classified",
    "due to unknown or unspecified agent",
    "miscellaneous specified",
]

ICD_GENERIC_PREFIX_EXCLUDES = [
    "other ",
    "certain specified ",
    "miscellaneous specified ",
    "fetus or newborn affected ",
    "diseases of ",
    "disorders of ",
    "inflammatory disorders of ",
    "complications following ",
    "aetiological considerations in ",
    "movement disorders of ",
    "acquired deformities of ",
]

ICD_GENERIC_CONTAINS_EXCLUDES = [
    " unspecified",
    " not elsewhere classified",
    " due to unknown or unspecified agent",
    " dysfunction",
    " support",
    " supporting structures",
    " edentulous",
    " prosthesis",
    " prosthetic",
    " bearing surface",
    " current complications",
    " following acute myocardial infarction",
    " following abortion",
    " related to present pregnancy",
    " transmitted via placenta",
]

ICD_ORAL_DENTAL_KEYWORDS = [
    "oral",
    "orofacial",
    "teeth",
    "tooth",
    "dental",
    "periodontal",
    "gingiva",
    "gingival",
    "edentulous",
    "tongue",
    "salivary",
    "jaw",
    "lips",
    "lip",
]

ICD_LOW_VALUE_CLINICAL_KEYWORDS = [
    "hypotension",
    "developmental ",
    "dentofacial",
    "anatomical alterations",
    "deviated nasal septum",
    "hypertrophy of nasal turbinates",
    "cyst or mucocele",
    "abscess of ",
    "cellulitis of ",
    "vulvitis",
    "vaginitis",
    "cervicitis",
    "pelvic inflammatory",
    "otitis externa",
    "eyelash",
    "papular",
    "acrodermatitis",
    "pityriasis rosea",
    "keratitis",
    "foodborne ",
    "intoxication",
    "hypersecretion",
    "increased secretion",
    "abnormal secretion",
    "resistance to thyroid hormone",
    "intermediate hyperglycaemia",
    "hypoglycaemia",
    "silent sinus syndrome",
    "columnar metaplastic epithelium",
    "tonsils or adenoids",
    "eyeball",
    "orbital ",
    "otomycosis",
    "perichondritis",
    "congenital malposition of eyelids",
    "acquired malposition of eyelid",
    "infectious disorders of eyelid",
    "inflammatory disorders of eyelid",
]

ICD_EXCLUDED_CHAPTERS = {"17", "18", "19", "20", "21", "22", "23", "24"}

ICD_CHAPTER_NAMES = {
    "01": "Certain infectious or parasitic diseases",
    "02": "Neoplasms",
    "03": "Diseases of the blood or blood-forming organs",
    "04": "Diseases of the immune system",
    "05": "Endocrine, nutritional or metabolic diseases",
    "06": "Mental, behavioural or neurodevelopmental disorders",
    "07": "Sleep-wake disorders",
    "08": "Diseases of the nervous system",
    "09": "Diseases of the visual system",
    "10": "Diseases of the ear or mastoid process",
    "11": "Diseases of the circulatory system",
    "12": "Diseases of the respiratory system",
    "13": "Diseases of the digestive system",
    "14": "Diseases of the skin",
    "15": "Diseases of the musculoskeletal system or connective tissue",
    "16": "Diseases of the genitourinary system",
    "17": "Conditions related to sexual health",
    "18": "Pregnancy, childbirth or the puerperium",
    "19": "Certain conditions originating in the perinatal period",
    "20": "Developmental anomalies",
}

# Weighted chapter order to keep the extension layer broad while still biasing
# toward high-burden domains.
ICD_WEIGHTED_SCHEDULE = (
    ["01"] * 4
    + ["11"] * 3
    + ["05"] * 2
    + ["06"] * 2
    + ["15"] * 2
    + ["12"] * 2
    + ["08"] * 2
    + ["13"] * 2
    + ["02"] * 2
    + ["03"]
    + ["04"]
    + ["14"]
)


def fetch_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def xlsx_column(ref: str) -> int:
    match = re.match(r"([A-Z]+)", ref)
    if not match:
        return 0
    value = 0
    for char in match.group(1):
        value = value * 26 + ord(char) - 64
    return value


def read_xlsx_sheet(xlsx_bytes: bytes, sheet_target: str) -> list[list[str]]:
    with zipfile.ZipFile(io.BytesIO(xlsx_bytes)) as zf:
        shared_strings = []
        if "xl/sharedStrings.xml" in zf.namelist():
            root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
            for si in root.findall("a:si", NS):
                shared_strings.append("".join(t.text or "" for t in si.iterfind(".//a:t", NS)))

        sheet_root = ET.fromstring(zf.read(sheet_target))
        rows: list[list[str]] = []
        for row in sheet_root.findall(".//a:sheetData/a:row", NS):
            values: dict[int, str] = {}
            for cell in row.findall("a:c", NS):
                ref = cell.attrib.get("r", "")
                cell_type = cell.attrib.get("t")
                value_node = cell.find("a:v", NS)
                if value_node is None:
                    inline = cell.find("a:is", NS)
                    if inline is not None:
                        values[xlsx_column(ref)] = "".join(
                            t.text or "" for t in inline.iterfind(".//a:t", NS)
                        )
                    continue
                value = value_node.text or ""
                if cell_type == "s":
                    value = shared_strings[int(value)]
                values[xlsx_column(ref)] = value
            max_col = max(values) if values else 0
            rows.append([values.get(i, "") for i in range(1, max_col + 1)])
        return rows


def clean_title(title: str) -> str:
    title = title.strip().strip('"').replace("\xa0", " ")
    title = re.sub(r"^(?:-\s*)+", "", title)
    title = re.sub(r"\s+", " ", title)
    return title.strip()


def normalize_name(text: str) -> str:
    text = text.lower().replace("\xa0", " ")
    text = text.replace("&", "and")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def has_any_keyword(text: str, keywords: list[str]) -> bool:
    normalized = normalize_name(text)
    return any(normalize_name(keyword) in normalized for keyword in keywords)


def matches_exact_title(text: str, titles: set[str]) -> bool:
    normalized = normalize_name(text)
    return normalized in {normalize_name(title) for title in titles}


def starts_with_any(text: str, prefixes: list[str]) -> bool:
    normalized = normalize_name(text)
    return any(normalized.startswith(normalize_name(prefix)) for prefix in prefixes)


def natural_code_key(code: str) -> list[object]:
    parts = re.split(r"([0-9]+)", code)
    key: list[object] = []
    for part in parts:
        if part.isdigit():
            key.append(int(part))
        else:
            key.append(part)
    return key


def build_who_core(ghe_bytes: bytes) -> list[dict[str, str]]:
    rows = read_xlsx_sheet(ghe_bytes, "xl/worksheets/sheet3.xml")
    extracted = []
    for row in rows:
        if not row or not row[0].isdigit():
            continue
        levels = row[1:6]
        name = ""
        for cell in reversed(levels):
            if cell:
                name = clean_title(cell)
                break
        if (
            not name
            or name == "All Causes"
            or matches_exact_title(name, WHO_CORE_BROAD_EXCLUDES)
            or matches_exact_title(name, WHO_CORE_TITLE_EXCLUDES)
        ):
            continue
        if starts_with_any(name, ["other "]):
            continue
        if has_any_keyword(name, WHO_CORE_LOCAL_COVERAGE_KEYWORDS):
            continue
        if has_any_keyword(name, WHO_CORE_NON_DISEASE_KEYWORDS):
            continue
        try:
            dalys = float(row[6])
        except (IndexError, ValueError):
            continue
        extracted.append({"name": name, "dalys": dalys})

    extracted.sort(key=lambda item: item["dalys"], reverse=True)

    result = []
    seen = set()
    for item in extracted:
        norm = normalize_name(item["name"])
        if norm in seen:
            continue
        seen.add(norm)
        result.append(
            {
                "name": item["name"],
                "source_tier": "WHO GHE 2021 core",
                "priority_basis": "Exact global DALY ordering",
                "reference": "WHO GHE 2021",
            }
        )
    return result


def build_icd_extension(
    icd_zip_bytes: bytes, existing_names: set[str], target_count: int
) -> list[dict[str, str]]:
    with zipfile.ZipFile(io.BytesIO(icd_zip_bytes)) as zf:
        text = zf.read("SimpleTabulation-ICD-11-MMS-en.txt").decode("utf-8", "ignore")

    reader = csv.DictReader(io.StringIO(text), delimiter="\t")
    chapter_rows: dict[str, list[tuple[str, str]]] = defaultdict(list)

    for row in reader:
        title = clean_title(row["Title"])
        code = (row["Code"] or "").strip()
        chapter = (row["ChapterNo"] or "").strip()
        if not title or not code:
            continue
        if row["ClassKind"] != "category":
            continue
        if row["Primary tabulation"] != "True":
            continue
        if row["IsResidual"] == "True":
            continue
        if chapter in ICD_EXCLUDED_CHAPTERS:
            continue
        if code.endswith((".Y", ".Z")):
            continue
        if int(row["DepthInKind"]) != 1:
            continue

        low = title.lower()
        if starts_with_any(title, ICD_GENERIC_PREFIX_EXCLUDES):
            continue
        if has_any_keyword(title, ICD_GENERIC_CONTAINS_EXCLUDES):
            continue
        if has_any_keyword(title, ICD_TITLE_EXCLUDES):
            continue
        if has_any_keyword(title, ICD_LOCAL_COVERAGE_KEYWORDS):
            continue
        if has_any_keyword(title, ICD_NON_DISEASE_KEYWORDS):
            continue
        if has_any_keyword(title, ICD_ORAL_DENTAL_KEYWORDS):
            continue
        if has_any_keyword(title, ICD_LOW_VALUE_CLINICAL_KEYWORDS):
            continue

        norm = normalize_name(title)
        if norm in existing_names:
            continue

        chapter_rows[chapter].append((code, title))
        existing_names.add(norm)

    for chapter in chapter_rows:
        chapter_rows[chapter].sort(key=lambda item: natural_code_key(item[0]))

    indices = defaultdict(int)
    result = []
    while len(result) < target_count:
        progressed = False
        for chapter in ICD_WEIGHTED_SCHEDULE:
            idx = indices[chapter]
            if idx >= len(chapter_rows.get(chapter, [])):
                continue
            code, title = chapter_rows[chapter][idx]
            indices[chapter] += 1
            progressed = True
            result.append(
                {
                    "name": title,
                    "source_tier": "WHO ICD-11 extension",
                    "priority_basis": (
                        "Weighted extension after WHO core · "
                        f"{ICD_CHAPTER_NAMES.get(chapter, chapter)}"
                    ),
                    "reference": f"ICD-11 {code}",
                }
            )
            if len(result) >= target_count:
                break
        if not progressed:
            break

    if len(result) < target_count:
        raise RuntimeError(
            f"ICD extension pool exhausted at {len(result)} items; "
            f"needed {target_count}."
        )

    return result


def render_markdown(entries: list[dict[str, str]]) -> str:
    lines = [
        "# Disease Priority Longlist",
        "",
        "用于后续逐病种选择一个主靶点的工作底稿。该文件不是 route-backed 结构库真源，"
        "也不会自动改变现有本地 PDB 路由。",
        "",
        "## Method",
        "",
        "- Core layer: WHO Global Health Estimates 2021 global DALYs, using disease-like causes that can be ranked directly by burden.",
        "- Extension layer: WHO ICD-11 MMS 2025-01 simple tabulation, expanded under major disease chapters to reach 1000 entries after removing overly broad buckets, injuries, perinatal or pregnancy bookkeeping rows, oral or device-related rows, and other poor target-scouting terms.",
        "- Local-coverage filter: obvious diseases already covered by the current local disease directions were excluded from this list so later target-search work can focus on gaps first.",
        "- Ranking note: the WHO GHE core keeps exact burden order; the ICD-11 extension is a curated follow-up backlog rather than a literal global incidence ranking across all remaining diseases.",
        "- Granularity control: ICD-11 expansion is limited to depth-1 disease categories to avoid over-fragmented complication or manifestation rows.",
        "",
        "## Sources",
        "",
        f"- WHO GHE 2021 DALY workbook: [{WHO_GHE_DALY_GLOBAL_URL}]({WHO_GHE_DALY_GLOBAL_URL})",
        f"- WHO ICD-11 MMS simple tabulation 2025-01: [{ICD11_SIMPLE_TABULATION_URL}]({ICD11_SIMPLE_TABULATION_URL})",
        "- WHO ICD landing page: [International Classification of Diseases (ICD)](https://www.who.int/standards/classifications/classification-of-diseases)",
        "",
        f"## Longlist ({len(entries)} items)",
        "",
        "| # | Disease | Source tier | Priority basis | Reference |",
        "| --- | --- | --- | --- | --- |",
    ]

    for idx, entry in enumerate(entries, start=1):
        disease = entry["name"].replace("|", "\\|")
        lines.append(
            f"| {idx} | {disease} | {entry['source_tier']} | "
            f"{entry['priority_basis']} | {entry['reference']} |"
        )

    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=1000)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    if args.limit <= 0:
        raise SystemExit("--limit must be positive")

    ghe_bytes = fetch_bytes(WHO_GHE_DALY_GLOBAL_URL)
    icd_zip_bytes = fetch_bytes(ICD11_SIMPLE_TABULATION_URL)

    core = build_who_core(ghe_bytes)
    if len(core) >= args.limit:
        entries = core[: args.limit]
    else:
        extension = build_icd_extension(
            icd_zip_bytes,
            existing_names={normalize_name(item["name"]) for item in core},
            target_count=args.limit - len(core),
        )
        entries = core + extension

    content = render_markdown(entries)
    args.output.write_text(content, encoding="utf-8")
    print(f"Wrote {len(entries)} entries to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
