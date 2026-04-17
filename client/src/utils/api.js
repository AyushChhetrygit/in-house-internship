import axios from 'axios'

// Base API client — proxied via Vite to http://localhost:5000
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// ─── API helpers ──────────────────────────────────────────────────────────────

/** Build query string from filter object */
const toQuery = (filters = {}) => {
  const params = Object.entries(filters)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  return params ? `?${params}` : ''
}

export const fetchKPIs = (filters) => api.get(`/kpis${toQuery(filters)}`).then(r => r.data)
export const fetchSegments = (filters) => api.get(`/segments${toQuery(filters)}`).then(r => r.data)
export const fetchChurn = (filters) => api.get(`/churn${toQuery(filters)}`).then(r => r.data)
export const fetchCLVDistribution = (filters) => api.get(`/clv-distribution${toQuery(filters)}`).then(r => r.data)
export const fetchActions = (filters) => api.get(`/actions${toQuery(filters)}`).then(r => r.data)
export const fetchScatter = (filters) => api.get(`/scatter${toQuery(filters)}`).then(r => r.data)
export const fetchTrend = () => api.get('/trend').then(r => r.data)
export const fetchCustomers = (params) => api.get(`/customers`, { params }).then(r => r.data)

export default api
