import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import ChurnBarChart from '../components/charts/ChurnBarChart'
import { useFilters } from '../context/FilterContext'
import { fetchChurn, fetchKPIs } from '../utils/api'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

export default function ChurnAnalytics() {
  const { filters, refreshKey } = useFilters()
  const [churn, setChurn] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    await Promise.allSettled([
      fetchChurn(filters).then(r => setChurn(r.data)),
      fetchKPIs(filters).then(r => setKpis(r.data)),
    ])
    setLoading(false)
  }, [filters, refreshKey]) // eslint-disable-line

  useAutoRefresh(load, 180000)

  const total = (churn || []).reduce((s, d) => s + d.count, 0) || 1

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-primary">Churn Analytics</h2>
        <p className="text-sm text-secondary mt-0.5">Customer retention risk analysis</p>
      </div>

      {/* Metric row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'High Churn', key: 'High', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
          { label: 'Medium Churn', key: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
          { label: 'Low Churn', key: 'Low', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
        ].map(({ label, key, color, bg, border }) => {
          const d = (churn || []).find(c => c.name === key)
          const pct = d ? ((d.count / total) * 100).toFixed(1) : '0.0'
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5" style={{ background: bg, border: `1px solid ${border}` }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color }}>{label}</p>
              <p className="text-3xl font-bold" style={{ color }}>{d?.count ?? 0}</p>
              <p className="text-sm mt-1 text-secondary">{pct}% of customers</p>
              {/* Mini progress bar */}
              <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChurnBarChart data={churn} loading={loading} />

        {/* Insight table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 rounded-2xl">
          <h3 className="font-semibold text-base text-primary mb-1">Risk Breakdown</h3>
          <p className="text-xs text-secondary mb-4">Detailed churn risk metrics</p>

          <div className="space-y-3">
            {(churn || []).map(d => {
              const pct = ((d.count / total) * 100).toFixed(1)
              const color = d.name === 'High' ? '#EF4444' : d.name === 'Medium' ? '#F59E0B' : '#10B981'
              return (
                <div key={d.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-primary">{d.name} Risk</span>
                    <span className="text-sm font-bold" style={{ color }}>{d.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-subtle">
            <p className="text-xs text-secondary mb-1">Overall Churn Rate</p>
            <p className="text-2xl font-bold gradient-text-purple">{kpis?.churnPercent ?? 0}%</p>
            <p className="text-xs text-secondary mt-1">Based on High risk customers</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
