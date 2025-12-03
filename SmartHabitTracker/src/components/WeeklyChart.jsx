import { useMemo } from 'react'
import { Calendar, TrendingUp } from 'lucide-react'

export default function WeeklyChart({ completions = {}, habits = [] }) {
  const weekData = useMemo(() => {
    const days = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      let completedCount = 0
      Object.values(completions).forEach(habitCompletions => {
        if ((habitCompletions || []).includes(dateStr)) {
          completedCount++
        }
      })

      const percentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0

      days.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        completed: completedCount,
        total: habits.length || 1,
        percentage
      })
    }

    return days
  }, [completions, habits])

  const maxCompleted = Math.max(...weekData.map(d => d.completed), 1)
  const weeklyAvg = Math.round(weekData.reduce((sum, d) => sum + d.percentage, 0) / 7)
  const bestDay = weekData.reduce((best, d) => d.percentage > best.percentage ? d : best, weekData[0])

  return (
    <div className="bg-surface-dark rounded-3xl p-6 card-shadow overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-white/60 mb-1">Weekly Progress</p>
          <h3 className="text-xl font-bold text-white">Habit Completions</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm font-medium flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {weeklyAvg}% avg
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-44 mb-4">
        {weekData.map((day, index) => {
          const heightPercent = (day.completed / maxCompleted) * 100
          const isToday = index === weekData.length - 1
          const isPerfect = day.percentage === 100

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full h-36 bg-white/5 rounded-xl overflow-hidden">
                <div
                  className={`absolute bottom-0 left-0 right-0 rounded-xl transition-all duration-700 ease-out ${isPerfect
                      ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                      : isToday
                        ? 'bg-gradient-to-t from-primary to-orange-400'
                        : day.completed > 0
                          ? 'bg-gradient-to-t from-secondary/80 to-teal-400/80'
                          : 'bg-white/10'
                    }`}
                  style={{ height: `${Math.max(heightPercent, 8)}%` }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-bold text-lg">{day.percentage}%</span>
                  <span className="text-white/60 text-xs">{day.completed}/{day.total}</span>
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm group-hover:opacity-0 transition-opacity">
                  {day.completed}
                </span>
                {isPerfect && (
                  <div className="absolute top-1 left-1/2 -translate-x-1/2">
                    <span className="text-lg">⭐</span>
                  </div>
                )}
              </div>
              <div className={`text-center ${isToday ? 'scale-110' : ''} transition-transform`}>
                <span className={`text-xs font-semibold block ${isToday ? 'text-primary' : 'text-white/60'}`}>
                  {day.day}
                </span>
                <span className={`text-xs ${isToday ? 'text-primary/80' : 'text-white/40'}`}>
                  {day.dayNum}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-white/40" />
          <span className="text-white/60">Best day:</span>
          <span className="text-white font-medium">{bestDay.day} ({bestDay.percentage}%)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-primary to-orange-400" />
            <span className="text-xs text-white/60">Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-xs text-white/60">100%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
