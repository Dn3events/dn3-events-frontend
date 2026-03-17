import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Upload } from 'lucide-react'
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
    logo: event.logo || null,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setFormData((prev) => ({ ...prev, logo: ev.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updates = {
        name: formData.name,
        description: `<p>${formData.description}</p>`,
        websiteUrl: formData.websiteUrl,
        logo: formData.logo,
      }
      await eventsAPI.update(event.id, updates)
      if (onEventUpdate) onEventUpdate(updates)
      setIsEditing(false)
      showToast('Event details updated')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save changes', 'error')
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

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-2">Event Name</p>
              <p className="text-lg font-semibold text-gray-900">{event.name}</p>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-700">{event.description.replace(/<[^>]*>/g, '')}</p>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-2">Website</p>
              <a href={event.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {event.websiteUrl}
              </a>
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
                {format(parseISO(event.salesOpenDate), 'MMM d')} to{' '}
                {format(parseISO(event.salesCloseDate), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {event.logo && (
          <div className="mt-8">
            <p className="text-sm text-gray-600 mb-2">Logo</p>
            <img src={event.logo} alt="Event logo" className="w-32 h-32 object-cover rounded-lg" />
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
          <label className="block text-sm font-semibold text-gray-900 mb-2">Logo</label>
          <div className="flex items-center gap-4">
            {formData.logo && (
              <img src={formData.logo} alt="Logo preview" className="w-24 h-24 object-cover rounded-lg" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-edit"
            />
            <label
              htmlFor="logo-edit"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition"
            >
              <Upload className="w-4 h-4" />
              Change Logo
            </label>
          </div>
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
