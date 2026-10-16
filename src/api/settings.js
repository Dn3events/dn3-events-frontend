import client from './client'

export const settings = {
  get: (eventId) => client.get(`/events/${eventId}/settings`),
  update: (eventId, data) => client.put(`/events/${eventId}/settings`, data),
  listUsers: (eventId) => client.get(`/events/${eventId}/settings/users`),
  addUser: (eventId, data) => client.post(`/events/${eventId}/settings/users`, data),
  updateUser: (eventId, userId, role) => client.put(`/events/${eventId}/settings/users/${userId}`, { role }),
  removeUser: (eventId, userId) => client.delete(`/events/${eventId}/settings/users/${userId}`),
}
