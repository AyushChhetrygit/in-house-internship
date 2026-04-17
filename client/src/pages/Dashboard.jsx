import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, AlertTriangle, DollarSign, Download } from 'lucide-react'
import KPICard from '../components/cards/KPICard'
import TrendLineChart from '../components/charts/TrendLineChart'
import SegmentScatterPlot from '../components/charts/SegmentScatterPlot'
import ChurnBarChart from '../components/charts/ChurnBarChart'
import CLVDonutChart from '../components/charts/CLVDonutChart'
import ActionHeatmap from '../components/charts/ActionHeatmap'
import { useFilters } from '../context/FilterContext'
import { fetchKPIs, fetchChurn, fetchCLVDistribution, fetchActions, fetchScatter, fetchTrend } from '../utils/api'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import toast from 'react-hot-toast'
import { generatePDFReport } from '../utils/pdfExport'
import CustomerReportTemplate from '../components/report/CustomerReportTemplate'

export default function Dashboard() {
  const { filters, refreshKey } = useFilters()

  const [kpis, setKpis] = useState(null)
  const [churn, setChurn] = useState(null)
  const [clv, setClv] = useState(null)
  const [actions, setActions] = useState(null)
  const [scatter, setScatter] = useState(null)
  const [trend, setTrend] = useState(null)
  const [loadingMap, setLoadingMap] = useState({
    kpis: true, churn: true, clv: true, actions: true, scatter: true, trend: true,
  })

  const setLoading = (key, val) => setLoadingMap(p => ({ ...p, [key]: val }))

  const loadAll = useCallback(async () => {
    const f = filters
    await Promise.allSettled([
      fetchKPIs(f).then(r => { setKpis(r.data); setLoading('kpis', false) }),
      fetchChurn(f).then(r => { setChurn(r.data); setLoading('churn', false) }),
      fetchCLVDistribution(f).then(r => { setClv(r.data); setLoading('clv', false) }),
      fetchActions(f).then(r => { setActions(r); setLoading('actions', false) }),
      fetchScatter(f).then(r => { setScatter(r.data); setLoading('scatter', false) }),
      fetchTrend().then(r => { setTrend(r.data); setLoading('trend', false) }),
    ])
  }, [filters, refreshKey])  // eslint-disable-line

  // Auto-refresh every 3 minutes (matching cron)
  useAutoRefresh(loadAll, 180000)

  const exportPDF = () => {
    generatePDFReport()
  }

  const fmt = (n, prefix = '') => n != null ? `${prefix}${Number(n).toLocaleString()}` : '—'
  const fmtK = (n) => n != null ? `₹${(n / 1000).toFixed(1)}k` : '—'

  return (
    <div id="dashboard-content" className="p-4 lg:p-6 space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">Overview</h2>
          <p className="text-sm text-secondary mt-0.5">Real-time customer behavior insights</p>
        </div>
        <button onClick={exportPDF} className="btn-ghost flex items-center gap-2 text-sm">
          <Download size={14} /> Export PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Total Customers" value={fmt(kpis?.totalCustomers)}
          subtitle={`${fmt(kpis?.highValueCount)} high-value`}
          icon={Users} color="cyan" trend={2.4} loading={loadingMap.kpis} />
        <KPICard title="Avg Lifetime Value" value={fmtK(kpis?.avgCLV)}
          subtitle="Per customer CLV"
          icon={TrendingUp} color="purple" trend={5.1} loading={loadingMap.kpis} />
        <KPICard title="High Churn Users" value={fmt(kpis?.highChurn)}
          subtitle={`${kpis?.churnPercent || 0}% of total`}
          icon={AlertTriangle} color="pink" trend={-1.2} loading={loadingMap.kpis} />
        <KPICard title="Total Revenue" value={`₹${kpis?.totalRevenue ? (kpis.totalRevenue / 1e6).toFixed(2) : '—'}M`}
          subtitle="Total customer spend"
          icon={DollarSign} color="green" trend={8.7} loading={loadingMap.kpis} />
      </div>

      {/* Trend Chart — full width */}
      <TrendLineChart data={trend} loading={loadingMap.trend} />

      {/* Row: Scatter + Churn */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SegmentScatterPlot data={scatter} loading={loadingMap.scatter} />
        <ChurnBarChart data={churn} loading={loadingMap.churn} />
      </div>

      {/* Row: CLV + Action Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CLVDonutChart data={clv} loading={loadingMap.clv} />
        <ActionHeatmap data={actions} loading={loadingMap.actions} />
      </div>

      <CustomerReportTemplate filters={filters} />
    </div>
  )
}
