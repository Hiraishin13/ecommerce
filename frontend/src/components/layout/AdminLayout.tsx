import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  LogOut,
  Menu,
  CreditCard,
} from 'lucide-react'
import { m } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
}
const pageTransition = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const }
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/pos', label: 'Caisse POS', icon: CreditCard },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-60 bg-black text-white flex flex-col z-30 transition-transform duration-300',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#222]">
          <p className="text-lg font-black uppercase tracking-[0.2em]">SHOP</p>
          <p className="text-xs text-white/50 uppercase tracking-wider mt-0.5">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors',
                  isActive
                    ? 'bg-white text-black'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )
              }
            >
              <link.icon size={16} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User / logout */}
        <div className="px-6 py-4 border-t border-[#222]">
          <p className="text-xs font-bold truncate mb-0.5">{user?.name}</p>
          <p className="text-xs text-white/50 truncate mb-3">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-accent px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button
            className="lg:hidden p-1"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <p className="text-xs text-muted uppercase tracking-wider">
            Welcome, {user?.name}
          </p>
        </header>

        {/* Content */}
        <m.main
          key={pathname}
          className="flex-1 p-6 overflow-y-auto"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          transition={pageTransition}
        >
          <Outlet />
        </m.main>
      </div>
    </div>
  )
}
