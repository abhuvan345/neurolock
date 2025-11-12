"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TrustMeter } from "@/components/dashboard/trust-meter"
import { TrustTrend } from "@/components/dashboard/trust-trend"
import { TelemetryCards } from "@/components/dashboard/telemetry-cards"
import { ActivityLog } from "@/components/dashboard/activity-log"
import { WarningBanner } from "@/components/dashboard/warning-banner"
import { LockedModal } from "@/components/dashboard/locked-modal"
import { ConnectionBanner } from "@/components/dashboard/connection-banner"
import { useBehaviorTracking } from "@/hooks/use-behavior-tracking"
import { useApiPolling } from "@/hooks/use-api-polling"

export function DashboardPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  // Behavior tracking
  const { features, isMonitoring, startMonitoring, stopMonitoring } = useBehaviorTracking()

  // API polling and trust state
  const {
    trustScore,
    status,
    summary,
    telemetry,
    connectionError,
    trendData,
    activityLog,
    submitBehavior,
    reAuthenticate,
  } = useApiPolling(userId, features)

  // Initialize
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    if (!storedUserId) {
      router.push("/")
    } else {
      setUserId(storedUserId)
      startMonitoring()
      setIsLoading(false)
    }

    return () => {
      stopMonitoring()
    }
  }, [router, startMonitoring, stopMonitoring])

  const handleLogout = () => {
    localStorage.removeItem("userId")
    stopMonitoring()
    router.push("/")
  }

  const handleReAuth = async (password: string) => {
    const success = await reAuthenticate(password)
    if (success) {
      // Modal will close automatically
      return true
    }
    return false
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing NeuroLock...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background effects */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
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
      <div className="fixed -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl opacity-20 pointer-events-none animate-pulse-soft" />
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-green-500/10 rounded-full blur-3xl opacity-10 pointer-events-none" />

      {status === "locked" && <div className="fixed inset-0 z-40" />}

      <div className="relative z-10">
        {/* Header */}
        <DashboardHeader userEmail={userId} onLogout={handleLogout} />

        {/* Connection Error Banner */}
        {connectionError && <ConnectionBanner />}

  {/* Warning Banner - Don't show if locked (status is checked) */}
  {status === "warning" && <WarningBanner onReAuth={() => {}} />}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
          {/* Trust Meter and Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <TrustMeter score={trustScore} status={status} summary={summary} />
            </div>
            <div className="lg:col-span-2">
              <TrustTrend data={trendData} />
            </div>
          </div>

          {/* Telemetry Cards: use local live features while monitoring for instant updates */}
          <TelemetryCards telemetry={isMonitoring ? (features as any) : telemetry} isMonitoring={isMonitoring} />

          {/* Activity Log */}
          <ActivityLog activities={activityLog} />
        </main>
      </div>

      {/* Locked Modal */}
      {status === "locked" && <LockedModal summary={summary} onReAuth={handleReAuth} />}
    </div>
  )
}
