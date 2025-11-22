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
  if (method === 'post' || method === 'put' || method === 'delete') {
    const csrfToken = getCookie('csrf_access_token');
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (navigateToLogin) navigateToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;
