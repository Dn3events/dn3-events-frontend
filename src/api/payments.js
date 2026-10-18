import client from './client'

const options=reference=>({headers:{'X-Order-Reference':reference}})
export const payments = {
  changeShop: ref=>client.get('/ticket-changes',options(ref)),
  changeQuote: (ref,data)=>client.post('/ticket-changes/quote',data,options(ref)),
  startChange: (ref,data)=>client.post('/ticket-changes/start',data,options(ref)),
  refreshChanges: ref=>client.post('/ticket-changes/refresh',{},options(ref)),
  createCheckoutSession: (data) =>
    client.post('/payments/create-session', data),

  getSuccess: (sessionId) =>
    client.get(`/payments/success?session_id=${sessionId}`),
}
