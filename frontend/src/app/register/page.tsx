"use client"

import AuthForm, { AuthFormType } from "@/components/auth/AuthForm"
import  RegisterForm  from "@/components/auth/RegisterForm"

const RegisterPage = () => {
  return (
    <AuthForm children={<RegisterForm />} type={AuthFormType.REGISTER} />
  )
}

export default RegisterPage