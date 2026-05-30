import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Layout() {
  const { resident, isAdmin, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate">📚 Pride Platinum Library</h1>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-xs sm:text-sm text-gray-600">
              {resident?.flat_number}
              {isAdmin && <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Admin</span>}
            </span>
            <button
              onClick={signOut}
              data-testid="logout-button"
              className="text-sm text-red-600 hover:text-red-800 px-2 py-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-4">
        <Outlet />
      </main>

      {/* Bottom navigation (mobile) */}
      <nav className="bg-white border-t fixed bottom-0 left-0 right-0 safe-area-pb">
        <div className="max-w-4xl mx-auto flex">
          <NavItem to="/dashboard" label="Home" icon="🏠" />
          <NavItem to="/catalog" label="Catalog" icon="📚" />
          <NavItem to="/wishlist" label="Wishlist" icon="📋" />
          {isAdmin && <NavItem to="/checkout" label="Checkout" icon="📖" />}
          {isAdmin && <NavItem to="/return" label="Return" icon="↩️" />}
          {isAdmin && <NavItem to="/admin" label="Admin" icon="⚙️" />}
          {!isAdmin && <NavItem to="/volunteer" label="Volunteer" icon="🙋" />}
        </div>
      </nav>

      {/* Spacer for fixed bottom nav */}
      <div className="h-16" />
    </div>
  )
}

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center py-2 text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`
      }
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}
