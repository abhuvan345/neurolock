"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BehaviorFeatures } from "./use-behavior-tracking";

interface TrustResponse {
  trust_score: number;
  status: "active" | "warning" | "locked";
  summary: string;
}

interface Telemetry {
  avg_key_interval: number;
  avg_key_hold: number;
  mouse_speed: number;
  click_rate: number;
  click_variance: number;
  scroll_rate: number;
  nav_entropy: number;
  time_on_page: number;
}

interface Activity {
  id: string;
  timestamp: string;
  trustScore: number;
  status: string;
  description: string;
}

const DEFAULT_TELEMETRY: Telemetry = {
  avg_key_interval: 0,
  avg_key_hold: 0,
  mouse_speed: 0,
  click_rate: 0,
  click_variance: 0,
  scroll_rate: 0,
  nav_entropy: 0,
  time_on_page: 0,
};

export function useApiPolling(userId: string, features: BehaviorFeatures) {
  const [trustScore, setTrustScore] = useState(85);
  const [status, setStatus] = useState<"active" | "warning" | "locked">(
    "active"
  );
  const [summary, setSummary] = useState("Normal behavioral patterns detected");
  const [telemetry, setTelemetry] = useState<Telemetry>(DEFAULT_TELEMETRY);
  const [connectionError, setConnectionError] = useState(false);
  const [trendData, setTrendData] = useState<
    Array<{ timestamp: string; score: number }>
  >([]);
  const [activityLog, setActivityLog] = useState<Activity[]>([]);
  const [lastStatus, setLastStatus] = useState<"active" | "warning" | "locked">(
    "active"
  );
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const autounlockRef = useRef<NodeJS.Timeout | null>(null);
  const reauthGraceUntil = useRef<number | null>(null);

  const submitBehavior = useCallback(
    async (behaviorFeatures: BehaviorFeatures) => {
      try {
        // If within re-auth grace period, avoid backend lockouts and keep session active
        if (reauthGraceUntil.current && Date.now() < reauthGraceUntil.current) {
          const safeScore = Math.max(80, Math.min(95, trustScore + 2));
          setConnectionError(false);
          setTrustScore(safeScore);
          setSummary("Normal behavioral patterns detected");
          setTelemetry(behaviorFeatures);
          if (!lockoutUntil || Date.now() > lockoutUntil) {
            setStatus("active");
          }
          setTrendData((prev) =>
            [
              ...prev,
              {
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                score: safeScore,
              },
            ].slice(-20)
          );
          return {
            trust_score: safeScore,
            status: "active" as const,
            summary: "Grace period active",
          };
        }
        console.log("[v0] Submitting behavior data:", {
          userId,
          features: behaviorFeatures,
        });

        const response = await fetch("/api/behavior", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            features: behaviorFeatures,
          }),
        });

        console.log("[v0] API response status:", response.status);

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data: TrustResponse = await response.json();
        console.log("[v0] API response data:", data);

        setConnectionError(false);
        setTrustScore(data.trust_score);
        setSummary(data.summary);
        setTelemetry(behaviorFeatures);

        if (data.status === "locked") {
          const now = Date.now();
          const fiveMinutesFromNow = now + 5 * 60 * 1000;
          setLockoutUntil(fiveMinutesFromNow);
          setStatus("locked");

          console.log(
            "[v0] Session locked until:",
            new Date(fiveMinutesFromNow).toLocaleTimeString()
          );

          // Schedule auto-unlock after 5 minutes
          if (autounlockRef.current) clearTimeout(autounlockRef.current);
          autounlockRef.current = setTimeout(() => {
            console.log("[v0] Auto-unlocking session after 5 minutes");
            setStatus("active");
            setTrustScore(90);
            setSummary("Session automatically resumed after security period.");
            setLockoutUntil(null);
            addActivity(
              "Auto-unlocked",
              90,
              "active",
              "Session automatically resumed"
            );
            setLastStatus("active");
          }, 5 * 60 * 1000);
        } else {
          // Only update status if not in lockout period
          if (!lockoutUntil || Date.now() > lockoutUntil) {
            setStatus(data.status);
          }
          setLockoutUntil(null);
        }

        // Update trend
        setTrendData((prev) => {
          const newData = [
            ...prev,
            {
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              score: data.trust_score,
            },
          ];
          return newData.slice(-20);
        });

        // Add to activity log if status changed
        if (data.status !== lastStatus) {
          const statusText =
            data.status === "active"
              ? "Normal"
              : data.status === "warning"
              ? "Warning"
              : "Locked";
          addActivity(statusText, data.trust_score, data.status, data.summary);
          setLastStatus(data.status);
        }

        // Refresh activity log from backend
        try {
          const logsRes = await fetch("/api/logs");
          if (logsRes.ok) {
            const { activities } = await logsRes.json();
            if (Array.isArray(activities)) {
              setActivityLog(
                activities.map((a: any) => ({
                  id: String(a.id ?? Date.now()),
                  timestamp: new Date(a.timestamp).toLocaleTimeString(),
                  trustScore: Number(a.trustScore ?? 0),
                  status: String(a.status ?? "active"),
                  description: String(a.description ?? "Trust score update"),
                }))
              );
            }
          }
        } catch (e) {
          // ignore logs fetch errors (already handled via setConnectionError)
        }

        return data;
      } catch (error) {
        console.warn("[v0] Behavior submission warning (using mock):", error);
        setConnectionError(true);

        // Mock data for demo when backend is unavailable
        const mockScore = Math.max(50, trustScore + (Math.random() - 0.5) * 20);
        const mockStatus =
          mockScore > 75 ? "active" : mockScore >= 65 ? "warning" : "locked";

        setTrustScore(mockScore);
        if (!lockoutUntil || Date.now() > lockoutUntil) {
          setStatus(mockStatus);
        }
        setTelemetry(behaviorFeatures);

        setTrendData((prev) =>
          [
            ...prev,
            {
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              score: mockScore,
            },
          ].slice(-20)
        );

        return {
          trust_score: mockScore,
          status: mockStatus,
          summary: "Running in demo mode (backend unavailable)",
        };
      }
    },
    [userId, trustScore, lastStatus, lockoutUntil]
  );

  const reAuthenticate = useCallback(
    async (password: string) => {
      try {
        console.log("[v0] Attempting re-authentication");

        const response = await fetch("/api/re-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, password }),
        });

        console.log("[v0] Re-auth response status:", response.status);
        if (!response.ok) {
          return false;
        }

        // Set a 20s grace period to avoid immediate re-locks
        reauthGraceUntil.current = Date.now() + 20_000;
        setStatus("active");
        setTrustScore(90);
        setSummary("Re-authentication successful. Session resumed.");
        setLockoutUntil(null);
        if (autounlockRef.current) clearTimeout(autounlockRef.current);
        addActivity(
          "Re-authenticated",
          90,
          "active",
          "User successfully re-authenticated"
        );
        setLastStatus("active");
        return true;
      } catch (error) {
        console.error("[v0] Re-auth error:", error);
        // Demo fallback: accept any non-empty password
        if (password && password.trim().length > 0) {
          reauthGraceUntil.current = Date.now() + 20_000;
          setStatus("active");
          setTrustScore(90);
          setSummary("Re-authentication successful (demo). Session resumed.");
          setLockoutUntil(null);
          if (autounlockRef.current) clearTimeout(autounlockRef.current);
          addActivity(
            "Re-authenticated",
            90,
            "active",
            "User successfully re-authenticated (demo)"
          );
          setLastStatus("active");
          return true;
        }
        return false;
      }
    },
    [userId]
  );

  const addActivity = useCallback(
    (description: string, score: number, stat: string, detail: string) => {
      const activity: Activity = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        trustScore: score,
        status: stat,
        description,
      };
      setActivityLog((prev) => [activity, ...prev].slice(0, 20));
    },
    []
  );

  // Start polling
  useEffect(() => {
    if (!userId) return;

    // Initial submission
    submitBehavior(features);

    // Initial logs load
    (async () => {
      try {
        const logsRes = await fetch("/api/logs");
        if (logsRes.ok) {
          const { activities } = await logsRes.json();
          if (Array.isArray(activities)) {
            setActivityLog(
              activities.map((a: any) => ({
                id: String(a.id ?? Date.now()),
                timestamp: new Date(a.timestamp).toLocaleTimeString(),
                trustScore: Number(a.trustScore ?? 0),
                status: String(a.status ?? "active"),
                description: String(a.description ?? "Trust score update"),
              }))
            );
          }
        }
      } catch {}
    })();

    // Setup polling interval (5 seconds)
    pollingRef.current = setInterval(() => {
      submitBehavior(features);
    }, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (autounlockRef.current) {
        clearTimeout(autounlockRef.current);
      }
    };
  }, [userId, features, submitBehavior]);

  return {
    trustScore,
    status,
    summary,
    telemetry,
    connectionError,
    trendData,
    activityLog,
    submitBehavior,
    reAuthenticate,
  };
}
