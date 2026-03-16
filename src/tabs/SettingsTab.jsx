import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'

export default function SettingsTab({ eventId }) {
  const { eventSettings, userRoles, updateEventSettings, addUserRole, deleteUserRole, updateUserRole, showToast } = useStore()
  const [activeSubTab, setActiveSubTab] = useState('fees')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const settings = eventSettings.find((s) => s.eventId === eventId) || { eventId }
  const [formData, setFormData] = useState({ ...settings })

  useEffect(() => {
    const newSettings = eventSettings.find((s) => s.eventId === eventId) || { eventId }
    setFormData({ ...newSettings })
  }, [eventId, eventSettings])

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'editor',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSaveSettings = () => {
    updateEventSettings(eventId, formData)
    showToast('Settings saved')
  }

  const handleOpenUserModal = () => {
    setUserForm({ name: '', email: '', role: 'editor' })
    setIsModalOpen(true)
  }

  const handleUserChange = (e) => {
    const { name, value } = e.target
    setUserForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddUser = () => {
    if (!userForm.name.trim() || !userForm.email.trim()) {
      showToast('Please fill in all fields', 'error')
      return
    }

    addUserRole({
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
    })

    setIsModalOpen(false)
    showToast('User added')
  }

  const handleDeleteUser = (userId) => {
    deleteUserRole(userId)
    showToast('User removed')
  }

  const roleDescriptions = {
    web_manager: 'Widget & online page only',
    viewer: 'View reports & sales',
    support: 'Resend tickets, refunds, guest list',
    editor: 'Edit event, tickets, discounts, buyer questions',
    organiser: 'Financing, add-ons',
    administrator: 'Full access',
  }

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-6 mb-6 border-b border-gray-200 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('fees')}
          className={`font-medium transition whitespace-nowrap ${
            activeSubTab === 'fees'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Fees & Finance
        </button>
        <button
          onClick={() => setActiveSubTab('support')}
          className={`font-medium transition whitespace-nowrap ${
            activeSubTab === 'support'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Support
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`font-medium transition whitespace-nowrap ${
            activeSubTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Users & Roles
        </button>
      </div>

      {/* Fees & Finance Tab */}
      {activeSubTab === 'fees' && (
        <div className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Fixed Fee (£)</label>
              <input
                type="number"
                name="feeFixed"
                value={formData.feeFixed || ''}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Percentage Fee (%)</label>
              <input
                type="number"
                name="feePercent"
                value={formData.feePercent || ''}
                onChange={handleChange}
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="feesPassedOn"
              name="feesPassedOn"
              checked={formData.feesPassedOn || false}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="feesPassedOn" className="text-sm text-gray-900">
              Pass fees on to customer
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="vatRegistered"
              name="vatRegistered"
              checked={formData.vatRegistered || false}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="vatRegistered" className="text-sm text-gray-900">
              VAT registered
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Facebook Pixel ID</label>
            <input
              type="text"
              name="facebookPixel"
              value={formData.facebookPixel || ''}
              onChange={handleChange}
              placeholder="Your Facebook Pixel ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Save Settings
          </button>
        </div>
      )}

      {/* Support Tab */}
      {activeSubTab === 'support' && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Support Email</label>
            <input
              type="email"
              name="supportEmail"
              value={formData.supportEmail || ''}
              onChange={handleChange}
              placeholder="support@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Support URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={`support.example.com/${eventId}`}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                Copy
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Terms & Conditions</label>
            <textarea
              name="termsAndConditions"
              value={formData.termsAndConditions || ''}
              onChange={handleChange}
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your terms and conditions..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Pre-Checkout Message</label>
            <textarea
              name="preCheckoutMessage"
              value={formData.preCheckoutMessage || ''}
              onChange={handleChange}
              rows="3"
              placeholder="Message shown before checkout..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Post-Checkout Message</label>
            <textarea
              name="postCheckoutMessage"
              value={formData.postCheckoutMessage || ''}
              onChange={handleChange}
              rows="3"
              placeholder="Message shown after checkout..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Save Settings
          </button>
        </div>
      )}

      {/* Users & Roles Tab */}
      {activeSubTab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
            <button
              onClick={handleOpenUserModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>

          {userRoles.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">No team members yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Permissions</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userRoles.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          {user.role.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {roleDescriptions[user.role] || 'Custom role'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
            title="Add Team Member"
            size="md"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={userForm.name}
                  onChange={handleUserChange}
                  placeholder="Full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={userForm.email}
                  onChange={handleUserChange}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Role</label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={handleUserChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="web_manager">Web Manager</option>
                  <option value="viewer">Viewer</option>
                  <option value="support">Support</option>
                  <option value="editor">Editor</option>
                  <option value="organiser">Organiser</option>
                  <option value="administrator">Administrator</option>
                </select>
                <p className="text-xs text-gray-600 mt-2">{roleDescriptions[userForm.role]}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddUser}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add User
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
