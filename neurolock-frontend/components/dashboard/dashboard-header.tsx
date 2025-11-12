"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Lock, Info, LogOut } from "lucide-react"

interface DashboardHeaderProps {
  userEmail: string
  onLogout: () => void
}

export function DashboardHeader({ userEmail, onLogout }: DashboardHeaderProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-green-500">
            <Lock className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-heading font-bold text-foreground">NeuroLock</h1>
            <p className="text-xs text-muted-foreground">Behavioral Authentication</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Info Tooltip */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="p-2 text-muted-foreground hover:text-cyan-400 transition-colors"
              aria-label="Information about NeuroLock"
            >
              <Info className="w-5 h-5" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-full mt-2 p-3 bg-card border border-cyan-500/30 rounded-lg whitespace-nowrap text-xs text-muted-foreground glow-cyan z-50">
                NeuroLock continuously verifies active sessions — this is an AI trust score.
              </div>
            )}
          </div>

          {/* User Email */}
          <div className="hidden sm:block text-sm text-muted-foreground truncate max-w-xs">{userEmail}</div>

          {/* Logout Button */}
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
