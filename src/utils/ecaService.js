import { postJson, getJson, putJson, deleteJson } from "../api/authService";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const getToken = () => {
  const auth = JSON.parse(localStorage.getItem("academix-auth"));
  return auth?.token;
};

export const createEcaRequest = ({
  activityTitle,
  activityType,
  organizer,
  eventDate,
  achievement,
  description,
}) =>
  postJson("/eca-certificates", {
    activityTitle,
    activityType,
    organizer,
    eventDate,
    achievement,
    description,
  });

export const getMyEcaRequests = () => getJson("/eca-certificates/my");

export const getAllEcaRequests = () => getJson("/eca-certificates");

export const updateEcaStatus = (requestId, status, teacherNote) =>
  putJson(`/eca-certificates/${requestId}/status`, {
    status,
    teacherNote,
  });

export const generateEcaCertificate = (requestId) =>
  putJson(`/eca-certificates/${requestId}/generate`, {});

export const downloadEcaCertificate = async (requestId) => {
  const res = await fetch(
    `${API_BASE_URL}/eca-certificates/${requestId}/download`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to download certificate.");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `eca-certificate-${requestId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
};

export const getAdminEcaRequests = () => getJson("/eca-certificates/admin/all");

export const updateAdminEcaStatus = ({ id, status }) =>
  putJson(`/eca-certificates/admin/${id}/status`, { status });

export const adminGenerateEcaCertificate = (id) =>
  postJson(`/eca-certificates/admin/${id}/generate`, {});

export const deleteAdminEcaRequest = (id) =>
  deleteJson(`/eca-certificates/admin/${id}`);
