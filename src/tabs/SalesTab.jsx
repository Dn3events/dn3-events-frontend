import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Download, Search } from 'lucide-react'
import Modal from '../components/Modal'
import { format, parseISO } from 'date-fns'

export default function SalesTab({ eventId }) {
  const { orders, showToast } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const eventOrders = orders.filter((o) => o.eventId === eventId)
  const paidOrders = eventOrders.filter((o) => o.status === 'paid')

  const filteredOrders = eventOrders.filter((o) =>
    searchTerm === '' ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.buyerPostcode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalOrders: paidOrders.length,
    totalRevenue: paidOrders.reduce((sum, o) => sum + o.total, 0),
    totalTickets: paidOrders.reduce((sum, o) => sum + o.tickets.reduce((s, t) => s + t.quantity, 0), 0),
    avgOrderValue: paidOrders.length > 0 ? paidOrders.reduce((sum, o) => sum + o.total, 0) / paidOrders.length : 0,
  }

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Buyer Name', 'Email', 'Postcode', 'Tickets', 'Amount', 'Status']
    const rows = filteredOrders.map((o) => [
      o.id,
      format(parseISO(o.createdAt), 'MMM d, yyyy'),
      o.buyerName,
      o.buyerEmail,
      o.buyerPostcode,
      o.tickets.map((t) => `${t.quantity}x ${t.ticketName}`).join('; '),
      `£${o.total.toFixed(2)}`,
      o.status.toUpperCase(),
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${eventId}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV exported')
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">£{stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Tickets Sold</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTickets}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Avg Order Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">£{stats.avgOrderValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, name, email, or postcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Buyer Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tickets</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(parseISO(order.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.buyerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.buyerEmail}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.tickets.map((t, idx) => (
                      <div key={idx}>
                        {t.quantity}x {t.ticketName}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    £{order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'refunded'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="font-semibold text-gray-900">{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedOrder.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {selectedOrder.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Buyer Information</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-600">Name:</span>{' '}
                  <span className="text-gray-900">{selectedOrder.buyerName}</span>
                </p>
                <p>
                  <span className="text-gray-600">Email:</span>{' '}
                  <span className="text-gray-900">{selectedOrder.buyerEmail}</span>
                </p>
                <p>
                  <span className="text-gray-600">Postcode:</span>{' '}
                  <span className="text-gray-900">{selectedOrder.buyerPostcode}</span>
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Tickets</h4>
              <div className="space-y-2">
                {selectedOrder.tickets.map((ticket, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">
                      {ticket.quantity}x {ticket.ticketName}
                    </span>
                    <span className="text-gray-600">
                      £{(ticket.unitPrice * ticket.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">£{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span>-£{selectedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Fees</span>
                  <span className="text-gray-900">£{selectedOrder.fees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-gray-900">£{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
