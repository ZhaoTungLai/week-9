#!/usr/bin/env python3
"""Build the final 500-entry corpus from the public NV Atlas search index.

The NV Atlas search page embeds its sentence index in a `const DATA = ...`
declaration. This script fetches that page, applies the documented eligibility
rules, draws a fixed-seed random sample, assigns semantic categories, and writes
JSON/CSV deliverables. It never generates translations or invent sentence IDs.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import random
import re
import sys
import urllib.request
import urllib.parse
from collections import Counter
from pathlib import Path
from typing import Any

NV_ATLAS_URL = "https://nvatlas.tra.cuhk.edu.hk/search.html"
SEED = 2026
SAMPLE_SIZE = 500
RETRIEVED = "2026-11-05"
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

CATEGORY_ORDER = [
    "institutional_procedure",
    "speech_cognition",
    "affect_embodiment",
    "social_relation",
    "material_action",
]

# Decision rules are intentionally explicit and auditable. Matching is on the
# English nominal selected by NV Atlas. Priority is: institutional > speech /
# cognition > state / relation > material action.
INSTITUTIONAL = {
    "permission", "punishment", "election", "appointment", "prosecution", "resignation",
    "registration", "authorization", "payment", "detention", "imprisonment", "probation",
    "parole", "trial", "verdict", "indictment", "settlement", "compensation", "fine",
    "taxation", "revenue", "budget", "employment", "retirement", "deportation", "extradition",
    "banishment", "eviction", "foreclosure", "disbarment", "injunction", "subpoena",
    "legislation", "regulation", "enforcement", "compliance", "noncompliance", "mandate",
    "policy", "election", "nomination", "campaign", "vote", "reservation", "booking",
    "application", "submission", "approval", "rejection", "acceptance", "admission",
    "membership", "citizenship", "ownership", "tenure", "inheritance", "donation",
    "funding", "endowment", "investment", "auction", "purchase", "sale", "contract",
    "agreement", "negotiation", "mediation", "arbitration", "commitment", "obligation",
    "requirement", "restriction", "prohibition", "sanction", "license", "permit",
    "passport", "visa", "certificate", "identification", "verification", "examination",
    "inspection", "investigation", "intelligence", "surveillance", "war", "peace",
    "invasion", "bombardment", "battle", "attack", "assassination", "execution",
    "assassination", "punishment", "sentencing", "incarceration", "confinement",
}

SPEECH_COGNITION = {
    "explanation", "question", "confession", "mention", "announcement", "description",
    "recognition", "decision", "attention", "information", "conversation", "discussion",
    "argument", "debate", "interview", "interrogation", "testimony", "statement",
    "declaration", "pronouncement", "comment", "complaint", "compliment", "persuasion",
    "admission", "acknowledgment", "confirmation", "denial", "contradiction", "promise",
    "threat", "warning", "recommendation", "advice", "instruction", "request", "invitation",
    "proposal", "suggestion", "objection", "protest", "apology", "pardon", "forgiveness",
    "confession", "prayer", "sermon", "lecture", "lesson", "teaching", "training",
    "research", "study", "analysis", "interpretation", "translation", "misinterpretation",
    "mistranslation", "hypothesis", "theory", "idea", "thought", "memory", "recollection",
    "imagination", "vision", "dream", "hope", "expectation", "anticipation", "assumption",
    "belief", "conviction", "knowledge", "understanding", "comprehension", "awareness",
    "recognition", "realization", "revelation", "discovery", "realization", "reflection",
    "consideration", "contemplation", "meditation", "trance", "attention", "concentration",
    "observation", "inspection", "examination", "attention", "interest", "curiosity",
    "confidence", "certainty", "uncertainty", "doubt", "confusion", "misunderstanding",
    "misconception", "impression", "sense", "sensation", "perception", "intuition",
    "instinct", "judgment", "judgement", "opinion", "choice", "selection", "calculation",
    "deduction", "inference", "conclusion", "solution", "resolution", "determination",
    "indecision", "hesitation", "intention", "objective", "purpose", "plan", "strategy",
}

AFFECT_BODY = {
    "dance", "performance", "celebration", "celebration", "excitement", "amusement",
    "pleasure", "disappointment", "obsession", "passion", "admiration", "appreciation",
    "embarrassment", "excitement", "fear", "anger", "rage", "hate", "love", "affection",
    "compassion", "affection", "devotion", "sorrow", "grief", "regret", "guilt", "shame",
    "humiliation", "pride", "confidence", "anxiety", "worry", "tension", "relaxation",
    "satisfaction", "frustration", "irritation", "amusement", "enjoyment", "entertainment",
    "boredom", "loneliness", "isolation", "torment", "torture", "distress", "suffering",
    "treatment", "cure", "infection", "injection", "medication", "transfusion", "operation",
    "surgery", "examination", "diagnosis", "recovery", "rehabilitation", "birth", "death",
    "illness", "disease", "injury", "pain", "wound", "fracture", "contusion", "inflammation",
    "dehydration", "suffocation", "strangulation", "starvation", "exhaustion", "sleep",
    "hibernation", "gestation", "pregnancy", "abortion", "copulation", "ejaculation",
    "masturbation", "prostitution", "erection", "menstruation", "ovulation", "respiration",
    "perspiration", "digestion", "inhalation", "exhalation", "urination", "defecation",
}

STATE_SUFFIXES = (
    "ance", "ence", "ness", "ity", "ship", "hood", "dom", "ism", "acy", "cy",
)
STATE_TERMS = {
    "protection", "assistance", "possession", "presence", "absence", "relationship",
    "violence", "dance", "performance", "control", "power", "influence", "ownership",
    "presence", "absence", "existence", "resemblance", "difference", "similarity",
    "silence", "chance", "position", "possession", "protection", "resistance", "assistance",
    "importance", "significance", "reassurance", "assurance", "awareness", "happiness",
    "sadness", "weakness", "strength", "freedom", "independence", "dependence", "relationship",
    "friendship", "partnership", "leadership", "ownership", "membership", "citizenship",
    "condition", "situation", "circumstance", "status", "stability", "instability",
    "security", "safety", "danger", "vulnerability", "availability", "reliability",
    "responsibility", "authority", "power", "control", "influence", "value", "quality",
    "quantity", "measure", "distance", "duration", "size", "shape", "colour", "color",
    "beauty", "ugliness", "truth", "falsity", "reality", "possibility", "probability",
    "necessity", "ability", "capability", "capacity", "opportunity", "difficulty",
    "resilience", "tolerance", "patience", "impatience", "obedience", "disobedience",
    "indulgence", "forbearance", "temperance", "confidence", "innocence", "guilt",
}

SENSITIVE = {
    "masturbation", "ejaculation", "copulation", "erection", "prostitution", "abortion",
    "menstruation", "ovulation", "rape", "molestation", "incest", "orgasm", "sex",
    "sexual", "penis", "vagina", "breast", "nude", "naked", "porn", "pornography",
    "murder", "homicide", "assassination", "killing", "kill", "death", "die", "dead",
    "suicide", "torture", "strangulation", "beheading", "dismemberment", "massacre",
    "genocide", "extermination", "violence", "assault", "rape", "abuse", "molestation",
    "drug", "cocaine", "heroin", "opium", "marijuana", "alcohol", "drunk", "smoking",
    "nazi", "hitler", "jew", "jewish", "persecution", "racist", "racism", "slave",
    "slavery", "profanity", "fuck", "shit", "damn", "bitch", "bastard", "asshole",
}

HUMAN_CHECK_SAMPLE_SIZE = 50


def fetch_html(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; TT-final-project/1.0; corpus research)",
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    with urllib.request.urlopen(req, timeout=45) as response:
        return response.read().decode("utf-8", errors="replace")


def extract_data(html: str) -> dict[str, Any]:
    match = re.search(r"const DATA = (\{.*?\});\s*\n\s*const SPELLING_CANONICAL", html, re.S)
    if not match:
        match = re.search(r"const DATA = (\{.*?\});\s*</script>", html, re.S)
    if not match:
        raise ValueError("Could not locate the embedded NV Atlas DATA object.")
    return json.loads(match.group(1))


def is_latin(text: str) -> bool:
    return bool(re.search(r"[A-Za-z]", text))


def is_han(text: str) -> bool:
    return bool(re.search(r"[\u3400-\u9fff]", text))


def eligible(sentence: dict[str, Any]) -> tuple[bool, str]:
    en = str(sentence.get("en", "")).strip()
    zh = str(sentence.get("zh", "")).strip()
    ids = [str(x) for x in sentence.get("ids", []) if str(x).strip()]
    if not en or not zh:
        return False, "empty side"
    if not ids:
        return False, "missing sentence id"
    if not is_latin(en) or not is_han(zh):
        return False, "language-script check"
    if not (10 <= len(en) <= 240):
        return False, "source length 10-240"
    if not (1 <= len(zh) <= 240):
        return False, "target length 1-240"
    return True, "eligible"


# Concrete event nouns that could trip the abstract-noun suffix rule.
MATERIAL_OVERRIDES = {
    "dance", "performance", "violence", "disturbance", "appearance", "departure",
    "arrival", "advance", "resurgence", "explosion", "eruption", "collision",
}


def category_for(term: str) -> str:
    key = term.strip().lower()
    if key in INSTITUTIONAL:
        return "institutional_procedure"
    if key in SPEECH_COGNITION:
        return "speech_cognition"
    if key in AFFECT_BODY:
        return "affect_embodiment"
    if key in MATERIAL_OVERRIDES:
        return "material_action"
    if key in STATE_TERMS or key.endswith(STATE_SUFFIXES):
        return "social_relation"
    return "material_action"


def sensitive_for(text: str, term: str) -> str:
    blob = " ".join([text, term]).lower()
    tokens = set(re.findall(r"[a-z]+(?:'[a-z]+)?", blob))
    return "yes" if tokens & SENSITIVE else "no"


def make_entry(sentence: dict[str, Any], number: int, pair: list[Any]) -> dict[str, Any]:
    en = str(sentence["en"]).strip()
    zh = str(sentence["zh"]).strip()
    ids = [str(x) for x in sentence.get("ids", [])]
    source_term = str(pair[0]).strip() if len(pair) > 0 else ""
    target_term = str(pair[1]).strip() if len(pair) > 1 else ""
    nominal = str(pair[2]).strip() if len(pair) > 2 and pair[2] else source_term
    verb = str(pair[3]).strip() if len(pair) > 3 and pair[3] else target_term
    category = category_for(nominal)
    source_id = ";".join(ids)
    query = en[:80]
    url = f"https://nvatlas.tra.cuhk.edu.hk/search.html?q={urllib.parse.quote(query)}&mode=en"
    return {
        "id": f"NV-{number:03d}",
        "source_id": source_id,
        "source_text": en,
        "target_text": zh,
        "source": (
            "OpenSubtitles v2024 via NV Atlas; "
            f"sentence ID {source_id}; retrieved {RETRIEVED}; "
            f"{url}"
        ),
        "source_url": url,
        "category": category,
        "human_checked": "no",
        "machine_checked": "yes",
        "unit": "short sentence pair + extracted term pair",
        "key_term": nominal,
        "target_term": verb,
        "language_pair": "en-zh_CN",
        "sample_seed": SEED,
        "sensitive": sensitive_for(en + " " + zh, nominal + " " + verb),
        "notes": "Term pair extracted by NV Atlas; row matched exactly to its embedded record by this build.",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--html", type=Path, help="Use a saved NV Atlas search page instead of fetching.")
    parser.add_argument("--out", type=Path, default=DATA)
    args = parser.parse_args()

    html = args.html.read_text(encoding="utf-8", errors="replace") if args.html else fetch_html(NV_ATLAS_URL)
    source_data = extract_data(html)
    candidates = source_data.get("SENTS", [])
    accepted: list[dict[str, Any]] = []
    rejected = Counter()
    seen_pairs: set[tuple[str, str]] = set()

    for sentence in candidates:
        ok, reason = eligible(sentence)
        if not ok:
            rejected[reason] += 1
            continue
        pair_key = (str(sentence["en"]).strip(), str(sentence["zh"]).strip())
        if pair_key in seen_pairs:
            rejected["duplicate source-target pair"] += 1
            continue
        seen_pairs.add(pair_key)
        accepted.append(sentence)

    if len(accepted) < SAMPLE_SIZE:
        raise RuntimeError(f"Only {len(accepted)} eligible records; need {SAMPLE_SIZE}.")

    rng = random.Random(SEED)
    sampled = rng.sample(accepted, SAMPLE_SIZE)

    entries: list[dict[str, Any]] = []
    for number, sentence in enumerate(sampled, 1):
        pairs = sentence.get("pairs") or []
        if not pairs:
            continue
        # Use the first extracted term pair. NV Atlas records normally have one.
        entries.append(make_entry(sentence, number, pairs[0]))
    if len(entries) != SAMPLE_SIZE:
        raise RuntimeError(f"Built {len(entries)} entries instead of {SAMPLE_SIZE}.")

    args.out.mkdir(parents=True, exist_ok=True)
    json_path = args.out / "corpus.json"
    csv_path = args.out / "corpus.csv"
    sample_path = args.out / "verification-sample.csv"
    meta_path = args.out / "build-metadata.json"

    json_path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    fieldnames = [
        "id", "source_id", "source_text", "target_text", "source", "source_url",
        "category", "human_checked", "machine_checked", "unit", "key_term",
        "target_term", "language_pair", "sample_seed", "sensitive", "notes",
    ]
    with csv_path.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(entries)

    # A fixed subset for the required manual spot check. The build pre-fills no
    # human judgments; every candidate remains human_checked=no until a person
    # compares it with the source and records the result.
    check_entries = rng.sample(entries, HUMAN_CHECK_SAMPLE_SIZE)
    check_fields = ["id", "source_id", "source_text", "target_text", "source_url", "human_checked", "reviewer_notes"]
    with sample_path.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=check_fields)
        writer.writeheader()
        for entry in check_entries:
            writer.writerow({key: entry.get(key, "") for key in check_fields})

    category_counts = Counter(entry["category"] for entry in entries)
    sensitive_count = sum(entry["sensitive"] == "yes" for entry in entries)
    metadata = {
        "title": "English nominalizations rendered as Chinese verbs",
        "source_index": NV_ATLAS_URL,
        "underlying_corpus": "OpenSubtitles v2024, en-zh_CN",
        "source_page_sha256": hashlib.sha256(html.encode("utf-8")).hexdigest(),
        "retrieved": RETRIEVED,
        "seed": SEED,
        "sample_size": SAMPLE_SIZE,
        "source_records": len(candidates),
        "eligible_records": len(accepted),
        "sample_population": len(accepted),
        "candidates_rejected": dict(rejected),
        "filter_rules": [
            "both source and target non-empty",
            "at least one sentence ID present",
            "English contains a Latin letter",
            "Chinese contains a Han character",
            "English length 10-240 characters",
            "Chinese length 1-240 characters",
            "exact duplicate source-target pairs removed",
        ],
        "sampling": "Python random.Random(2026).sample over the eligible list; one term pair per sampled sentence pair.",
        "category_counts": dict(category_counts),
        "sensitive_entries": sensitive_count,
        "human_checked_entries": 0,
        "machine_matched_entries": SAMPLE_SIZE,
        "verification_sample_size": HUMAN_CHECK_SAMPLE_SIZE,
        "verification_note": "The 50-row file is a review queue, not evidence of human verification.",
    }
    meta_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(metadata, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
