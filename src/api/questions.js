import client from './client'

export const questions = {
  listByEvent: (eventId) => client.get(`/events/${eventId}/questions`),
  create: (eventId, data) => client.post(`/events/${eventId}/questions`, data),
  update: (eventId, questionId, data) => client.put(`/events/${eventId}/questions/${questionId}`, data),
  delete: (eventId, questionId) => client.delete(`/events/${eventId}/questions/${questionId}`),
}
