export default function StatusBadge({ status }) {
  const styles = {
    live: 'bg-green-100 text-green-800 border border-green-300',
    paused: 'bg-amber-100 text-amber-800 border border-amber-300',
    cancelled: 'bg-red-100 text-red-800 border border-red-300',
  }

  const labels = {
    live: 'LIVE',
    paused: 'PAUSED',
    cancelled: 'CANCELLED',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.paused}`}>
      {labels[status] || status}
    </span>
  )
}
