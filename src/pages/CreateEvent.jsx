import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Upload, Check } from 'lucide-react'
import { useStore } from '../store/useStore'

const steps = ['Basic Details', 'Location', 'Dates', 'Review']

export default function CreateEvent() {
  const navigate = useNavigate()
  const { addEvent, showToast } = useStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [logo, setLogo] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    websiteUrl: '',
    line1: '',
    line2: '',
    city: '',
    county: '',
    postcode: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    salesOpenDate: '',
    salesOpenTime: '00:00',
    salesCloseDate: '',
    salesCloseTime: '23:59',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogo(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogo(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const isStep0Valid = formData.name.trim() && formData.description.trim() && formData.websiteUrl.trim()
  const isStep1Valid = formData.line1.trim() && formData.city.trim() && formData.postcode.trim()
  const isStep2Valid = formData.startDate && formData.startTime && formData.endDate && formData.endTime && formData.salesOpenDate && formData.salesCloseDate

  const canProceed = [isStep0Valid, isStep1Valid, isStep2Valid, true][currentStep]

  const handleNext = () => {
    if (canProceed && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreate = () => {
    if (!formData.name.trim()) return

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00Z`).toISOString()
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00Z`).toISOString()
    const salesOpenDateTime = new Date(`${formData.salesOpenDate}T${formData.salesOpenTime}:00Z`).toISOString()
    const salesCloseDateTime = new Date(`${formData.salesCloseDate}T${formData.salesCloseTime}:00Z`).toISOString()

    const newEvent = {
      name: formData.name,
      description: `<p>${formData.description}</p>`,
      logo,
      websiteUrl: formData.websiteUrl,
      address: {
        line1: formData.line1,
        line2: formData.line2,
        city: formData.city,
        county: formData.county,
        postcode: formData.postcode,
      },
      startDate: startDateTime,
      endDate: endDateTime,
      salesOpenDate: salesOpenDateTime,
      salesCloseDate: salesCloseDateTime,
      status: 'live',
    }

    addEvent(newEvent)
    showToast('Event created successfully')
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Event</h1>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition ${
                  idx === currentStep
                    ? 'bg-blue-600 text-white'
                    : idx < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-sm font-medium ${idx === currentStep ? 'text-blue-600' : 'text-gray-600'}`}>
                {step}
              </span>
              {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Step 1: Basic Details */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Event Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Tech Conference 2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Website URL *</label>
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Event Logo</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDragDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="cursor-pointer block">
                  {logo ? (
                    <div>
                      <img src={logo} alt="Logo preview" className="w-32 h-32 mx-auto mb-4 object-cover rounded" />
                      <p className="text-sm text-blue-600">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Drag and drop your logo here</p>
                      <p className="text-xs text-gray-400 mt-1">or click to select</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Address Line 1 *</label>
              <input
                type="text"
                name="line1"
                value={formData.line1}
                onChange={handleInputChange}
                placeholder="Street address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Address Line 2</label>
              <input
                type="text"
                name="line2"
                value={formData.line2}
                onChange={handleInputChange}
                placeholder="Suite, floor, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">County</label>
                <input
                  type="text"
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  placeholder="County"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Postcode *</label>
              <input
                type="text"
                name="postcode"
                value={formData.postcode}
                onChange={handleInputChange}
                placeholder="Postal code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 3: Dates */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Event Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Start Time *</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Event End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">End Time *</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Sales Open Date *</label>
                <input
                  type="date"
                  name="salesOpenDate"
                  value={formData.salesOpenDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Open Time</label>
                <input
                  type="time"
                  name="salesOpenTime"
                  value={formData.salesOpenTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Sales Close Date *</label>
                <input
                  type="date"
                  name="salesCloseDate"
                  value={formData.salesCloseDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Close Time</label>
                <input
                  type="time"
                  name="salesCloseTime"
                  value={formData.salesCloseTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Event Summary</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{formData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">
                    {formData.line1}, {formData.city}, {formData.postcode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Event Dates</p>
                  <p className="font-medium text-gray-900">
                    {formData.startDate} to {formData.endDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCreate}
              className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Create Event
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
