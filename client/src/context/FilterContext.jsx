import { createContext, useContext, useState, useCallback } from 'react'

const FilterContext = createContext()

const INITIAL_FILTERS = {
  segment: '',
  churnRisk: '',
  processedAt: '',
}

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [refreshKey, setRefreshKey] = useState(0)

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
  }, [])

  // Trigger a global manual refresh
  const triggerRefresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  // Build query string from active filters
  const filterQuery = Object.entries(filters)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')

  return (
    <FilterContext.Provider value={{ filters, updateFilter, resetFilters, filterQuery, refreshKey, triggerRefresh }}>
      {children}
    </FilterContext.Provider>
  )
}

export const useFilters = () => useContext(FilterContext)
