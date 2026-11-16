const ADMIN_KEY = "wishlist_admin_password";

export function getAdminPassword() {
  return sessionStorage.getItem(ADMIN_KEY) || "";
}

export function setAdminPassword(password) {
  sessionStorage.setItem(ADMIN_KEY, password);
}

export function clearAdminPassword() {
  sessionStorage.removeItem(ADMIN_KEY);
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (options.admin) {
    headers["x-admin-password"] = getAdminPassword();
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    const error = new Error(data?.error || "Algo salió mal");
    error.status = res.status;
    throw error;
  }

  return data;
}

export const api = {
  getSettings: () => request("/settings"),
  getParticipants: () => request("/participants"),
  getWishlist: (id) => request(`/participants/${id}/wishlist`),
  saveWishlist: (id, items) =>
    request(`/participants/${id}/wishlist`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),
  verifyAdmin: () => request("/admin/verify", { method: "POST", admin: true }),
  adminParticipants: () => request("/admin/participants", { admin: true }),
  addParticipant: (name) =>
    request("/admin/participants", {
      method: "POST",
      admin: true,
      body: JSON.stringify({ name }),
    }),
  updateParticipant: (id, name) =>
    request(`/admin/participants/${id}`, {
      method: "PUT",
      admin: true,
      body: JSON.stringify({ name }),
    }),
  deleteParticipant: (id) =>
    request(`/admin/participants/${id}`, {
      method: "DELETE",
      admin: true,
    }),
  updateSettings: (eventTitle) =>
    request("/admin/settings", {
      method: "PUT",
      admin: true,
      body: JSON.stringify({ eventTitle }),
    }),
};
