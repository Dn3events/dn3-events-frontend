import client from './client'

export const orders = {
  listByEvent: (eventId) =>
    client.get(`/events/${eventId}/orders`),

  get: (orderId) =>
    client.get(`/orders/${orderId}`),

  create: (data) =>
    client.post('/orders', data),

  update: (orderId, data) =>
    client.patch(`/orders/${orderId}`, data),

  delete: (orderId) =>
    client.delete(`/orders/${orderId}`),

  exportCSV: (eventId) =>
    client.get(`/events/${eventId}/orders/export/csv`, {
      responseType: 'blob',
    }),
}
