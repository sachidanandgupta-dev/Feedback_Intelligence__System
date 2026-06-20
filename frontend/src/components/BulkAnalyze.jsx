import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const SAMPLE_BULK = `The app crashes every time I try to upload a file. Totally unusable.
Love the new dashboard design! It's so much cleaner and faster.
Shipping took 3 weeks. That's way too long for a premium service.
Customer support resolved my issue in under 10 minutes. Impressive!
The pricing is too high compared to competitors offering the same features.
Setup was straightforward and the documentation is excellent.
I've been a customer for 3 years and quality has really gone downhill lately.
The mobile app is fantastic. Works perfectly on my iPhone.
Got charged twice for the same order. Still waiting for refund after 2 weeks.
Overall good product but could use more customization options.`

export default function BulkAnalyze({ onAnalyzed }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const getFeedbacks = () => text.split('\n').map(l => l.trim()).filter(l => l.length > 5)

  const handleAnalyze = async () => {
    const feedbacks = getFeedbacks()
    if (feedbacks.length < 2) { toast.error('Please enter at least 2 feedback entries.'); return }
    if (feedbacks.length > 50) { toast.error('Maximum 50 feedbacks at once.'); return }

    setLoading(true)
    setResult(null)
    try {
      const res = await axios.post('/api/feedback/bulk-analyze', { feedbacks })
      setResult(res.data.insights)
      toast.success(`✅ Analyzed ${res.data.count} feedbacks!`)
      onAnalyzed?.()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Bulk analysis failed!')
    } finally {
      setLoading(false)
    }
  }

  const count = getFeedbacks().length
  const priorityColors = { HIGH: 'border-red-700 bg-red-900/20 text-red-300', MEDIUM: 'border-amber-700 bg-amber-900/20 text-amber-300', LOW: 'border-blue-700 bg-blue-900/20 text-blue-300' }
  const sentColors = { Positive: 'text-green-400', Negative: 'text-red-400', Neutral: 'text-slate-400', Mixed: 'text-amber-400' }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Bulk Feedback Analysis</h2>
        <p className="text-slate-400 text-sm">Paste multiple feedbacks (one per line) to get aggregate business insights.</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-slate-300">Feedback Entries (one per line)</label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{count} entries</span>
            <button onClick={() => { setText(SAMPLE_BULK); setResult(null) }}
              className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800 px-3 py-1 rounded-lg transition">
              Load Sample (10)
            </button>
          </div>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={10}
          placeholder={"Enter one feedback per line:\nThe product is amazing!\nDelivery was too slow.\nCustomer support needs improvement."}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500 transition resize-none font-mono" />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-slate-500">Min: 2 entries · Max: 50 entries</p>
          <button onClick={handleAnalyze} disabled={loading || count < 2}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-xl transition flex items-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> AI Analyzing {count} feedbacks...</>
            ) : `🧠 Analyze ${count > 0 ? count : ''} Feedbacks`}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Aggregate Insights</h3>
                <p className="text-sm text-slate-400">{count} feedbacks analyzed</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${sentColors[result.overall_sentiment]}`}>
                  {result.overall_sentiment}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full border font-medium
                  ${result.trend === 'Improving' ? 'border-green-700 bg-green-900/20 text-green-400' :
                    result.trend === 'Declining' ? 'border-red-700 bg-red-900/20 text-red-400' :
                    'border-slate-600 bg-slate-700 text-slate-300'}`}>
                  {result.trend === 'Improving' ? '↑' : result.trend === 'Declining' ? '↓' : '→'} {result.trend}
                </span>
              </div>
            </div>

            {result.executive_summary && (
              <div className="mt-4 bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Executive Summary</p>
                <p className="text-sm text-slate-300 leading-relaxed">{result.executive_summary}</p>
              </div>
            )}
          </div>

          {/* Sentiment Distribution */}
          {result.sentiment_distribution && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Sentiment Distribution</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(result.sentiment_distribution).map(([sentiment, pct]) => {
                  const colors = { positive: '#22c55e', negative: '#ef4444', neutral: '#94a3b8', mixed: '#f59e0b' }
                  const c = colors[sentiment.toLowerCase()] || '#6b7280'
                  return (
                    <div key={sentiment} className="text-center">
                      <div className="text-2xl font-bold" style={{ color: c }}>{pct}%</div>
                      <div className="text-xs text-slate-400 capitalize">{sentiment}</div>
                      <div className="h-1.5 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Critical Issues */}
            {result.critical_issues?.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h4 className="text-sm font-semibold text-red-400 mb-3">🚨 Critical Issues</h4>
                <ul className="space-y-2">
                  {result.critical_issues.map((issue, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 shrink-0">•</span> {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Positive Highlights */}
            {result.positive_highlights?.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h4 className="text-sm font-semibold text-green-400 mb-3">✅ Positive Highlights</h4>
                <ul className="space-y-2">
                  {result.positive_highlights.map((h, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 shrink-0">•</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Key Themes */}
          {result.key_themes?.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">🏷️ Key Themes</h4>
              <div className="flex flex-wrap gap-2">
                {result.key_themes.map((theme, i) => (
                  <span key={i} className="text-sm bg-emerald-900/30 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-full">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {result.recommended_actions?.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">💡 Recommended Actions</h4>
              <div className="space-y-3">
                {result.recommended_actions.map((action, i) => (
                  <div key={i} className={`rounded-xl p-4 border ${priorityColors[action.priority] || 'border-slate-600 bg-slate-700/30 text-slate-300'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold opacity-80">{action.priority}</span>
                      <span className="text-sm font-medium text-white">{action.action}</span>
                    </div>
                    <p className="text-xs opacity-75">Impact: {action.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NPS Estimate */}
          {result.nps_estimate !== undefined && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-5">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Estimated NPS</p>
                <div className={`text-4xl font-bold mt-1 ${result.nps_estimate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {result.nps_estimate > 0 ? '+' : ''}{result.nps_estimate}
                </div>
              </div>
              <div className="flex-1">
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${result.nps_estimate >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${((result.nps_estimate + 100) / 200) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>-100 (Detractors)</span><span>+100 (Promoters)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
