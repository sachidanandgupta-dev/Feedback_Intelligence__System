import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import SubmitFeedback from './components/SubmitFeedback'
import BulkAnalyze from './components/BulkAnalyze'
import Dashboard from './components/Dashboard'
import FeedbackList from './components/FeedbackList'

const TABS = [
  { id: 'dashboard', label: '📊 Dashboard', desc: 'Live stats & insights' },
  { id: 'submit', label: '✍️ Submit', desc: 'Single feedback' },
  { id: 'bulk', label: '📋 Bulk Analyze', desc: 'Multiple feedbacks' },
  { id: 'history', label: '🗂️ History', desc: 'All feedbacks' },
]

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = () => setRefreshKey(k => k + 1)

  return (
    <div className="min-h-screen bg-slate-900">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' }
      }} />

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-xl">💬</div>
          <div>
            <h1 className="text-xl font-bold text-white">Feedback Intelligence System</h1>
            <p className="text-xs text-slate-400">Sentiment Analysis · Topic Classification · Automated Summarization</p>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 pt-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-t-xl text-sm font-medium transition
                ${tab === t.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6">
        {tab === 'dashboard' && <Dashboard key={refreshKey} />}
        {tab === 'submit'    && <SubmitFeedback onSubmitted={refresh} />}
        {tab === 'bulk'      && <BulkAnalyze onAnalyzed={refresh} />}
        {tab === 'history'   && <FeedbackList key={refreshKey} />}
      </main>
    </div>
  )
}
