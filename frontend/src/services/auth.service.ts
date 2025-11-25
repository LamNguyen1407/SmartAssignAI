import axiosClient from "@/config/axios.config";
import { ForgotPasswordSchema } from "@/interface/forgotPasswordForm.interface";
import { LoginSchema } from "@/interface/loginForm.interface";
import { RegisterSchema } from "@/interface/registerForm.interface";
import { IResetPassword, ResetPasswordSchema } from "@/interface/resetPassword.interface";

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

export const forgotPassword = async (data: ForgotPasswordSchema) => {
    return await axiosClient.post("/auth/forgot-password", data);
}

export const resetPassword = async (data: IResetPassword) => {
    return await axiosClient.post("/auth/reset-password", data);
}