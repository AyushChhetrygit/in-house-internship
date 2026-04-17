import CustomerTable from '../components/table/CustomerTable'
import { useFilters } from '../context/FilterContext'

export default function CustomerTablePage() {
  const { filters, refreshKey } = useFilters()
  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-bold text-primary">Customer Records</h2>
        <p className="text-sm text-secondary mt-0.5">Search, sort, filter and export customer data</p>
      </div>
      <CustomerTable filters={filters} refreshKey={refreshKey} />
    </div>
  )
}
