import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, MoreVertical, Loader } from 'lucide-react'
import { useStore } from '../store/useStore'
import StatusBadge from '../components/StatusBadge'
import DetailsTab from '../tabs/DetailsTab'
import TicketsTab from '../tabs/TicketsTab'
import CheckoutTab from '../tabs/CheckoutTab'
import SalesTab from '../tabs/SalesTab'
import ReportsTab from '../tabs/ReportsTab'
import BuyersTab from '../tabs/BuyersTab'
import SettingsTab from '../tabs/SettingsTab'
import ConfirmDialog from '../components/ConfirmDialog'
import { events as eventsAPI } from '../api/events'

const TABS = ['Details', 'Tickets', 'Checkout', 'Sales', 'Buyers', 'Reports', 'Settings']

export default function EventDetail() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useStore()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true)
        const res = await eventsAPI.get(eventId)
        setEvent(res.data.data)
      } catch (err) {
        console.error('Failed to load event:', err)
        setEvent(null)
      } finally {
        setLoading(false)
      }
    }
    loadEvent()
  }, [eventId])

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Event not found</p>
      </div>
    )
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await eventsAPI.update(event.id, { status: newStatus })
      setEvent({ ...event, status: newStatus })
      showToast(`Event ${newStatus === 'live' ? 'published' : newStatus}`)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error')
    }
  }

  const handleDelete = async () => {
    try {
      await eventsAPI.delete(event.id)
      showToast('Event deleted successfully')
      navigate('/')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete event', 'error')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              <StatusBadge status={event.status} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-2 bg-white rounded-lg shadow p-1">
              <button
                onClick={() => handleStatusChange('live')}
                className={`px-4 py-2 rounded transition ${
                  event.status === 'live'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                LIVE
              </button>
              <button
                onClick={() => handleStatusChange('paused')}
                className={`px-4 py-2 rounded transition ${
                  event.status === 'paused'
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                PAUSE
              </button>
              <button
                onClick={() => handleStatusChange('cancelled')}
                className={`px-4 py-2 rounded transition ${
                  event.status === 'cancelled'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                CANCEL
              </button>
            </div>

            <div className="relative group">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                <MoreVertical className="w-5 h-5" />
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition z-10">
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 flex overflow-x-auto">
          {TABS.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(idx)}
              className={`px-6 py-4 font-medium transition whitespace-nowrap ${
                currentTab === idx
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8">
          {currentTab === 0 && <DetailsTab event={event} onEventUpdate={(updates) => setEvent({ ...event, ...updates })} />}
          {currentTab === 1 && <TicketsTab eventId={event.id} />}
          {currentTab === 2 && <CheckoutTab eventId={event.id} />}
          {currentTab === 3 && <SalesTab eventId={event.id} />}
          {currentTab === 4 && <BuyersTab eventId={event.id} />}
          {currentTab === 5 && <ReportsTab eventId={event.id} />}
          {currentTab === 6 && <SettingsTab eventId={event.id} />}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        isDangerous
      />
    </div>
  )
}
