import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight,
  ChevronLeft, ChevronRight, Search, Download
} from 'lucide-react'
import { fetchCustomers } from '../../utils/api'
import toast from 'react-hot-toast'

const PAGE_SIZES = [10, 25, 50]

const CHURN_BADGE = {
  Low: 'badge-low',
  Medium: 'badge-medium',
  High: 'badge-high',
}

const SEGMENT_STYLES = {
  Bronze: 'bg-orange-500/15 text-orange-400',
  Silver: 'bg-slate-400/15 text-slate-300',
  Gold: 'bg-yellow-500/15 text-yellow-400',
  Platinum: 'bg-violet-500/15 text-violet-400',
}

export default function CustomerTable({ filters, refreshKey }) {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('customerID')
  const [sortDir, setSortDir] = useState('asc')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit, search, sortBy, sortDir, ...filters }
      const res = await fetchCustomers(params)
      setData(res.data || [])
      setTotal(res.total || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, sortBy, sortDir, filters, refreshKey])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, filters])

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const exportCSV = () => {
    if (!data.length) return
    const cols = Object.keys(data[0])
    const rows = data.map(r => cols.map(c => r[c]).join(','))
    const csv = [cols.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'customers_export.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported!', {
      style: { background: 'rgba(15,23,42,0.95)', color: '#F1F5F9', border: '1px solid rgba(34,211,238,0.3)' },
    })
  }

  const totalPages = Math.ceil(total / limit)

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronUp size={12} className="opacity-30" />
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-cyan-400" /> : <ChevronDown size={12} className="text-cyan-400" />
  }

  const COLS = [
    { key: 'customerID', label: 'Customer ID' },
    { key: 'segmentLabel', label: 'Segment' },
    { key: 'churnRisk', label: 'Churn Risk' },
    { key: 'clv', label: 'CLV' },
    { key: 'totalSpend', label: 'Total Spend' },
    { key: 'totalOrders', label: 'Orders' },
    { key: 'engagementScore', label: 'Engagement' },
    { key: 'recommendedAction', label: 'Action' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Table Header */}
      <div className="p-5 border-b border-subtle flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-base text-primary">Customer Records</h3>
          <p className="text-xs text-secondary mt-0.5">{total.toLocaleString()} total customers</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
            <Search size={13} className="text-muted-custom" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ID..."
              className="bg-transparent text-sm outline-none w-28 text-primary placeholder-muted-custom"
              style={{ color: 'var(--text-secondary)' }}
            />
          </div>
          <select
            value={limit}
            onChange={e => { setLimit(Number(e.target.value)); setPage(1) }}
            className="text-xs px-2 py-2 rounded-xl outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
          >
            {PAGE_SIZES.map(s => <option key={s} value={s} style={{ background: '#1E293B' }}>{s} / page</option>)}
          </select>
          <button onClick={exportCSV} className="btn-ghost flex items-center gap-1.5 text-xs">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              {COLS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left text-xs font-semibold text-secondary uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-primary transition-colors whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={i} className="border-b border-subtle">
                  {COLS.map(c => (
                    <td key={c.key} className="px-4 py-3"><div className="skeleton h-3.5 rounded w-full" /></td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr><td colSpan={COLS.length} className="text-center py-12 text-secondary">No records found.</td></tr>
            ) : (
              data.map((row, i) => (
                <motion.tr
                  key={row.customerID}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className="border-b border-subtle hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-cyan-400">{row.customerID}</td>
                  <td className="px-4 py-3">
                    <span className={`badge-segment px-2 py-0.5 rounded-full text-xs font-medium ${SEGMENT_STYLES[row.segmentLabel] || ''}`}>
                      {row.segmentLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={CHURN_BADGE[row.churnRisk] || 'text-secondary'}>{row.churnRisk}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary">₹{(row.clv / 1000).toFixed(0)}k</td>
                  <td className="px-4 py-3 text-secondary">₹{(row.totalSpend / 1000).toFixed(1)}k</td>
                  <td className="px-4 py-3 text-secondary">{row.totalOrders}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                          style={{ width: `${Math.min((row.engagementScore / 15) * 100, 100)}%` }} />
                      </div>
                      <span className="text-xs text-secondary">{row.engagementScore?.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-secondary">{row.recommendedAction}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-subtle flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs text-secondary">
          Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total.toLocaleString()}
        </p>
        <div className="flex items-center gap-1">
          {[
            { icon: ChevronsLeft, fn: () => setPage(1), disabled: page === 1 },
            { icon: ChevronLeft, fn: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1 },
            { icon: ChevronRight, fn: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages },
            { icon: ChevronsRight, fn: () => setPage(totalPages), disabled: page === totalPages },
          ].map(({ icon: Ic, fn, disabled }, i) => (
            <button
              key={i} onClick={fn} disabled={disabled}
              className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Ic size={14} />
            </button>
          ))}
          <span className="text-xs text-secondary ml-2">Page {page} / {totalPages}</span>
        </div>
      </div>
    </motion.div>
  )
}
