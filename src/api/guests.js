import client from './client'

export const guests = {
  listByEvent: (eventId) => client.get(`/events/${eventId}/guests`),
  create: (eventId, data) => client.post(`/events/${eventId}/guests`, data),
  bulk: (eventId, guestList) => client.post(`/events/${eventId}/guests/bulk`, { guests: guestList }),
  send: (eventId, guestId) => client.post(`/events/${eventId}/guests/${guestId}/send`),
}
