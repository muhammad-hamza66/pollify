import client from "./client";

// Maps 1:1 to routes/authRoutes.js. registerUser/updateProfile use
// multipart/form-data because the backend accepts an optional `image` file
// via multer -- axios auto-sets the multipart boundary when given FormData.
const toFormData = (fields) => {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fd;
};

export const authApi = {
  // POST /api/auth/register -> { needsVerification, email }
  // NOTE: do not set Content-Type manually here -- Axios needs to inspect
  // the FormData instance itself to generate "multipart/form-data;
  // boundary=...". A hardcoded header strips the boundary and multer fails
  // to parse the body server-side.
  register: ({ name, email, username, password, image }) =>
    client.post("/auth/register", toFormData({ name, email, username, password, image })).then((r) => r.data),

  // POST /api/auth/verify-otp -> { token, user }
  verifyOtp: (payload) => client.post("/auth/verify-otp", payload).then((r) => r.data),

  // POST /api/auth/resend-otp -> { message }
  resendOtp: (email) => client.post("/auth/resend-otp", { email }).then((r) => r.data),

  // POST /api/auth/login -> { token, user } | 403 { needsVerification, email }
  login: (payload) => client.post("/auth/login", payload).then((r) => r.data),

  // POST /api/auth/forgot-password -> { message }
  forgotPassword: (email) => client.post("/auth/forgot-password", { email }).then((r) => r.data),

  // POST /api/auth/verify-reset-otp -> { ok }
  verifyResetOtp: (payload) => client.post("/auth/verify-reset-otp", payload).then((r) => r.data),

  // POST /api/auth/reset-password -> { message }
  resetPassword: (payload) => client.post("/auth/reset-password", payload).then((r) => r.data),

  // GET /api/auth/me -> { user, stats: { created, voted, bookmarked } }
  getMe: () => client.get("/auth/me").then((r) => r.data),

  // PATCH /api/auth/profile -> { user }
  // Same reasoning as register(): let Axios set the multipart Content-Type
  // with boundary automatically instead of overriding it.
  updateProfile: ({ name, username, bio, image }) =>
    client.patch("/auth/profile", toFormData({ name, username, bio, image })).then((r) => r.data),

  // PATCH /api/auth/password -> { message }
  changePassword: (payload) => client.patch("/auth/password", payload).then((r) => r.data),

  // DELETE /api/auth/account -> { message }
  deleteAccount: () => client.delete("/auth/account").then((r) => r.data),
};
