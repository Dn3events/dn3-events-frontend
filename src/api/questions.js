import client from './client'

export const questions = {
  listByEvent: (eventId) =>
    client.get(`/events/${eventId}/buyer-questions`),

  get: (questionId) =>
    client.get(`/buyer-questions/${questionId}`),

  create: (eventId, data) =>
    client.post(`/events/${eventId}/buyer-questions`, data),

  update: (questionId, data) =>
    client.patch(`/buyer-questions/${questionId}`, data),

  delete: (questionId) =>
    client.delete(`/buyer-questions/${questionId}`),
}
