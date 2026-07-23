# Antigen-Only Sweep Batch 035

Scope: disease ranks `661-680`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 661 | Non-pyogenic bacterial infections of the skin | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 662 | Toxic shock syndrome | CACNA1G | 6KZO | exact_public_antigen | downloaded | Added human CACNA1G calcium channel structure from RCSB PDB. |
| 663 | Human immunodeficiency virus disease associated with tuberculosis | NR3C1 | 4P6X | reused_target | reused | Existing human NR3C1 antigen file already present in this folder. |
| 664 | Asymptomatic stenosis of intracranial or extracranial artery | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 665 | Asymptomatic occlusion of intracranial or extracranial artery | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 666 | Superficial thrombophlebitis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 667 | Mineral excesses | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 668 | Alpha-1-antitrypsin deficiency | SERPINA1 | 2QUG | exact_public_antigen | downloaded | Added human alpha-1-antitrypsin structure from RCSB PDB. |
| 669 | Disorders due to use of nicotine | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 670 | Disorders due to use of volatile inhalants | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 671 | Myotonic disorders | DMPK | - | not_found | skipped | No confirmed public human DMPK PDB selected in this pass. |
| 672 | Congenital myopathies | DST | 3GJO | exact_public_antigen | downloaded | Added human dystonin peptide-containing structure from RCSB PDB. |
| 673 | Autoimmune pancreatitis | CRP | 1GNH | reused_target | reused | Existing human CRP antigen file already present in this folder. |
| 674 | Obstructive pancreatitis | CRP | 1GNH | reused_target | reused | Same antigen target as rank 673. |
| 675 | Leiomyosarcoma, primary site | TP53 | 1TUP | reused_target | reused | Existing human TP53 antigen file already present in this folder. |
| 676 | Malignant neoplasms of gum | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 677 | Haemorrhagic disorder due to circulating anticoagulants or coagulation factors inhibitors | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 678 | Cryoglobulinaemia | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 679 | Erythema multiforme | NR3C1 | 4P6X | reused_target | reused | Same antigen target as rank 663. |
| 680 | Human immunodeficiency virus disease associated with malaria | TLR9 | 8AR3 | reused_target | reused | Existing human TLR9 antigen file already present in this folder. |

## Batch Notes

- New downloads added in this batch: `2QUG`, `3GJO`, `6KZO`.
- Reused targets point to antigen files already present in this folder.
- `3GJO` contains a human dystonin (`DST`) peptide segment rather than a full-length dystonin structure; it is recorded as the actual solved coordinate context.
- This batch continues from rank 661 after batch 034 finished ranks 641-660.
