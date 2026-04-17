import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ZAxis, Legend
} from 'recharts'
import { motion } from 'framer-motion'

const SEGMENT_COLORS = {
  Bronze: '#F59E0B',
  Silver: '#94A3B8',
  Gold: '#EAB308',
  Platinum: '#A855F7',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="glass-card px-4 py-3 text-xs space-y-1">
      <p className="font-semibold text-primary">{d.customerID}</p>
      <p className="text-secondary">Frequency: <span className="text-primary font-medium">{d.x}</span></p>
      <p className="text-secondary">Monetary: <span className="text-primary font-medium">₹{(d.y/1000).toFixed(1)}k</span></p>
      <p className="text-secondary">CLV: <span className="text-primary font-medium">₹{(d.clv/1000).toFixed(1)}k</span></p>
      <p className="text-secondary">Segment: <span className="text-primary font-medium">{d.segment}</span></p>
      <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${
        d.churnRisk === 'High' ? 'bg-rose-500/20 text-rose-400' :
        d.churnRisk === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
        'bg-emerald-500/20 text-emerald-400'
      }`}>{d.churnRisk} Churn</span>
    </div>
  )
}

export default function SegmentScatterPlot({ data, loading }) {
  if (loading) {
    return (
      <div className="glass-card p-5 rounded-2xl">
        <div className="skeleton h-4 w-44 mb-4 rounded"/>
        <div className="skeleton h-56 w-full rounded-xl"/>
      </div>
    )
  }

  // Group by segment for multiple scatter series
  const segments = [...new Set((data || []).map(d => d.segment))]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 rounded-2xl"
    >
      <div className="mb-4">
        <h3 className="font-semibold text-base text-primary">Customer Segmentation</h3>
        <p className="text-xs text-secondary mt-0.5">Frequency vs Monetary — bubble size = CLV</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="x" name="Frequency" type="number"
            tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false}
            label={{ value: 'Frequency', position: 'insideBottom', offset: -2, fill: '#64748B', fontSize: 11 }}
          />
          <YAxis dataKey="y" name="Monetary" type="number"
            tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false}
          />
          <ZAxis dataKey="z" range={[30, 200]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8', paddingTop: '8px' }} />
          {segments.map(seg => (
            <Scatter
              key={seg}
              name={seg}
              data={(data || []).filter(d => d.segment === seg)}
              fill={SEGMENT_COLORS[seg] || '#6366F1'}
              fillOpacity={0.8}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
