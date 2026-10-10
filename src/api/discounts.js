import client from './client'

export const discounts = {
  list: (eventId) => client.get(`/events/${eventId}/discounts`),
  create: (eventId, data) => client.post(`/events/${eventId}/discounts`, data),
  update: (eventId, id, data) => client.put(`/events/${eventId}/discounts/${id}`, data),
  remove: (eventId, id) => client.delete(`/events/${eventId}/discounts/${id}`),
  toggle: (eventId, id) => client.patch(`/events/${eventId}/discounts/${id}/toggle`),
}
