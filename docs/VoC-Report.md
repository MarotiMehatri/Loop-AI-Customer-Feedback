# Voice of the Customer (VoC) Report — Acme Corp

**Workspace:** `acme-corp` (demo)
**Period:** Last 14 days
**Source:** `backend/prisma/seed-demo-data.ts` (34 demo feedback records)
**Generated:** Demo dataset — analytics dashboard mein live `GET /api/v1/analytics` se verify kiya jaa sakta hai

---

## 1. Executive Summary

34 feedback items were collected over the last 14 days across 6 channels. Sentiment is evenly split: **38.2% positive, 38.2% negative, 23.5% neutral**. While customers love the usability of the new UI, the **single biggest cluster of complaints is around product bugs** — login failures, crashes on large-file upload, stale dashboard data, and broken search filters are eroding trust in an otherwise well-received product. The most common *request* is PDF export and related reporting features, signalling that customers want the platform to be a deeper analytical tool rather than just a dashboard.

---

## 2. Sentiment Overview

| Sentiment | Count | % |
|-----------|------:|---:|
| Positive | 13 | 38.2% |
| Negative | 13 | 38.2% |
| Neutral  | 8  | 23.5% |
| **Total** | **34** | **100%** |

> Positive-Negative balance: 1.00 (1:1). No dominant sentiment — fixes on bugs could quickly tip the balance positive.

---

## 3. Channel Breakdown

| Channel | Count | % |
|---------|------:|---:|
| Survey  | 7  | 20.6% |
| Support | 7  | 20.6% |
| Email   | 6  | 17.6% |
| Website | 6  | 17.6% |
| App Store | 4 | 11.8% |
| Social  | 4  | 11.8% |

**Insight:** Support tickets carry the **highest share of negative sentiment** (6 of 7), while Social and App Store skew positive. Email is bimodal — praise for billing comms on one hand, refund/complaint escalations on the other.

---

## 4. Theme Analysis

| Theme | Count | % | Dominant Sentiment |
|-------|------:|---:|--------------------|
| Feature Request | 9 | 26.5% | Neutral |
| Product Bug | 8 | 23.5% | Negative (8/8) |
| Pricing | 5 | 14.7% | Mixed (3 neg / 2 pos) |
| Customer Support | 5 | 14.7% | Positive (4/5) |
| UI / UX | 5 | 14.7% | Mixed (3 pos / 2 neg) |
| Product Experience | 2 | 5.9% | Positive |

### 4.1 Product Bug (Highest-Impact Negative Theme)
All 8 mentions are negative. Sub-themes:
- **Authentication:** login broken after update
- **Stability:** mobile app crashes on large-file upload
- **Data freshness:** dashboard reports show stale data after refresh
- **Search:** filters return incorrect results
- **Integrations:** Zapier fails intermittently
- **Platform gaps:** no iOS app / can't change profile pic on mobile

### 4.2 Feature Request (Highest-Volume Theme)
9 requests, almost all neutral — these are **unmet needs**, not complaints:
- PDF export of weekly reports + sentiment report
- Slack integration for real-time notifications
- Custom report scheduling
- Report auto-suggest and period-over-period comparison
- iOS mobile app

### 4.3 Pricing (Revenue-Sensitive)
Split opinion: "too expensive / team seats limited" vs. "great value for money / yearly discount convinced us to upgrade". One billing dispute (double charge) flagged as important.

### 4.4 Customer Support (Strength to Protect)
4 of 5 positive — "solved quickly", "responded within minutes". One double-charge/refund case needs a fast resolution to protect this reputation.

### 4.5 UI / UX (Mixed)
New colour scheme, dark mode, and chart types are praised; onboarding flow and truncated chart labels need polish.

---

## 5. Important Flags

5 items are marked `isImportant` in the dataset:

1. "I am facing issues while logging in after the latest update. Please fix this." — **P0, blocks all usage**
2. "The pricing is too expensive compared to other tools in the market." — churn risk
3. "The dashboard reports show stale data after refresh." — trust risk
4. "I was charged twice last month, need a refund." — billing, legal/finance
5. "The new analytics dashboard is amazing and super easy to use." — strong promoter, amplify

---

## 6. Representative Quotes

> "The new analytics dashboard is amazing and super easy to use." — *Priya Sharma, App Store*
>
> "I am facing issues while logging in after the latest update. Please fix this." — *Rahul Verma, Support*
>
> "The mobile app keeps crashing when I upload a large file." — *Vikram Singh, App Store*
>
> "The pricing is too expensive compared to other tools in the market." — *Amit Patel, Email*
>
> "The support team responded within minutes, very impressive!" — *Kavita Joshi, Social*
>
> "The tool is intuitive and the learning curve is small." — *Sakshi Pandey, App Store*

---

## 7. Recommendations (Priority Order)

1. **Fix the login regression (P0)** — highest-importance item; gate any release on a full auth regression suite.
2. **Investigate stale dashboard data** — refresh/cache bug erodes trust; pair with the search-filter and date-range-picker bugs in one "data correctness" sprint.
3. **Ship PDF export** — the #1 requested feature (2 of 9 feature requests); the reports module already supports export, so this is a low-effort, high-perception win.
4. **Deploy a lightweight iOS app (or PWA)** — iOS and mobile gaps (crash, profile-pic) appear repeatedly across channels.
5. **Standardize notification controls** — "too noisy, want to control which ones I get"; settings module supports per-type toggles.
6. **Protect the support win** — resolve the double-charge case fast and consider priority support in annual plans (directly requested).
7. **Pricing segmentation** — address "too expensive" with a mid-tier or team-seat expansion, since value perception is otherwise strong.

---

## 8. Methodology

- Dataset: 34 records from `FEEDBACK_SEED` in `backend/prisma/seed-demo-data.ts`.
- Sentiment/category labels are provided by the seed; in production they are generated by the **AI classification pipeline** (`ai-classification` module, Gemini-backed) and can be re-verified via the **Ask LOOP** natural-language interface.
- Report produced from the demo dataset so the numbers above can be reproduced exactly in the running app.
