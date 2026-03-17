import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Plus, GripVertical, Edit3, Trash2, Loader } from 'lucide-react'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { tickets as ticketsAPI } from '../api/tickets'

export default function TicketsTab({ eventId }) {
  const { showToast } = useStore()
  const [eventTickets, setEventTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    earlyPrice: '',
    quantity: '',
    groupHeading: '',
  })

  useEffect(() => {
    loadTickets()
  }, [eventId])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const res = await ticketsAPI.listByEvent(eventId)
      setEventTickets(res.data.data || [])
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load tickets', 'error')
    } finally {
      setLoading(false)
    }
  }

  const totalCapacity = eventTickets.reduce((sum, t) => sum + (t.quantity || 0), 0)
  const totalSold = eventTickets.reduce((sum, t) => sum + (t.sold || 0), 0)
  const hasUnlimited = eventTickets.some((t) => !t.quantity)

  const handleOpenModal = (ticket = null) => {
    if (ticket) {
      setEditingId(ticket.id)
      setFormData({
        name: ticket.name,
        description: ticket.description || '',
        price: ticket.price.toString(),
        earlyPrice: ticket.earlyPrice ? ticket.earlyPrice.toString() : '',
        quantity: ticket.quantity ? ticket.quantity.toString() : '',
        groupHeading: ticket.groupHeading || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        earlyPrice: '',
        quantity: '',
        groupHeading: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price) {
      showToast('Please fill in required fields', 'error')
      return
    }

    const ticketData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      earlyPrice: formData.earlyPrice ? parseFloat(formData.earlyPrice) : null,
      quantity: formData.quantity ? parseInt(formData.quantity) : null,
      groupHeading: formData.groupHeading || null,
      visible: true,
      status: 'open',
      sortOrder: eventTickets.length + 1,
    }

    try {
      setSaving(true)
      if (editingId) {
        const res = await ticketsAPI.update(eventId, editingId, ticketData)
        setEventTickets((prev) =>
          prev.map((t) => (t.id === editingId ? res.data.data : t))
        )
        showToast('Ticket updated')
      } else {
        const res = await ticketsAPI.create(eventId, ticketData)
        setEventTickets((prev) => [...prev, res.data.data])
        showToast('Ticket added')
      }
      setIsModalOpen(false)
      setEditingId(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save ticket', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ticketId) => {
    try {
      await ticketsAPI.delete(eventId, ticketId)
      setEventTickets((prev) => prev.filter((t) => t.id !== ticketId))
      setDeleteConfirm(null)
      showToast('Ticket deleted')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete ticket', 'error')
    }
  }

  const handleToggleVisibility = async (ticket) => {
    try {
      const res = await ticketsAPI.update(eventId, ticket.id, { visible: !ticket.visible })
      setEventTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? res.data.data : t))
      )
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update ticket', 'error')
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
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tickets</h3>
          <p className="text-sm text-gray-600 mt-1">
            Total: {totalSold} sold {hasUnlimited ? '(unlimited capacity)' : `/ ${totalCapacity} available`}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Ticket
        </button>
      </div>

      {eventTickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No tickets yet</p>
          <p className="text-gray-400 text-sm mt-2">Add your first ticket type to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900"></th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ticket Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Early Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Qty / Sold</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Visible</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {eventTickets
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{ticket.name}</p>
                      <p className="text-xs text-gray-600">{ticket.description}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      £{parseFloat(ticket.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ticket.earlyPrice ? `£${parseFloat(ticket.earlyPrice).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ticket.quantity ? ticket.quantity : '∞'} / {ticket.sold || 0}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleVisibility(ticket)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition ${
                          ticket.visible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ticket.visible ? 'ON' : 'OFF'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(ticket)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(ticket.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Ticket' : 'Add New Ticket'}
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Ticket Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Standard Pass"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="What's included with this ticket?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Price (£) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Early Bird Price (£)</label>
              <input
                type="number"
                name="earlyPrice"
                value={formData.earlyPrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity (leave blank for unlimited)</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Leave blank for unlimited"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Group Heading</label>
              <input
                type="text"
                name="groupHeading"
                value={formData.groupHeading}
                onChange={handleChange}
                placeholder="e.g., VIP Tickets"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Ticket' : 'Add Ticket'}
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
        title="Delete Ticket"
        message="Are you sure you want to delete this ticket type?"
        confirmText="Delete"
        isDangerous
      />
    </div>
  )
}
