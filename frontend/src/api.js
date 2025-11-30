import axios from "axios";

let navigateToLogin = null;

export function setNavigateToLogin(fn) {
  navigateToLogin = fn;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();

  if (config.url.includes("/auth/refresh")) {
    return config;
  }

  if (method === 'post' || method === 'put' || method === 'delete') {
    const csrfToken = getCookie('csrf_access_token');
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url.includes("/auth/login")) {
      return Promise.reject(error);
    }
    const resp = error.response;
    if (resp?.status === 401 && resp.data?.message === "Token has expired" && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest))
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const csrfToken = getCookie('csrf_refresh_token');
        await api.post("/auth/refresh", {}, {
          headers: { 'X-CSRF-TOKEN': csrfToken }
        });
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);
        if (navigateToLogin) navigateToLogin();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);


export default api;
