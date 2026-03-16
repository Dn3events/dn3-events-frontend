import client from './client'

export const reports = {
  getEventAnalytics: (eventId) =>
    client.get(`/events/${eventId}/analytics`),

  getSalesReport: (eventId, params = {}) =>
    client.get(`/events/${eventId}/reports/sales`, { params }),

  getAttendanceReport: (eventId, params = {}) =>
    client.get(`/events/${eventId}/reports/attendance`, { params }),

  getDemographicsReport: (eventId) =>
    client.get(`/events/${eventId}/reports/demographics`),
}
