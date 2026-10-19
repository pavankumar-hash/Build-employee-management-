import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Public auth requests should not trigger automatic logout.
function isPublicAuthRequest(url = "") {
  return /\/auth\/(login|register)\/?$/.test(url);
}

let isRedirectingToLogin = false;

// Attach the access token to API requests.
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle expired or invalid authentication.
api.interceptors.response.use(
  (response) => {
    if (isPublicAuthRequest(response.config?.url || "")) {
      isRedirectingToLogin = false;
    }

    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";
    const isPublicRequest = isPublicAuthRequest(requestUrl);

    if (status === 401 && !isPublicRequest) {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("user");

      if (window.location.pathname !== "/login" && !isRedirectingToLogin) {
        isRedirectingToLogin = true;
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
