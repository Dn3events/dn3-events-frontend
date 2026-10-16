import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { Download, Search, Loader } from 'lucide-react'
import Modal from '../components/Modal'
import { format, parseISO } from 'date-fns'
import { orders as ordersAPI } from '../api/orders'

const money = (n) => `£${Number(n || 0).toFixed(2)}`
const errorOf = (err, fallback) => err.response?.data?.error || err.response?.data?.message || fallback

const STATUS_STYLE = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  review: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
  expired: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-gray-100 text-gray-600',
}

export default function SalesTab({ eventId }) {
  const { showToast } = useStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [confirmRefund, setConfirmRefund] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await ordersAPI.listByEvent(eventId)
      setOrders(res.data.data)
    } catch (err) {
      showToast(errorOf(err, 'Failed to load orders'), 'error')
    } finally {
      setLoading(false)
    }
  }, [eventId, showToast])

  useEffect(() => {
    load()
  }, [load])

  const selected = orders.find((o) => o.id === selectedId) || null

  const term = searchTerm.toLowerCase()
  const filtered = orders.filter(
    (o) =>
      !term ||
      o.id.toLowerCase().includes(term) ||
      o.buyerName.toLowerCase().includes(term) ||
      o.buyerEmail.toLowerCase().includes(term) ||
      (o.buyerPostcode || '').toLowerCase().includes(term)
  )

  // Revenue is what was kept: paid orders minus anything refunded from them.
  const paid = orders.filter((o) => o.status === 'paid')
  const revenue = paid.reduce((sum, o) => sum + Number(o.total) - Number(o.refundedAmount), 0)
  const ticketCount = orders.reduce((sum, o) => sum + (o.tickets || []).filter((t) => t.status === 'valid').length, 0)
  const stats = {
    orders: paid.length,
    revenue,
    tickets: ticketCount,
    average: paid.length ? revenue / paid.length : 0,
  }

  const run = async (action, success) => {
    setBusy(true)
    try {
      await action()
      showToast(success)
      await load()
    } catch (err) {
      showToast(errorOf(err, 'That did not work'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const exportCSV = async () => {
    try {
      const res = await ordersAPI.exportCSV(eventId)
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-${eventId}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      showToast(errorOf(err, 'Export failed'), 'error')
    }
  }

  const closeDetail = () => {
    setSelectedId(null)
    setConfirmRefund(false)
    setRefundAmount('')
    setRefundReason('')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const refundable = selected ? Number(selected.total) - Number(selected.refundedAmount) : 0
  const canRefund = selected && ['paid', 'review'].includes(selected.status) && refundable > 0 && selected.stripePaymentIntentId

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Stat label="Paid Orders" value={stats.orders} tone="bg-blue-50" />
        <Stat label="Net Revenue" value={money(stats.revenue)} tone="bg-green-50" />
        <Stat label="Valid Tickets" value={stats.tickets} tone="bg-purple-50" />
        <Stat label="Avg Order Value" value={money(stats.average)} tone="bg-orange-50" />
      </div>

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
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Order ID', 'Date', 'Buyer', 'Email', 'Tickets', 'Amount', 'Status', ''].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{format(parseISO(order.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.buyerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.buyerEmail}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.items.map((i) => (
                      <div key={i.id}>{i.quantity}x {i.ticketName}</div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {money(order.total)}
                    {Number(order.refundedAmount) > 0 && (
                      <div className="text-xs font-normal text-red-600">-{money(order.refundedAmount)} refunded</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedId(order.id)} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!selected} onClose={closeDetail} title="Order Details" size="lg">
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="font-mono text-sm text-gray-900 break-all">{selected.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[selected.status] || 'bg-gray-100'}`}>
                  {selected.status.toUpperCase()}
                </span>
              </div>
            </div>

            {selected.status === 'review' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                The buyer paid but no tickets were issued (amount mismatch, or the hold ran out and stock was gone). Refund them.
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 text-sm space-y-1">
              <p><span className="text-gray-600">Name:</span> {selected.buyerName}</p>
              <p><span className="text-gray-600">Email:</span> {selected.buyerEmail}</p>
              <p><span className="text-gray-600">Postcode:</span> {selected.buyerPostcode || '-'}</p>
              <p>
                <span className="text-gray-600">Ticket email:</span> {selected.emailStatus}
                {selected.emailError ? ` (${selected.emailError})` : ''}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Tickets</h4>
              <div className="space-y-2">
                {(selected.tickets || []).map((t, idx) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">
                      {t.ticketName} #{idx + 1}
                      {t.scanned && <span className="ml-2 text-green-700">checked in</span>}
                      {t.status === 'revoked' && <span className="ml-2 text-red-600">revoked</span>}
                    </span>
                    {t.status === 'valid' && !t.scanned && (
                      <button
                        disabled={busy}
                        onClick={() => run(() => ordersAPI.revokeTicket(eventId, selected.id, t.id, 'Revoked by organiser'), 'Ticket revoked')}
                        className="text-red-600 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
                {(selected.tickets || []).length === 0 && <p className="text-sm text-gray-600">No tickets issued.</p>}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 text-sm space-y-2">
              <Row label="Subtotal" value={money(selected.subtotal)} />
              {Number(selected.discountAmount) > 0 && <Row label="Discount" value={`-${money(selected.discountAmount)}`} red />}
              <Row label="Fees" value={money(selected.fees)} />
              <Row label="Total" value={money(selected.total)} bold />
              {Number(selected.refundedAmount) > 0 && <Row label="Refunded" value={`-${money(selected.refundedAmount)}`} red />}
            </div>

            {(selected.refunds || []).length > 0 && (
              <div className="text-xs text-gray-600 border-t border-gray-200 pt-3">
                {selected.refunds.map((r) => (
                  <div key={r.id}>
                    {format(parseISO(r.createdAt), 'MMM d, HH:mm')}: {money(r.amount)} {r.status}
                    {r.source === 'stripe_dashboard' ? ' (made in Stripe)' : ''}
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-3">
              {selected.status === 'paid' && (
                <button
                  disabled={busy}
                  onClick={() => run(() => ordersAPI.resend(eventId, selected.id), 'Tickets queued to send')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Resend tickets
                </button>
              )}
              {selected.status === 'pending' && (
                <button
                  disabled={busy}
                  onClick={() => run(() => ordersAPI.cancel(eventId, selected.id), 'Order cancelled')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel unpaid order
                </button>
              )}
              {canRefund && !confirmRefund && (
                <button onClick={() => setConfirmRefund(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                  Refund
                </button>
              )}
            </div>

            {canRefund && confirmRefund && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                <p className="text-sm text-red-900 font-semibold">
                  This sends money back to the buyer through Stripe and cannot be undone.
                </p>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Amount (£). Leave empty to refund all {money(refundable)} and cancel every ticket.</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={refundable}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {refundAmount !== '' && Number(refundAmount) < refundable && (
                    <p className="text-xs text-gray-600 mt-1">A partial refund keeps the tickets valid. Revoke any tickets you are taking back above.</p>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="flex gap-3">
                  <button
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await ordersAPI.refund(eventId, selected.id, {
                          ...(refundAmount !== '' && { amount: Number(refundAmount) }),
                          ...(refundReason && { reason: refundReason }),
                        })
                        setConfirmRefund(false)
                        setRefundAmount('')
                        setRefundReason('')
                      }, 'Refund sent')
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {busy ? 'Refunding...' : `Refund ${refundAmount !== '' ? money(refundAmount) : money(refundable)}`}
                  </button>
                  <button onClick={() => setConfirmRefund(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function Stat({ label, value, tone }) {
  return (
    <div className={`${tone} p-4 rounded-lg`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

function Row({ label, value, bold, red }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold text-base border-t border-gray-200 pt-2' : ''} ${red ? 'text-red-600' : ''}`}>
      <span className={red ? '' : 'text-gray-600'}>{label}</span>
      <span className={red ? '' : 'text-gray-900'}>{value}</span>
    </div>
  )
}
