import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const SAMPLE_FEEDBACKS = [
  "The product quality is amazing but delivery took too long. I'd order again though!",
  "Customer support was unhelpful and rude. My issue still hasn't been resolved after 2 weeks.",
  "Great value for money. The interface is intuitive and easy to use. Highly recommend!",
  "Average experience. Nothing special but nothing terrible either.",
  "The new update broke several features I relied on. Very disappointed with the regression.",
]

const SentimentBadge = ({ sentiment }) => {
  const styles = {
    Positive: 'bg-green-900/40 text-green-400 border-green-700',
    Negative: 'bg-red-900/40 text-red-400 border-red-700',
    Neutral:  'bg-slate-700 text-slate-300 border-slate-600',
    Mixed:    'bg-amber-900/40 text-amber-400 border-amber-700',
  }
  const icons = { Positive: '😊', Negative: '😠', Neutral: '😐', Mixed: '🤔' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border ${styles[sentiment] || styles.Neutral}`}>
      {icons[sentiment]} {sentiment}
    </span>
  )
}

const UrgencyBadge = ({ urgency }) => {
  const styles = { High: 'text-red-400', Medium: 'text-amber-400', Low: 'text-green-400' }
  return <span className={`text-xs font-bold ${styles[urgency]}`}>⚡ {urgency} Urgency</span>
}

export default function SubmitFeedback({ onSubmitted }) {
  const [text, setText] = useState('')
  const [source, setSource] = useState('manual')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async () => {
    if (!text.trim()) { toast.error('Please enter feedback text.'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await axios.post('/api/feedback/submit', { text: text.trim(), source })
      setResult(res.data.analysis)
      toast.success('Feedback analyzed!')
      onSubmitted?.()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submission failed!')
    } finally {
      setLoading(false)
    }
  }

  const useSample = (s) => { setText(s); setResult(null) }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Submit & Analyze Feedback</h2>
        <p className="text-slate-400 text-sm">Get instant sentiment analysis, topic extraction, and actionable insights.</p>
      </div>

      {/* Sample Feedbacks */}
      <div>
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Quick Samples</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_FEEDBACKS.map((s, i) => (
            <button key={i} onClick={() => useSample(s)}
              className="text-xs bg-slate-800 border border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition">
              Sample {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <label className="block text-sm font-medium text-slate-300 mb-2">Feedback Text</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
          placeholder="Enter customer feedback here..."
          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500 transition resize-none" />

        <div className="flex items-center gap-3 mt-3">
          <select value={source} onChange={e => setSource(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none">
            <option value="manual">Manual Entry</option>
            <option value="email">Email</option>
            <option value="survey">Survey</option>
            <option value="social">Social Media</option>
            <option value="support">Support Ticket</option>
          </select>
          <span className="text-slate-500 text-xs">{text.length} chars</span>
          <button onClick={handleSubmit} disabled={loading || !text.trim()}
            className="ml-auto bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-xl transition flex items-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
            ) : '🔍 Analyze'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-base font-semibold text-white">Analysis Result</h3>
            <div className="flex items-center gap-3">
              <SentimentBadge sentiment={result.sentiment} />
              <UrgencyBadge urgency={result.urgency} />
            </div>
          </div>

          {/* Score bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Sentiment Score</span>
              <span className="text-white font-medium">{result.sentiment_score?.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${((result.sentiment_score + 1) / 2) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-0.5">
              <span>-1.0 (Very Negative)</span><span>+1.0 (Very Positive)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Summary */}
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Summary</p>
              <p className="text-sm text-slate-300">{result.summary}</p>
            </div>
            {/* Actionable Insight */}
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Actionable Insight</p>
              <p className="text-sm text-emerald-300">{result.actionable_insight}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Topics */}
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {(result.topics || []).map((t, i) => (
                  <span key={i} className="text-xs bg-emerald-900/30 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>
            {/* Keywords */}
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {(result.keywords || []).map((k, i) => (
                  <span key={i} className="text-xs bg-slate-700 text-slate-300 border border-slate-600 px-2.5 py-1 rounded-full">{k}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1 border-t border-slate-700">
            <div className="text-xs text-slate-400">Category: <span className="text-slate-200 font-medium">{result.category}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
