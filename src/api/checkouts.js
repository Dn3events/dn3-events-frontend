import client from './client'

export const checkouts = {
  listByEvent: (eventId) =>
    client.get(`/events/${eventId}/checkouts`),

  getBySlug: (slug) =>
    client.get(`/public/checkouts/${slug}`),

  create: (eventId, data) =>
    client.post(`/events/${eventId}/checkouts`, data),

  update: (eventId, checkoutId, data) =>
    client.put(`/events/${eventId}/checkouts/${checkoutId}`, data),

  toggle: (eventId, checkoutId) =>
    client.patch(`/events/${eventId}/checkouts/${checkoutId}/toggle`),

  delete: (eventId, checkoutId) =>
    client.delete(`/events/${eventId}/checkouts/${checkoutId}`),
}
