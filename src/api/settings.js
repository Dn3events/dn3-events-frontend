import client from './client'

export const settings = {
  getEventSettings: (eventId) =>
    client.get(`/events/${eventId}/settings`),

  updateEventSettings: (eventId, data) =>
    client.patch(`/events/${eventId}/settings`, data),

  listUsers: (eventId) =>
    client.get(`/events/${eventId}/users`),

  getUser: (userId) =>
    client.get(`/users/${userId}`),

  addUser: (eventId, data) =>
    client.post(`/events/${eventId}/users`, data),

  updateUser: (userId, data) =>
    client.patch(`/users/${userId}`, data),

  deleteUser: (userId) =>
    client.delete(`/users/${userId}`),
}
