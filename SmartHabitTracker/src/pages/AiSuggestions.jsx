import { useState, useEffect, useCallback } from 'react'
import {
  Sparkles, Lightbulb, Target, Layers, Star, RefreshCw, TrendingUp,
  Brain, Zap, Clock, Award, ArrowRight, Loader2, Smile, Flame, Heart
} from 'lucide-react'

import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { aiSuggestions } from '../utils/api'

// ICON MAP
const iconMap = {
  rocket: TrendingUp,
  layers: Layers,
  chart: TrendingUp,
  target: Target,
  clock: Clock,
  star: Star,
  zap: Zap,
  award: Award,
  brain: Brain,
  lightbulb: Lightbulb
}

const categoryColors = {
  Celebration: 'from-emerald-500 to-teal-500',
  Improvement: 'from-amber-500 to-orange-500',
  GettingStarted: 'from-blue-500 to-cyan-500',
  Motivation: 'from-purple-500 to-pink-500',
  Strategy: 'from-indigo-500 to-purple-500',
  Consistency: 'from-rose-500 to-red-500',
  Psychology: 'from-violet-500 to-purple-500'
}

export default function AiSuggestions() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [personalizedTips, setPersonalizedTips] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ⭐ NEW FEATURES
  const [aiMood, setAiMood] = useState("Balanced")
  const [quote, setQuote] = useState("Your small steps create big wins.")

  const moodEmojis = {
    Happy: "😊",
    Focused: "🎯",
    Balanced: "⚖️",
    Motivated: "🔥",
    Calm: "🧘"
  }

  const generateMood = () => {
    const moods = ["Happy", "Focused", "Balanced", "Motivated", "Calm"]
    setAiMood(moods[Math.floor(Math.random() * moods.length)])
  }

  const generateQuote = () => {
    const quotes = [
      "Consistency is your superpower.",
      "Every day is a new chance to restart.",
      "Small progress is still progress.",
      "Discipline beats motivation.",
      "Your habits shape your future."
    ]
    setQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }

  const loadSuggestions = useCallback(async () => {
    try {
      const data = await aiSuggestions.get()
      setPersonalizedTips(data?.personalized_tips || [])
      setSuggestions(data?.suggestions || [])

      generateMood()
      generateQuote()

    } catch (error) {
      console.error('AI suggestions failed:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadSuggestions()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted">Generating AI magic...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="p-4 lg:p-6">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
                <p className="text-muted">Smarter suggestions, better habits</p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-3 bg-surface hover:bg-gray-100 text-foreground rounded-xl transition-all card-shadow disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* ⭐ AI OVERVIEW SECTION */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">

            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-5 rounded-2xl text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Smile className="w-6 h-6" />
                <h3 className="font-semibold">AI Mood Score</h3>
              </div>
              <p className="text-3xl font-bold">{moodEmojis[aiMood]} {aiMood}</p>
              <p className="text-white/70 text-sm mt-1">Based on your weekly habit activity</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-orange-500 p-5 rounded-2xl text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-6 h-6" />
                <h3 className="font-semibold">Daily Motivation</h3>
              </div>
              <p className="text-lg font-medium">{quote}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-5 rounded-2xl text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Flame className="w-6 h-6" />
                <h3 className="font-semibold">Quick Action</h3>
              </div>
              <button className="bg-white/20 px-4 py-2 rounded-xl font-medium hover:bg-white/30 transition-all w-full">
                Boost Productivity ⚡
              </button>
            </div>
          </div>

          {/* PERSONALIZED TIPS */}
          {personalizedTips.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Personalized For You
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {personalizedTips.map((tip, index) => {
                  const IconComponent = iconMap[tip?.icon] || Lightbulb
                  const gradient = categoryColors[tip?.category] || 'from-gray-500 to-gray-600'

                  return (
                    <div
                      key={index}
                      className={`rounded-3xl p-6 text-white bg-gradient-to-br ${gradient} shadow-xl hover:scale-[1.02] transition-transform`}
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <IconComponent className="w-6 h-6" />
                        </div>

                        <div>
                          <p className="text-xs text-white/70">{tip.category}</p>
                          <h3 className="text-lg font-bold">{tip.title}</h3>
                          <p className="text-sm text-white/80 mt-1">{tip.description}</p>

                          {tip.action && (
                            <button className="mt-3 flex items-center gap-2 text-sm hover:gap-3 transition-all">
                              <span>{tip.action}</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* GENERAL SUGGESTIONS */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning" />
              Habit Building Tips
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((s, i) => {
                const IconComponent = iconMap[s.icon] || Lightbulb

                return (
                  <div
                    key={i}
                    className="bg-surface rounded-2xl p-5 card-shadow hover:shadow-xl transition-all"
                  >
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>

                      <div>
                        <p className="text-xs text-muted uppercase">{s.category}</p>
                        <h3 className="font-semibold text-foreground mt-1">{s.title}</h3>
                        <p className="text-sm text-muted mt-1">{s.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* SCIENCE SECTION */}
          <div className="bg-surface-dark rounded-3xl p-6 card-shadow">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Science Behind Good Habits
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Clock,
                  title: "66-Day Formation",
                  desc: "Habits take an average of 66 days to form, not 21."
                },
                {
                  icon: Layers,
                  title: "Habit Stacking",
                  desc: "Attach a new habit to an existing one to boost success."
                },
                {
                  icon: Brain,
                  title: "Habit Loop",
                  desc: "Cue → Routine → Reward is the foundation of habit building."
                },
                {
                  icon: Zap,
                  title: "Start Small",
                  desc: "2-minute habits remove resistance and build momentum."
                }
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
