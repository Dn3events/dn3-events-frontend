import client from './client'

export const discounts = {
  listByEvent: (eventId) =>
    client.get(`/events/${eventId}/discount-codes`),

  get: (discountId) =>
    client.get(`/discount-codes/${discountId}`),

  create: (eventId, data) =>
    client.post(`/events/${eventId}/discount-codes`, data),

  update: (discountId, data) =>
    client.patch(`/discount-codes/${discountId}`, data),

  delete: (discountId) =>
    client.delete(`/discount-codes/${discountId}`),

  validate: (code, eventId) =>
    client.post('/discount-codes/validate', { code, eventId }),
}
