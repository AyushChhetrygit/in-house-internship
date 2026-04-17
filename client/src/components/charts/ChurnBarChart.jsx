import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from 'recharts'
import { motion } from 'framer-motion'

const CHURN_COLORS = {
  Low: '#10B981',
  Medium: '#F59E0B',
  High: '#EF4444',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-4 py-3 text-sm">
      <p className="font-semibold text-primary mb-1">{label} Risk</p>
      <p className="text-secondary">Count: <span className="font-bold text-primary">{payload[0].value}</span> customers</p>
    </div>
  )
}

export default function ChurnBarChart({ data, loading }) {
  if (loading) {
    return (
      <div className="glass-card p-5 rounded-2xl">
        <div className="skeleton h-4 w-36 mb-4 rounded"/>
        <div className="skeleton h-52 w-full rounded-xl"/>
      </div>
    )
  }

  const total = (data || []).reduce((s, d) => s + d.count, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 rounded-2xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base text-primary">Churn Risk Distribution</h3>
          <p className="text-xs text-secondary mt-0.5">Customer count per risk tier</p>
        </div>
        <div className="flex flex-col gap-1">
          {(data || []).map(d => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ background: CHURN_COLORS[d.name] }} />
              <span className="text-secondary">{d.name}:</span>
              <span className="font-semibold text-primary">{((d.count / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data || []} barCategoryGap="35%" margin={{ top: 10, right: 5, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {(data || []).map((entry) => (
              <Cell key={entry.name} fill={CHURN_COLORS[entry.name] || '#6366F1'} fillOpacity={0.85} />
            ))}
            <LabelList dataKey="count" position="top" style={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
