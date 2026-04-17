import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import ActionHeatmap from '../components/charts/ActionHeatmap'
import { useFilters } from '../context/FilterContext'
import { fetchActions } from '../utils/api'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const ACTION_COLORS = ['#22D3EE', '#A855F7', '#EC4899', '#10B981', '#F59E0B']

export default function ActionMatrix() {
  const { filters, refreshKey } = useFilters()
  const [actions, setActions] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    await fetchActions(filters).then(r => setActions(r)).catch(console.error)
    setLoading(false)
  }, [filters, refreshKey]) // eslint-disable-line

  useAutoRefresh(load, 180000)

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-primary">Action Matrix</h2>
        <p className="text-sm text-secondary mt-0.5">Recommended actions per customer segment and risk tier</p>
      </div>

      <ActionHeatmap data={actions} loading={loading} />

      {/* Action breakdown bar chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 rounded-2xl">
        <h3 className="font-semibold text-base text-primary mb-1">Action Distribution</h3>
        <p className="text-xs text-secondary mb-4">Number of customers per recommended action</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={actions?.data || []} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="action" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip
              contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              labelStyle={{ color: '#F1F5F9' }} itemStyle={{ color: '#94A3B8' }}
            />
            <Bar dataKey="count" name="Customers" radius={[0, 6, 6, 0]}>
              {(actions?.data || []).map((_, i) => (
                <Cell key={i} fill={ACTION_COLORS[i % ACTION_COLORS.length]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
