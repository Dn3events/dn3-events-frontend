import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Loader, AlertCircle } from 'lucide-react'
import { checkouts } from '../api/checkouts'
import { payments } from '../api/payments'
import { discounts } from '../api/discounts'
import { format, parseISO } from 'date-fns'

export default function PublicCheckout() {
  const { slug } = useParams()
  const [checkout, setCheckout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  // Form state
  const [quantities, setQuantities] = useState({})
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPostcode, setBuyerPostcode] = useState('')
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [discountError, setDiscountError] = useState('')

  useEffect(() => {
    loadCheckout()
  }, [slug])

  const loadCheckout = async () => {
    try {
      setLoading(true)
      const response = await checkouts.getBySlug(slug)
      setCheckout(response.data.data)

      // Initialize quantities
      const initialQties = {}
      if (response.data.data.tickets) {
        response.data.data.tickets.forEach((ticket) => {
          initialQties[ticket.id] = 1
        })
      }
      setQuantities(initialQties)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load checkout')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return

    try {
      setDiscountError('')
      const response = await discounts.validate(discountCode, checkout.eventId)
      setAppliedDiscount(response.data.data)
    } catch (err) {
      setDiscountError(err.response?.data?.message || 'Invalid discount code')
      setAppliedDiscount(null)
    }
  }

  const calculateTotal = () => {
    let subtotal = 0
    if (checkout?.tickets) {
      checkout.tickets.forEach((ticket) => {
        const qty = quantities[ticket.id] || 0
        subtotal += ticket.price * qty
      })
    }

    const fees = subtotal * (checkout?.event?.feePercent || 0.035) / 100 + (checkout?.event?.feeFixed || 0.75)
    let total = subtotal + fees

    if (appliedDiscount) {
      const discountAmount = appliedDiscount.type === 'percentage'
        ? total * (appliedDiscount.value / 100)
        : appliedDiscount.value
      total -= discountAmount
    }

    return { subtotal, fees, total, discount: appliedDiscount }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const totals = calculateTotal()
      const items = checkout.tickets
        .filter((t) => quantities[t.id] > 0)
        .map((t) => ({
          ticketId: t.id,
          quantity: quantities[t.id],
          price: t.price,
        }))

      const response = await payments.createCheckoutSession({
        checkoutId: checkout.id,
        items,
        buyerName,
        buyerEmail,
        buyerPostcode,
        discountCode: appliedDiscount?.code || null,
        total: totals.total,
      })

      // Redirect to Stripe
      window.location.href = response.data.data.url
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  if (!checkout) {
    return null
  }

  const totals = calculateTotal()
  const totalQuantity = Object.values(quantities).reduce((sum, q) => sum + q, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{checkout.event?.name}</h1>
          {checkout.event?.startDate && (
            <p className="text-gray-600 mt-2">
              {format(parseISO(checkout.event.startDate), 'MMMM d, yyyy')}
            </p>
          )}
        </div>

        {/* Main Form */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Form Section */}
          <div className="md:col-span-2">
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Tickets */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Tickets</h2>
                <div className="space-y-4">
                  {checkout.tickets?.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                      <div>
                        <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                        <p className="text-sm text-gray-600">£{ticket.price.toFixed(2)}</p>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={quantities[ticket.id] || 0}
                        onChange={(e) =>
                          setQuantities({ ...quantities, [ticket.id]: parseInt(e.target.value) || 0 })
                        }
                        className="w-16 px-3 py-2 border border-gray-300 rounded text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Buyer Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Details</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Postcode"
                    value={buyerPostcode}
                    onChange={(e) => setBuyerPostcode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Discount Code */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Discount Code</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Apply
                  </button>
                </div>
                {discountError && <p className="text-red-600 text-sm mt-2">{discountError}</p>}
                {appliedDiscount && (
                  <p className="text-green-600 text-sm mt-2">
                    Discount applied: {appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}%` : `£${appliedDiscount.value.toFixed(2)}`}
                  </p>
                )}
              </div>

              {/* Payment Button */}
              <button
                type="submit"
                disabled={processing || totalQuantity === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {processing && <Loader className="w-5 h-5 animate-spin" />}
                {processing ? 'Processing...' : `Pay Now - £${totals.total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">£{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fees</span>
                <span className="font-semibold">£{totals.fees.toFixed(2)}</span>
              </div>
              {totals.discount && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-£{(totals.subtotal + totals.fees - totals.total).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-base font-bold">
                <span>Total</span>
                <span>£{totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
