"use client";

const AUTH_KEY = "blog_author_authenticated";
const CREDENTIALS_KEY = "blog_author_credentials";

const DEFAULT_CREDENTIALS = {
  username: "admin",
  password: "admin888",
};

export function getStoredCredentials() {
  if (typeof window === "undefined") return DEFAULT_CREDENTIALS;
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) return DEFAULT_CREDENTIALS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CREDENTIALS;
  }
}

export function setCredentials(username: string, password: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    CREDENTIALS_KEY,
    JSON.stringify({ username: username.trim(), password: password.trim() })
  );
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function login(username: string, password: string): boolean {
  if (typeof window === "undefined") return false;
  const current = getStoredCredentials();
  if (
    username.trim().toLowerCase() === current.username.toLowerCase() &&
    password.trim() === current.password
  ) {
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}
