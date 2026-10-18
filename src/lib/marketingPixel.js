const MAX_AGE = 180 * 86400000
export const validPixel = id => /^[0-9]{5,25}$/.test(id || '')
export const choiceKey = id => `dn3-ad-consent-v1:${id}`
export function readChoice(id) {
  try { const v = JSON.parse(localStorage.getItem(choiceKey(id))); return v && Date.now() - v.at < MAX_AGE && ['granted', 'denied'].includes(v.choice) ? v.choice : null } catch { return null }
}
export function saveChoice(id, choice) { try { localStorage.setItem(choiceKey(id), JSON.stringify({ choice, at: Date.now() })) } catch { /* Private browsing still permits an in-memory choice. */ } }
export function clearPixelCookies() {
  for (const name of ['_fbp', '_fbc']) {
    const domains = [null, ...location.hostname.split('.').map((_, i, a) => a.slice(i).join('.'))]
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`
  }
}
export function trackPixel(pixelId, choice, event, data = {}, eventID) {
  if (choice !== 'granted' || !validPixel(pixelId)) return false
  // Never load the SDK on a URL carrying a payment reference or buyer data.
  if (location.search || location.hash.includes('?')) return false
  if (!window.fbq) {
    const q = function () { q.callMethod ? q.callMethod.apply(q, arguments) : q.queue.push(arguments) }
    q.push = q; q.loaded = true; q.version = '2.0'; q.queue = []; window.fbq = q; window._fbq = q
    const script = document.createElement('script'); script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js'; script.id = 'dn3-meta-pixel'; document.head.appendChild(script)
  }
  const q = window.fbq
  window.__dn3Pixels ||= new Set()
  if (!window.__dn3Pixels.has(pixelId)) {
    q('consent', 'grant'); q('set', 'autoConfig', false, pixelId); q('init', pixelId); window.__dn3Pixels.add(pixelId)
  }
  // Explicit single-pixel events only. No email, name, postcode, order/session ID or answers.
  q('trackSingle', pixelId, event, data, eventID ? { eventID } : undefined)
  return true
}
