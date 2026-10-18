import { useEffect, useState } from 'react'
import { validPixel, readChoice, saveChoice, trackPixel, clearPixelCookies } from '../lib/marketingPixel'

export default function AdvertisingConsent({ pixelId, purchase }) {
  const [choice, setChoice] = useState(() => readChoice(pixelId))
  useEffect(() => { setChoice(readChoice(pixelId)) }, [pixelId])
  useEffect(() => {
    if (choice !== 'granted' || !validPixel(pixelId)) return
    if (purchase) {
      if (purchase.status !== 'paid') return
      const key = `dn3-meta-purchase:${pixelId}:${purchase.id}`
      try { if (sessionStorage.getItem(key)) return } catch { return }
      if (!trackPixel(pixelId, choice, 'Purchase', { value: purchase.total, currency: purchase.currency.toUpperCase() })) return
      try { sessionStorage.setItem(key, '1') } catch { /* no persistent purchase replay */ }
    } else trackPixel(pixelId, choice, 'PageView')
  }, [choice, pixelId, purchase?.id, purchase?.status])
  if (!validPixel(pixelId)) return null
  const choose = next => {
    saveChoice(pixelId, next); setChoice(next)
    if (next === 'denied') {
      window.fbq?.('consent', 'revoke'); clearPixelCookies()
      // Unload the SDK after withdrawal. The refusal survives the reload.
      if (document.getElementById('dn3-meta-pixel')) location.reload()
    }
  }
  return <section aria-label="Advertising cookies" className="max-w-4xl mx-auto px-4 py-4">
    {!choice ? <div className="bg-white border rounded-lg p-4 text-sm text-gray-800">
      <h2 className="font-semibold">Optional advertising cookies</h2>
      <p className="mt-2">Allow Meta (Facebook) to receive page visits and confirmed purchase totals to measure our advertising? This uses advertising cookies. We do not send your name, email, postcode or booking answers. Saying no will not affect your tickets. This is separate from email updates.</p>
      <a href="#/privacy" className="underline inline-block my-2">Privacy notice</a>
      <div className="flex flex-wrap gap-3"><button type="button" onClick={() => choose('denied')} className="px-4 py-2 border rounded font-semibold">Reject advertising cookies</button><button type="button" onClick={() => choose('granted')} className="px-4 py-2 border rounded font-semibold">Allow advertising cookies</button></div>
    </div> : <button type="button" onClick={() => choice === 'granted' ? choose('denied') : setChoice(null)} className="text-sm underline">{choice === 'granted' ? 'Withdraw advertising cookie consent' : 'Change advertising cookie choice'}</button>}
  </section>
}
