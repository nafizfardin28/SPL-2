const explicitBaseUrl = process.env.REACT_APP_API_BASE_URL;

const baseUrlCandidates = explicitBaseUrl
  ? [explicitBaseUrl]
  : ["/api", "http://localhost:5000/api"];

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => ({})) : {};

  if (!response.ok) {
    return { ok: false, message: data.message || `Request failed (${response.status}).` };
  }

  return { ok: true, ...data };
};

const getAuthHeaders = () => {
  const auth = JSON.parse(localStorage.getItem("academix-auth") || "{}");
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  return headers;
};

export const postJson = async (path, body) => {
  let lastResult = null;
  let lastError = null;

  for (const baseUrl of baseUrlCandidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const result = await parseResponse(response);

      if (result.ok) {
        return result;
      }

      lastResult = result;

      if (response.status === 404) {
        continue;
      }

      return result;
    } catch (error) {
      lastError = error;
    }
  }

  return (
    lastResult || {
      ok: false,
      message:
        "Cannot reach backend. Ensure `node backend/server.js` is running, or set REACT_APP_API_BASE_URL.",
      details: lastError?.message,
    }
  );
};

export const getJson = async (path) => {
  let lastResult = null;
  let lastError = null;

  for (const baseUrl of baseUrlCandidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const result = await parseResponse(response);

      if (result.ok) return result;

      lastResult = result;

      if (response.status === 404) continue;

      return result;
    } catch (error) {
      lastError = error;
    }
  }

  return (
    lastResult || {
      ok: false,
      message: "Cannot reach backend.",
      details: lastError?.message,
    }
  );
};

export const putJson = async (path, body) => {
  let lastResult = null;
  let lastError = null;

  for (const baseUrl of baseUrlCandidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const result = await parseResponse(response);

      if (result.ok) return result;

      lastResult = result;

      if (response.status === 404) continue;

      return result;
    } catch (error) {
      lastError = error;
    }
  }

  return (
    lastResult || {
      ok: false,
      message: "Cannot reach backend.",
      details: lastError?.message,
    }
  );
};

export const deleteJson = async (path) => {
  let lastResult = null;
  let lastError = null;

  for (const baseUrl of baseUrlCandidates) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result = await parseResponse(response);

      if (result.ok) return result;

      lastResult = result;

      if (response.status === 404) continue;

      return result;
    } catch (error) {
      lastError = error;
    }
  }

  return (
    lastResult || {
      ok: false,
      message: "Cannot reach backend.",
      details: lastError?.message,
    }
  );
};


export const registerUser = (payload) => postJson("/auth/register", payload);

export const verifyOtp = ({ email, otp, purpose }) => postJson("/auth/verify-otp", { email, otp, purpose });

export const sendOtp = ({email, purpose }) => postJson("/auth/send-otp", { email, purpose });

export const loginUser = ({ email, password }) => postJson("/auth/login", { email, password });

export const resetPassword = ({ email, newPassword }) => {
  console.log("Calling reset route:", "/auth/password-reset");
  return postJson("/auth/password-reset", { email, newPassword });
};
export const verifyUser = ({ email}) => 
  postJson("/auth/verify-user", {email});

export const getAdminUsers = () => getJson("/auth/admin/users");

export const approveUser = ({ id, role }) =>
  putJson(`/auth/admin/users/${id}/approve`, { role });

export const updateApprovedUserRole = ({ id, role }) =>
  putJson(`/auth/admin/users/${id}/role`, { role });

export const deleteUserById = (id) =>
  deleteJson(`/auth/admin/users/${id}`);