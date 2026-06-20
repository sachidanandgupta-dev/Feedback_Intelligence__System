import { useEffect, useState } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const SENTIMENT_COLORS = {
  Positive: '#22c55e',
  Negative: '#ef4444',
  Neutral:  '#94a3b8',
  Mixed:    '#f59e0b',
}

const StatCard = ({ icon, label, value, sub, color = 'emerald' }) => {
  const colors = {
    emerald: 'bg-emerald-900/30 border-emerald-800 text-emerald-400',
    blue:    'bg-blue-900/30 border-blue-800 text-blue-400',
    amber:   'bg-amber-900/30 border-amber-800 text-amber-400',
    violet:  'bg-violet-900/30 border-violet-800 text-violet-400',
  }
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/feedback/stats')
      .then(r => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-slate-300 mb-2">No Data Yet</h2>
        <p className="text-slate-500">Submit some feedback or use Bulk Analyze to see insights here.</p>
      </div>
    )
  }

  const sentimentData = Object.entries(stats.sentiment_distribution || {}).map(([name, value]) => ({
    name, value, color: SENTIMENT_COLORS[name] || '#6b7280'
  }))

  const topicsData = (stats.top_topics || []).slice(0, 8).map(t => ({
    topic: t.topic.length > 15 ? t.topic.slice(0, 15) + '…' : t.topic,
    count: t.count
  }))

  const avgScore = stats.avg_sentiment_score || 0
  const sentimentLabel = avgScore > 0.3 ? 'Positive' : avgScore < -0.3 ? 'Negative' : 'Neutral'
  const npsColor = avgScore >= 0.3 ? 'emerald' : avgScore <= -0.3 ? 'red' : 'amber'

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="💬" label="Total Feedbacks" value={stats.total} color="emerald" />
        <StatCard icon="😊" label="Overall Sentiment" value={sentimentLabel}
          sub={`Score: ${avgScore.toFixed(2)}`} color="blue" />
        <StatCard icon="🔥" label="Top Topic"
          value={stats.top_topics?.[0]?.topic || '—'}
          sub={`${stats.top_topics?.[0]?.count || 0} mentions`} color="amber" />
        <StatCard icon="📈" label="Categories"
          value={Object.keys(stats.sentiment_distribution || {}).length}
          sub="sentiment types" color="violet" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sentiment Pie */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" nameKey="name" paddingAngle={3}>
                {sentimentData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                formatter={(v, n) => [v, n]} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Topics Bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Topics</h3>
          {topicsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topicsData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-10">No topic data yet.</p>
          )}
        </div>
      </div>

      {/* Sentiment Breakdown Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Sentiment Breakdown</h3>
        <div className="space-y-3">
          {sentimentData.map(({ name, value, color }) => {
            const pct = Math.round((value / stats.total) * 100)
            return (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{name}</span>
                  <span className="text-white font-medium">{value} ({pct}%)</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
