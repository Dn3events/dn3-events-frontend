import client from './client'

export const tickets = {
  listByEvent: (eventId) =>
    client.get(`/events/${eventId}/tickets`),

  get: (eventId, ticketId) =>
    client.get(`/events/${eventId}/tickets/${ticketId}`),

  create: (eventId, data) =>
    client.post(`/events/${eventId}/tickets`, data),

  update: (eventId, ticketId, data) =>
    client.patch(`/events/${eventId}/tickets/${ticketId}`, data),

  delete: (eventId, ticketId) =>
    client.delete(`/events/${eventId}/tickets/${ticketId}`),

  updateStatus: (eventId, ticketId, status) =>
    client.patch(`/events/${eventId}/tickets/${ticketId}`, { status }),
}
