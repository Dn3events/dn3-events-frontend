import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import CreateEvent from './pages/CreateEvent'
import EventDetail from './pages/EventDetail'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import PublicCheckout from './pages/PublicCheckout'
import PaymentSuccess from './pages/PaymentSuccess'
import ProtectedRoute from './components/ProtectedRoute'
import Toast from './components/Toast'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout/:slug" element={<PublicCheckout />} />
        <Route path="/success" element={<PaymentSuccess />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="event/:eventId/*" element={<EventDetail />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
      <Toast />
    </Router>
  )
}
