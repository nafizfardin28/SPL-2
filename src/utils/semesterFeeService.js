import { postJson, getJson, putJson } from "../api/authService";

export const getStudentsByBatch = () =>
  getJson("/semester-fees/students-by-batch");

export const createSemesterFeeAllocation = ({
  batch,
  semester,
  title,
  amount,
  dueDate,
}) =>
  postJson("/semester-fees/allocations", {
    batch,
    semester,
    title,
    amount,
    dueDate,
  });

export const getSemesterFeeAllocations = () =>
  getJson("/semester-fees/allocations");

export const extendSemesterFeeDeadline = ({ allocationId, dueDate }) =>
  putJson(`/semester-fees/allocations/${allocationId}/extend-deadline`, {
    dueDate,
  });

export const getStudentSemesterFees = () => getJson("/semester-fees/student");

export const sandboxPaySemesterFee = ({
  allocationId,
  method,
  mobileNumber,
  otp,
}) =>
  postJson(`/semester-fees/${allocationId}/sandbox-pay`, {
    method,
    mobileNumber,
    otp,
  });

export const getAllocationStudents = (allocationId) =>
  getJson(`/semester-fees/allocations/${allocationId}/students`);
