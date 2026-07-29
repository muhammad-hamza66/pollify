// The backend returns a FLAT comment list where each item may reference a
// parent via `parent` (a Comment _id) or be top-level (`parent: null`).
// Build the nested tree the UI needs, client-side, once per fetch.
export function buildCommentTree(flatComments) {
  const byId = new Map(flatComments.map((c) => [c._id, { ...c, replies: [] }]));
  const roots = [];
  for (const comment of byId.values()) {
    if (comment.parent && byId.has(comment.parent)) {
      byId.get(comment.parent).replies.push(comment);
    } else {
      roots.push(comment);
    }
  }
  return roots;
}
