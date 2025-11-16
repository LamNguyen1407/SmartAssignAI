"use client"

import AuthForm, { AuthFormType } from "@/components/auth/AuthForm"
import LoginForm from "@/components/auth/LoginForm"

const LoginPage = () => {
  return (
    <AuthForm children={<LoginForm />} type={AuthFormType.LOGIN} />
  )
}

export default LoginPage