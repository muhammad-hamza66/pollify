import client from "./client";

// Matches routes/commentRoutes.js. getComments returns a FLAT array
// (each item may have a non-null `parent`) -- the reply tree is built
// client-side in utils/buildCommentTree.js, the backend does not nest it.
export const commentsApi = {
  list: (pollId) => client.get(`/comments/${pollId}`).then((r) => r.data),
  add: (pollId, { text, parent }) =>
    client.post(`/comments/${pollId}`, { text, parent }).then((r) => r.data),
  remove: (commentId) => client.delete(`/comments/${commentId}`).then((r) => r.data),
};
