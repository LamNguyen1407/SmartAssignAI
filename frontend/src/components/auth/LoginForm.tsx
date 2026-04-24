"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { loginSchema, LoginSchema } from "@/interface/loginForm.interface";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoginUser } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginForm() {
  const router = useRouter();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const { mutate: loginMutation, isPending: isLoginPending } = useMutation({
    mutationFn: async (data: LoginSchema) => {
      return await LoginUser(data);
    },
    onSuccess: (data) => {
      const role = data.data.data.role;
      checkAuth();
      toast.success("Login successfully!");
      if (role === 'admin') {
        router.push('/dashboard');
      } else router.push('/chat')
    },
    onError: (err: any) => { toast.error(err.response?.data?.message || "Login failed") },
  })

  const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    // console.log("Submitting login form with data:", data);
    await loginMutation(data);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-gray-100">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center text-gray-900">
          Login
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          Use your username or email to login
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <Label htmlFor="identifier">Username or Email</Label>
            <Input {...register("identifier")} placeholder="Enter username or email" />
            {errors.identifier && (
              <p className="text-sm text-red-500">{errors.identifier.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input {...register("password")} type="password" placeholder="Enter password" />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoginPending}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition cursor-pointer"
          >
            Login
          </button>
          <Link href="/forgot-password" className="text-sm w-full flex justify-center items-center text-gray-800 hover:underline">
            Forgot your Password?
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
