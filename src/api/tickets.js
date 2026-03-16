import client from './client'

export const tickets = {
  listByEvent: (eventId) =>
    client.get(`/events/${eventId}/tickets`),

  get: (ticketId) =>
    client.get(`/tickets/${ticketId}`),

  create: (eventId, data) =>
    client.post(`/events/${eventId}/tickets`, data),

  update: (ticketId, data) =>
    client.patch(`/tickets/${ticketId}`, data),

  delete: (ticketId) =>
    client.delete(`/tickets/${ticketId}`),

  updateStatus: (ticketId, status) =>
    client.patch(`/tickets/${ticketId}`, { status }),
}
