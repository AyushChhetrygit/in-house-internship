import { motion } from 'framer-motion'

const SEGMENTS = ['Bronze', 'Silver', 'Gold', 'Platinum']
const CHURN_RISKS = ['Low', 'Medium', 'High']

const ACTION_COLORS = {
  'Loyalty Program': { bg: 'rgba(34,211,238,0.15)', text: '#22D3EE', border: 'rgba(34,211,238,0.3)' },
  'VIP Treatment':  { bg: 'rgba(168,85,247,0.15)', text: '#A855F7', border: 'rgba(168,85,247,0.3)' },
  'Win-back Campaign': { bg: 'rgba(236,72,153,0.15)', text: '#EC4899', border: 'rgba(236,72,153,0.3)' },
  'Upsell Premium': { bg: 'rgba(16,185,129,0.15)', text: '#10B981', border: 'rgba(16,185,129,0.3)' },
  'Discount Offer':    { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B', border: 'rgba(245,158,11,0.3)' },
  'None':              { bg: 'rgba(100,116,139,0.1)', text: '#64748B', border: 'rgba(100,116,139,0.2)' },
}

function getCellStyle(action) {
  const c = ACTION_COLORS[action] || ACTION_COLORS['None']
  return { background: c.bg, color: c.text, border: `1px solid ${c.border}` }
}

function getCountStyle(count) {
  if (count > 80) return 'text-rose-400 font-bold'
  if (count > 40) return 'text-amber-400 font-semibold'
  return 'text-emerald-400'
}

export default function ActionHeatmap({ data, loading }) {
  if (loading) {
    return (
      <div className="glass-card p-5 rounded-2xl">
        <div className="skeleton h-4 w-36 mb-4 rounded"/>
        <div className="skeleton h-52 w-full rounded-xl"/>
      </div>
    )
  }

  // Build lookup: segment+churnRisk → cell
  const lookup = {}
  ;(data?.matrix || []).forEach(cell => {
    lookup[`${cell.segment}__${cell.churnRisk}`] = cell
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 rounded-2xl"
    >
      <div className="mb-4">
        <h3 className="font-semibold text-base text-primary">Action Matrix</h3>
        <p className="text-xs text-secondary mt-0.5">Recommended actions by Segment × Churn Risk</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-secondary pb-3 font-medium pl-1">Segment</th>
              {CHURN_RISKS.map(risk => (
                <th key={risk} className="text-center pb-3 font-medium" style={{
                  color: risk === 'High' ? '#EF4444' : risk === 'Medium' ? '#F59E0B' : '#10B981'
                }}>{risk} Risk</th>
              ))}
            </tr>
          </thead>
          <tbody className="space-y-1">
            {SEGMENTS.map(seg => (
              <tr key={seg}>
                <td className="py-1.5 pl-1 font-semibold text-secondary pr-4">{seg}</td>
                {CHURN_RISKS.map(risk => {
                  const cell = lookup[`${seg}__${risk}`]
                  const action = cell?.dominantAction || 'None'
                  const count = cell?.count || 0
                  const style = getCellStyle(action)
                  return (
                    <td key={risk} className="py-1.5 px-2 text-center">
                      <div className="rounded-lg px-2 py-2 text-center" style={style}>
                        <p className="font-medium leading-tight text-[10px]">{action}</p>
                        <p className={`mt-1 text-[10px] ${getCountStyle(count)}`}>{count} users</p>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-subtle">
        <p className="text-xs text-secondary mb-2">Actions:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ACTION_COLORS).filter(([k]) => k !== 'None').map(([action, colors]) => (
            <span key={action} className="px-2 py-0.5 rounded-md text-[10px] font-medium"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
              {action}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
