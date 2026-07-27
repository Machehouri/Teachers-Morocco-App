import toast from "react-hot-toast";

const API_URL = "http://127.0.0.1:8000";

// ── central response handler ───────────────────────────────────────────────
// Wrap every fetch response through this.
// - 401 → clears storage, redirects to login
// - 403 → "Not allowed" toast
// - other errors → surfaces Django's own error message
// - 204 No Content → returns null (used by DELETE)
export async function handleResponse(res) {
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    toast.error("Session expired. Please log in again.");
    localStorage.clear();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (res.status === 403) {
    toast.error("Not allowed.");
    throw new Error("Forbidden");
  }

  if (res.status === 404) {
    toast.error("Not found.");
    throw new Error("Not found");
  }

  if (!res.ok) {
    const msg =
      data?.detail ||
      data?.non_field_errors?.[0] ||
      Object.values(data)?.[0]?.[0] ||
      "Something went wrong.";
    toast.error(msg);
    throw new Error(msg);
  }

  return data;
}

// ── auth ───────────────────────────────────────────────────────────────────
export const login = async (data) => {
  const res = await fetch(`${API_URL}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const signup = async (data) => {
  const res = await fetch(`${API_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// ── teachers ───────────────────────────────────────────────────────────────
export const getTeachers = async (token, query = "") => {
  const url = query
    ? `${API_URL}/teachers/?search=${query}`
    : `${API_URL}/teachers/`;
  const res = await fetch(url, {
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  });
  return handleResponse(res);
};

export const createTeacher = async (token, data) => {
  const res = await fetch(`${API_URL}/teachers/`, {
    method: "POST",
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: data,
  });
  return handleResponse(res);
};

export const updateTeacher = async (token, id, data) => {
  const res = await fetch(`${API_URL}/teachers/${id}/`, {
    method: "PUT",
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: data,
  });
  return handleResponse(res);
};

export const deleteTeacher = async (token, id) => {
  const res = await fetch(`${API_URL}/teachers/${id}/`, {
    method: "DELETE",
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  });
  return handleResponse(res);
};

// ── reviews ────────────────────────────────────────────────────────────────
export const createReview = async (token, data) => {
  const res = await fetch(`${API_URL}/reviews/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// ── bookings ───────────────────────────────────────────────────────────────
export const createBooking = async (token, data) => {
  const res = await fetch(`${API_URL}/bookings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const getBookings = async (token) => {
  const res = await fetch(`${API_URL}/bookings/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const updateBookingStatus = async (token, id, status) => {
  const res = await fetch(`${API_URL}/bookings/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
};

// ── availability ───────────────────────────────────────────────────────────
export const deleteAvailability = async (token, id) => {
  const res = await fetch(`${API_URL}/availability/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

// ── notifications ──────────────────────────────────────────────────────────
export const markNotificationRead = async (token, id) => {
  const res = await fetch(`${API_URL}/notifications/${id}/read/`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};