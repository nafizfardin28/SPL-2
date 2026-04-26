import { postJson, getJson, deleteJson} from "../api/authService";


 export const createNotice = ({ title, body, audiences }) =>
  postJson("/notices", { title, body, audiences });

export const getMyNotices = () =>
  getJson("/notices/mine");

export const getStudentNotices = () =>
  getJson("/notices/student");

export const getAdminNotices = () =>
  getJson("/notices/admin");

export const deleteNotice = (noticeId) =>
  deleteJson(`/notices/${noticeId}`);