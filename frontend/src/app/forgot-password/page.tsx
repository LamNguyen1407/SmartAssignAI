"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { forgotPasswordSchema, ForgotPasswordSchema } from "@/interface/forgotPasswordForm.interface";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { forgotPassword } from "@/services/auth.service";

const ForgotPassword = () => {

  const {register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const {mutate: forgotPasswordMutation, isPending: isForgotPasswordPending} = useMutation({
    mutationFn: async (data: ForgotPasswordSchema) => {
        return await forgotPassword(data);
    },
    onSuccess: () => {
        toast.success("Email reset link has been sent to your email")
    },
    onError: (err: any) => {
        toast.error(err.response?.data?.message || "❌ Email send failed")
    }
  })
  const onSubmit = async (data: ForgotPasswordSchema) => {
    await forgotPasswordMutation(data);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow">
        
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Forgot Password
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              required
              {...register("email")}
            />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>

          <Button disabled={isForgotPasswordPending} type="submit" className={`w-full cursor-pointer`}>
            {isForgotPasswordPending ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

      </div>
    </div>
  );
};

export default ForgotPassword;
