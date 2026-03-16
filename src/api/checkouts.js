import client from './client'

export const checkouts = {
  listByEvent: (eventId) =>
    client.get(`/events/${eventId}/checkouts`),

  get: (checkoutId) =>
    client.get(`/checkouts/${checkoutId}`),

  getBySlug: (slug) =>
    client.get(`/checkouts/slug/${slug}`),

  create: (eventId, data) =>
    client.post(`/events/${eventId}/checkouts`, data),

  update: (checkoutId, data) =>
    client.patch(`/checkouts/${checkoutId}`, data),

  delete: (checkoutId) =>
    client.delete(`/checkouts/${checkoutId}`),
}
