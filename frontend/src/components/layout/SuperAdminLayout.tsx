import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Building2, CreditCard, Activity, FileText, LogOut, Menu, Shield } from 'lucide-react'
import { useState } from 'react'
import { m } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
}
const pageTransition = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const }

const superAdminLinks = [
  { to: '/superadmin',           label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/superadmin/tenants',   label: 'Shops',     icon: Building2 },
  { to: '/superadmin/plans',     label: 'Plans',     icon: CreditCard },
  { to: '/superadmin/invoices',  label: 'Invoices',  icon: FileText },
  { to: '/superadmin/activity',  label: 'Activity',  icon: Activity },
]

export default function SuperAdminLayout() {
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
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-60 bg-[#0A0A2A] text-white flex flex-col z-30 transition-transform duration-300',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-indigo-400" />
            <p className="text-lg font-black uppercase tracking-[0.2em]">Super Admin</p>
          </div>
          <p className="text-xs text-white/40 uppercase tracking-wider">Platform Control</p>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {superAdminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                )
              }
            >
              <link.icon size={16} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-xs font-bold truncate mb-0.5">{user?.name}</p>
          <p className="text-xs text-white/40 truncate mb-3">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-accent px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button className="lg:hidden p-1" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <p className="text-xs text-muted uppercase tracking-wider">
            {user?.name} · Super Admin
          </p>
        </header>

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
