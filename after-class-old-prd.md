# After Class Product Requirements Document

*Build-ready MVP specification for a safety-first verified campus dating app*

- Product: After Class
- Document type: Product requirements document
- Status: Draft v2 for implementation planning
- Version: 2.0
- Last updated: May 23, 2026
- Primary audience: Founders, product, design, engineering, and future coding agents

---

## Executive Summary

After Class is a mobile-first dating app for verified college students that is designed to move users from discovery to a safer real-world meetup. Only active students age 18 or older with approved `.edu` identities may join. The MVP combines swipe-and-match discovery with university compatibility insights, a guided meetup engine, and a stronger safety layer that stays active before, during, and after the date.

- Trust layer: users may enter through manual `.edu` signup or Google OAuth, but the account used for access must itself be an approved `.edu` identity mapped to an activated school.
- Core loop: verify school identity, complete required trust onboarding, choose `Find People` or `Review a Friend`, browse verified students, match, receive a meetup proposal, confirm arrival, complete the meetup, then optionally continue off-platform.
- Differentiator: the app translates internal university compatibility scores into human-friendly school-to-school labels, adds friend-reviewed social proof, and treats meetup safety as a core product behavior rather than a support afterthought.
- Safety posture: exact home addresses are never required, location use is bounded to the meetup window with explicit per-date consent, emergency flows prompt the user before escalation, and nightlife-first behavior is out of scope for MVP.

## Product Vision and Principles

After Class should feel safer, more intentional, and less awkward than a generic dating app. The MVP exists to help active students discover each other, form mutual matches, meet in public daytime settings, and feel supported if something goes wrong.

1. Verified identity first. School verification is part of the product promise, not a back-office check.
2. Trust before browsing. Users complete the minimum identity and authenticity steps before entering discovery.
3. Safety is product behavior. The app should actively support arrival, date progress, and post-date check-ins.
4. Use data as a guide, not a claim of truth. Compatibility is directional and school-level, not a promise about individual chemistry.
5. Keep v1 narrow and buildable. The MVP should prove verified student demand, meetup follow-through, and safety trustworthiness without expanding into a full social platform.

## Problem and Opportunity

Mainstream dating apps create four problems for college students: low trust, high social friction after a match, weak context for deciding whether to meet, and little structured support once an in-person date is underway. Students want to know whether someone is real, whether they are likely to share compatible campus context, whether meeting is convenient, and whether the app helps them stay safer during the date itself.

- General dating apps allow too many unverifiable or low-context profiles, which weakens trust before the first conversation begins.
- Even when people match, many conversations die because neither side wants to make the first move or negotiate logistics from scratch.
- Students often think in terms of campus, commute, neighborhood, and convenience, so school identity and travel radius matter more than they do in a generic dating product.
- Most dating products treat safety as a static help-center topic rather than an active date flow with check-ins, trusted contacts, and escalation logic.

## Target Users and Eligibility

### Primary user

The primary user is an active college or university student, age 18 or older, who wants to meet other verified students nearby through a lighter-weight dating experience that encourages safe daytime meetups.

### Eligible users

- Active undergraduate, graduate, or professional students with a working approved `.edu` email address.
- Students enrolled at a school whose email domain has been reviewed and activated by admins.
- Users who complete age gating, school verification, required trust onboarding, and affirm that they are at least 18 years old.

### Excluded users

- Alumni who still have access to a legacy `.edu` mailbox but are no longer current students.
- Faculty, staff, contractors, or campus partners who are not part of the student audience.
- Users under 18 years old, even if they possess an approved school email.
- Schools and domains that have not yet been approved by the admin team.

## MVP Scope

### In scope

- Student mobile onboarding with approved `.edu` verification through manual signup or Google OAuth using the same approved `.edu` identity.
- Mandatory face-to-profile verification before discovery access.
- A post-login chooser for `Find People` or `Review a Friend` when no profile exists.
- Profile setup, approximate area selection, weekday availability, daytime free-time windows, travel radius selection, backup email capture, and trusted contact capture.
- Swipe-style discovery, mutual matching, and a meetup-first flow with no standard in-app one-to-one chat.
- A hybrid venue engine that prefers safety-approved venues in strong-coverage cities and can use online place data to fill coverage gaps.
- User-facing school compatibility insights based on aggregated platform data, shown as qualitative school-to-school labels.
- Real-time meetup safety flows, including arrival confirmation, meetup-window location support, shake-triggered emergency flow, and post-date safety check-ins.
- A post-meetup off-platform handoff flow for optional exchange of social accounts or contact methods.
- Internal admin tooling for school-domain approval, venue oversight, moderation, compatibility oversight, and safety operations.

### Out of scope for MVP

- Paid subscriptions, boosts, or monetization systems.
- Voice notes, video calling, disappearing media, stories, or social feed mechanics.
- Student-facing web app experiences.
- Nighttime meetup scheduling, bar-first recommendations, or nightlife positioning.
- Always-on background tracking outside the explicit meetup window.
- Campus ambassador workflows, referral growth loops, event products, or group matching.
- A persistent in-app friends list, follow graph, or mutual-friends feature.
- Public reliability badges, public no-show indicators, or public safety ratings.

## Core User Journeys

### Journey 1: Onboarding, school verification, and trust setup

1. User downloads the app, confirms they are at least 18, and chooses manual `.edu` signup or Google OAuth.
2. The submitted or authenticated Google account must itself be an approved `.edu` identity tied to an activated school record.
3. The app verifies school identity by email code, magic link, or equivalent approved school-auth flow.
4. Before discovery access, the user completes mandatory face-to-profile verification to confirm that the onboarding face scan matches the uploaded profile photos. This is an authenticity check, not government-ID verification.
5. The user provides profile basics, approximate area, travel radius, weekday availability, daytime free-time windows, backup email, and a trusted contact for safety escalation.
6. If no profile exists, the app presents the onboarding choices `Find People` and `Review a Friend`.

### Journey 2: Review a friend

1. If the user chooses `Review a Friend`, the app asks them to identify someone they know who already has an account.
2. The app prompts the reviewer to answer lightweight structured questions about that friend.
3. Submitted answers become private-to-platform social-proof inputs and approved profile-facing review snippets for the reviewed user.
4. Reviewer input may quietly influence ranking for the reviewed person, but reviewers cannot directly connect people or act as an in-app matchmaker.

### Journey 3: Discovery and matching

1. The user browses verified students in a swipe-style card flow.
2. Cards are ranked by a hybrid score that combines explicit preference fit, distance fit, school compatibility, activity freshness, and safety eligibility.
3. School compatibility remains a meaningful ranking signal, but it does not fully block otherwise eligible users from appearing.
4. Mutual likes create a match and trigger the meetup proposal flow immediately.

### Journey 4: Meetup planning and confirmation

1. When a match is created, the app computes feasible meetup suggestions using both users' approximate areas, both travel radii, overlapping weekday availability, overlapping daytime free-time windows, venue operating hours, and the daytime scheduling window.
2. The app proposes one primary venue plus up to two alternates. The system automatically assigns a date and time from the shared availability overlap.
3. Venue sourcing is hybrid: safety-approved venues are preferred in strong-coverage cities, while online place data may supply additional candidate venues where approved coverage is sparse.
4. If no safe valid venue exists, the app clearly says so and prompts users to widen radius or let the match expire instead of fabricating an invalid suggestion.
5. Final time confirmation happens after the user confirms the match on the venue proposal screen, not during initial slot selection on that screen.

### Journey 5: Arrival, meetup safety, and emergency support

1. Before meetup-window safety features activate, the app asks for explicit per-date consent for location use during that meetup.
2. When the meetup time arrives, the user is prompted to confirm arrival while proximity to the venue acts as supporting evidence.
3. During the active meetup window, the app may use bounded location signals to detect likely arrival, sudden out-of-proximity events, or likely date completion.
4. If the app detects a safety concern or suspicious movement, it prompts the user first to confirm whether they are okay, whether the date ended, or whether they need help.
5. A shake gesture during the active meetup window opens an in-app emergency flow with quick safety actions.
6. If the user does not respond or signals danger, the app escalates to the trusted contact with a safety alert and relevant live or last-known location context.

### Journey 6: Post-date feedback, no-show handling, and continuation

1. After the scheduled meetup time passes, a user confirms completion, or the system detects likely date-end behavior, the app prompts each user for adaptive post-date feedback.
2. The feedback prompt changes based on meetup outcome, such as completed, canceled, expired, or safety-flagged flows.
3. If a user reports that the other person did not show up, the app records a private internal no-show signal for trust, ranking, and moderation use only.
4. After a completed meetup, the app may offer an optional off-platform continuation step where users choose whether to share supported social accounts or contact methods such as Instagram, Facebook, or phone number.
5. For up to 24 hours after the meetup, the app runs repeated safety check-ins until the user confirms they are okay or the window ends per product policy.

## UX Flow and Wireframes

This section updates the founder wireframe flow (v2) and should drive the next wireframe refresh.

### Design intent

- No standard in-app chat in MVP. The meetup proposal and safety flow are the center of the product.
- Safety is visible. Arrival confirmation, consent states, check-ins, and emergency actions should feel intentional rather than hidden.
- Identity should feel strong but not bureaucratic. School verification and face-to-profile verification should communicate trust, not surveillance.

### Primary happy path

| Step | Screen | What happens |
|------|--------|----------------|
| 1 | Welcome | Standard app entry; sign up or log in. |
| 2 | Age gate | User confirms 18+. |
| 3 | Auth choice | User chooses manual `.edu` signup or Google OAuth. |
| 4 | School verify | Code, link, or approved school auth confirmation. |
| 5 | Face check | User completes face-to-profile authenticity scan. |
| 6 | No-profile chooser | If no profile exists, user chooses `Find People` or `Review a Friend`. |
| 7 | Profile setup | Photos, name, age, school, bio, optional program or year. |
| 8 | Availability | Required weekday availability plus up to three daytime free-time windows (8:00 AM–6:00 PM). |
| 9 | Area and radius | Approximate area + max travel radius. |
| 10 | Safety setup | Backup email and trusted contact. |
| 11 | Discovery / swipe | Swipe left or right; school context on card. |
| 12 | Match | Full-screen match moment with typewritten “Found a Match!”, auto-assigned availability window, and a 30-second accept timer before discovery continues. |
| 13 | Meetup proposal | Map plus venue suggestion; confirm match to continue scheduling. |
| 14 | Safety consent | User opts into meetup-window location support for that date. |
| 15 | Arrival check | Confirm arrival with proximity support. |
| 16 | Active meetup | Safety tools are available, including shake emergency flow. |
| 17 | Post-date feedback | Outcome-aware review and optional no-show report. |
| 18 | Continue elsewhere | Optional exchange of social/contact methods after completed meetup. |

### Meetup proposal screen

When two users match, the app should speak in a concierge tone and summarize the logic behind the venue suggestion without exposing precise private data.

> Oh hey — you both said you're open to meeting. You both set a **[X] km** radius. Your shared best daytime options are around **[area label]**. I'm suggesting you meet at **[venue]**.

Supporting UI on the same screen:

- Map showing both users and the suggested venue.
- Primary venue photo and short description.
- Profile detail for the matched person.
- **Confirm Match** action that returns the user to discovery after acceptance.
- No time-slot picker on this screen. Final date and time assignment happens on a follow-up scheduling step after the user confirms the match.

The **Found a Match!** overlay shown immediately after a mutual like must display the system-assigned availability window in a human-readable format such as **Wed, 11:30 AM to 12:30 PM**. That window must always be at least one hour long.

### Safety interaction rules

| State | Behavior |
|------|----------|
| Match just created | In-place match acceptance overlay first; user has 30 seconds to accept before returning to discovery. No normal chat thread. |
| Meetup accepted | Date details are pinned; per-date safety consent is requested. |
| Meetup window begins | Arrival prompt appears; safety tools become active. |
| Suspicious movement or shake | User-first safety prompt or in-app emergency flow appears. |
| Post-date complete | Feedback and optional off-platform handoff appear. |
| Match expired | Match closes and no new coordination begins. |

## Functional Requirements

### Verification and school identity

- FR-VER-1: The app must allow access only through approved `.edu` domains tied to active school records.
- FR-VER-2: The app must support two authentication paths in MVP: manual `.edu` signup and Google OAuth using the same approved `.edu` identity.
- FR-VER-3: The Google account used for OAuth must itself be an approved `.edu` address. Users may not enter with a non-school Google account and verify a separate school email later.
- FR-VER-4: Verification must happen through an email code, magic link, or equivalent approved school-auth flow before the user can browse.
- FR-VER-5: Each approved school must have a canonical school record and one or more approved email domains managed by admins.
- FR-VER-6: The system must classify the user to a school automatically from the verified domain rather than asking the user to self-assign their school.
- FR-VER-7: Accounts that lose verification status, are tied to deactivated domains, or are flagged as non-student misuse must be placed into a restricted state pending review.
- FR-VER-8: The product must enforce a self-attested 18-plus age gate before account activation.
- FR-VER-9: Any verified user without a completed profile must see a chooser with `Find People` and `Review a Friend` before entering the main app flow.

### Profiles, trust setup, and preferences

- FR-PRO-1: Profiles must support display name, age, school, bio, interests, and three to six photos.
- FR-PRO-2: Program, year level, and profile prompts are optional in MVP and should enrich context without blocking activation.
- FR-PRO-3: Users must provide an approximate area represented by a place label and stored centroid, such as a campus zone, neighborhood, or district.
- FR-PRO-4: Users must choose a maximum travel radius in kilometers. The default is 10 km, and the supported MVP options are 2, 5, 10, 15, 20, and 30 km.
- FR-PRO-5: Exact addresses, dorm room details, and precise home coordinates must never be required profile fields.
- FR-PRO-6: Basic discovery preferences may include age range and gender interest, and smart likelihood ranking should rely primarily on explicit stated preferences in MVP.
- FR-PRO-7: Before discovery access, users must complete a face-to-profile verification step that confirms the onboarding face scan matches the profile photos. This is an authenticity check, not identity-grade KYC.
- FR-PRO-8: Users must provide a backup email for recovery and safety messaging support.
- FR-PRO-9: Users must provide a separate trusted contact for emergency escalation flows.
- FR-PRO-10: The main profile and home surface must display the user's full name, school, and small profile photo in a clear identity block.
- FR-PRO-11: If a profile includes approved friend-review content, the UI must show the reviewer's full name, school, and small profile photo beside the review snippet.
- FR-PRO-12: The MVP must not include a user-managed friends list, follow list, or mutual-friends graph.
- FR-PRO-13: During required onboarding, users must select at least one weekday when they are available for a meetup.
- FR-PRO-14: During required onboarding, users must add at least one and up to three daytime free-time windows. Each window must fall inside 8:00 AM to 6:00 PM local time.

### Friend review and social proof

- FR-SOC-1: The app must support a `Review a Friend` onboarding branch for verified users who know someone already on the platform.
- FR-SOC-2: The reviewed target must already have an account before a friend review can be submitted.
- FR-SOC-3: The flow must collect lightweight structured answers that can be used as profile-level social proof for the reviewed user.
- FR-SOC-4: Friend reviews must replace the need for an in-app friends feature when showing social context.
- FR-SOC-5: Reviewer input may influence the reviewed user's ranking privately, but reviewers must not be able to directly connect people or explicitly nominate matches in MVP.
- FR-SOC-6: The platform must be able to moderate, approve, hide, or remove friend-review content.

### Discovery, ranking, and prior-match memory

- FR-DIS-1: Discovery is cross-school by default across the currently approved school network.
- FR-DIS-2: The ranking model must combine explicit preference fit, distance fit, school compatibility, activity freshness, and safety eligibility.
- FR-DIS-3: School compatibility can influence ranking, but it must not fully block otherwise eligible users from appearing.
- FR-DIS-4: Distance fit must use approximate area centroids and user radius preferences rather than exact home locations.
- FR-DIS-5: Users who are blocked, banned, under review, or otherwise ineligible must never surface in discovery.
- FR-DIS-6: Discovery cards must show school context clearly enough to reinforce the verified-student value proposition.
- FR-DIS-7: Compatibility insights may appear in discovery as supportive context, but they must not overpower the core profile information.
- FR-DIS-8: The system may store prior match and meetup history as internal memory, but previously matched pairs must be excluded from default rediscovery in MVP.

### Matching

- FR-MAT-1: Mutual likes create a match immediately.
- FR-MAT-2: Match creation must emit analytics events for school-pair aggregation and post-match funnel tracking.
- FR-MAT-3: The first post-match moment must appear as an in-place full-screen match acceptance overlay rather than a separate chat thread or unrelated page transition.
- FR-MAT-4: When a mutual match is detected, the app must show a typewritten “Found a Match!” message, the system-assigned availability window, and an **Accept Match?** action with a visible 30-second fill timer. This gives users time to pause, review who they may meet in person, and confirm intentionally before moving forward.
- FR-MAT-5: If the user does not accept within 30 seconds, the pending match must expire and the user must return to discovery without creating an active match.
- FR-MAT-6: After the user accepts a match, the first post-match screen must emphasize the meetup suggestion flow rather than a chat thread.
- FR-MAT-7: The MVP default match expiration window is 48 hours from match creation unless changed by product policy. When a match expires without a mutually accepted meetup plan, the match must move to an expired state and disappear from active match lists.
- FR-MAT-8: After the user taps **Confirm Match** on the meetup proposal screen, the app must return them to the main discovery surface rather than a separate matches hub.
- FR-MAT-9: The **Found a Match!** overlay must show the auto-assigned meetup availability in the format **Day, Start Time to End Time** (for example, **Wed, 11:30 AM to 12:30 PM**). The displayed window must always be at least one hour long.

### Meetup recommendation engine

- FR-MEET-1: Every match must trigger a meetup suggestion attempt unless one of the users is no longer eligible or safety-restricted.
- FR-MEET-2: The engine must use each user's approximate area centroid and declared radius to define the feasible meetup zone.
- FR-MEET-3: The engine must calculate a midpoint between the two approximate origin centroids, then search safe eligible venues that fit both users' radius limits.
- FR-MEET-4: Venue sourcing must be hybrid in MVP: prefer safety-approved venues in strong-coverage cities, and allow online-data-assisted candidate sourcing where coverage is thin.
- FR-MEET-5: Bars, clubs, hotels, private residences, and other high-risk or low-visibility venues are excluded from the eligible set.
- FR-MEET-6: The engine must rank eligible venues by midpoint closeness, venue quality, daytime suitability, operating hours, and safety eligibility.
- FR-MEET-7: The app must propose one primary venue and up to two alternates when multiple valid options exist.
- FR-MEET-8: The scheduling engine must derive meetup date and time automatically from the overlap of both users' onboarding weekday availability and daytime free-time windows.
- FR-MEET-9: Auto-assigned meetup windows must stay inside the MVP daytime window of 8:00 AM to 6:00 PM local time and must be at least one hour long.
- FR-MEET-10: Suggested slots should feel after-class friendly, with default slots biased toward late morning, early afternoon, and late afternoon rather than early morning extremes.
- FR-MEET-11: If no safe valid venue exists near the midpoint, the system must broaden the overlap search zone before failing gracefully.
- FR-MEET-12: If there is no shared feasible venue at all, the app must clearly communicate that no valid suggestion is available and offer users the option to adjust radius or let the match expire.
- FR-MEET-13: User-facing meetup suggestions must never expose the other person's precise approximate-area centroid or exact address source used for the calculation.
- FR-MEET-14: The mapped meetup proposal screen must not ask users to pick among time slots. Time confirmation happens on a later scheduling step after **Confirm Match**.

### Arrival, feedback, continuation, and no-show handling

- FR-POST-1: When the meetup window begins, the app must prompt each user to confirm arrival while using proximity as a supporting signal.
- FR-POST-2: After a scheduled meetup time passes, a user marks the meetup complete, or the system detects likely date-end behavior, the app must prompt each user for private adaptive feedback.
- FR-POST-3: Feedback prompts may vary by meetup outcome, such as completed, canceled, expired, or safety-flagged.
- FR-POST-4: Users may add optional short text and may skip non-critical questions without losing access to discovery.
- FR-POST-5: If a user reports a no-show, the platform must record a private internal no-show signal for trust, ranking, and moderation use only. It must not create a public badge.
- FR-POST-6: After a completed meetup, the app must offer an optional off-platform continuation flow where users may choose whether to share supported social accounts or contact methods. Social handles must not appear on discovery cards or pre-meetup profile detail views.
- FR-POST-7: The MVP must not include a normal open-ended in-app one-to-one chat thread before or after match resolution.

### School compatibility insights and data pipeline

- FR-COMP-1: The product must maintain school-to-school compatibility aggregates derived from recent platform behavior.
- FR-COMP-2: Inputs should include mutual-like conversion to match, meetup acceptance, meetup completion, no-show reporting, and other relevant qualitative or quantitative trust and outcome signals when enough data exists.
- FR-COMP-3: The default evaluation window is the trailing 90 days so the signal stays fresh and can respond to changing behavior.
- FR-COMP-4: Compatibility must be treated as directional and school-level. It must not be framed as a person-to-person explanation of chemistry.
- FR-COMP-5: User-facing compatibility should be shown as qualitative labels such as High, Strong, Emerging, and Early Signal rather than raw scores.
- FR-COMP-6: A school pair must meet minimum data thresholds before a user-facing compatibility label is shown. The default threshold for MVP is at least 40 two-way likes and 20 matches in the trailing 90 days.
- FR-COMP-7: If the threshold is not met, the app should show a neutral early-signal state rather than a punitive low label.
- FR-COMP-8: School compatibility may influence discovery ranking, but it should contribute no more than a minority share of the final ranking score so it does not become a hard gate.
- FR-COMP-9: The platform must maintain a minimal clean data pipeline that normalizes qualitative and quantitative inputs for ranking, compatibility, trust, and future analytics.

### Trust, safety, and privacy

- FR-SAFE-1: The product must include blocking and reporting on profiles and match flows. There is no normal chat surface in MVP.
- FR-SAFE-2: Meetup defaults must favor public venues and daytime hours only.
- FR-SAFE-3: Exact addresses, dorm names, and live-location history must not be exposed to other users in MVP.
- FR-SAFE-4: Meetup-window location monitoring must require explicit per-date consent before activation.
- FR-SAFE-5: Location monitoring must be bounded to the active meetup window and may not become always-on background tracking by default.
- FR-SAFE-6: During the active meetup window, the app must support a shake-triggered in-app emergency flow.
- FR-SAFE-7: If the app detects sudden out-of-proximity movement or likely date-end behavior, it must prompt the user first before escalating to anyone else.
- FR-SAFE-8: If the user does not respond or signals danger, the app must escalate to the trusted contact with a safety alert and relevant live or last-known location context.
- FR-SAFE-9: For up to 24 hours after the meetup, the app must support repeated safety check-ins until the user confirms they are okay or the window ends per policy.
- FR-SAFE-10: Users under investigation, repeatedly reported accounts, and clearly abusive actors must be reviewable and removable through admin tools.
- FR-SAFE-11: The app must explain in plain language that compatibility insights are aggregate product signals, not statements of personal safety or romantic outcome.
- FR-SAFE-12: The app must support basic account restriction states such as active, under review, suspended, and banned.

### Admin console

- FR-ADM-1: Admins must be able to create, edit, activate, and deactivate school records.
- FR-ADM-2: Admins must be able to add and review approved email domains per school.
- FR-ADM-3: Admins must be able to review queued reports, inspect relevant profile or meetup context, and take moderation actions.
- FR-ADM-4: Admins must be able to create, edit, deactivate, and safety-tag venues, including those sourced from external place data.
- FR-ADM-5: Admins must be able to inspect school compatibility aggregates and suppress misleading or low-quality school-pair displays if needed.
- FR-ADM-6: Admins must be able to search for a user, review account state, and change status to active, under review, suspended, or banned.
- FR-ADM-7: Admins must be able to review no-show patterns, safety escalations, and trusted-contact-triggered incidents.
- FR-ADM-8: Admin tooling must be internal-only and can be web-based even though the student product is mobile-first.
- FR-ADM-9: MVP admin permissions may be simple role tiers such as moderator and super-admin rather than a full granular permissions matrix.
- FR-ADM-10: Admins must be able to review and moderate friend-review submissions before or after they appear on profiles, depending on final policy.

## Product-side Domain Objects and Events

### Core domain objects

- School: canonical record for one college or university, including active status and metadata used in discovery and reporting.
- SchoolDomain: approved email domain mapped to a School record and managed by admins.
- User: verified student account with profile fields, trust state, preferences, approximate area, radius, backup email, and trusted contact metadata.
- FriendReview: attributed structured social-proof submission from one verified user about another user who already has an account.
- ApproxArea: user-selected place label plus stored centroid coordinates used in ranking and meetup generation.
- Venue: safe eligible meetup location with coordinates, category, operating hours, source type, and moderation or approval state.
- Match: record created when two users like each other, including timestamps and school-pair context.
- MeetupProposal: generated venue and slot recommendation tied to a match, with primary option, alternates, expiry, and user actions such as accepted or skipped.
- MeetupSafetySession: per-date consent, arrival, proximity, check-in, and escalation context bounded to the meetup window and post-date follow-up.
- ContinuationHandoff: optional post-meetup exchange step for supported social accounts or contact methods.
- Report: trust-and-safety case attached to a user, profile, match, meetup, or escalation event.
- SchoolCompatibilityAggregate: rolling school-pair metrics and display band used in ranking and user-facing insight surfaces.

### Required event tracking

- Account created, auth path selected, verification email sent, verification completed, face verification completed, and onboarding completed.
- No-profile chooser shown, `Find People` selected, `Review a Friend` selected, friend-review started, friend-review submitted, and friend-review approved or rejected.
- Discovery card shown, like, pass, mutual match created.
- Meetup proposal generated, proposal failed, venue accepted, alternate selected, slot changed, widen-radius requested, and suggestion expired.
- Safety consent granted or denied, arrival confirmed, proximity-assisted arrival detected, shake emergency flow opened, user safety prompt shown, trusted-contact escalation triggered, and post-date safety check-in completed.
- Post-date feedback submitted, no-show reported, and continuation handoff accepted or skipped.
- Report filed, block applied, moderation action taken.
- School compatibility aggregate recalculated and school-pair display state changed.

## Ranking, Compatibility, and Meetup Defaults

The PRD should set defaults clearly enough that implementation can start without another product workshop. These defaults are product policy, not final algorithm lock-in.

- Discovery ranking default weighting: preference fit and safety eligibility are mandatory gates; among eligible users, distance fit and activity freshness carry the largest weight, while school compatibility remains a meaningful but minority factor.
- Smart likelihood behavior: use explicit user preferences as the primary signal in MVP rather than opaque behavior-driven personalization.
- Compatibility default score bands: 80 to 100 High, 65 to 79 Strong, 50 to 64 Emerging, below threshold Early Signal rather than a punitive low label.
- Compatibility display thresholds: show a user-facing band only after at least 40 two-way likes and 20 matches for the school pair in the trailing 90 days.
- Meetup radius default: 10 km. Metric units are the only supported unit system in MVP.
- Time-slot default behavior: suggest three slots inside 8:00 AM to 6:00 PM local time, biased toward late morning, early afternoon, and late afternoon.
- Fallback behavior: first search near the midpoint, then search the broader overlap zone, then fail gracefully if no safe eligible venue satisfies both users' radius limits.

## Success Metrics and Launch Criteria

### North-star outcome

The north-star outcome for MVP is a verified student match that progresses to a credible meetup plan and safely completes the date flow. The product should optimize for trust, meetup follow-through, and perceived safety rather than raw swipe volume alone.

### Core metrics

- Verification completion rate for eligible signups by auth path.
- Face-to-profile verification completion rate before discovery access.
- Profile completion rate before discovery access.
- No-profile chooser selection rate and friend-review submission rate.
- Like-to-match conversion rate.
- Percentage of matches that receive a valid meetup proposal within five seconds.
- Meetup proposal acceptance rate, alternate-selection rate, and expiration rate.
- Arrival confirmation rate and completed-meetup rate.
- Post-date feedback completion rate and no-show report rate.
- Safety check-in completion rate and trusted-contact escalation rate.
- Coverage of approved schools and safe eligible venues in the pilot geography.

### Launch gates

- At least three approved schools are active in the initial pilot cluster.
- Each launch geography has enough approved venues and online-data-assisted coverage to support common midpoint suggestions across likely student corridors.
- Verification, face-to-profile verification, matching, meetup proposal generation, and safety check-ins work reliably enough that the core loop can be demonstrated end to end.
- Moderation workflows, trusted-contact escalation, and emergency deactivation are operational before public launch.

## Risks and Mitigations

- Cold-start data risk: new schools will not have enough compatibility data. Mitigation: show Early Signal until thresholds are met and rely more heavily on distance and preference fit at launch.
- Venue coverage risk: midpoint math may fail in sparse or traffic-heavy areas. Mitigation: use hybrid venue sourcing with admin oversight in strong-coverage cities and external place data where coverage is thin.
- Privacy perception risk: location-aware safety features can feel invasive if poorly framed. Mitigation: require explicit per-date consent, bound location use to the meetup window, and never expose tracking to the other user.
- Verification loophole risk: some non-students may retain school mailboxes. Mitigation: state active-student-only policy, require face-to-profile authenticity checks, allow review states, and give admins tools to remove misuse.
- Product-friction risk: removing normal chat may feel unfamiliar to some users. Mitigation: keep the meetup flow fast, make post-date continuation optional, and validate whether the constrained flow improves real meetup completion.
- Social-proof abuse risk: users may submit low-quality, fake, or harmful friend reviews. Mitigation: require reviewed user account existence, keep moderation controls, and support hiding or removing review content quickly.

## Future Roadmap After MVP

- More advanced scheduling based on user availability rather than static daytime slot defaults.
- Richer school insights, campus-specific prompts, or same-school versus cross-school discovery controls.
- Deeper off-platform continuation tooling only if it improves safety and repeat engagement without creating harassment risks.
- Premium features, referral loops, student-facing web, or broader social/community mechanics only after the core verified dating loop proves value.
- Smarter compatibility weighting, better venue personalization, and safer automation experiments once the MVP data pipeline has matured.

## Acceptance Criteria for the Next Implementation Agent

- The implementation plan must preserve the active-student-only eligibility model and approved-domain school mapping.
- The student product must be mobile-first, while admin tooling may be a separate internal web surface.
- The core end-to-end flow must be verify school identity, complete face and safety onboarding, choose `Find People` or `Review a Friend` if no profile exists, browse, match, receive a meetup suggestion, confirm arrival, complete feedback, and optionally continue off-platform.
- Meetup generation must use approximate areas and radius preferences rather than exact address sharing or always-on live tracking.
- The MVP must exclude night meetups and high-risk venues.
- School compatibility must remain directional, school-to-school, threshold-gated, and qualitative on the user-facing side.
- Safety controls, moderation states, trusted-contact escalation, and meetup-window safety logic are required parts of MVP rather than post-launch extras.
- Friend-review social proof must replace any in-app friends or mutual-friends feature in MVP.
- The MVP must not reintroduce a normal one-to-one in-app chat thread without an explicit product decision.
- Any technical design produced later may choose specific vendors or frameworks, but it must not change the product defaults documented here without an explicit product decision.
