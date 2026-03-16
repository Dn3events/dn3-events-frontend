import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { X, CheckCircle, AlertCircle } from 'lucide-react'

export default function Toast() {
  const toast = useStore((state) => state.toast)
  const clearToast = useStore((state) => state.clearToast)

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(clearToast, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast, clearToast])

  if (!toast) return null

  const isError = toast.type === 'error'
  const isWarning = toast.type === 'warning'

  return (
    <div
      className={`fixed bottom-6 right-6 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg text-white animate-pulse ${
        isError ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-green-500'
      }`}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5" />
      ) : (
        <CheckCircle className="w-5 h-5" />
      )}
      <span>{toast.message}</span>
      <button onClick={clearToast} className="ml-2 hover:bg-white/20 rounded p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
