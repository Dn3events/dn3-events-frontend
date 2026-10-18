import { useEffect } from 'react'

// Festival-site look for the buyer pages (checkout and confirmation): dark band with the logo,
// so the buying journey feels like part of the festival website rather than a separate tool.
export default function SiteHeader({ eventName }) {
  useEffect(() => {
    if (eventName) document.title = `${eventName} | Tickets`
  }, [eventName])
  const isRtr = !eventName || /raise the roof/i.test(eventName)
  return (
    <div style={{ background: '#101310' }} className="w-full">
      <div className="rtr-checkout-nav">
        {isRtr ? <a href="https://raisetherooffestival.co.uk/" aria-label="Raise the Roof Festival home"><img src="/checkout/rtr-logo.jpg" alt="Raise the Roof Festival" className="rtr-checkout-logo" /></a> : <span className="text-white font-bold">{eventName}</span>}
        <div className="rtr-checkout-nav-links">{isRtr && <a href="https://raisetherooffestival.co.uk/">Back to the festival <span aria-hidden="true">↗</span></a>}<span>Ticket booking</span></div>
      </div>
    </div>
  )
}
