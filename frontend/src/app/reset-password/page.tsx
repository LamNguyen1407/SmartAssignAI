"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IResetPassword, resetPasswordSchema, ResetPasswordSchema } from '@/interface/resetPassword.interface';
import { resetPassword } from '@/services/auth.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeClosed } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const params = useSearchParams();
    const token = params.get('token');

    const router = useRouter();


    const [seePassword, setSeePassword] = useState<boolean>(false);


    const {register, handleSubmit, formState: { errors }} = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema)
    })

    const {mutate: resetPasswordMutation, isPending: isResetPasswordPending} = useMutation({
        mutationFn: async (data: IResetPassword) => {
            await resetPassword(data);
        },
        onSuccess: () => {
            toast.success("Password reset successfully");
            router.push("/login");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Password reset failed")
        }
    })

    const onSubmit = async (formData: ResetPasswordSchema) => {
        if (!token) {
            toast.error("Invalid or missing token.");
            return;
        }
        await resetPasswordMutation({ token, password: formData.password});
    }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow">

        <h1 className="text-2xl font-semibold mb-6 text-center">
          Reset Password
        </h1>

        {!token ? (
          <p className="text-red-500 text-center">Invalid or missing token.</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                id="password"
                type={seePassword ? "text" : "password"}
                placeholder="Enter new password..."
                required
                {...register("password")}
                className="pr-10" // chừa chỗ cho icon
                />
                {seePassword ? (
                <Eye
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-black"
                onClick={() => setSeePassword((prev) => !prev)}
                />
                ) : (
                <EyeClosed 
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-black"
                onClick={() => setSeePassword((prev) => !prev)}
                />
                )}

              </div>
            </div>
            {errors.password && <p className="text-red-500">{errors.password.message}</p>}

            <Button  disabled={isResetPasswordPending} type="submit" className="w-full cursor-pointer">
              {isResetPasswordPending ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}

      </div>
    </div>
  );
}

export default ResetPassword