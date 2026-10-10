import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Download, Loader } from 'lucide-react'
import { reports } from '../api/reports'

const money = (n) => `£${Number(n || 0).toFixed(2)}`

export default function ReportsTab({ eventId }) {
  const { showToast } = useStore()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [ticketRows, setTicketRows] = useState([])
  const [discountRows, setDiscountRows] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [s, r, t, d] = await Promise.all([
          reports.summary(eventId),
          reports.revenueOverTime(eventId),
          reports.tickets(eventId),
          reports.discounts(eventId),
        ])
        if (cancelled) return
        setSummary(s.data.data)
        setRevenue(r.data.data)
        setTicketRows(t.data.data)
        setDiscountRows(d.data.data)
      } catch (err) {
        if (!cancelled) showToast(err.response?.data?.error || 'Failed to load reports', 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [eventId, showToast])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }
  if (!summary) return <p className="text-gray-600">Reports are not available.</p>

  const maxRevenue = Math.max(1, ...revenue.map((d) => d.revenue))
  const totalSold = ticketRows.reduce((sum, t) => sum + t.sold, 0)

  const exportCSV = () => {
    const lines = [
      ['Ticket', 'Sold', 'Revenue'],
      ...ticketRows.map((t) => [t.name, t.sold, Number(t.revenue).toFixed(2)]),
    ]
    const csv = lines.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${eventId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card tone="bg-blue-50" label="Net revenue" value={money(summary.totalRevenue)} />
        <Card tone="bg-green-50" label="Paid orders" value={summary.totalOrders} />
        <Card tone="bg-purple-50" label="Tickets sold" value={summary.totalTicketsSold} />
        <Card tone="bg-orange-50" label="Checked in" value={`${summary.ticketsCheckedIn} / ${summary.ticketsIssued}`} />
      </div>
      {summary.totalRefunded > 0 && (
        <p className="text-sm text-gray-600 -mt-4 mb-8">Revenue is after {money(summary.totalRefunded)} of refunds.</p>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by day</h3>
        {revenue.length === 0 ? (
          <p className="text-gray-600">No paid orders yet.</p>
        ) : (
          <div className="flex items-end gap-2 h-56 overflow-x-auto">
            {revenue.map((d) => (
              <div key={d.date} className="flex flex-col items-center justify-end min-w-[48px] flex-1 h-full">
                <div className="w-full bg-blue-600 rounded-t" style={{ height: `${(d.revenue / maxRevenue) * 80}%` }} title={money(d.revenue)} />
                <p className="text-[10px] text-gray-600 mt-2">{d.date.slice(5)}</p>
                <p className="text-xs font-semibold text-gray-900">{money(d.revenue)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets</h3>
        <div className="overflow-x-auto"><table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Ticket type', 'Sold', 'Capacity', 'Revenue', 'Share'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-900">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ticketRows.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{t.sold}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{t.available ?? 'Unlimited'}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{money(t.revenue)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{totalSold ? `${((t.sold / totalSold) * 100).toFixed(1)}%` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {discountRows.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount codes</h3>
          <div className="overflow-x-auto"><table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Code', 'Uses', 'Given away'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-900">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {discountRows.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-sm">{d.code}</code></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{d.usedCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{money(d.totalDiscountAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={exportCSV} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
    </div>
  )
}

function Card({ label, value, tone }) {
  return (
    <div className={`${tone} p-4 rounded-lg`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}
