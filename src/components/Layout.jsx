import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { Calendar, Home, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()

  const isEventPage = location.pathname.includes('/event/')

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar text-white flex flex-col shadow-lg">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">DN3 Events</h1>
              <p className="text-xs text-gray-400">Event Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-4">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              !isEventPage && location.pathname === '/'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 space-y-4">
          <div className="text-sm">
            <p className="text-gray-400 mb-1">Signed in as</p>
            <p className="text-white font-semibold truncate">{user?.name || 'User'}</p>
          </div>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="flex items-center gap-3 text-gray-300 hover:text-white transition w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {!isEventPage ? 'Dashboard' : 'Event Management'}
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                AD
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
