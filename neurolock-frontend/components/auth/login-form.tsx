"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LoginFormProps {
  onSuccess: (userId: string) => void
  onError: (message: string) => void
}

export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Replace with actual backend API endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

      // Demo mode: Accept demo credentials
      if (email === "user@demo.com" && password === "neuro123") {
        onSuccess("demo-user-001")
        return
      }

      const response = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Invalid credentials")
      }

      const data = await response.json()
      onSuccess(data.userId)
    } catch (error) {
      onError(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="bg-input border-border text-input-foreground placeholder:text-muted-foreground focus:ring-cyan-500/50 focus:border-cyan-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="bg-input border-border text-input-foreground placeholder:text-muted-foreground focus:ring-cyan-500/50 focus:border-cyan-500"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full gradient-neon text-background font-heading font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? "Verifying..." : "Login"}
      </Button>
    </form>
  )
}
