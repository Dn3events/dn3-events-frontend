import { useSearchParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { payments } from '../api/payments'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // The webhook confirms payment, which can land a few seconds after the redirect.
  // Keep checking until the order is paid (or for about a minute).
  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      setError('Missing payment reference')
      return undefined
    }
    let cancelled = false
    let attempts = 0
    const poll = async () => {
      attempts += 1
      const data = await loadOrder()
      if (cancelled) return
      if (data && data.status === 'pending' && attempts < 20) {
        timer = setTimeout(poll, 3000)
      }
    }
    let timer = null
    poll()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [sessionId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const response = await payments.getSuccess(sessionId)
      const orderData = response.data.data.order
      // Normalise: page renders order.tickets, backend returns order.items
      setOrder({ ...orderData, tickets: orderData.items || [] })
      return orderData
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load order details')
      return null
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const status = order?.status
  const isPaid = status === 'paid'
  const needsHelp = status === 'review' || status === 'expired' || status === 'cancelled'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header reflects what the server has actually confirmed */}
        <div className="text-center mb-8">
          {isPaid && (
            <>
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
              <p className="text-gray-600 mt-2">Thank you for your purchase</p>
            </>
          )}
          {!isPaid && !needsHelp && (
            <>
              <Loader className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900">Confirming your payment</h1>
              <p className="text-gray-600 mt-2">This usually takes a few seconds. Please keep this page open.</p>
            </>
          )}
          {needsHelp && (
            <>
              <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900">We need to check your order</h1>
              <p className="text-gray-600 mt-2">
                Your tickets have not been issued. If you were charged, contact the organiser with the order ID below.
              </p>
            </>
          )}
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
            {order && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-semibold text-gray-900">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-semibold text-gray-900">{order.buyerEmail}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base font-bold">
                  <span>{isPaid ? 'Total Paid' : 'Total'}</span>
                  <span>£{order.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Tickets */}
          {isPaid && order?.tickets && order.tickets.length > 0 && (
            <div className="mb-8 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Tickets</h3>
              <div className="space-y-3">
                {order.tickets.map((ticket, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{ticket.ticketName}</p>
                      <p className="text-sm text-gray-600">Qty: {ticket.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">£{(ticket.unitPrice * ticket.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          {isPaid && order?.emailStatus === 'sent' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-semibold">Check your email for your tickets</p>
              <p className="mt-1">We sent them to {order.buyerEmail}</p>
            </div>
          )}
          {isPaid && order?.emailStatus === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-semibold">Your tickets are being emailed</p>
              <p className="mt-1">They will arrive at {order.buyerEmail} shortly.</p>
            </div>
          )}
          {isPaid && (order?.emailStatus === 'failed' || order?.emailStatus === 'skipped') && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <p className="font-semibold">We could not email your tickets yet</p>
              <p className="mt-1">Your payment is confirmed. Contact the organiser with your order ID and they will send them to you.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
