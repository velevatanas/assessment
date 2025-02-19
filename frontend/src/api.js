import axios from "axios";
import store from "./store";
import { logout, refreshTokenAction } from "./store/authSlice"; // Import actions

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

API.interceptors.request.use(
  async (config) => {
    const state = store.getState();
    let token = state.auth.tokens?.access;

    // If no token in Redux, try to get it from localStorage
    if (!token) {
        const storedTokens = JSON.parse(localStorage.getItem("tokens"));
        token = storedTokens?.access;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // const state = store.getState();
        // const refresh = state.auth.tokens?.refresh;
        const storedTokens = JSON.parse(localStorage.getItem("tokens"));
        const refresh = storedTokens?.refresh;

        if (!refresh) {
          store.dispatch(logout());
          return Promise.reject(error);
        }

        const { data } = await axios.post("http://localhost:8000/api/token/refresh/", {
          refresh,
        });

        store.dispatch(refreshTokenAction(data.access));

        // Update localStorage
        localStorage.setItem(
            "tokens",
            JSON.stringify({ ...storedTokens, access: data.access })
            );
    
        // Retry request with new token
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
