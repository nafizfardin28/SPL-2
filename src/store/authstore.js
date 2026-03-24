import { useEffect, useState } from "react";
const AUTH_KEY = "academix-auth";
const readAuth = () => {
  const parsed = JSON.parse(localStorage.getItem(AUTH_KEY) || "{}");
  return {
    user: parsed.user || null,
    token: parsed.token || null,
  };
};

const notify = () => window.dispatchEvent(new Event("academix-auth-changed"));

export const getAuthState = () => readAuth();

export const loginAuth = (user, token) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, token }));
  notify();
};

export const logoutAuth = () => {
  localStorage.removeItem(AUTH_KEY);
  notify();
};

export const useAuthUser = () => {
  const [auth, setAuth] = useState(readAuth());

  useEffect(() => {
    const refresh = () => setAuth(readAuth());
    window.addEventListener("academix-auth-changed", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("academix-auth-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return auth.user;
};
