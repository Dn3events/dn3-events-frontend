import client from './client'

export const payments = {
  createCheckoutSession: (data) =>
    client.post('/payments/create-session', data),

  getSuccess: (sessionId) =>
    client.get(`/payments/success?session_id=${sessionId}`),
}
