const USERS_KEY = "academix-users";

const demoUsers = [
  {
    id: 1,
    firstName: "System",
    lastName: "Admin",
    email: "superadmin@iit.du.ac.bd",
    phone: "01700000000",
    role: "superadmin",
    password: "Admin@123",
    status: "approved",
    otpVerified: true,
    isSeeded: true,
  },
  {
    id: 2,
    firstName: "Ayesha",
    lastName: "Rahman",
    email: "teacher@iit.du.ac.bd",
    phone: "01700000001",
    role: "teacher",
    password: "Teacher@123",
    status: "approved",
    otpVerified: true,
    isSeeded: true,
  },
  {
    id: 3,
    firstName: "Mahmud",
    lastName: "Hasan",
    email: "staff@iit.du.ac.bd",
    phone: "01700000002",
    role: "staff",
    password: "Staff@123",
    status: "approved",
    otpVerified: true,
    isSeeded: true,
  },
  {
    id: 4,
    firstName: "Nadia",
    lastName: "Islam",
    email: "student@iit.du.ac.bd",
    phone: "01700000003",
    role: "student",
    password: "Student@123",
    status: "approved",
    otpVerified: true,
    regNo: "2024123456",
    rollNo: "1234",
    isSeeded: true,
  },
];

const readUsers = () => JSON.parse(localStorage.getItem(USERS_KEY)) || [];
const writeUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const ensureSeedUsers = () => {
  const existingUsers = readUsers();

  if (existingUsers.length === 0) {
    writeUsers(demoUsers);
    return;
  }

  const mergedUsers = [...existingUsers];

  demoUsers.forEach((demoUser) => {
    const alreadyExists = mergedUsers.some(
      (user) => user.email.toLowerCase() === demoUser.email.toLowerCase()
    );

    if (!alreadyExists) {
      mergedUsers.push(demoUser);
    }
  });

  writeUsers(mergedUsers);
};

ensureSeedUsers();

export const getDemoAccounts = () =>
  demoUsers.map(({ role, email, password, status }) => ({
    role,
    email,
    password,
    status,
  }));

export const registerUser = (payload) => {
  const users = readUsers();

  const exists = users.some(
    (u) => u.email.toLowerCase() === payload.email.toLowerCase()
  );
  if (exists) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const newUser = {
    ...payload,
    id: Date.now(),
    status: payload.role === "superadmin" ? "approved" : "pending",
    otpVerified: false,
    otpDeliveryStatus: "pending_backend",
  };

  users.push(newUser);
  writeUsers(users);

  return {
    ok: true,
    email: newUser.email,
    message:
      "Registration successful. OTP delivery must come from the backend email service before login is enabled.",
  };
};

export const verifyOtp = ({ email, otp }) => {
  const users = readUsers();
  const idx = users.findIndex(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (idx < 0) return { ok: false, message: "User not found." };
  if (!users[idx].otp) {
    return {
      ok: false,
      message:
        "This account does not yet have a backend-issued OTP. Use a demo account for now or connect the backend OTP API.",
    };
  }
  if (users[idx].otp !== otp) return { ok: false, message: "Invalid OTP." };

  users[idx].otpVerified = true;
  users[idx].otp = null;
  writeUsers(users);

  return {
    ok: true,
    message: "OTP verified successfully. Wait for Super Admin approval.",
  };
};

export const loginUser = ({ email, password }) => {
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== password) {
    return { ok: false, message: "Invalid email or password." };
  }

  if (!user.otpVerified) {
    return {
      ok: false,
      message:
        "This account cannot login yet because backend OTP/email delivery is not connected.",
    };
  }

  if (user.status !== "approved") {
    return {
      ok: false,
      message: "Your account is pending Super Admin approval.",
    };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    token: `mock-token-${user.id}`,
  };
};

export const resetPassword = ({ email, newPassword }) => {
  const users = readUsers();
  const idx = users.findIndex(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (idx < 0) return { ok: false, message: "No account found with this email." };

  users[idx].password = newPassword;
  writeUsers(users);
  return { ok: true, message: "Password reset successful. Please login." };
};

export const getDashboardPathByRole = (role) => {
  switch (role) {
    case "student":
      return "/student/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    case "staff":
      return "/staff/dashboard";
    case "superadmin":
      return "/admin/dashboard";
    default:
      return "/login";
  }
};