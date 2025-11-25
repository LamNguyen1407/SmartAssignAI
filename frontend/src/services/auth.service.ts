import axiosClient from "@/config/axios.config";
import { LoginSchema } from "@/interface/loginForm.interface";
import { RegisterSchema } from "@/interface/registerForm.interface";

export const RegisterUser = async (data: RegisterSchema) => {
    return await axiosClient.post("/auth/register", data);
}

export const LoginUser = async (data: LoginSchema) => {
    return await axiosClient.post("/auth/login", data);
}

export const RefreshToken = async () => {
    return await axiosClient.post("/auth/refresh");
}

export const LogoutUser = async () => {
    return await axiosClient.post("/auth/logout");
}

export const checkAuth = async () => {
    return await axiosClient.get("/auth/profile")
}