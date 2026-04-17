import { useState, useEffect } from 'react'
import axios from 'axios'
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react'

// Replace this with standard base URL configuration if needed
const API_BASE = 'http://localhost:8000/api/v1'

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    SENT: 'bg-emerald-500/20 text-emerald-400',
    FAILED: 'bg-red-500/20 text-red-400',
  }
  
  const icons = {
    PENDING: <Clock size={14} />,
    SENT: <CheckCircle2 size={14} />,
    FAILED: <XCircle size={14} />
  }

  return (
    <span className={`px-2 py-1 flex items-center gap-1.5 rounded-full text-xs font-medium w-max ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  )
}

export default function EmailHistoryTable({ campaignId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!campaignId) return
    
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${API_BASE}/campaigns/${campaignId}/logs`)
        setLogs(res.data)
      } catch (err) {
        console.error("Failed to fetch logs:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchLogs()
    // Poll every 5 seconds for updates if pending
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [campaignId])

  if (!campaignId) return <div className="text-secondary text-sm">Select a campaign to view logs.</div>
  
  return (
    <div className="glass-card rounded-xl border border-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-subtle bg-white/5">
              <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Sent At</th>
              <th className="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle">
            {loading && logs.length === 0 ? (
              <tr><td colSpan="4" className="px-4 py-4 text-center text-sm text-secondary">Loading logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="4" className="px-4 py-4 text-center text-sm text-secondary">No logs found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-primary">{log.customer_email}</td>
                  <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                  <td className="px-4 py-3 text-sm text-secondary">
                    {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-400 max-w-xs truncate">
                    {log.error_message || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
