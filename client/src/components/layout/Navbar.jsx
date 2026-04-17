import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, Search, RefreshCw, Bell, Sun, Moon, User, ChevronDown } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useFilters } from '../../context/FilterContext'
import toast from 'react-hot-toast'

const PAGE_TITLES = {
  '/': 'Dashboard Overview',
  '/segmentation': 'Customer Segmentation',
  '/churn': 'Churn Analytics',
  '/clv': 'CLV Insights',
  '/actions': 'Action Matrix',
  '/customers': 'Customer Table',
  '/settings': 'Settings',
}

export default function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme()
  const { triggerRefresh } = useFilters()
  const location = useLocation()
  const [refreshing, setRefreshing] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const title = PAGE_TITLES[location.pathname] || 'Dashboard'

  const handleRefresh = async () => {
    setRefreshing(true)
    triggerRefresh()
    toast.success('Data refreshed!', {
      style: { background: 'rgba(15,23,42,0.95)', color: '#F1F5F9', border: '1px solid rgba(34,211,238,0.3)' },
      iconTheme: { primary: '#22D3EE', secondary: '#0F172A' },
    })
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <header
      className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-subtle z-20 relative"
      style={{ background: 'var(--sidebar-bg)', backdropFilter: 'blur(20px)' }}
    >
      {/* Left - Menu + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-secondary"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-bold text-base text-primary leading-none">{title}</h1>
          <p className="text-xs text-muted-custom mt-0.5 hidden sm:block">
            Real-time customer intelligence
          </p>
        </div>
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl max-w-xs w-full mx-4"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
        <Search size={14} className="text-muted-custom flex-shrink-0" />
        <input
          placeholder="Search customers, segments..."
          className="bg-transparent text-sm text-primary placeholder-muted-custom outline-none w-full"
          style={{ color: 'var(--text-secondary)' }}
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
        <motion.button
          onClick={handleRefresh}
          whileTap={{ scale: 0.9 }}
          className="btn-ghost p-2.5 rounded-xl hidden sm:flex"
          title="Refresh data"
        >
          <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.7, ease: 'easeInOut' }}>
            <RefreshCw size={15} />
          </motion.div>
        </motion.button>

        {/* Notifications */}
        <button className="btn-ghost p-2.5 rounded-xl relative hidden sm:flex">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost p-2.5 rounded-xl flex items-center gap-1.5 text-xs font-medium"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#22D3EE,#A855F7)' }}>
              A
            </div>
            <span className="text-sm font-medium text-primary hidden sm:inline">Admin</span>
            <ChevronDown size={13} className="text-secondary" />
          </button>

          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-12 w-44 glass-card py-1 z-50 border-subtle"
            >
              {['Profile', 'Settings', 'Sign out'].map(item => (
                <button
                  key={item}
                  onClick={() => setProfileOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-white/5 transition-colors"
                >
                  {item}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </header>
  )
}
