import client from "./client";

// Matches routes/notificationRoutes.js. Notification `type` is only
// ever "vote" | "comment" (per models/Notification.js) -- there is no
// follow-notification on the backend, so the UI must not imply one.
export const notificationsApi = {
  // GET /api/notifications -> { items: [...], unread: number }
  list: () => client.get("/notifications").then((r) => r.data),
  // PATCH /api/notifications/read -> marks ALL unread as read (no per-item endpoint)
  markAllRead: () => client.patch("/notifications/read").then((r) => r.data),
};
