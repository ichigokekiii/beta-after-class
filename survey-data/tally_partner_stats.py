#!/usr/bin/env python3
"""Partner-safe survey tally. Prints aggregates only. Never prints emails."""

from __future__ import annotations

import csv
import json
import re
import sys
from collections import Counter
from pathlib import Path

CSV_PATH = Path(__file__).with_name("Student Dating Habits Survey .csv")
EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
PII_HEADERS = {"username", "email", "e-mail"}

COL_ENROLL = "What school are you currently enrolled in?"
COL_SPOT_TYPE = "Which school do you usually spot your type at?"
COL_APPS = "Which apps are you on right now? (be honest)"
COL_MEET = "Have you ever matched with someone and then...never actually meet them?"
COL_WAY = "So what gets in the way?"
COL_TIME = "On a school day, when's the best time to sneak in a meetup?"
COL_VENUE = "What's your ideal first date spot?"
COL_SHOW = (
    "If someone just planned the whole thing for you "
    "(picked the place and set the time), would you actually show up?"
)
COL_SAFE = "What would make you actually feel safe enough to go?"
COL_EXCITED = "What would make you genuinely excited to show up?"

OFTEN_NEVER = {
    "Yes, literally every single match",
    "Yeah it happens more than I'd like to admit",
}
EVERY_MATCH = "Yes, literally every single match"
PLANNING_FREEZE = {
    "It's awkward to be the one to suggest it",
    "Nobody wants to make the first move to plan",
}
CHAT_DIES = "The conversation just...stopped"
WEEKENDS_ONLY = "Weekends only"
AFTER_CLASS = "Chill meetup after class"
PICKED_SPOT = "Someone already picked the spot so I don't have to think"
PROMO = "There's a promo, freebie, or treat involved muehehe"
NEED_PLAN = "Knowing exactly where, when, and what to expect"
PUBLIC_BUSY = "Meeting somewhere public and busy"
VERIFIED = "Knowing their profile is verified"


def pct(n: int, d: int) -> float:
    return round(100.0 * n / d, 1) if d else 0.0


def split_multi(value: str) -> list[str]:
    return [p.strip() for p in (value or "").split(";") if p.strip()]


def corridor(raw: str) -> str:
    t = (raw or "").lower()
    if "la salle" in t or "dlsu" in t:
        return "DLSU / Taft"
    if "santo tomas" in t or t.strip() == "ust":
        return "UST / España"
    if "diliman" in t or t.strip() in {"upd", "up diliman"}:
        return "UP Diliman"
    if "ateneo" in t:
        return "Ateneo / Katipunan"
    if "national university" in t or t.startswith("nu"):
        return "NU Manila"
    return "Other"


def mentions_cafe(text: str) -> bool:
    return bool(re.search(r"caf[eé]|coffee", (text or "").lower()))


def load_rows(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        headers = [h or "" for h in (reader.fieldnames or [])]
        pii_cols = [h for h in headers if h.strip().lower() in PII_HEADERS]
        rows: list[dict[str, str]] = []
        for raw in reader:
            rows.append({k: v for k, v in raw.items() if k not in pii_cols})
    if not rows:
        raise SystemExit(f"no rows in {path}")
    return rows


def likert_values(rows: list[dict[str, str]]) -> list[int]:
    out: list[int] = []
    for row in rows:
        raw = (row.get(COL_SHOW) or "").strip()
        if raw.isdigit():
            out.append(int(raw))
    return out


def tally(rows: list[dict[str, str]], source_name: str) -> dict:
    n = len(rows)
    likerts = likert_values(rows)
    if len(likerts) != n:
        raise SystemExit(f"likert count {len(likerts)} != n {n}")

    often_never = sum(1 for r in rows if (r.get(COL_MEET) or "") in OFTEN_NEVER)
    every = sum(1 for r in rows if (r.get(COL_MEET) or "") == EVERY_MATCH)
    planning = sum(1 for r in rows if (r.get(COL_WAY) or "") in PLANNING_FREEZE)
    chat_dies = sum(1 for r in rows if (r.get(COL_WAY) or "") == CHAT_DIES)
    show_4_5 = sum(1 for v in likerts if v >= 4)
    show_5 = sum(1 for v in likerts if v == 5)
    need_plan = sum(1 for r in rows if NEED_PLAN in (r.get(COL_SAFE) or ""))
    public_busy = sum(1 for r in rows if PUBLIC_BUSY in (r.get(COL_SAFE) or ""))
    verified = sum(1 for r in rows if VERIFIED in (r.get(COL_SAFE) or ""))
    cafe = sum(1 for r in rows if mentions_cafe(r.get(COL_VENUE) or ""))
    weekends_only = sum(1 for r in rows if (r.get(COL_TIME) or "") == WEEKENDS_ONLY)
    weekday = n - weekends_only
    after_class = sum(1 for r in rows if (r.get(COL_TIME) or "") == AFTER_CLASS)
    picked = sum(1 for r in rows if (r.get(COL_EXCITED) or "") == PICKED_SPOT)
    promo = sum(1 for r in rows if (r.get(COL_EXCITED) or "") == PROMO)
    bumble = sum(1 for r in rows if "Bumble" in split_multi(r.get(COL_APPS) or ""))
    corridors = Counter(corridor(r.get(COL_SPOT_TYPE) or "") for r in rows)

    mean_show = round(sum(likerts) / n, 2)
    claims = [
        {
            "id": "sample",
            "claim": "Sample",
            "count": n,
            "denom": n,
            "pct": 100.0,
            "slide": "Footer on 2, 6, 7",
            "say": "We asked 110 college students.",
        },
        {
            "id": "often_never_meet",
            "claim": "Match then often never meet",
            "count": often_never,
            "denom": n,
            "pct": pct(often_never, n),
            "slide": "2",
            "say": "Lead with 79%. Keep 44% for Q&A if they push.",
        },
        {
            "id": "never_any_match",
            "claim": "Never meet any match",
            "count": every,
            "denom": n,
            "pct": pct(every, n),
            "slide": "2 Q&A",
            "say": "44% never meet any match.",
        },
        {
            "id": "chat_or_planning",
            "claim": "Chat dies or planning freeze",
            "count": planning + chat_dies,
            "denom": n,
            "pct": pct(planning + chat_dies, n),
            "slide": "2 spoken",
            "say": "The conversation dies, or nobody books the table.",
        },
        {
            "id": "show_if_planned",
            "claim": "Would show if place and time already picked (4 or 5)",
            "count": show_4_5,
            "denom": n,
            "pct": pct(show_4_5, n),
            "slide": "3 live, 7 proof",
            "say": "Hero partner number. Label as stated intent.",
            "mean": mean_show,
            "rated_5": show_5,
        },
        {
            "id": "need_exact_plan",
            "claim": "Need exact where, when, and what",
            "count": need_plan,
            "denom": n,
            "pct": pct(need_plan, n),
            "slide": "3 or 5",
            "say": "Why a listed Spot with hours beats somewhere later.",
        },
        {
            "id": "public_busy",
            "claim": "Want a public, busy venue",
            "count": public_busy,
            "denom": n,
            "pct": pct(public_busy, n),
            "slide": "3 or 5",
            "say": "Why a café floor beats a private hang.",
        },
        {
            "id": "verified",
            "claim": "Want a verified profile",
            "count": verified,
            "denom": n,
            "pct": pct(verified, n),
            "slide": "5 spoken",
            "say": "Supports verification. Do not claim a majority.",
        },
        {
            "id": "cafe_venue",
            "claim": "Ideal first date mentions café or coffee (free text)",
            "count": cafe,
            "denom": n,
            "pct": pct(cafe, n),
            "slide": "6",
            "say": "Floor, not exact share. Keyword coded.",
        },
        {
            "id": "weekday",
            "claim": "Weekday-capable meetup (not weekends only)",
            "count": weekday,
            "denom": n,
            "pct": pct(weekday, n),
            "slide": "6",
            "say": "Daytime / after-class seating, not Saturday-only events.",
        },
        {
            "id": "after_class",
            "claim": "Named after class as best time",
            "count": after_class,
            "denom": n,
            "pct": pct(after_class, n),
            "slide": "6",
            "say": "36% named after class outright.",
        },
        {
            "id": "promo",
            "claim": "Promo or freebie as what would excite them",
            "count": promo,
            "denom": n,
            "pct": pct(promo, n),
            "slide": "5",
            "say": "Discounts optional. Do not lead with coupons.",
        },
        {
            "id": "bumble",
            "claim": "Already on Bumble",
            "count": bumble,
            "denom": n,
            "pct": pct(bumble, n),
            "slide": "8 spoken",
            "say": "They need a place to land, not another app pitch.",
        },
        {
            "id": "picked_spot_excited",
            "claim": "Excited because someone already picked the spot",
            "count": picked,
            "denom": n,
            "pct": pct(picked, n),
            "slide": "3 spoken",
            "say": "Backup to the 88% show-up rating.",
        },
    ]

    corridor_rows = [
        {
            "corridor": name,
            "count": corridors[name],
            "pct": pct(corridors[name], n),
        }
        for name in [
            "DLSU / Taft",
            "UST / España",
            "UP Diliman",
            "Ateneo / Katipunan",
            "NU Manila",
            "Other",
        ]
    ]

    return {
        "n": n,
        "source": source_name,
        "pii_policy": "Username/email columns dropped before tally. Output is aggregates only.",
        "claims": claims,
        "corridors": corridor_rows,
        "likert": {
            "mean": mean_show,
            "n": n,
            "rated_4_or_5": show_4_5,
            "rated_5": show_5,
        },
    }


def format_table(data: dict) -> str:
    lines = [
        f"n={data['n']}  source={data['source']}",
        data["pii_policy"],
        "",
        "| Claim | Count | Pct | Slide |",
        "|---|---:|---:|---|",
    ]
    for c in data["claims"]:
        lines.append(
            f"| {c['claim']} | {c['count']}/{c['denom']} | {c['pct']}% | {c['slide']} |"
        )
    lines.append("")
    lines.append("| Corridor (spot your type) | Count | Pct |")
    lines.append("|---|---:|---:|")
    for row in data["corridors"]:
        lines.append(f"| {row['corridor']} | {row['count']} | {row['pct']}% |")
    return "\n".join(lines) + "\n"


def assert_no_pii(text: str) -> None:
    if EMAIL_RE.search(text):
        raise SystemExit("tally output leaked an email. abort.")


def main() -> int:
    path = CSV_PATH
    if len(sys.argv) > 1:
        path = Path(sys.argv[1])
    rows = load_rows(path)
    data = tally(rows, path.name)
    table = format_table(data)
    payload = json.dumps(data, indent=2) + "\n"
    assert_no_pii(table)
    assert_no_pii(payload)
    if "--json" in sys.argv:
        sys.stdout.write(payload)
    else:
        sys.stdout.write(table)
        if "--dump-json" in sys.argv:
            sys.stdout.write("\n")
            sys.stdout.write(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
