"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TrustTrendProps {
  data: Array<{ timestamp: string; score: number }>
}

export function TrustTrend({ data }: TrustTrendProps) {
  return (
    <div className="glass rounded-xl p-6 lg:p-8 glow-cyan">
      <h2 className="text-lg font-heading font-semibold mb-6 text-foreground">Trust Trend</h2>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3f5c" />
            <XAxis dataKey="timestamp" stroke="#4a6289" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} stroke="#4a6289" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a2847",
                border: "1px solid #00d9ff",
                borderRadius: "8px",
                color: "#f0f4f8",
              }}
              cursor={{ stroke: "#00d9ff" }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#00d9ff"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
