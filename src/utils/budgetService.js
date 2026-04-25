import { postJson, getJson, putJson } from "../api/authService";

export const createBudgetRequest = ({ title, category, amount, purpose }) =>
  postJson("/budgets", {
    title,
    category,
    amount,
    purpose,
  });

export const getMyBudgetRequests = () => getJson("/budgets/my");

export const getAllBudgetRequests = () => getJson("/budgets");

export const updateTeacherBudgetStatus = (budgetId, status, teacherNote) =>
  putJson(`/budgets/${budgetId}/teacher-status`, {
    status,
    teacherNote,
  });

export const updateStaffBudgetStatus = (budgetId, status, staffNote) =>
  putJson(`/budgets/${budgetId}/staff-status`, {
    status,
    staffNote,
  });