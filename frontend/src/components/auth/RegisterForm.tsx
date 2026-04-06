"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useMutation } from "@tanstack/react-query"
import { useRef, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { registerSchema, RegisterSchema } from "@/interface/registerForm.interface"
import { RegisterUser } from "@/services/auth.service"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

export default function RegisterForm() {

  const router = useRouter();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Mutation để gọi API đăng ký
  // const registerMutation = useMutation({
  //   mutationFn: async (data: RegisterSchema) => {
  //     const res = await axiosClient.post("/auth/register", data)
  //     return res.data
  //   },
  // })

  const {mutate: registerMutation, isPending: isRegisterPending} = useMutation({
    mutationFn: async (data: RegisterSchema) => {
      const res = await RegisterUser(data);
      return res;
    },
    onSuccess: () => { 
      toast.success("🎉 Register successfully"),
      router.push("/login");
     },
    onError: (err: any) => { 
      toast.error(err.response?.data?.message || "❌ Register failed")
     },
  })


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema) as any,
  })

  const onSubmit = (data: RegisterSchema) => {
    // console.log("Submitting register form with data:", data);
    registerMutation(data);
  }

  const gender = watch("gender")
  const avatarUrl = watch("avatarUrl")

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
      // Nếu bạn upload ảnh lên server, có thể thay đổi logic ở đây
      setValue("avatarUrl", url)
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
  
      <Card className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-gray-100">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center text-gray-900">
          Create Account
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          Please fill in the form to create your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <Avatar onClick={handleAvatarClick} className="w-20 h-20 border cursor-pointer">
              <AvatarImage src={avatarPreview || avatarUrl || undefined} />
              <AvatarFallback>👤</AvatarFallback>
            </Avatar>
            <input className="hidden" ref={fileInputRef}  type="file" accept="image/*" onChange={handleAvatarChange} />
            {errors.avatarUrl && (
              <p className="text-sm text-red-500">{errors.avatarUrl.message}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Full Name</Label>
            <Input {...register("name")} placeholder="Enter your full name" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* Username */}
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input {...register("username")} placeholder="Enter your username" />
            {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input {...register("email")} type="email" placeholder="Enter your email" />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input {...register("password")} type="password" placeholder="Create a password" />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <Label htmlFor="gender">Gender</Label>
            <Select
              onValueChange={(val) => setValue("gender", val as any)}
              defaultValue={gender}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
          </div>

          {/* Phone number */}
          <div className="space-y-1">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input {...register("phoneNumber")} placeholder="+84123456789" />
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              type="date"
              {...register("dateOfBirth", {
                setValueAs: (value) => value ? new Date(value) : undefined
              })}
            />
            {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isRegisterPending}
          >
            {isRegisterPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
    
  )
}
