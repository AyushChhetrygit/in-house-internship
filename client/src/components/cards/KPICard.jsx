import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

const CARD_CONFIGS = {
  cyan: {
    gradient: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(129,140,248,0.1))',
    border: 'rgba(34,211,238,0.3)',
    glow: '0 0 25px rgba(34,211,238,0.15)',
    accent: '#22D3EE',
    iconBg: 'rgba(34,211,238,0.12)',
  },
  purple: {
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.1))',
    border: 'rgba(168,85,247,0.3)',
    glow: '0 0 25px rgba(168,85,247,0.15)',
    accent: '#A855F7',
    iconBg: 'rgba(168,85,247,0.12)',
  },
  pink: {
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(251,146,60,0.1))',
    border: 'rgba(236,72,153,0.3)',
    glow: '0 0 25px rgba(236,72,153,0.15)',
    accent: '#EC4899',
    iconBg: 'rgba(236,72,153,0.12)',
  },
  green: {
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(34,211,238,0.1))',
    border: 'rgba(16,185,129,0.3)',
    glow: '0 0 25px rgba(16,185,129,0.15)',
    accent: '#10B981',
    iconBg: 'rgba(16,185,129,0.12)',
  },
}

export default function KPICard({ title, value, subtitle, icon: Icon, color = 'cyan', trend, loading }) {
  const cfg = CARD_CONFIGS[color]

  if (loading) {
    return (
      <div className="glass-card p-5 rounded-2xl animate-fadeIn">
        <div className="skeleton h-4 w-24 mb-3 rounded"/>
        <div className="skeleton h-8 w-32 mb-2 rounded"/>
        <div className="skeleton h-3 w-20 rounded"/>
      </div>
    )
  }

  const isPositive = trend > 0
  const trendAbs = Math.abs(trend || 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl p-5 cursor-default"
      style={{
        background: cfg.gradient,
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow,
      }}
    >
      {/* Decorative blob */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20 blur-xl"
        style={{ background: cfg.accent }} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">{title}</p>
          <p className="text-2xl font-bold text-primary leading-none mb-1">{value}</p>
          {subtitle && <p className="text-xs text-secondary mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{isPositive ? '+' : '-'}{trendAbs}% vs prev period</span>
            </div>
          )}
        </div>

        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.iconBg }}>
          <Icon size={20} style={{ color: cfg.accent }} />
        </div>
      </div>
    </motion.div>
  )
}
