import client from "./client";

// Every list endpoint returns an array of "shaped" polls (see backend
// utils/pollShape.js + utils/counts.js):
// { _id, question, type, category, closed, createdAt, creator, options,
//   views, totalVotes, results, myVote, isBookmarked, comments, saves }
export const pollsApi = {
  // GET /api/polls?type=&category=&feed=following
  list: (params = {}) => client.get("/polls", { params }).then((r) => r.data),

  // GET /api/polls/:id -> single shaped poll (increments view count server-side
  // unless ?noview=true is passed, e.g. right after voting to avoid double count)
  get: (id, { noview } = {}) =>
    client.get(`/polls/${id}`, { params: noview ? { noview: "true" } : {} }).then((r) => r.data),

  getMine: () => client.get("/polls/mine").then((r) => r.data),
  getVoted: () => client.get("/polls/voted").then((r) => r.data),
  getBookmarks: () => client.get("/polls/bookmarks").then((r) => r.data),

  // GET /api/polls/trending -> [{ type, count }] -- this is a per-type
  // aggregate count, NOT a ranked list of trending poll documents.
  getTrendingCounts: () => client.get("/polls/trending").then((r) => r.data),

  // GET /api/polls/:id/analytics (creator only) -> { poll, comments }
  getAnalytics: (id) => client.get(`/polls/${id}/analytics`).then((r) => r.data),

  // POST /api/polls  (multipart when type === "image", JSON otherwise)
  // type: "single" -> options: string[] (min 2)
  // type: "yesno" | "rating" | "open" -> no options needed
  // type: "image" -> images: File[] (min 2)
  create: ({ question, type, category, options, images }) => {
    if (type === "image") {
      const fd = new FormData();
      fd.append("question", question);
      fd.append("type", type);
      if (category) fd.append("category", category);
      (images || []).forEach((file) => fd.append("images", file));
      return client.post("/polls", fd).then((r) => r.data);
    }
    return client
      .post("/polls", {
        question,
        type,
        category,
        options: type === "single" ? JSON.stringify(options || []) : undefined,
      })
      .then((r) => r.data);
  },

  // POST /api/polls/:id/vote  body: { value }
  // single/image -> value = option index (number)
  // yesno -> value = index 0 ("Yes") | 1 ("No")
  // rating -> value = 1..5
  // open -> value = free text string
  vote: (id, value) => client.post(`/polls/${id}/vote`, { value }).then((r) => r.data),

  // DELETE /api/polls/:id/vote -> undo your vote
  removeVote: (id) => client.delete(`/polls/${id}/vote`).then((r) => r.data),

  // PATCH /api/polls/:id/close -> toggles open/closed, returns { closed }
  toggleClose: (id) => client.patch(`/polls/${id}/close`).then((r) => r.data),

  // PATCH /api/polls/:id  body: { question?, category? }
  update: (id, payload) => client.patch(`/polls/${id}`, payload).then((r) => r.data),

  // DELETE /api/polls/:id
  remove: (id) => client.delete(`/polls/${id}`).then((r) => r.data),

  // POST /api/polls/:id/bookmark -> { bookmarked: boolean }
  toggleBookmark: (id) => client.post(`/polls/${id}/bookmark`).then((r) => r.data),
};
