import { useState, useEffect } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { Home, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()

  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const isEventPage = location.pathname.includes('/event/')

  return (
    <div className="flex h-screen bg-paper overflow-hidden">
      {menuOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMenuOpen(false)} />}
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-white flex flex-col shadow-lg transform transition-transform md:static md:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-xl font-extrabold tracking-[0.18em]">DN3 <span className="text-brand">EVENTS</span></h1>
              <p className="text-[11px] uppercase tracking-widest text-gray-400 mt-1">Foundry Events</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-4">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              !isEventPage && location.pathname === '/'
                ? 'bg-brand text-ink font-semibold'
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
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-ink text-white border-b-[3px] border-brand px-4 py-3 md:px-8 md:py-4">
          <div className="flex items-center justify-between">
            <button className="md:hidden mr-3 p-2 -ml-2 text-white" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="flex-1 text-base md:text-lg font-extrabold tracking-[0.18em]">
              DN3 <span className="text-brand">EVENTS</span>
              <span className="hidden sm:inline ml-3 text-xs font-medium tracking-widest text-gray-400 uppercase">{!isEventPage ? 'Dashboard' : 'Event Management'}</span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-ink font-bold">
                {(user?.name || 'U').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-3 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
