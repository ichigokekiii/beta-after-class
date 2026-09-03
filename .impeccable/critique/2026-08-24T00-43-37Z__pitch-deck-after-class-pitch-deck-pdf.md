---
target: first slide of After Class pitch deck
total_score: 7
max_score: 16
na_heuristics: 1,3,5,7,9,10
p0_count: 0
p1_count: 3
timestamp: 2026-08-24T00-43-37Z
slug: pitch-deck-after-class-pitch-deck-pdf
---
Method: dual-agent (A: 02212f1d-2753-446e-b360-c80a0e46d2c6 · B: 3e0eb123-af8a-4b97-9378-cb053de7cfa3)

#### Design Health Score

Surface: Persuade (static café-owner title slide). Heuristics that cannot apply to a static 16:9 pitch slide are n/a.

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | n/a | Static title slide. No states or action feedback. |
| 2 | Match System / Real World | 2 | Café table is the owner’s world. Copy is consumer poetry. Polaroid is founder merch. |
| 3 | User Control and Freedom | n/a | No interactive states or exits. |
| 4 | Consistency and Standards | 2 | Color system holds. Words and pictures do not mean the same thing. |
| 5 | Error Prevention | n/a | No inputs or operations to guard. |
| 6 | Recognition Rather Than Recall | 1 | Cannot tell this is a student dating app that sends matches to this café without the spoken line. |
| 7 | Flexibility and Efficiency | n/a | Persuade slide. No expert path. |
| 8 | Aesthetic and Minimalist Design | 2 | Airy and pretty. Top line, poetic subtext, and merch Polaroid do not earn their pixels. |
| 9 | Error Recovery | n/a | No error states. |
| 10 | Help and Documentation | n/a | Persuade title. The speaker is the help. |
| **Total** | | **7/16** | **Poor (~44%)** |

n/a: 1, 3, 5, 7, 9, 10.

#### Design Specificity Verdict

**LLM assessment**: This is a Canva lifestyle cover with After Class painted on it, not a slide authored for a café owner. The paper grain, coral brush wordmark, tilted Polaroid, and rounded café still-life are a scrapbook chassis any student brand, coffee subscription, or dating-nostalgia campaign could wear unchanged. What is specific: the two red cups matching the type, and a table set for two. That is the product in one picture. What is interchangeable: “The first move is showing up” (dating-coach poster), “Bringing the age of dating back to where it all started” (manifesto with no café, no students, no ask), and a Polaroid of business cards on a laptop (founder merch). A café owner on Taft does not need an anthem. They need to know, in one glance, that this is a college dating app that sends matched pairs to a real shop, and that the shop in question is theirs.

**Deterministic scan**: Detector returned `[]` with exit 0 on both the PDF and the screenshot. Neither is a scannable UI source (`.pdf` / image are outside `SCANNABLE_EXTENSIONS`). Empty array is a false-clean / inapplicable scan, not a clean pass. Mechanical probe of the screenshot: 1024×566 JPEG; salmon-on-cream contrast ≈ 2.00–2.45:1 (median title ~2.39:1; kicker zone ~2.02:1). Well below WCAG AA large-text 3.0. No rule names or file locations.

**Visual overlays**: No reliable user-visible overlay. No mutable-injection browser in this session; live-server skipped because the target is a static PDF/image.

#### Overall Impression

The slide looks designed. It does not yet open a café-owner conversation. The biggest opportunity is not a visual overhaul: kill the top line, replace the manifesto subtext with one product sentence, and stop letting the merch Polaroid compete with the table.

#### What's Working

- The café table is the right metaphor: two cups, two pastries, two waters, wood. That is a date. Let it lead.
- Color is tight. Coral type, coral cards, dark red cups, cream paper, wood. Warm and analog. Not dating-app purple.
- The brush “After Class” has character. It could sit on a café window. Keep the wordmark. Kill what is sandwiching it.

#### Priority Issues

- **[P1] Subtext is doing the wrong job**
  - **What**: “Bringing the age of dating back to where it all started.”
  - **Why it matters**: A café owner does not know where “it” started, who is dating, or what you want from this shop. It is a consumer manifesto. It fails “understand After Class in one glance.”
  - **Fix**: Replace with one or two lines that name the product and the shop. Not a paragraph. Not poetry.
  - **Suggested command**: `$impeccable clarify`

- **[P1] Top line does not earn its pixel**
  - **What**: “The first move is showing up.”
  - **Why it matters**: Dating-coach copy. Same thin script as the subtext, so it builds a magazine-cover sandwich around the title. The spoken line already covers showing up. Extra voice, no new information.
  - **Fix**: Delete it. Let “After Class” sit. Put the only caption underneath.
  - **Suggested command**: `$impeccable distill`

- **[P1] Copy and images disagree**
  - **What**: Spoken story is phones → no-show → café. Board shows a café table (right) plus business cards on a laptop (wrong). Polaroid overlaps the title.
  - **Why it matters**: The laptop/cards Polaroid is founder-world. It says merch, startup, take a card. It is the opposite of getting people off phones and into a seat.
  - **Fix**: Let the café table be the only picture, or replace the Polaroid with something that agrees with the spoken line. Do not invent an app UI or fake users.
  - **Suggested command**: `$impeccable layout`

- **[P2] Caption type will not survive a counter**
  - **What**: Both caption lines are light, small, handwritten salmon on cream. Measured contrast ~2.0–2.4:1.
  - **Why it matters**: If the subtext becomes the only product sentence, it has to be readable at arm’s length.
  - **Fix**: After rewriting, set it in a weight and contrast that holds at a glance.
  - **Suggested command**: `$impeccable typeset`

- **[P2] Hierarchy is title vs Polaroid vs photo, not title vs one caption**
  - **What**: Two captions at equal weight. Polaroid centered on the wordmark. Photo large on the right.
  - **Why it matters**: The owner’s eye never lands on a “this is for your café” line because that line does not exist, and the Polaroid is sitting where that line should be felt.
  - **Fix**: One caption under the title. Photo unobstructed. Polaroid gone or receded.
  - **Suggested command**: `$impeccable layout`

#### Persona Red Flags

**Jordan (first-timer café owner, cold)**: Reads “After Class” and does not know if this is a class, a café, a club, or an app. “The first move is showing up” sounds like dating advice. “Where it all started” has no referent. Business cards suggest they want him to take a card. Nothing on the slide says college students, matched pairs, free listing, or no contract.

**Casey (distracted, standing, 20 seconds)**: Gets the pink wordmark and the pretty table. Misses both captions. Walk-away memory: “some dating thing with a nice photo.” Thin type is a miss at counter distance. Measured 2:1 contrast confirms the miss.

**Mae (café owner on Taft/España, burned by promo flyers)**: Pretty student design + café photo + no operational sentence = another campus org that wants a window poster or a discount. Cards on a laptop confirm merch energy. Nothing says free listing, no contract, no promised tables. Slide 8’s “we are not a promo” arrives too late if she closes on slide 1.

#### Minor Observations

- The PDF on disk is still the Canva template (Aldenaire & Partners, “Pitch Deck,” lorem). This critique is of the live first-slide screenshot.
- Two drinks and no people is fine. It is a table waiting.
- Cup color matching the type is the one clearly authored color choice. Keep it.
- Polaroid tilt and paper texture are template residue. Harmless if the object inside is right. It is not.
- Do not put 110 or 143 on this slide. Demand is slide 7.

#### Questions to Consider

- If you cover the wordmark, can a café owner still say what After Class is?
- Why is the first object in their face a business card on a laptop instead of a phone face-down next to two cups?
- What if slide 1 had zero poetry and only a shortened version of the spoken line?
- Would this slide work as a consumer brand cover? If yes, it is the wrong first slide for this room.
