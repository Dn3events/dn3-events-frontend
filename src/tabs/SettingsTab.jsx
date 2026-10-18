import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import { settings as settingsAPI } from '../api/settings'
import { cleanNumberInput } from '../lib/numberInput'

const errorOf = (err, fallback) => err.response?.data?.error || err.response?.data?.message || fallback

export default function SettingsTab({ eventId }) {
  const { showToast } = useStore()
  const [activeSubTab, setActiveSubTab] = useState('fees')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({})
  const [canEditFees, setCanEditFees] = useState(true)
  const [userRoles, setUserRoles] = useState([])
  const [canSeeTeam, setCanSeeTeam] = useState(true)
  const [userForm, setUserForm] = useState({ email: '', role: 'viewer' })

  const loadSettings = useCallback(async () => {
    try {
      const res = await settingsAPI.get(eventId)
      setFormData(res.data.data)
    } catch (err) {
      showToast(errorOf(err, 'Failed to load settings'), 'error')
    }
  }, [eventId, showToast])

  const loadUsers = useCallback(async () => {
    try {
      const res = await settingsAPI.listUsers(eventId)
      setUserRoles(res.data.data)
      setCanSeeTeam(true)
    } catch (err) {
      // Viewers cannot see the team list.
      if (err.response?.status === 403) setCanSeeTeam(false)
      else showToast(errorOf(err, 'Failed to load team'), 'error')
    }
  }, [eventId, showToast])

  useEffect(() => {
    loadSettings()
    loadUsers()
  }, [loadSettings, loadUsers])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const cleaned = type === 'number' ? cleanNumberInput(e) : value
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : cleaned,
    }))
  }

  const handleSaveSettings = async () => {
    try {
      const body = {
        feePerTicket: formData.feePerTicket === null || formData.feePerTicket === undefined || formData.feePerTicket === '' ? null : Number(formData.feePerTicket),
        feeFixed: Number(formData.feeFixed),
        feePercent: Number(formData.feePercent),
        feesPassedOn: !!formData.feesPassedOn,
        vatRegistered: !!formData.vatRegistered,
        facebookPixel: formData.facebookPixel || '',
        brevoListId: formData.brevoListId ? Number(formData.brevoListId) : null,
        termsAndConditions: formData.termsAndConditions || '',
        preCheckoutMessage: formData.preCheckoutMessage || '',
        postCheckoutMessage: formData.postCheckoutMessage || '',
        ...(formData.supportEmail && { supportEmail: formData.supportEmail }),
      }
      const res = await settingsAPI.update(eventId, body)
      setFormData(res.data.data)
      showToast('Settings saved')
    } catch (err) {
      if (err.response?.status === 403) setCanEditFees(false)
      showToast(errorOf(err, 'Failed to save settings'), 'error')
    }
  }

  const handleOpenUserModal = () => {
    setUserForm({ email: '', role: 'viewer' })
    setIsModalOpen(true)
  }

  const handleUserChange = (e) => {
    const { name, value } = e.target
    setUserForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddUser = async () => {
    if (!userForm.email.trim()) {
      showToast('Enter the email they signed up with', 'error')
      return
    }
    try {
      await settingsAPI.addUser(eventId, { email: userForm.email.trim(), role: userForm.role })
      setIsModalOpen(false)
      showToast('User added')
      loadUsers()
    } catch (err) {
      showToast(errorOf(err, 'Failed to add user'), 'error')
    }
  }

  const handleChangeRole = async (userId, role) => {
    try {
      await settingsAPI.updateUser(eventId, userId, role)
      showToast('Role updated')
    } catch (err) {
      showToast(errorOf(err, 'Failed to change role'), 'error')
    }
    loadUsers()
  }

  const handleDeleteUser = async (userId) => {
    try {
      await settingsAPI.removeUser(eventId, userId)
      showToast('User removed')
    } catch (err) {
      showToast(errorOf(err, 'Failed to remove user'), 'error')
    }
    loadUsers()
  }

  const roleDescriptions = {
    owner: 'Full access, including fees and team',
    manager: 'Edit event, tickets, discounts, guests; view orders and reports',
    viewer: 'View-only access to the event, orders and reports',
    scanner: 'Door staff: check tickets in and nothing else',
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 space-y-3">
            <label htmlFor="feePerTicket" className="block font-semibold">Flat booking fee per paid ticket (£)</label>
            <input id="feePerTicket" name="feePerTicket" type="number" min="0" max="100" step="0.01" value={formData.feePerTicket ?? ''} onChange={handleChange} placeholder="Leave blank for legacy order + percentage fees" className="w-full px-4 py-2 border rounded-lg" />
            <p className="text-sm text-gray-600">When set, replaces both legacy fees below. Free tickets and fully discounted orders stay fee-free. Partly discounted paid tickets keep the full fee. Existing orders never change.</p>
          </div>
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

          <div>
            <label htmlFor="brevoListId" className="block text-sm font-semibold text-gray-900 mb-2">Brevo marketing list ID</label>
            <input id="brevoListId" name="brevoListId" type="number" min="1" step="1" value={formData.brevoListId ?? ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            <p className="text-sm text-gray-600 mt-2">Optional. Only completed orders with email opt-in are synced. The server connection must also be enabled. Existing unsubscribes are respected. No campaigns are sent here.</p>
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
              <div className="overflow-x-auto"><table className="w-full min-w-[600px]">
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
                        <select
                          value={user.role}
                          onChange={(ev) => handleChangeRole(user.id, ev.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="owner">Owner</option>
                          <option value="manager">Manager</option>
                          <option value="viewer">Viewer</option>
                          <option value="scanner">Scanner</option>
                        </select>
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
              </table></div>
            </div>
          )}

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Add Team Member"
            size="md"
          >
            <div className="space-y-6">
              <p className="text-sm text-gray-600">They need an account first. Ask them to register, then enter the email they used.</p>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email they registered with</label>
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
                  <option value="viewer">Viewer</option>
                  <option value="scanner">Scanner (door staff)</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
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
