# LOOP — Demo Video Script & Storyboard

**Format:** ~4–5 minute screen recording with voice-over (or captions).
**Goal:** Show a complete "collect → classify → understand → act" loop in under 5 minutes.

---

## Setup Checklist (before recording)

- [ ] Backend running: `cd backend && npm run dev` (port 5000)
- [ ] Frontend running: `cd frontend && npm run dev` (port 3000)
- [ ] DB seeded: `npm run seed` + `npm run seed:demo` in backend
- [ ] `.env` files set (`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY` in backend; `NEXT_PUBLIC_API_URL` in frontend)
- [ ] Browser at 1440×900, zoom 100%
- [ ] Recording at 30fps, window-capture (not full screen), cursor highlighted
- [ ] Test mic, silence notifications/OS sounds

---

## Scene-by-Scene Script

### Scene 1 — Hook (0:00–0:15)
**Screen:** LOOP login page
> "Every business has thousands of customer voices. Most of them never get heard. **LOOP** turns that noise into a signal — automatically classifying feedback, surfacing trends, and letting you ask your data questions in plain English."

**Action:** Type `admin@loop.com` / `Loop@123`, click **Sign in**.

---

### Scene 2 — Dashboard & Analytics (0:15–0:55)
**Screen:** `/protected/admin/dashboard`
> "This is the workspace. Everything is at a glance — feedback volume, sentiment mix, top themes, and recent items that need attention."

**Action:** Hover over a few stat cards; click **Analytics** in the sidebar.

**Screen:** `/protected/admin/analytics`
> "Drill into the analytics. Sentiment distribution over time, themes by volume, and per-channel performance — all computed in real time from every feedback record."

**Action:** Toggle through Overview / Sentiment / Themes / Sources / Trends tabs.

---

### Scene 3 — Inbox & AI Classification (0:55–1:35)
**Screen:** `/protected/admin/inbox`
> "Every piece of feedback lands in the inbox. Each item has already been classified by AI — sentiment, theme, and a confidence score — so nothing gets buried."

**Action:** Open one feedback item (`/protected/admin/inbox/[id]`), show the classified fields, change its status, mark it important.

---

### Scene 4 — Ask LOOP (the wow moment) (1:35–2:25)
**Screen:** `/protected/admin/ask-loop`
> "Here's the part I love. Instead of building a report, just **ask**."

**Action:** Type *"What are the top complaints in the last 7 days?"* and send.
> "LOOP answers in natural language with citations back to the actual feedback — and every answer is grounded in your real data."

**Action:** Ask a second question: *"Which channel has the most negative sentiment?"* Show the follow-up thread. Expand a citation.

---

### Scene 5 — Reports (2:25–3:10)
**Screen:** `/protected/admin/reports`
> "For something to share with the team, generate a polished report."

**Action:** Click **New report**, pick sources + metrics, click **Generate**. Then open the report detail and hit **Preview**.
> "Live preview, exportable, and tied to the same themes we saw earlier."

**Action:** Export to CSV.

---

### Scene 6 — Team & Settings (3:10–3:40)
**Screen:** `/protected/admin/team`
> "Invite teammates with role-based access — Admin, Analyst, or Viewer."

**Action:** Type an email, pick a role, click **Invite**. Show the pending invitation appear.

**Screen:** `/protected/admin/settings`
> "And control exactly how AI behaves — classification thresholds, notification toggles, retention — per workspace."

**Action:** Flip a couple of toggles in **AI** and **Notifications** tabs, save.

---

### Scene 7 — Close (3:40–4:15)
**Screen:** Analytics overview again
> "From raw feedback to decisions in minutes. That's LOOP — AI Customer Feedback Intelligence."

**Action:** Fade out on the sentiment trend chart.

---

## Audio Notes
- Keep voice-over calm and slow (~140 wpm).
- On each "wow" moment (Ask LOOP answer, live preview), pause 1–2 s so viewers can read.
- Optional background music: low-volume, no vocals.

## Post-Production
- Add subtle zoom on clicks (2×, 300 ms).
- Overlay captions for the key metrics ("38% positive · 38% negative").
- Export 1080p, H.264, `.mp4`. Title: **"LOOP — AI Customer Feedback Intelligence"**.

## If Things Go Wrong (Backup)
- Ask LOOP needs a valid `GEMINI_API_KEY`; if the model call fails, the API has a graceful fallback path — re-run the same question once.
- Re-seed any time: `cd backend && npm run seed:demo`.
