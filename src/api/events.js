import client from './client'

export const events = {
  list: () =>
    client.get('/events'),

  get: (eventId) =>
    client.get(`/events/${eventId}`),

  create: (data) =>
    client.post('/events', data),

  update: (eventId, data) =>
    client.patch(`/events/${eventId}`, data),

  delete: (eventId) =>
    client.delete(`/events/${eventId}`),

  updateStatus: (eventId, status) =>
    client.patch(`/events/${eventId}`, { status }),

  getBySlug: (slug) =>
    client.get(`/events/slug/${slug}`),
}
