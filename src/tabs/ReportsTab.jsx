import { useStore } from '../store/useStore'
import { Download } from 'lucide-react'

export default function ReportsTab({ eventId }) {
  const { orders, tickets, discountCodes, showToast } = useStore()

  const eventOrders = orders.filter((o) => o.eventId === eventId && o.status === 'paid')
  const eventTickets = tickets.filter((t) => t.eventId === eventId)
  const eventDiscounts = discountCodes.filter((d) => d.eventId === eventId)

  const stats = {
    revenue: eventOrders.reduce((sum, o) => sum + o.total, 0),
    orders: eventOrders.length,
    ticketsSold: eventOrders.reduce((sum, o) => sum + o.tickets.reduce((s, t) => s + t.quantity, 0), 0),
    conversionRate: eventTickets.length > 0 ? '85%' : '0%',
  }

  // Revenue chart data (simplified)
  const revenueByWeek = [
    { week: 'Week 1', revenue: 1200 },
    { week: 'Week 2', revenue: 1800 },
    { week: 'Week 3', revenue: 2500 },
    { week: 'Week 4', revenue: 3100 },
  ]

  const maxRevenue = Math.max(...revenueByWeek.map((d) => d.revenue))

  // Ticket breakdown
  const ticketBreakdown = eventTickets.map((ticket) => {
    const sold = ticket.sold
    const revenue = sold * ticket.price
    const percent = eventOrders.reduce((sum, o) => sum + o.tickets.filter((t) => t.ticketId === ticket.id).reduce((s, t) => s + t.quantity, 0), 0)
    return {
      name: ticket.name,
      sold: percent,
      revenue: eventOrders
        .reduce((sum, o) => sum + (o.tickets.find((t) => t.ticketId === ticket.id) ? o.tickets.find((t) => t.ticketId === ticket.id).quantity * o.tickets.find((t) => t.ticketId === ticket.id).unitPrice : 0), 0),
      percent: eventOrders.reduce((sum, o) => sum + o.tickets.filter((t) => t.ticketId === ticket.id).reduce((s, t) => s + t.quantity, 0), 0),
    }
  }).filter(t => t.percent > 0)

  const totalTicketsForBreakdown = ticketBreakdown.reduce((sum, t) => sum + t.percent, 0)

  const handleExportReport = () => {
    const reportContent = `
Event Revenue Report
Event ID: ${eventId}
Generated: ${new Date().toLocaleDateString()}

SUMMARY
Total Revenue: £${stats.revenue.toFixed(2)}
Total Orders: ${stats.orders}
Tickets Sold: ${stats.ticketsSold}
Conversion Rate: ${stats.conversionRate}

TICKET BREAKDOWN
${ticketBreakdown.map((t) => `${t.name}: ${t.percent} sold, £${t.revenue.toFixed(2)} revenue (${((t.percent / totalTicketsForBreakdown) * 100).toFixed(1)}%)`).join('\n')}

DISCOUNT USAGE
${eventDiscounts.map((d) => `${d.code}: ${d.usedCount} uses (max: ${d.maxUses || 'unlimited'})`).join('\n')}
    `.trim()

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${eventId}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Report exported')
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">£{stats.revenue.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.orders}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Tickets Sold</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.ticketsSold}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Conversion Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.conversionRate}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
        <div className="flex items-end justify-around h-64 gap-4">
          {revenueByWeek.map((data, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-blue-600 rounded-t transition hover:bg-blue-700"
                style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                title={`£${data.revenue}`}
              />
              <p className="text-xs text-gray-600 mt-2">{data.week}</p>
              <p className="text-sm font-semibold text-gray-900">£{data.revenue}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Breakdown */}
      {ticketBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Breakdown</h3>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ticket Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sold</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Revenue</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ticketBreakdown.map((ticket, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ticket.percent}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      £{ticket.revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition"
                            style={{ width: `${(ticket.percent / totalTicketsForBreakdown) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {((ticket.percent / totalTicketsForBreakdown) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Discount Usage */}
      {eventDiscounts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount Code Usage</h3>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Uses</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Max Uses</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {eventDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {discount.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{discount.description}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{discount.usedCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {discount.maxUses ? discount.maxUses : 'Unlimited'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {discount.maxUses ? discount.maxUses - discount.usedCount : 'Unlimited'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExportReport}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>
    </div>
  )
}
