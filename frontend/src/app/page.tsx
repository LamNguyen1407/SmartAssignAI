import { LoginForm } from "@/components/auth/login-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-fancy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Intelligent Assignment Support
          </h1>
          <p className="text-gray-600">AI-powered assistance for your academic work</p>
        </div>
        <LoginForm />
      </div>
    </div>

  )
}