import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import SegmentScatterPlot from '../components/charts/SegmentScatterPlot'
import { useFilters } from '../context/FilterContext'
import { fetchScatter, fetchSegments } from '../utils/api'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const SEGMENT_COLORS = { Bronze: '#F59E0B', Silver: '#94A3B8', Gold: '#EAB308', Platinum: '#A855F7' }

export default function Segmentation() {
  const { filters, refreshKey } = useFilters()
  const [scatter, setScatter] = useState(null)
  const [segments, setSegments] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [s, seg] = await Promise.allSettled([
      fetchScatter(filters).then(r => r.data),
      fetchSegments(filters).then(r => r.data),
    ])
    if (s.status === 'fulfilled') setScatter(s.value)
    if (seg.status === 'fulfilled') setSegments(seg.value)
    setLoading(false)
  }, [filters, refreshKey]) // eslint-disable-line

  useAutoRefresh(load, 180000)

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-primary">Customer Segmentation</h2>
        <p className="text-sm text-secondary mt-0.5">RFM-based customer segments analysis</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SegmentScatterPlot data={scatter} loading={loading} />

        {/* Segment Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 rounded-2xl">
          <h3 className="font-semibold text-base text-primary mb-1">Segment Share</h3>
          <p className="text-xs text-secondary mb-4">Distribution across segments</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={segments || []} cx="50%" cy="50%" outerRadius={90} dataKey="count" paddingAngle={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              >
                {(segments || []).map((entry) => (
                  <Cell key={entry.name} fill={SEGMENT_COLORS[entry.name] || '#6366F1'} fillOpacity={0.85} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} customers`, 'Count']}
                contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                labelStyle={{ color: '#F1F5F9' }} itemStyle={{ color: '#94A3B8' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Stat rows */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(segments || []).map(s => (
              <div key={s.name} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: SEGMENT_COLORS[s.name] || '#6366F1' }} />
                <div>
                  <p className="text-xs font-semibold text-primary">{s.name}</p>
                  <p className="text-xs text-secondary">{s.count} customers</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
