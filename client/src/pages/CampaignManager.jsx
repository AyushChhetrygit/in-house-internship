import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Play, CalendarClock, ListFilter, LayoutTemplate, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import EmailHistoryTable from '../components/EmailHistoryTable'

const API_BASE = 'http://localhost:8000/api/v1'

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState([])
  const [templates, setTemplates] = useState([])
  const [selectedSegment, setSelectedSegment] = useState('VIP')
  const [segmentPreview, setSegmentPreview] = useState([])
  const [loadingPreview, setLoadingPreview] = useState(false)

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    target_segment: 'VIP',
    template_id: ''
  })

  // Load Initial Data
  useEffect(() => {
    fetchData()
  }, [])

  // Load Audience Preview on segment change
  useEffect(() => {
    fetchSegmentPreview(selectedSegment)
  }, [selectedSegment])

  const fetchData = async () => {
    try {
      const [campRes, tempRes] = await Promise.all([
        axios.get(`${API_BASE}/campaigns`),
        axios.get(`${API_BASE}/templates`)
      ])
      setCampaigns(campRes.data)
      setTemplates(tempRes.data)
      if (tempRes.data.length > 0) {
        setNewCampaign(prev => ({ ...prev, template_id: tempRes.data[0].id }))
      }
    } catch (error) {
      toast.error("Failed to load backend data. Is FastAPI running on port 8000?")
      console.error(error)
    }
  }

  const fetchSegmentPreview = async (seg) => {
    setLoadingPreview(true)
    try {
      const res = await axios.get(`${API_BASE}/segments/${seg}`)
      setSegmentPreview(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleCreateCampaign = async (e) => {
    e.preventDefault()
    try {
      if (!newCampaign.name || !newCampaign.template_id) {
        return toast.error("Please fill all required fields")
      }
      await axios.post(`${API_BASE}/campaigns`, newCampaign)
      toast.success("Campaign Draft Created")
      setNewCampaign({ ...newCampaign, name: '' })
      fetchData()
    } catch (err) {
      toast.error("Error creating campaign")
    }
  }

  const triggerCampaign = async (id) => {
    try {
      await axios.post(`${API_BASE}/campaigns/${id}/send`)
      toast.success("Campaign Triggered successfully! Check history.")
      fetchData()
    } catch (err) {
      toast.error("Failed to trigger campaign")
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <CalendarClock className="text-indigo-400" size={32} />
          Email Campaigns
        </h1>
        <p className="text-secondary mt-1">Automate retention and engagement emails to specific segments.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Campaign Form */}
        <div className="glass-card p-6 rounded-2xl border border-subtle">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus size={20} className="text-emerald-400" />
            New Campaign
          </h2>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label className="block text-sm text-secondary mb-1">Campaign Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-white/5 border border-subtle rounded-lg px-4 py-2 text-primary focus:outline-none focus:border-indigo-500"
                placeholder="e.g. VIP Summer Sale"
                value={newCampaign.name}
                onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm text-secondary mb-1 flex items-center gap-2">
                <ListFilter size={16} /> Target Segment
              </label>
              <select 
                className="w-full bg-white/5 border border-subtle rounded-lg px-4 py-2 text-primary appearance-none"
                value={newCampaign.target_segment}
                onChange={e => {
                  setNewCampaign({...newCampaign, target_segment: e.target.value})
                  setSelectedSegment(e.target.value)
                }}
              >
                <option value="VIP">VIP Customers</option>
                <option value="AT-RISK">At-Risk (Churn)</option>
                <option value="INACTIVE">Inactive / Dormant</option>
                <option value="NEW">New Customers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-secondary mb-1 flex items-center gap-2">
                <LayoutTemplate size={16} /> Email Template
              </label>
              <select 
                className="w-full bg-white/5 border border-subtle rounded-lg px-4 py-2 text-primary appearance-none"
                value={newCampaign.template_id}
                onChange={e => setNewCampaign({...newCampaign, template_id: parseInt(e.target.value)})}
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full mt-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors">
              Save Draft
            </button>
          </form>
        </div>

        {/* Middle/Right Column: Audience Preview */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-subtle flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserCheck size={20} className="text-blue-400" />
              Audience Preview ({segmentPreview.length})
            </span>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-secondary">
              Segment: {selectedSegment}
            </span>
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 rounded-lg border border-subtle bg-black/20" style={{ maxHeight: '300px' }}>
            {loadingPreview ? (
              <p className="text-secondary p-4 text-center">Crunching Data...</p>
            ) : segmentPreview.length === 0 ? (
              <p className="text-secondary p-4 text-center">No customers match this segment criteria.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#111] sticky top-0 border-b border-subtle">
                  <tr>
                    <th className="px-4 py-2 text-secondary font-medium">Customer</th>
                    <th className="px-4 py-2 text-secondary font-medium">Email</th>
                    <th className="px-4 py-2 text-secondary font-medium">Risk</th>
                    <th className="px-4 py-2 text-secondary font-medium">Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {segmentPreview.slice(0, 50).map(p => (
                    <tr key={p.customer_id} className="hover:bg-white/5">
                      <td className="px-4 py-2 font-medium">{p.name}</td>
                      <td className="px-4 py-2 text-secondary">{p.email}</td>
                      <td className="px-4 py-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${p.churn_risk === 'High' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                          {p.churn_risk}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono">${(p.attributes.TotalSpend).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {segmentPreview.length > 50 && (
              <div className="p-3 text-center text-xs text-secondary italic border-t border-subtle bg-black/40">
                + {segmentPreview.length - 50} more users...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Campaigns and Logs */}
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Campaign Management
        </h2>
        
        {campaigns.length === 0 ? (
          <p className="text-secondary glass-card p-6 text-center rounded-xl font-medium">No campaigns created yet.</p>
        ) : (
          campaigns.map(camp => (
            <div key={camp.id} className="glass-card p-6 rounded-2xl border border-subtle flex flex-col md:flex-row gap-6 items-start">
              {/* Campaign Status Card */}
              <div className="w-full md:w-1/3 space-y-3">
                <div className="flex justify-between">
                  <h3 className="text-lg font-bold">{camp.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${
                    camp.status === 'DRAFT' ? 'bg-slate-500/20 text-slate-300' :
                    camp.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-400' :
                    camp.status === 'RUNNING' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {camp.status}
                  </span>
                </div>
                <p className="text-sm text-secondary">Target Object: <span className="font-bold text-primary">{camp.target_segment}</span></p>
                <p className="text-xs text-secondary mt-2">Created: {new Date(camp.created_at).toLocaleDateString()}</p>
                
                {camp.status === 'DRAFT' && (
                  <button 
                    onClick={() => triggerCampaign(camp.id)}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <Play size={16} fill="currentColor"/> Run Now
                  </button>
                )}
              </div>

              {/* Logs Table */}
              <div className="w-full md:w-2/3">
                <h4 className="text-sm font-semibold mb-2 text-secondary uppercase tracking-wider">Execution Logs</h4>
                <EmailHistoryTable campaignId={camp.id} />
              </div>
            </div>
          ))
        )}
      </div>

    </motion.div>
  )
}
