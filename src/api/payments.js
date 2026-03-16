import client from './client'

export const payments = {
  createCheckoutSession: (data) =>
    client.post('/payments/stripe/session', data),

  getSessionStatus: (sessionId) =>
    client.get(`/payments/stripe/session/${sessionId}`),

  createPaymentIntent: (data) =>
    client.post('/payments/intent', data),
}
