import client from './client'

export const tickets = {
  listByEvent: (eventId) => client.get(`/events/${eventId}/tickets`),
  create: (eventId, data) => client.post(`/events/${eventId}/tickets`, data),
  update: (eventId, ticketId, data) => client.put(`/events/${eventId}/tickets/${ticketId}`, data),
  delete: (eventId, ticketId) => client.delete(`/events/${eventId}/tickets/${ticketId}`),
  // visible and/or status ('open' | 'closed')
  setVisibility: (eventId, ticketId, data) => client.patch(`/events/${eventId}/tickets/${ticketId}/visibility`, data),
}
