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

  useEffect(() => {
    if (sessionId) {
      loadOrder()
    }
  }, [sessionId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const response = await payments.getSuccess(sessionId)
      const orderData = response.data.data.order
      // Normalise: page renders order.tickets, backend returns order.items
      setOrder({ ...orderData, tickets: orderData.items || [] })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details')
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-gray-600 mt-2">Thank you for your purchase</p>
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
                  <span className="text-gray-600">Buyer Name</span>
                  <span className="font-semibold text-gray-900">{order.buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-semibold text-gray-900">{order.buyerEmail}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base font-bold">
                  <span>Total Paid</span>
                  <span>£{order.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Tickets */}
          {order?.tickets && order.tickets.length > 0 && (
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
            <p className="font-semibold">Check your email for ticket confirmation</p>
            <p className="mt-1">An email with your tickets has been sent to {order?.buyerEmail}</p>
          </div>
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
