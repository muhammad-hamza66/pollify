# Frontend Notes — Backend Audit & Integration Decisions

This file documents exactly how the frontend was built against your real backend code (`Backend.zip`), not assumptions.

## API contract used

Base path: `/api` (from `server.js`)

| Resource | Routes used |
|---|---|
| Auth | `POST /auth/register`, `/auth/verify-otp`, `/auth/resend-otp`, `/auth/login`, `/auth/forgot-password`, `/auth/verify-reset-otp`, `/auth/reset-password`, `GET /auth/me`, `PATCH /auth/profile`, `PATCH /auth/password`, `DELETE /auth/account` |
| Polls | `GET /polls`, `GET /polls/:id`, `GET /polls/mine`, `GET /polls/voted`, `GET /polls/bookmarks`, `GET /polls/trending`, `GET /polls/:id/analytics`, `POST /polls`, `POST /polls/:id/vote`, `DELETE /polls/:id/vote`, `PATCH /polls/:id/close`, `PATCH /polls/:id`, `DELETE /polls/:id`, `POST /polls/:id/bookmark` |
| Comments | `GET /comments/:pollId`, `POST /comments/:pollId`, `DELETE /comments/:commentId` |
| Notifications | `GET /notifications`, `PATCH /notifications/read` |
| Users | `GET /users/:username`, `POST /users/:username/follow`, `GET /users/:username/connections` |

Auth: JWT via `Authorization: Bearer <token>` header (not cookies), attached by an Axios request interceptor. Token stored in `localStorage`.

## Decisions made because of backend constraints

1. **Likes vs. Bookmarks** — The `User` model only has a `bookmarks` array; there is no `likes` field anywhere (User, Poll, or Comment). Building a "Like" button would call an endpoint that doesn't exist. The frontend implements **Saved Polls** only, backed by the real `bookmark` toggle endpoint.

2. **No WebSocket/Socket.io layer** — `server.js` starts a plain HTTP/Express server. "Live results" is implemented as: optimistic UI right after voting, plus a background `setInterval` refetch every 8 seconds on the poll details page. This is disclosed in code comments and in the README rather than presented as true real-time.

3. **No text search endpoint** — `GET /polls` (in `pollController.js`) only reads `type`, `category`, and `feed` from `req.query`. There's no `q` parameter and no text index in the `Poll` schema. The Search page fetches the full poll list once and filters client-side. **Recommendation:** add `req.query.q` support with a `$or` regex/text match on `question` and `category` server-side, plus pagination (`skip`/`limit`) — right now `listPolls` returns every poll with no limit, which will not scale.

4. **Poll type reality check** — The `Poll` model's `type` enum is `single | yesno | rating | image | open`. Only `single` and `image` involve multiple options; a vote's `value` is a single number or string (see `voteSchema`), so there is no multi-select. The Create Poll UI is labeled "Single Choice," not "Multiple Choice," to avoid promising behavior the schema can't store.

5. **No expiration / visibility / tags / anonymous fields** — none of these exist on the `Poll` model. Rather than add dead form fields that silently do nothing, they were left out of Create Poll. All are reasonable, low-risk additions to the schema if you want them later.

6. **Comments are flat** — `getComments` in `commentController.js` returns a flat array; nesting via the `parent` field is done entirely client-side in `utils/buildCommentTree.js`.

7. **Register → OTP → token** — `registerUser` does not return a token; it returns `{ needsVerification: true, email }` and emails an OTP (see `utils/otp.js`). Only `verifyOtp` and `login` (post-verification) return a JWT. The frontend's `AuthContext` reflects this: `register()` never sets a session, only `completeVerification()` and `login()` do.

8. **`GET /polls/:id` increments a view counter** every call. The frontend passes `?noview=true` when re-fetching immediately after a vote or a background refresh, so a user's own vote/poll-open doesn't inflate their own view count on every refetch.

## Suggested backend improvements (not made — you said backend is out of scope)

- Add pagination (`skip`/`limit`) to `GET /polls`; it currently returns the entire collection unbounded.
- Add a `q` query param for real search.
- Consider a lightweight Socket.io layer if true real-time results matter for the product pitch.
- Consider adding `likes` alongside `bookmarks` if "Like" is meant to be distinct from "Save."
