# Nominal to Verb

A bilingual corpus explorer for English nominalizations that become Chinese verbs. The site is a static GitHub Pages project with 500 sampled subtitle pairs, linked interactive views, a codebook, a learning report, and an AI-use declaration.

## Run locally

Because the explorer loads `data/corpus.json` with `fetch`, serve the directory over HTTP:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`.

## Data build

The reproducible build uses the public NV Atlas search index, which embeds OpenSubtitles v2024 sentence records:

```bash
python3 scripts/build_corpus.py --html /path/to/nvatlas-search.html
```

Without `--html`, the script fetches the public page directly. The current build metadata is in `data/build-metadata.json`; the sample uses seed `2026` and the documented eligibility filters.

## Files

- `index.html` - searchable, filterable corpus explorer with network, heat map, KWIC, and table views
- `report.html` - learning report, method, analysis, conclusion, and reflection
- `codebook.html` - five-category bilingual codebook and boundary cases
- `ai-use.html` - AI use declaration
- `data/corpus.json` - website data
- `data/corpus.csv` - downloadable corpus
- `data/verification-sample.csv` - 50-row human-review queue
- `scripts/build_corpus.py` - reproducible sampling and category assignment

## Verification status

All entries currently have `human_checked = no`. The build verifies exact matches against the public index, but the brief requires a person to compare 50 rows with source records. Complete that review before submission and update the flag honestly.

## Source attribution

Data source: OpenSubtitles v2024, indexed by [NV Atlas](https://nvatlas.tra.cuhk.edu.hk/), Department of Translation, The Chinese University of Hong Kong. The site uses short subtitle excerpts with source sentence IDs; it does not reproduce complete works.
