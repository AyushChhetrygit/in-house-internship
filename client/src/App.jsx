import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Sidebar from './components/layout/Sidebar'
import Navbar from './components/layout/Navbar'
import GlobalFilters from './components/ui/GlobalFilters'

import Dashboard from './pages/Dashboard'
import Segmentation from './pages/Segmentation'
import ChurnAnalytics from './pages/ChurnAnalytics'
import CLVInsights from './pages/CLVInsights'
import ActionMatrix from './pages/ActionMatrix'
import CustomerTablePage from './pages/CustomerTablePage'
import CampaignManager from './pages/CampaignManager'
import Settings from './pages/Settings'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-primary text-primary transition-colors duration-300">
      {/* Sidebar (fixed left) */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <GlobalFilters />
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{ zIndex: 10 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/segmentation" element={<Segmentation />} />
            <Route path="/churn" element={<ChurnAnalytics />} />
            <Route path="/clv" element={<CLVInsights />} />
            <Route path="/actions" element={<ActionMatrix />} />
            <Route path="/customers" element={<CustomerTablePage />} />
            <Route path="/campaigns" element={<CampaignManager />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      <Toaster position="bottom-right" />
    </div>
  )
}
