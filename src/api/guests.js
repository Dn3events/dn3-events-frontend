import client from './client'

export const guests = {
  listByEvent: (eventId) =>
    client.get(`/events/${eventId}/guests`),

  get: (guestId) =>
    client.get(`/guests/${guestId}`),

  create: (eventId, data) =>
    client.post(`/events/${eventId}/guests`, data),

  update: (guestId, data) =>
    client.patch(`/guests/${guestId}`, data),

  delete: (guestId) =>
    client.delete(`/guests/${guestId}`),
}
