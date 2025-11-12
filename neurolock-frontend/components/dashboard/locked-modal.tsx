"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock } from "lucide-react"

interface LockedModalProps {
  summary: string
  onReAuth: (password: string) => Promise<boolean>
}

export function LockedModal({ summary, onReAuth }: LockedModalProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes in seconds
  const [isAutoUnlocking, setIsAutoUnlocking] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsAutoUnlocking(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await onReAuth(password)
      if (!success) {
        setError("Re-authentication failed. Please try again.")
        setPassword("")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <>
      <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-40" />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md border border-red-500/40 glow-red shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-full bg-red-500/20 border border-red-500/40 animate-pulse-soft">
              <Lock className="w-10 h-10 text-red-400 animate-bounce" style={{ animationDuration: "2s" }} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-foreground mb-2 font-heading">Session Locked</h2>

          <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
            Your session has been locked due to unusual activity. Re-authenticate to regain access.
          </p>

          <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-300 leading-relaxed">
              {summary || "Unusual activity detected in your session"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reauth-password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                id="reauth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isAutoUnlocking}
                className="bg-input border-border text-input-foreground focus:ring-red-500/50 focus:border-red-500 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || isAutoUnlocking}
              className="w-full bg-red-500 hover:bg-red-600 text-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : isAutoUnlocking ? "Unlocking..." : "Re-authenticate"}
            </Button>
          </form>

          <div className="mt-6 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center">
            <p className="text-xs text-cyan-400 font-medium">Auto-unlock in {formatTime(timeRemaining)}</p>
            <p className="text-xs text-muted-foreground mt-1">Or re-authenticate immediately above</p>
          </div>
        </div>
      </div>
    </>
  )
}
