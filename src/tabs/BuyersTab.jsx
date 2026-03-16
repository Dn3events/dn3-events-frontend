import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Plus, Upload } from 'lucide-react'
import Modal from '../components/Modal'
import { format, parseISO } from 'date-fns'

export default function BuyersTab({ eventId }) {
  const { orders, tickets, buyerQuestions, addBuyerQuestion, updateBuyerQuestion, deleteBuyerQuestion, showToast } = useStore()
  const [activeSubTab, setActiveSubTab] = useState('guestList')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    question: '',
    type: 'text',
    options: '',
    required: false,
  })

  const eventOrders = orders.filter((o) => o.eventId === eventId && o.status === 'paid')
  const eventTickets = tickets.filter((t) => t.eventId === eventId)
  const eventQuestions = buyerQuestions.filter((q) => q.eventId === eventId)

  // Build unique guests from orders
  const guests = []
  const seenEmails = new Set()
  eventOrders.forEach((order) => {
    if (!seenEmails.has(order.buyerEmail)) {
      seenEmails.add(order.buyerEmail)
      guests.push({
        name: order.buyerName,
        email: order.buyerEmail,
        postcode: order.buyerPostcode,
        ticketCount: eventOrders.filter((o) => o.buyerEmail === order.buyerEmail).length,
        createdAt: order.createdAt,
      })
    }
  })

  const handleOpenModal = (question = null) => {
    if (question) {
      setEditingId(question.id)
      setFormData({
        question: question.question,
        type: question.type,
        options: question.options.join('\n'),
        required: question.required,
      })
    } else {
      setEditingId(null)
      setFormData({
        question: '',
        type: 'text',
        options: '',
        required: false,
      })
    }
    setIsModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = () => {
    if (!formData.question.trim()) {
      showToast('Please fill in question text', 'error')
      return
    }

    const questionData = {
      eventId,
      question: formData.question,
      type: formData.type,
      options: formData.type === 'dropdown' ? formData.options.split('\n').filter((o) => o.trim()) : [],
      required: formData.required,
      enabled: true,
      sortOrder: eventQuestions.length + 1,
      perTransaction: false,
    }

    if (editingId) {
      updateBuyerQuestion(editingId, questionData)
      showToast('Question updated')
    } else {
      addBuyerQuestion(questionData)
      showToast('Question added')
    }

    setIsModalOpen(false)
    setEditingId(null)
  }

  const handleDeleteQuestion = (questionId) => {
    deleteBuyerQuestion(questionId)
    showToast('Question deleted')
  }

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-6 mb-6 border-b border-gray-200 pb-4">
        <button
          onClick={() => setActiveSubTab('guestList')}
          className={`font-medium transition ${
            activeSubTab === 'guestList'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Guest List ({guests.length})
        </button>
        <button
          onClick={() => setActiveSubTab('questions')}
          className={`font-medium transition ${
            activeSubTab === 'questions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Buyer Questions ({eventQuestions.length})
        </button>
      </div>

      {/* Guest List Tab */}
      {activeSubTab === 'guestList' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Guests</h3>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              <Upload className="w-4 h-4" />
              Upload CSV
            </button>
          </div>

          {guests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">No guests yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Postcode</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tickets Purchased</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">First Purchase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {guests.map((guest, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{guest.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{guest.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{guest.postcode}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{guest.ticketCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(parseISO(guest.createdAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Questions Tab */}
      {activeSubTab === 'questions' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Custom Buyer Questions</h3>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {eventQuestions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">No buyer questions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {eventQuestions.map((question) => (
                <div key={question.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{question.question}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {question.type === 'text' ? 'Text' : 'Dropdown'}
                        </span>
                        {question.required && (
                          <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                        {question.type === 'dropdown' && (
                          <span className="text-xs text-gray-600">
                            {question.options.length} options
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(question)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingId ? 'Edit Question' : 'Add Buyer Question'}
            size="lg"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Question *</label>
                <input
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  placeholder="e.g., Dietary requirements"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Question Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text Input</option>
                  <option value="dropdown">Dropdown</option>
                </select>
              </div>

              {formData.type === 'dropdown' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Options (one per line)</label>
                  <textarea
                    name="options"
                    value={formData.options}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="required"
                  name="required"
                  checked={formData.required}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="required" className="text-sm text-gray-900">
                  Required question
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingId ? 'Update Question' : 'Add Question'}
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
        </div>
      )}
    </div>
  )
}
