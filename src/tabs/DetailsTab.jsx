import { useState } from 'react'
import { useStore } from '../store/useStore'
import { format, parseISO } from 'date-fns'
import { events as eventsAPI } from '../api/events'

export default function DetailsTab({ event, onEventUpdate }) {
  const { showToast } = useStore()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: event.name || '',
    description: (event.description || '').replace(/<[^>]*>/g, ''),
    websiteUrl: event.websiteUrl || '',
    privacyPolicyUrl: event.privacyPolicyUrl || '',
    controllerName: event.controllerName || '',
    controllerEmail: event.controllerEmail || '',
    logoUrl: event.logoUrl || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updates = {
        name: formData.name.trim(),
        description: formData.description,
        websiteUrl: formData.websiteUrl.trim(),
        privacyPolicyUrl: formData.privacyPolicyUrl.trim(),
        controllerName: formData.controllerName.trim() || null,
        controllerEmail: formData.controllerEmail.trim() || null,
        logoUrl: formData.logoUrl.trim(),
      }
      if (!updates.name) {
        showToast('The event needs a name', 'error')
        return
      }
      await eventsAPI.update(event.id, updates)
      if (onEventUpdate) onEventUpdate(updates)
      setIsEditing(false)
      showToast('Event details updated')
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.message || 'Failed to save changes', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!isEditing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Event Information</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-2">Event Name</p>
              <p className="text-lg font-semibold text-gray-900">{event.name}</p>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-700">{(event.description || '').replace(/<[^>]*>/g, '')}</p>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-2">Privacy notice</p>
              {/^https?:\/\//i.test(event.privacyPolicyUrl || '') ? (
                <a href={event.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                  {event.privacyPolicyUrl}
                </a>
              ) : (
                <p className="text-gray-600">Not set. Add one before selling tickets.</p>
              )}
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-2">Website</p>
              {/^https?:\/\//i.test(event.websiteUrl || '') ? (
                <a href={event.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {event.websiteUrl}
                </a>
              ) : (
                <p className="text-gray-600">Not set</p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-2">Location</p>
              <p className="text-gray-900">
                {event.addressLine1}
                {event.addressLine2 && <>, {event.addressLine2}</>}
              </p>
              <p className="text-gray-900">
                {[event.city, event.county].filter(Boolean).join(', ')}
              </p>
              <p className="text-gray-900 font-semibold">{event.postcode}</p>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-2">Event Dates</p>
              <p className="text-gray-900">
                {format(parseISO(event.startDate), 'MMM d, yyyy HH:mm')} to{' '}
                {format(parseISO(event.endDate), 'MMM d, yyyy HH:mm')}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Sales Period</p>
              <p className="text-gray-900">
                {event.salesOpenDate && event.salesCloseDate
                  ? `${format(parseISO(event.salesOpenDate), 'MMM d')} to ${format(parseISO(event.salesCloseDate), 'MMM d, yyyy')}`
                  : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        {event.logoUrl && (
          <div className="mt-8">
            <p className="text-sm text-gray-600 mb-2">Logo</p>
            <img src={event.logoUrl} alt="Event logo" className="w-32 h-32 object-cover rounded-lg" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Edit Event Details</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Event Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="6"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Website URL</label>
          <input
            type="url"
            name="websiteUrl"
            value={formData.websiteUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Privacy notice link</label>
          <input
            type="url"
            name="privacyPolicyUrl"
            value={formData.privacyPolicyUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank to use the built-in privacy notice.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Who is responsible for buyer data (name)</label>
          <input name="controllerName" value={formData.controllerName} onChange={handleChange} placeholder="DN3 Events" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Privacy contact email</label>
          <input type="email" name="controllerEmail" value={formData.controllerEmail} onChange={handleChange} placeholder="dn3events@gmail.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <p className="text-xs text-gray-500 mt-1">Shown on the privacy notice.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Logo link</label>
          <input
            type="url"
            name="logoUrl"
            placeholder="https://..."
            value={formData.logoUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {formData.logoUrl && <img src={formData.logoUrl} alt="Logo preview" className="mt-3 w-24 h-24 object-cover rounded-lg" />}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
