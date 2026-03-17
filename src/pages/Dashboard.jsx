import { Link } from 'react-router-dom'
import { Plus, Edit3, MoreVertical, TrendingUp, Loader } from 'lucide-react'
import { useStore } from '../store/useStore'
import StatusBadge from '../components/StatusBadge'
import { format, parseISO } from 'date-fns'
import { useState, useEffect } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import { events as eventsAPI } from '../api/events'
import { orders as ordersAPI } from '../api/orders'
import { tickets as ticketsAPI } from '../api/tickets'

export default function Dashboard() {
  const { showToast } = useStore()
  const [events, setEvents] = useState([])
  const [orders, setOrders] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [eventsRes] = await Promise.all([eventsAPI.list()])
      setEvents(eventsRes.data.data || [])

      // Load orders and tickets for all events
      if (eventsRes.data.data && eventsRes.data.data.length > 0) {
        const allOrders = []
        const allTickets = []

        for (const event of eventsRes.data.data) {
          try {
            const [ordersRes, ticketsRes] = await Promise.all([
              ordersAPI.listByEvent(event.id),
              ticketsAPI.listByEvent(event.id),
            ])
            allOrders.push(...(ordersRes.data.data || []))
            allTickets.push(...(ticketsRes.data.data || []))
          } catch {
            // Continue loading other events
          }
        }

        setOrders(allOrders)
        setTickets(allTickets)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateEvent = async (eventId, updates) => {
    try {
      await eventsAPI.update(eventId, updates)
      setEvents(events.map((e) => (e.id === eventId ? { ...e, ...updates } : e)))
      showToast('Event updated successfully')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update event', 'error')
    }
  }

  const deleteEvent = async (eventId) => {
    try {
      await eventsAPI.delete(eventId)
      setEvents(events.filter((e) => e.id !== eventId))
      setOrders(orders.filter((o) => o.eventId !== eventId))
      setTickets(tickets.filter((t) => t.eventId !== eventId))
      showToast('Event deleted successfully')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete event', 'error')
    }
  }

  const eventsByYear = {}
  events.forEach((event) => {
    const year = event.year || new Date(event.startDate).getFullYear()
    if (!eventsByYear[year]) eventsByYear[year] = []
    eventsByYear[year].push(event)
  })

  const sortedYears = Object.keys(eventsByYear).sort((a, b) => b - a)

  const getEventStats = (eventId) => {
    const eventOrders = orders.filter((o) => o.eventId === eventId)
    const eventTickets = tickets.filter((t) => t.eventId === eventId)
    const totalSold = eventTickets.reduce((sum, t) => sum + t.sold, 0)
    const totalRevenue = eventOrders
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + o.total, 0)

    return { totalSold, totalRevenue, orderCount: eventOrders.length }
  }

  const stats = {
    totalEvents: events.length,
    liveEvents: events.filter((e) => e.status === 'live').length,
    totalRevenue: orders
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + o.total, 0),
    totalTicketsSold: tickets.reduce((sum, t) => sum + t.sold, 0),
  }

  const handleToggleStatus = (event) => {
    const newStatus = event.status === 'live' ? 'paused' : 'live'
    updateEvent(event.id, { status: newStatus })
    showToast(`Event ${newStatus === 'live' ? 'published' : 'paused'}`)
  }

  const handleDelete = (eventId) => {
    deleteEvent(eventId)
    setDeleteConfirm(null)
    showToast('Event deleted successfully')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <p className="text-red-700 font-semibold">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DN3 Events</h1>
          <p className="text-gray-600 mt-1">Manage your events and ticket sales</p>
        </div>
        <Link
          to="/create-event"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create New Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm">Total Events</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEvents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
          <p className="text-gray-600 text-sm">Live Events</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.liveEvents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">£{stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-600">
          <p className="text-gray-600 text-sm">Tickets Sold</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTicketsSold}</p>
        </div>
      </div>

      {/* Events by Year */}
      {sortedYears.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No events yet</p>
          <p className="text-gray-400 text-sm mt-2">Create your first event to get started</p>
        </div>
      ) : (
        sortedYears.map((year) => (
          <div key={year} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{year}</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Event Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dates</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tickets Sold</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Revenue</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {eventsByYear[year].map((event) => {
                    const stats = getEventStats(event.id)
                    return (
                      <tr key={event.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <Link
                            to={`/event/${event.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {event.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={event.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {format(parseISO(event.startDate), 'MMM d')} -{' '}
                          {format(parseISO(event.endDate), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {stats.totalSold}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          £{stats.totalRevenue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/event/${event.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <div className="relative group">
                              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition z-10">
                                <button
                                  onClick={() => handleToggleStatus(event)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                                >
                                  {event.status === 'live' ? 'Pause' : 'Publish'} Event
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(event.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
                                >
                                  Delete Event
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onConfirm={() => handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        isDangerous
      />
    </div>
  )
}
