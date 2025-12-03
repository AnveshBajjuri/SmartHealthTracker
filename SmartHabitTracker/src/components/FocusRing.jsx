import { useMemo } from 'react'
import { Target, TrendingUp, Award } from 'lucide-react'

export default function FocusRing({ habits = [], completions = {} }) {
  const stats = useMemo(() => {
    if (!Array.isArray(habits)) habits = []
    if (typeof completions !== "object") completions = {}

    const today = new Date().toISOString().split('T')[0]

    let completedToday = 0

    habits.forEach(habit => {
      const habitId = habit?.id
      const compList = completions[habitId] || []
      if (Array.isArray(compList) && compList.includes(today)) {
        completedToday++
      }
    })

    const total = habits.length || 1
    const percentage = Math.round((completedToday / total) * 100)

    const totalStreak = habits.reduce((sum, h) => sum + (h?.streak || 0), 0)
    const avgStreak = habits.length > 0 ? Math.round(totalStreak / habits.length) : 0

    return { completedToday, total, percentage, avgStreak, totalStreak }
  }, [habits, completions])

  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (stats.percentage / 100) * circumference

  const getMessage = () => {
    if (stats.percentage === 100) return "Perfect day! 🎉"
    if (stats.percentage >= 75) return "Almost there! 💪"
    if (stats.percentage >= 50) return "Great progress! 🚀"
    if (stats.percentage > 0) return "Keep going! 🔥"
    return "Start your day! ✨"
  }

  return (
    <div className="bg-surface rounded-3xl p-6 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted mb-1">Today's Focus</p>
          <h3 className="text-xl font-bold text-foreground">Daily Progress</h3>
        </div>
        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {getMessage()}
        </div>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="relative">
          <svg className="w-48 h-48 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="96"
              cy="96"
              r="70"
              stroke="currentColor"
              strokeWidth="14"
              fill="none"
              className="text-gray-100"
            />

            {/* Animated progress ring */}
            <circle
              cx="96"
              cy="96"
              r="70"
              stroke="url(#progressGradient)"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />

            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(24 100% 50%)" />
                <stop offset="50%" stopColor="hsl(38 100% 50%)" />
                <stop offset="100%" stopColor="hsl(160 84% 39%)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Percentage label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-foreground">{stats.percentage}%</span>
            <span className="text-sm text-muted mt-1">Complete</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {/* Completed */}
        <div className="text-center p-3 bg-emerald-50 rounded-2xl">
          <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.completedToday}</p>
          <p className="text-xs text-muted">Done</p>
        </div>

        {/* Remaining */}
        <div className="text-center p-3 bg-orange-50 rounded-2xl">
          <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-orange-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.total - stats.completedToday}</p>
          <p className="text-xs text-muted">Remaining</p>
        </div>

        {/* Average streak */}
        <div className="text-center p-3 bg-purple-50 rounded-2xl">
          <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-purple-100 flex items-center justify-center">
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.avgStreak}</p>
          <p className="text-xs text-muted">Avg Streak</p>
        </div>
      </div>
    </div>
  )
}
