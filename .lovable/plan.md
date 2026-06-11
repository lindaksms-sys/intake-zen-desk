# Clinic Copilot — 60s Hackathon Demo Video

A polished, render-to-MP4 demo video built with Remotion. Clean medical/tech aesthetic, ElevenLabs AI voiceover, 1920x1080 @ 30fps, output to `/mnt/documents/clinic-copilot-demo.mp4`.

## Visual direction

- **Palette**: white `#FFFFFF`, soft surface `#F4F7FB`, ink `#0B1B2B`, clinical blue `#1E6BE6`, accent teal `#14B8A6`, alert `#EF4444`
- **Type**: Inter (display + body), tight tracking, large numerics
- **Motion**: snappy springs, fast cuts (~2s avg), subtle parallax, soft grid background, no neon

## Narrative arc (6 scenes, ~60s)

```text
[0-8s]   HOOK — "Clinics drown in messages."          chaos: notification stack
[8-18s]  PROBLEM — missed calls, slow triage          stat: "73% of urgent cases wait >2h"
[18-30s] SOLUTION — AI intake form + urgency scoring  intake form mock → urgency badge animates
[30-44s] DASHBOARD — triage queue, assign, case detail  fake cases stream in, get sorted
[44-54s] OUTCOMES — stats counter                      "4.2h saved/day · 38% faster response · 2x bookings"
[54-60s] CTA — logo + copilot.creativehauz.space      end card
```

## Voiceover script (~150 words, Sarah voice)

> Every day, clinics lose patients to chaos. Missed calls. Stacked DMs. Urgent cases buried in noise.
>
> Meet Clinic Copilot — an AI front desk that never sleeps.
>
> Patients describe their symptoms in a simple intake form. Our AI scores urgency in real time — red for now, amber for today, green for routine.
>
> Your team sees one clean queue. Sorted by what matters. One click to assign. One view for the full case.
>
> The result? Four hours saved per day. Thirty-eight percent faster response. Twice the bookings — with the same staff.
>
> Clinic Copilot. Built by Creative Hauz. Visit copilot dot creative hauz dot space.

## Scenes (Remotion)

| # | Scene | Duration | Key motion |
|---|---|---|---|
| 1 | Hook | 240f | Notification cards stack and overflow, blur in headline |
| 2 | Problem | 300f | Inbox unread counter ticks up, big stat slides in |
| 3 | Intake + AI | 360f | Form fields auto-type, urgency badge spring-pops red |
| 4 | Dashboard | 420f | Case rows stream in, auto-sort by urgency, assign avatar drops |
| 5 | Outcomes | 300f | Three big numbers count up with staggered spring |
| 6 | CTA | 180f | Logo mark draws in, URL fades up |

Total: 1800 frames @ 30fps = 60s. TransitionSeries with `fade` (15f) between scenes.

## Technical setup

1. Scaffold `remotion/` with Bun + Remotion deps + musl compositor fix (per skill setup)
2. Load Inter via `@remotion/google-fonts/Inter`
3. Generate VO via ElevenLabs Sarah (`EXAVITQu4vr4xnSDxMaL`), `eleven_multilingual_v2`, save to `remotion/public/audio/vo.mp3`
4. Generate light bg music SFX via ElevenLabs sound-generation (22s loop, ducked under VO)
5. Build 6 scene components under `remotion/src/scenes/`
6. Render via `scripts/render-remotion.mjs` with `chrome-for-testing`, `muted: false`, concurrency 1
7. Output: `/mnt/documents/clinic-copilot-demo.mp4`

## Assets

- All UI mocked in Remotion components (no screenshots needed — faster, cleaner, on-brand)
- Logo: simple SVG wordmark "Clinic Copilot" in Inter
- No user-uploaded assets required

## Prereqs

- ElevenLabs connector must be linked. If not, I'll prompt to connect before generating VO.

## Deliverable

`clinic-copilot-demo.mp4` — 1920x1080, 60s, H.264, ~15-25MB, ready to upload to the hackathon submission.

---

Approve and I'll scaffold + render. Render takes ~3-6 min.
