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

export default function LoginForm() {
    const router = useRouter();

    const {mutate: loginMutation, isPending: isLoginPending} = useMutation({
    mutationFn: async (data: LoginSchema) => {
        return await LoginUser(data);
        },
        onSuccess: () => {
          alert("🎉 Đăng nhập thành công!"),
          router.push("/");
        },
        onError: (err: any) => { alert(err.response?.data?.message || "❌ Đăng nhập thất bại") },
    })


    const { register, handleSubmit, formState: { errors } } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    

  const onSubmit = async (data: LoginSchema) => {
    console.log("Submitting login form with data:", data);
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
          {/* Username or Email */}
          <div className="space-y-1">
            <Label htmlFor="identifier">Username or Email</Label>
            <Input {...register("identifier")} placeholder="Enter username or email" />
            {errors.identifier && (
              <p className="text-sm text-red-500">{errors.identifier.message}</p>
            )}
          </div>

          {/* Password */}
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
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
