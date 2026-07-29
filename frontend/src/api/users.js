import client from "./client";

// Matches routes/userRoutes.js.
export const usersApi = {
  // GET /api/users/:username -> { user, isFollowing, isMe, stats, polls }
  getProfile: (username) => client.get(`/users/${username}`).then((r) => r.data),
  // POST /api/users/:username/follow -> { following, followers }
  toggleFollow: (username) => client.post(`/users/${username}/follow`).then((r) => r.data),
  // GET /api/users/:username/connections -> { followers, following }
  getConnections: (username) => client.get(`/users/${username}/connections`).then((r) => r.data),
};
