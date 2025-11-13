import axios from "axios";


const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 100000,
    headers: {
        'Content-Type': 'application/json'
    }
})

//tu dong gan access token vao header
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

//tu dong refresh token neu access token het han
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;
            try{
                const refreshToken = localStorage.getItem('refreshToken');
                const res = await axiosClient.post('/auth/refresh', {token: refreshToken});

                const newAccessToken = res.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);

                // Gắn lại token mới vào header và retry request
                axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                return axiosClient(originalRequest);
            }
            catch(refreshError){
                // Nếu refresh token hết hạn → logout
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
)

export default axiosClient;