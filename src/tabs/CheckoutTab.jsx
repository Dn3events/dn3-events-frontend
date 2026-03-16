import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Plus, Copy, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function CheckoutTab({ eventId }) {
  const { checkouts, tickets, addCheckout, updateCheckout, deleteCheckout, showToast } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [copied, setCopied] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    ticketIds: [],
  })

  const eventCheckouts = checkouts.filter((c) => c.eventId === eventId)
  const eventTickets = tickets.filter((t) => t.eventId === eventId)

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

  const handleSave = () => {
    if (!formData.name.trim() || formData.ticketIds.length === 0) {
      showToast('Please fill in all fields', 'error')
      return
    }

    const url = formData.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    addCheckout({
      eventId,
      name: formData.name,
      enabled: true,
      isDefault: eventCheckouts.length === 0,
      ticketIds: formData.ticketIds,
      url,
    })

    setIsModalOpen(false)
    showToast('Checkout created')
  }

  const handleToggle = (checkout) => {
    updateCheckout(checkout.id, { enabled: !checkout.enabled })
  }

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url)
    setCopied(url)
    showToast('URL copied to clipboard')
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDelete = (checkoutId) => {
    deleteCheckout(checkoutId)
    setDeleteConfirm(null)
    showToast('Checkout deleted')
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
        </div>
      ) : (
        <div className="space-y-4">
          {eventCheckouts.map((checkout) => {
            const checkoutTickets = checkout.ticketIds
              .map((id) => eventTickets.find((t) => t.id === id))
              .filter(Boolean)

            return (
              <div key={checkout.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{checkout.name}</h4>
                      {checkout.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <code className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-700">
                        {checkout.url}
                      </code>
                      <button
                        onClick={() => handleCopyUrl(checkout.url)}
                        className={`p-1 rounded transition ${
                          copied === checkout.url
                            ? 'bg-green-100 text-green-600'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600">
                      Tickets: {checkoutTickets.map((t) => t.name).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
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
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {eventTickets.map((ticket) => (
                <label key={ticket.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={formData.ticketIds.includes(ticket.id)}
                    onChange={() => handleTicketToggle(ticket.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{ticket.name}</p>
                    <p className="text-xs text-gray-600">£{ticket.price.toFixed(2)}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Checkout
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
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
        message="Are you sure you want to delete this checkout?"
        confirmText="Delete"
        isDangerous
      />
    </div>
  )
}
