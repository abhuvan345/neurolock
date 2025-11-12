"use client"

interface Activity {
  id: string
  timestamp: string
  trustScore: number
  status: string
  description: string
}

interface ActivityLogProps {
  activities: Activity[]
}

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <div className="glass rounded-xl p-6 lg:p-8">
      <h2 className="text-lg font-heading font-semibold mb-6 text-foreground">Activity Log</h2>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No activities yet</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{activity.description}</p>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      activity.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : activity.status === "warning"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {activity.trustScore}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
