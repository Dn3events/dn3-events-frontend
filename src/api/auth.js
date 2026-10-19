import client from './client'

export const auth = {
  login: (email, password) =>
    client.post('/auth/login', { email, password }),

  register: (name, email, password) =>
    client.post('/auth/register', { name, email, password }),

  forgotPassword: (email) =>
    client.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    client.post('/auth/reset-password', { token, password }),

  getMe: () =>
    client.get('/auth/me'),
}
