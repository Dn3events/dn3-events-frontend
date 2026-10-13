import client from './client'

export const organisations = {
  list: () => client.get('/organisations'),
  listKeys: (orgId) => client.get(`/organisations/${orgId}/integration-keys`),
  createKey: (orgId, name) => client.post(`/organisations/${orgId}/integration-keys`, { name }),
  revokeKey: (orgId, keyId) => client.delete(`/organisations/${orgId}/integration-keys/${keyId}`),
}
