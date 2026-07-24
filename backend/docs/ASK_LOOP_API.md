# Ask LOOP API

Base path: `/api/ask-loop`

All endpoints require:

- authenticated user
- active workspace
- workspace-scoped database queries

## POST `/ask`

Request:

```json
{
  "question": "What are customers complaining about most?",
  "conversationId": "optional-cuid",
  "dateFrom": "2026-07-01T00:00:00.000Z",
  "dateTo": "2026-07-24T23:59:59.999Z",
  "topK": 8
}
```

Response:

```json
{
  "success": true,
  "data": {
    "conversationId": "cuid",
    "answer": "Pricing is the most frequent complaint...",
    "summary": "Pricing leads negative feedback.",
    "citations": [
      {
        "feedbackId": "cuid",
        "excerpt": "The new plan is too expensive...",
        "channel": "SUPPORT",
        "customerLabel": "Customer 17",
        "createdAt": "2026-07-20T10:00:00.000Z",
        "similarity": 0.8841
      }
    ],
    "chart": null,
    "followUpQuestions": ["Which pricing issue appears most often?"]
  }
}
```

## GET `/suggestions`

Query parameters:

- `dateFrom`
- `dateTo`
- `limit` (1–10)

## GET `/conversations?page=1&limit=20`

Lists the authenticated user's conversations in the active workspace.

## GET `/conversations/:conversationId`

Returns the conversation, messages and evidence citations.

## DELETE `/conversations/:conversationId`

Deletes only a conversation owned by the authenticated user in the active
workspace.

## Required behaviour

1. Every feedback search is filtered by `workspaceId`.
2. Claude receives only retrieved feedback as grounding context.
3. Claude returns citation IDs from the retrieved set.
4. The backend filters invalid citation IDs before saving.
5. API keys remain server-side.
6. Ask requests are rate limited.
