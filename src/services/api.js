const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://timeless-lemon.vercel.app/api/v1";

const TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log(`API Request: ${options.method || 'GET'} ${API_BASE_URL}${path}`);
  console.log('Headers:', headers);
  if (options.body) {
    console.log('Body:', JSON.parse(options.body));
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  console.log(`API Response: ${response.status} ${response.statusText}`);

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  console.log('Response Data:', data);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }
    let message = "Request failed";
    if (data?.detail) {
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length > 0) {
        message = data.detail[0]?.msg || "Validation error";
        if (message.startsWith("Value error, ")) {
          message = message.substring("Value error, ".length);
        }
      }
    } else if (data?.message) {
      message = data.message;
    }
    console.error('API Error:', message);
    throw new Error(message);
  }

  return data;
}

export {
  API_BASE_URL,
  TOKEN_KEY,
  USER_KEY,
  request,
  getStoredToken,
  getStoredUser,
  setAuthSession,
  clearAuthSession,
};
