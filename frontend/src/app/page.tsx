"use client"

import { RegisterForm } from "@/components/auth/RegisterForm"
import { Sparkles } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-fancy p-8">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left Section – Introduction */}
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
            <Sparkles className="h-4 w-4" />
            SmartAssign AI
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Intelligent Assignment <br /> Support Platform
          </h1>

          <p className="text-gray-600 text-lg">
            Let AI assist you in researching, structuring, and writing academic assignments.
            Save time and enhance your productivity with our smart assistant.
          </p>

          <ul className="text-gray-700 space-y-2 text-left mx-auto md:mx-0">
            <li>✅ Personalized AI study assistant</li>
            <li>✅ Organize your assignments efficiently</li>
            <li>✅ Collaborate and track progress seamlessly</li>
          </ul>

          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Sign in here
            </a>
          </p>
        </div>

        {/* Right Section – Register Form */}
        
          <RegisterForm />
        
      </div>
    </div>
  )
}
