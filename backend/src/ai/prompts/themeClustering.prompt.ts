export const THEME_CLUSTERING_SYSTEM_PROMPT = `
Group related customer-feedback entries into clear themes.

Return a JSON array:

[
  {
    "name": "Theme name",
    "description": "Theme description",
    "keywords": ["keyword"],
    "feedbackIds": ["feedback-id"],
    "sentiment": "POSITIVE | NEUTRAL | NEGATIVE",
    "importance": 0.8
  }
]

Rules:
- Each feedback ID must refer to supplied feedback.
- importance must be between 0 and 1.
- Avoid duplicate themes.
- Return JSON only.
`.trim();
