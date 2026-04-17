import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, RefreshCw, Bell, Shield, Database } from 'lucide-react'

export default function Settings() {
  const { theme, toggleTheme } = useTheme()

  const Section = ({ title, children }) => (
    <div className="glass-card p-5 rounded-2xl space-y-4">
      <h3 className="font-semibold text-base text-primary">{title}</h3>
      {children}
    </div>
  )

  const Row = ({ icon: Icon, label, desc, children }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon size={15} className="text-secondary" />
        </div>
        <div>
          <p className="text-sm font-medium text-primary">{label}</p>
          <p className="text-xs text-secondary">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  )

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fadeIn max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-primary">Settings</h2>
        <p className="text-sm text-secondary mt-0.5">Preferences and configuration</p>
      </div>

      <Section title="Appearance">
        <Row icon={theme === 'dark' ? Moon : Sun} label="Theme" desc={`Currently using ${theme} mode`}>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-cyan-500/40' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-all duration-300 ${theme === 'dark' ? 'left-6 bg-cyan-400' : 'left-0.5 bg-white'}`} />
          </button>
        </Row>
      </Section>

      <Section title="Data">
        <Row icon={RefreshCw} label="Auto-refresh interval" desc="Dashboard auto-refreshes every 3 minutes (matching cron)">
          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">3 min</span>
        </Row>
        <Row icon={Database} label="Data source" desc="customer_processed.csv — auto-reloaded on change">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Live</span>
        </Row>
      </Section>

      <Section title="Notifications">
        <Row icon={Bell} label="Refresh alerts" desc="Toast notifications on data refresh">
          <span className="text-xs px-2 py-1 rounded-lg bg-white/5 text-secondary border border-subtle">Enabled</span>
        </Row>
      </Section>

      <Section title="Access">
        <Row icon={Shield} label="Role" desc="Full administrative access to all dashboard features">
          <span className="text-xs px-3 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">Admin</span>
        </Row>
      </Section>

      <div className="glass-card p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
        <p className="text-xs font-semibold text-cyan-400 mb-1">ℹ️ Architecture Note</p>
        <p className="text-xs text-secondary">
          This dashboard uses a CSV-backed Express API. Cron generates raw data every 1 minute.
          Processed data is updated every 3 minutes. The backend auto-detects file changes via chokidar.
        </p>
      </div>
    </div>
  )
}
