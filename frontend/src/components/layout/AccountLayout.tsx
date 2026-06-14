import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { User, ShoppingBag, MapPin, Heart, Settings } from 'lucide-react'
import { m } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import { cn } from '../../utils/cn'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
}
const pageTransition = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const }

const accountLinks = [
  { to: '/account', label: 'Dashboard', icon: Settings, end: true },
  { to: '/account/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
]

export default function AccountLayout() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="border border-accent">
              <div className="px-4 py-3 bg-black text-white">
                <p className="text-xs font-bold uppercase tracking-widest">My Account</p>
              </div>
              <nav>
                {accountLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b border-accent last:border-0 transition-colors',
                        isActive
                          ? 'bg-black text-white'
                          : 'text-[#1A1A1A] hover:bg-accent'
                      )
                    }
                  >
                    <link.icon size={14} />
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Mobile nav */}
          <div className="md:hidden w-full mb-4">
            <div className="flex overflow-x-auto gap-2 pb-2">
              {accountLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      'flex-shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors',
                      isActive
                        ? 'bg-black text-white border-black'
                        : 'border-accent hover:border-black'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Content */}
          <m.main
            key={pathname}
            className="flex-1 min-w-0"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={pageTransition}
          >
            <Outlet />
          </m.main>
        </div>
      </div>
      <Footer />
    </div>
  )
}
