import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { motion } from 'framer-motion'

const COLORS = ['#22D3EE', '#A855F7', '#EC4899', '#10B981', '#F59E0B', '#3B82F6']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-4 py-3 text-sm">
      <p className="font-semibold text-primary">{payload[0].name}</p>
      <p className="text-secondary">Customers: <span className="font-bold text-primary">{payload[0].value}</span></p>
      <p className="text-secondary">Share: <span className="font-bold text-primary">{payload[0].payload.percent}%</span></p>
    </div>
  )
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function CLVDonutChart({ data, loading }) {
  if (loading) {
    return (
      <div className="glass-card p-5 rounded-2xl">
        <div className="skeleton h-4 w-36 mb-4 rounded"/>
        <div className="skeleton h-52 w-full rounded-xl"/>
      </div>
    )
  }

  const total = (data || []).reduce((s, d) => s + d.count, 0)
  const enriched = (data || []).map(d => ({
    ...d,
    percent: total ? ((d.count / total) * 100).toFixed(1) : 0,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 rounded-2xl"
    >
      <div className="mb-3">
        <h3 className="font-semibold text-base text-primary">CLV Distribution</h3>
        <p className="text-xs text-secondary mt-0.5">Customer Lifetime Value buckets</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={enriched} cx="50%" cy="50%"
            innerRadius={52} outerRadius={85}
            paddingAngle={3} dataKey="count"
            labelLine={false} label={renderCustomLabel}
          >
            {enriched.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.9}
                stroke="rgba(0,0,0,0.2)" strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(v) => <span style={{ color: '#94A3B8', fontSize: 11 }}>{v}</span>}
            wrapperStyle={{ paddingTop: '4px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
