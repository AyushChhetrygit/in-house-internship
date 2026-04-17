import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, AlertTriangle, TrendingUp,
  Zap, Table2, Settings, X, BarChart3, Mail
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/segmentation', label: 'Segmentation', icon: Users },
  { to: '/churn', label: 'Churn Analytics', icon: AlertTriangle },
  { to: '/clv', label: 'CLV Insights', icon: TrendingUp },
  { to: '/actions', label: 'Action Matrix', icon: Zap },
  { to: '/customers', label: 'Customer Table', icon: Table2 },
  { to: '/campaigns', label: 'Email Campaigns', icon: Mail },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const SEGMENT_COLORS = [
  'bg-orange-500/20 text-orange-400',
  'bg-slate-400/20 text-slate-400',
  'bg-yellow-500/20 text-yellow-400',
  'bg-violet-500/20 text-violet-400',
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)', backdropFilter: 'blur(20px)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#22D3EE,#A855F7)' }}>
              <BarChart3 size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-primary leading-none">CustomerIQ</p>
              <p className="text-xs text-muted-custom mt-0.5">Analytics Platform</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-secondary hover:text-primary transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          <p className="text-xs font-semibold text-muted-custom uppercase tracking-wider px-4 pb-2">Main menu</p>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom badge */}
        <div className="px-4 py-4 border-t border-subtle">
          <div className="glass-card p-3 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow"></span>
              <span className="text-xs font-medium text-emerald-400">Live Data</span>
            </div>
            <p className="text-xs text-secondary">Auto-refreshes every 3 min</p>
          </div>
        </div>
      </aside>
    </>
  )
}
