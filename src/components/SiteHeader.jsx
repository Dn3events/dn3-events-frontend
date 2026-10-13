import { useEffect } from 'react'

// Festival-site look for the buyer pages (checkout and confirmation): dark band with the logo,
// so the buying journey feels like part of the festival website rather than a separate tool.
export default function SiteHeader({ eventName }) {
  useEffect(() => {
    if (eventName) document.title = `${eventName} | Tickets`
  }, [eventName])
  return (
    <div style={{ background: '#101310' }} className="w-full">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <img src={`${import.meta.env.BASE_URL}rtr-logo.png`} alt="Raise the Roof Festival" className="h-14 w-auto" />
        <span className="text-white text-sm font-semibold tracking-wide" style={{ borderBottom: '3px solid #ff9500' }}>Tickets</span>
      </div>
    </div>
  )
}
