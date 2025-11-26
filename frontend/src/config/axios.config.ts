import { RefreshToken } from "@/services/auth.service";
import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, //cho phép gửi cookie (quan trọng)
});



//Interceptor response để tự refresh nếu accessToken hết hạn
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRequest =
      originalRequest.url.includes("/auth/refresh") ||
      originalRequest.url.includes("/auth/profile");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      try {
        await RefreshToken();
        return axiosClient(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default axiosClient;
