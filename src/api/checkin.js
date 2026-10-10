import client from './client'

export const checkin = {
  // code = what the QR holds; or pass { ticketId } for a manual check-in from the list.
  scan: (eventId, body) => client.post(`/events/${eventId}/checkin`, body, { validateStatus: (s) => s < 500 }),
  // Look at a QR code without admitting anyone.
  lookup: (eventId, code) => client.post(`/events/${eventId}/checkin/lookup`, { code }, { validateStatus: (s) => s < 500 }),
  undo: (eventId, ticketId) => client.post(`/events/${eventId}/checkin/undo`, { ticketId }),
  stats: (eventId) => client.get(`/events/${eventId}/checkin/stats`),
  tickets: (eventId, search = '') => client.get(`/events/${eventId}/checkin/tickets`, { params: { search } }),
}
