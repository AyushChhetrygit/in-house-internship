import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { motion } from 'framer-motion'

const TIME_RANGES = ['7d', '30d', '90d']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-4 py-3 text-sm">
      <p className="font-semibold text-primary mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-secondary">{p.name}:</span>
          <span className="font-semibold text-primary">
            {p.name === 'totalSpend' ? `₹${(p.value/1000).toFixed(1)}k` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function TrendLineChart({ data, loading }) {
  const [range, setRange] = useState('30d')

  if (loading) {
    return (
      <div className="glass-card p-5 rounded-2xl">
        <div className="skeleton h-4 w-40 mb-4 rounded"/>
        <div className="skeleton h-56 w-full rounded-xl"/>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 rounded-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base text-primary">Revenue & Engagement Trend</h3>
          <p className="text-xs text-secondary mt-0.5">Total spend and avg engagement over time</p>
        </div>
        <div className="flex gap-1">
          {TIME_RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                range === r ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-secondary hover:text-primary'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data || []} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradEngagement" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#94A3B8', paddingTop: '8px' }}
          />
          <Area
            type="monotone" dataKey="totalSpend" name="Total Spend"
            stroke="#22D3EE" strokeWidth={2.5}
            fill="url(#gradSpend)" dot={false} activeDot={{ r: 5, fill: '#22D3EE' }}
          />
          <Area
            type="monotone" dataKey="avgEngagement" name="Avg Engagement"
            stroke="#A855F7" strokeWidth={2.5}
            fill="url(#gradEngagement)" dot={false} activeDot={{ r: 5, fill: '#A855F7' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
