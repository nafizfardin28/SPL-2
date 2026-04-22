import { getAuthToken } from "../store/authstore";

const API_BASE = "http://localhost:5000/api/notices";

const buildHeaders = () => {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const createNotice = async ({ title, body, audiences }) => {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ title, body, audiences }),
    });

    const data = await response.json();

    return {
      ok: response.ok,
      ...data,
    };
  } catch (error) {
    console.error("createNotice error:", error);
    return {
      ok: false,
      message: "Network error while creating notice.",
    };
  }
};

export const getMyNotices = async () => {
  try {
    const response = await fetch(`${API_BASE}/mine`, {
      method: "GET",
      headers: buildHeaders(),
    });

    const data = await response.json();

    return {
      ok: response.ok,
      notices: data.notices || [],
      message: data.message,
    };
  } catch (error) {
    console.error("getMyNotices error:", error);
    return {
      ok: false,
      notices: [],
      message: "Network error while fetching notices.",
    };
  }
};

export const getStudentNotices = async () => {
  try {
    const response = await fetch(`${API_BASE}/student`, {
      method: "GET",
      headers: buildHeaders(),
    });

    const data = await response.json();

    return {
      ok: response.ok,
      notices: data.notices || [],
      message: data.message,
    };
  } catch (error) {
    console.error("getStudentNotices error:", error);
    return {
      ok: false,
      notices: [],
      message: "Network error while fetching notices.",
    };
  }
};

export const getAdminNotices = async () => {
  try {
    const response = await fetch(`${API_BASE}/admin`, {
      method: "GET",
      headers: buildHeaders(),
    });

    const data = await response.json();

    return {
      ok: response.ok,
      teacherNotices: data.teacherNotices || [],
      staffNotices: data.staffNotices || [],
      message: data.message,
    };
  } catch (error) {
    console.error("getAdminNotices error:", error);
    return {
      ok: false,
      teacherNotices: [],
      staffNotices: [],
      message: "Network error while fetching admin notices.",
    };
  }
};