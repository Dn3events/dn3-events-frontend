import client from './client'

export const reports = {
  summary: (eventId, params = {}) => client.get(`/events/${eventId}/reports/summary`, { params }),
  revenueOverTime: (eventId) => client.get(`/events/${eventId}/reports/revenue-over-time`),
  tickets: (eventId) => client.get(`/events/${eventId}/reports/tickets`),
  discounts: (eventId) => client.get(`/events/${eventId}/reports/discounts`),
  checkouts: (eventId) => client.get(`/events/${eventId}/reports/checkouts`),
  location: (eventId) => client.get(`/events/${eventId}/reports/location`),
}
