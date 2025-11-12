"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { Lock } from "lucide-react"

export function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string>("")

  const handleLoginSuccess = (userId: string) => {
    // Store userId for dashboard use
    localStorage.setItem("userId", userId)
    router.push("/dashboard")
  }

  const handleLoginError = (message: string) => {
    setError(message)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(0, 217, 255, 0.1) 25%, rgba(0, 217, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.1) 75%, rgba(0, 217, 255, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 217, 255, 0.1) 25%, rgba(0, 217, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.1) 75%, rgba(0, 217, 255, 0.1) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl opacity-30 animate-pulse-soft" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-green-500/10 rounded-full blur-3xl opacity-20" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-green-500">
              <Lock className="w-6 h-6 text-background" />
            </div>
            <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              NeuroLock
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">Adaptive Behavioral Authentication</p>
          <p className="text-xs text-muted-foreground mt-1">AI-powered continuous session verification</p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-xl p-8">
          <LoginForm onSuccess={handleLoginSuccess} onError={handleLoginError} />

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 animate-slide-up">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Demo Credentials Hint */}
          <div className="mt-6 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
            <p className="text-xs text-muted-foreground mb-1">💡 Demo Credentials:</p>
            <p className="text-xs text-cyan-400 font-mono">Email: user@demo.com</p>
            <p className="text-xs text-cyan-400 font-mono">Password: neuro123</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">Protected by NeuroLock AI Authentication</p>
      </div>
    </div>
  )
}
