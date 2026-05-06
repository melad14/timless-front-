import {
  request,
  setAuthSession,
  clearAuthSession,
  getStoredUser,
  getStoredToken,
} from "./api";

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function hasValidToken() {
  const token = getStoredToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    clearAuthSession();
    return false;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp <= nowInSeconds) {
    clearAuthSession();
    return false;
  }

  return true;
}

async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setAuthSession(data.access_token, data.user);
  return data.user;
}

async function signup(payload) {
  await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // Force explicit login flow after registration.
  clearAuthSession();
}

async function fetchMe() {
  return request("/users/me");
}

async function updateProfile(payload) {
  const user = await request("/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  // Keep the current token and update stored user data.
  const token = getStoredToken();
  if (token) {
    setAuthSession(token, user);
  }

  return user;
}

function logout() {
  clearAuthSession();
}

function isAuthenticated() {
  return hasValidToken();
}

export { login, signup, fetchMe, updateProfile, logout, isAuthenticated, getStoredUser };
