
import axios from "axios";

const baseURL = "http://127.0.0.1:3000/api";

export const api = axios.create({
  baseURL,
});

const refreshApi = axios.create({
  baseURL,
});


api.interceptors.request.use((config) => {
  
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
 

  return config;
});



api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refresh_token = localStorage.getItem("refresh_token");

      if (refresh_token) {
        const { data } = await refreshApi.post("/v1/auth/refresh", {
          refresh_token,
        });

        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);

        originalRequest.headers.Authorization =
          `Bearer ${data.access_token}`;

        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);
