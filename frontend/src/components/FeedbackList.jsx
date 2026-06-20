import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const sentimentStyle = {
  Positive: 'text-green-400 bg-green-900/20 border-green-800',
  Negative: 'text-red-400 bg-red-900/20 border-red-800',
  Neutral:  'text-slate-300 bg-slate-700 border-slate-600',
  Mixed:    'text-amber-400 bg-amber-900/20 border-amber-800',
}
const sentimentIcon = { Positive: '😊', Negative: '😠', Neutral: '😐', Mixed: '🤔' }

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  const load = () => {
    setLoading(true)
    axios.get('/api/feedback/list?limit=100')
      .then(r => setFeedbacks(r.data.feedbacks))
      .catch(() => setFeedbacks([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleClear = async () => {
    if (!confirm('Clear all feedbacks?')) return
    try {
      await axios.delete('/api/feedback/clear')
      setFeedbacks([])
      toast.success('All feedbacks cleared.')
    } catch {
      toast.error('Failed to clear.')
    }
  }

  const filtered = filter === 'All' ? feedbacks : feedbacks.filter(f => f.sentiment === filter)

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Feedback History</h2>
          <p className="text-slate-400 text-sm">{feedbacks.length} total entries</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'Positive', 'Negative', 'Neutral', 'Mixed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium
                ${filter === f ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600 text-slate-400 hover:text-white bg-slate-800'}`}>
              {f}
            </button>
          ))}
          <button onClick={handleClear} className="text-xs text-red-400 hover:text-red-300 border border-red-800 px-3 py-1.5 rounded-lg transition ml-2">
            🗑️ Clear All
          </button>
          <button onClick={load} className="text-xs text-slate-400 hover:text-white border border-slate-600 px-3 py-1.5 rounded-lg transition">
            ↻ Refresh
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-2xl">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-slate-400">No feedbacks found.</p>
          <p className="text-slate-500 text-sm mt-1">Submit some feedback or change filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((fb, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl p-4 transition">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm text-slate-200 leading-relaxed flex-1">{fb.text}</p>
                <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${sentimentStyle[fb.sentiment] || sentimentStyle.Neutral}`}>
                  {sentimentIcon[fb.sentiment]} {fb.sentiment}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {fb.category && <span className="bg-slate-700 px-2 py-0.5 rounded-full">{fb.category}</span>}
                {fb.urgency && (
                  <span className={fb.urgency === 'High' ? 'text-red-400' : fb.urgency === 'Medium' ? 'text-amber-400' : 'text-slate-400'}>
                    ⚡ {fb.urgency}
                  </span>
                )}
                {fb.source && <span>Source: {fb.source}</span>}
                {fb.submitted_at && <span>{new Date(fb.submitted_at).toLocaleString()}</span>}
                {fb.sentiment_score !== undefined && (
                  <span className={fb.sentiment_score > 0 ? 'text-green-400' : fb.sentiment_score < 0 ? 'text-red-400' : 'text-slate-400'}>
                    Score: {Number(fb.sentiment_score).toFixed(2)}
                  </span>
                )}
              </div>
              {fb.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {fb.topics.map((t, j) => (
                    <span key={j} className="text-xs bg-emerald-900/20 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
              {fb.actionable_insight && (
                <p className="text-xs text-slate-400 mt-2 border-t border-slate-700 pt-2">
                  💡 <span className="text-slate-300">{fb.actionable_insight}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
