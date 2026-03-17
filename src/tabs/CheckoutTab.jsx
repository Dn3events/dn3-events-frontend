import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Plus, Copy, Trash2, Loader, ExternalLink } from 'lucide-react'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { checkouts as checkoutsAPI } from '../api/checkouts'
import { tickets as ticketsAPI } from '../api/tickets'

const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_URL || 'https://dn3-events-frontend.vercel.app'

export default function CheckoutTab({ eventId }) {
  const { showToast } = useStore()
  const [eventCheckouts, setEventCheckouts] = useState([])
  const [eventTickets, setEventTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [copied, setCopied] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    ticketIds: [],
  })

  useEffect(() => {
    loadData()
  }, [eventId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [checkoutsRes, ticketsRes] = await Promise.all([
        checkoutsAPI.listByEvent(eventId),
        ticketsAPI.listByEvent(eventId),
      ])
      setEventCheckouts(checkoutsRes.data.data || [])
      setEventTickets(ticketsRes.data.data || [])
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = () => {
    setFormData({ name: '', ticketIds: [] })
    setIsModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTicketToggle = (ticketId) => {
    setFormData((prev) => ({
      ...prev,
      ticketIds: prev.ticketIds.includes(ticketId)
        ? prev.ticketIds.filter((id) => id !== ticketId)
        : [...prev.ticketIds, ticketId],
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim() || formData.ticketIds.length === 0) {
      showToast('Please fill in all fields and select at least one ticket', 'error')
      return
    }

    try {
      setSaving(true)
      const res = await checkoutsAPI.create(eventId, {
        name: formData.name,
        ticketIds: formData.ticketIds,
      })
      setEventCheckouts((prev) => [res.data.data, ...prev])
      setIsModalOpen(false)
      showToast('Checkout created')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create checkout', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (checkout) => {
    try {
      const res = await checkoutsAPI.toggle(eventId, checkout.id)
      setEventCheckouts((prev) =>
        prev.map((c) => (c.id === checkout.id ? res.data.data : c))
      )
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to toggle checkout', 'error')
    }
  }

  const handleCopyUrl = (slug) => {
    const fullUrl = `${PUBLIC_BASE_URL}/#/checkout/${slug}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(slug)
    showToast('URL copied to clipboard')
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDelete = async (checkoutId) => {
    try {
      await checkoutsAPI.delete(eventId, checkoutId)
      setEventCheckouts((prev) => prev.filter((c) => c.id !== checkoutId))
      setDeleteConfirm(null)
      showToast('Checkout deleted')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete checkout', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Checkouts</h3>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Checkout
        </button>
      </div>

      {eventCheckouts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No checkouts yet</p>
          <p className="text-gray-400 text-sm mt-2">Create a checkout page so customers can buy tickets</p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventCheckouts.map((checkout) => {
            const checkoutTickets = (checkout.tickets || []).map((ct) => ct.ticket).filter(Boolean)
            const fullUrl = `${PUBLIC_BASE_URL}/#/checkout/${checkout.slug}`

            return (
              <div key={checkout.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{checkout.name}</h4>
                      {checkout.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-700 truncate max-w-md">
                        {fullUrl}
                      </code>
                      <button
                        onClick={() => handleCopyUrl(checkout.slug)}
                        className={`p-1 rounded transition flex-shrink-0 ${
                          copied === checkout.slug
                            ? 'bg-green-100 text-green-600'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition flex-shrink-0"
                        title="Open checkout page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <p className="text-sm text-gray-600">
                      Tickets: {checkoutTickets.length > 0 ? checkoutTickets.map((t) => t.name).join(', ') : 'None assigned'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <button
                      onClick={() => handleToggle(checkout)}
                      className={`px-4 py-2 rounded font-medium transition ${
                        checkout.enabled
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {checkout.enabled ? 'ENABLED' : 'DISABLED'}
                    </button>

                    <button
                      onClick={() => setDeleteConfirm(checkout.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Checkout"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Checkout Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Main Checkout"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Select Tickets *</label>
            {eventTickets.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No tickets created yet. Add tickets first.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {eventTickets.map((ticket) => (
                  <label
                    key={ticket.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.ticketIds.includes(ticket.id)}
                      onChange={() => handleTicketToggle(ticket.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{ticket.name}</p>
                      <p className="text-xs text-gray-600">£{parseFloat(ticket.price).toFixed(2)}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Checkout'}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onConfirm={() => handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
        title="Delete Checkout"
        message="Are you sure you want to delete this checkout page?"
        confirmText="Delete"
        isDangerous
      />
    </div>
  )
}
