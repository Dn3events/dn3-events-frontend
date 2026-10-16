import client from './client'

export const orders = {
  listByEvent: (eventId, params = {}) => client.get(`/events/${eventId}/orders`, { params }),
  get: (eventId, orderId) => client.get(`/events/${eventId}/orders/${orderId}`),
  // Only cancelling an unpaid order is allowed here.
  cancel: (eventId, orderId) => client.patch(`/events/${eventId}/orders/${orderId}/status`, { status: 'cancelled' }),
  // amount in pounds; leave out to refund everything still refundable. Owner only.
  refund: (eventId, orderId, data = {}) => client.post(`/events/${eventId}/orders/${orderId}/refund`, data),
  resend: (eventId, orderId) => client.post(`/events/${eventId}/orders/${orderId}/resend`),
  revokeTicket: (eventId, orderId, ticketId, reason) =>
    client.post(`/events/${eventId}/orders/${orderId}/tickets/${ticketId}/revoke`, { reason }),
  // marketingOnly: just the buyers who opted in to marketing.
  exportCSV: (eventId, { marketingOnly = false } = {}) =>
    client.get(`/events/${eventId}/orders/export/csv`, { params: marketingOnly ? { marketingOnly: 'true' } : {}, responseType: 'blob' }),
  // Owner only: erase a buyer's personal data on one order, or read everything held for an email.
  anonymise: (eventId, orderId) => client.post(`/events/${eventId}/orders/${orderId}/anonymise`),
  subjectData: (eventId, email) => client.get(`/events/${eventId}/orders/subject-data`, { params: { email } }),
}
