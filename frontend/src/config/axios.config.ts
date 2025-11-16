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

    // Nếu accessToken hết hạn (401) và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Gọi endpoint refresh — cookie sẽ được tự gửi
        await axiosClient.post("/auth/refresh");

        // Backend nên set lại cookie mới ở response
        // => không cần làm gì thêm ở FE, chỉ retry lại request
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token cũng hết hạn → logout
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
