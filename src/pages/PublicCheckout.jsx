import { useParams } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { Loader, AlertCircle } from 'lucide-react'
import { checkouts } from '../api/checkouts'
import { payments } from '../api/payments'
import { format, parseISO } from 'date-fns'
import AdvertisingConsent from '../components/AdvertisingConsent'
import CheckoutHero from '../components/CheckoutHero'
import SiteHeader from '../components/SiteHeader'
import { cleanNumberInput } from '../lib/numberInput'

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
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [questionAnswers, setQuestionAnswers] = useState({})
  const [discountCode, setDiscountCode] = useState('')
  const [appliedCode, setAppliedCode] = useState(null)
  const [discountError, setDiscountError] = useState('')
  const [quote, setQuote] = useState(null)
  const [quoteError, setQuoteError] = useState('')

  const apiError = (err, fallback) => err.response?.data?.error || err.response?.data?.message || fallback

  useEffect(() => {
    setQuestionAnswers({})
    loadCheckout()
  }, [slug])

  const loadCheckout = async () => {
    try {
      setLoading(true)
      const response = await checkouts.getBySlug(slug)
      setCheckout(response.data.data)

      // Nothing is pre-selected: the buyer chooses what they want.
      const initialQties = {}
      if (response.data.data.tickets) {
        response.data.data.tickets.forEach((ticket) => {
          initialQties[ticket.id] = 0
        })
      }
      setQuantities(initialQties)
    } catch (err) {
      setError(apiError(err, 'Failed to load checkout'))
    } finally {
      setLoading(false)
    }
  }

  const selectedItems = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([ticketId, quantity]) => ({ ticketId, quantity })),
    [quantities]
  )

  // Ask the server for the price whenever the basket or code changes.
  useEffect(() => {
    if (!checkout || selectedItems.length === 0) {
      setQuote(null)
      setQuoteError('')
      return undefined
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const response = await checkouts.quote(slug, { items: selectedItems, discountCode: appliedCode })
        if (!cancelled) {
          setQuote(response.data.data)
          setQuoteError('')
          setDiscountError('')
        }
      } catch (err) {
        if (cancelled) return
        setQuote(null)
        if (err.response?.data?.code === 'invalid_discount') {
          setDiscountError(apiError(err, 'Invalid discount code'))
          setAppliedCode(null)
        } else {
          setQuoteError(apiError(err, 'Could not work out the price'))
        }
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [checkout, selectedItems, appliedCode, slug])

  const handleApplyDiscount = () => {
    const code = discountCode.trim()
    if (!code) return
    setDiscountError('')
    setAppliedCode(code)
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setQuoteError('')

    try {
      // Only ticket ids and quantities are sent. Prices, fees and totals are worked out by the server.
      const response = await payments.createCheckoutSession({
        checkoutId: checkout.id,
        items: selectedItems,
        buyerName,
        buyerEmail,
        buyerPostcode,
        marketingConsent,
        questionAnswers: (checkout.questions || []).map((q) => ({ questionId: q.id, answer: questionAnswers[q.id] || '' })),
        discountCode: appliedCode,
      })

      // Redirect to Stripe
      window.location.href = response.data.data.url
    } catch (err) {
      setQuoteError(apiError(err, 'Payment processing failed'))
      // Stock may have changed: refresh what is on sale.
      loadCheckout()
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

  const totalQuantity = Object.values(quantities).reduce((sum, q) => sum + (Number(q) || 0), 0)
  const money = (n) => `£${Number(n).toFixed(2)}`
  const isRtr = /raise the roof/i.test(checkout.event?.name || '')
  const canBuy = checkout.salesOpen !== false

  return (
    <div className={isRtr ? 'rtr-checkout' : ''}>
    <AdvertisingConsent pixelId={checkout?.settings?.facebookPixel} />
    <SiteHeader eventName={checkout.event?.name} />
    {isRtr && <CheckoutHero />}
    <div id="booking-form" className="min-h-[calc(100vh-5rem)] bg-gray-50 py-8 px-4 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {isRtr && <div className="rtr-booking-heading"><p className="rtr-checkout-eyebrow">Make it a weekend to remember</p><h2>Your tickets</h2><p>Choose your tickets below. Your total is shown before payment.</p></div>}
        {/* Header */}
        <div className={isRtr ? "sr-only" : "text-center mb-8"}>
          <h1 className="text-3xl font-bold text-gray-900">{checkout.event?.name}</h1>
          {checkout.event?.startDate && (
            <p className="text-gray-600 mt-2">
              {format(parseISO(checkout.event.startDate), 'MMMM d, yyyy')}
            </p>
          )}
        </div>

        {!canBuy && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-amber-800 text-sm">
            {checkout.salesClosedReason || 'Ticket sales are not open right now.'}
          </div>
        )}

        {/* Main Form */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Form Section */}
          <div className="min-w-0 md:col-span-2">
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Tickets */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Tickets</h2>
                <div className="space-y-4">
                  {checkout.tickets?.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded">
                      <div>
                        <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                        <p className="text-sm text-gray-600">{ticket.price === 0 ? 'Free' : money(ticket.price)}
                          {ticket.earlyPrice && (
                            <span className="ml-2 text-green-700">
                              early price (was {money(ticket.regularPrice)}, ends {format(parseISO(ticket.earlyPriceEndsAt), 'MMM d, HH:mm')})
                            </span>
                          )}
                        </p>
                        {ticket.soldOut && <p className="text-sm font-semibold text-red-600">Sold out</p>}
                      </div>
                      <input
                        type="number"
                        min="0"
                        max={Math.min(10, ticket.remaining ?? 10)}
                        disabled={ticket.soldOut || !canBuy}
                        value={quantities[ticket.id] === undefined ? 0 : quantities[ticket.id]}
                        onChange={(e) => {
                          const v = cleanNumberInput(e)
                          if (v === '') {
                            setQuantities({ ...quantities, [ticket.id]: '' })
                            return
                          }
                          const n = Math.max(0, parseInt(v, 10) || 0)
                          const canon = String(n)
                          if (e.target.value !== canon) e.target.value = canon
                          setQuantities({ ...quantities, [ticket.id]: n })
                        }}
                        className="w-16 px-3 py-2 border border-gray-300 rounded text-center disabled:bg-gray-100"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Buyer Details */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
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

              {!!checkout.questions?.length && (
                <section className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-5" aria-labelledby="booking-questions-title">
                  <h2 id="booking-questions-title" className="text-xl font-semibold text-gray-900">Booking questions</h2>
                  <p className="text-sm text-gray-600">Please answer once for this order. Required questions are marked.</p>
                  {checkout.questions.map((q) => (
                    <div key={q.id}>
                      <label htmlFor={`question-${q.id}`} className="block text-sm font-semibold text-gray-900 mb-2 break-words">
                        {q.question} <span className="font-normal text-gray-600">({q.required ? 'required' : 'optional'})</span>
                      </label>
                      {q.type === 'dropdown' ? (
                        <select id={`question-${q.id}`} required={q.required} value={questionAnswers[q.id] || ''}
                          onChange={(e) => setQuestionAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                          <option value="">Choose an option</option>
                          {q.options.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      ) : (
                        <input id={`question-${q.id}`} type="text" required={q.required} maxLength={2000}
                          value={questionAnswers[q.id] || ''} onChange={(e) => setQuestionAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Discount Code */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Discount Code</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="min-w-0 flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                {appliedCode && quote && quote.discount > 0 && (
                  <p className="text-green-600 text-sm mt-2">Discount applied: -{money(quote.discount)}</p>
                )}
              </div>

              {/* Consent and privacy: marketing is opt-in and never pre-ticked */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-3">
                <label className="flex items-start gap-3 text-sm text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0"
                  />
                  <span>
                    Yes, keep me posted by email about {checkout.event?.name} and future events. You can unsubscribe at any time.
                    This is optional and does not affect your ticket.
                  </span>
                </label>
                <p className="text-xs text-gray-600">
                  We use your name, email and postcode to issue and deliver your tickets and to run the event.{' '}
                  {/^https?:\/\//i.test(checkout.event?.privacyPolicyUrl || '') ? (
                    <a href={checkout.event.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
                      Read our privacy notice
                    </a>
                  ) : (
                    <a href={`#/privacy/${slug}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
                      Read our privacy notice
                    </a>
                  )}
                </p>
                {/^https?:\/\//i.test(checkout.settings?.termsAndConditions || '') && (
                  <p className="text-xs text-gray-600">
                    By buying a ticket you agree to the{' '}
                    <a href={checkout.settings.termsAndConditions} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
                      festival terms and conditions
                    </a>.
                  </p>
                )}
              </div>

              {/* Payment Button */}
              <button
                type="submit"
                disabled={processing || totalQuantity === 0 || !quote || !canBuy}
                className="w-full bg-[#ff9500] hover:bg-[#e68600] disabled:bg-gray-400 text-[#101310] font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {processing && <Loader className="w-5 h-5 animate-spin" />}
                {processing ? 'Processing...' : quote ? (quote.total === 0 ? 'Get tickets (free)' : `Pay Now - ${money(quote.total)}`) : 'Choose tickets'}
              </button>
              {quoteError && <p className="text-red-600 text-sm">{quoteError}</p>}
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{quote ? money(quote.subtotal) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking fee</span>
                <span className="font-semibold">{quote ? money(quote.fees) : '-'}</span>
              </div>
              {quote && quote.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{money(quote.discount)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{quote ? money(quote.total) : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
