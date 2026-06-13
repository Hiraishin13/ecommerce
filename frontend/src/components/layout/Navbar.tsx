import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Search, Menu, X, ChevronDown } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const cartCount = useCartStore((s) => s.count())
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/search', label: 'Search' },
  ]

  return (
    <nav className="sticky top-0 z-40 bg-black text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
          >
            SHOP
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'text-xs font-bold uppercase tracking-widest transition-opacity',
                    isActive ? 'opacity-100 border-b border-white pb-0.5' : 'opacity-70 hover:opacity-100'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Search icon */}
            <Link
              to="/search"
              className="p-2 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Search"
            >
              <Search size={18} />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 relative opacity-70 hover:opacity-100 transition-opacity"
              aria-label={`Cart (${cartCount} items)`}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative hidden md:block">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1 p-2 opacity-70 hover:opacity-100 transition-opacity text-xs font-bold uppercase tracking-wider"
                  >
                    <User size={18} />
                    <span className="hidden lg:block">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-1 w-48 bg-white text-black shadow-lg z-20">
                        <div className="px-4 py-3 border-b border-accent">
                          <p className="text-xs font-bold truncate">{user?.name}</p>
                          <p className="text-xs text-muted truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-xs uppercase tracking-wider hover:bg-accent transition-colors"
                        >
                          My Account
                        </Link>
                        <Link
                          to="/account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-xs uppercase tracking-wider hover:bg-accent transition-colors"
                        >
                          Orders
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-xs uppercase tracking-wider hover:bg-accent transition-colors"
                          >
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-xs uppercase tracking-wider hover:bg-accent transition-colors border-t border-accent"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-bold uppercase tracking-widest bg-white text-black px-3 py-1.5 hover:bg-accent transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 opacity-70 hover:opacity-100 transition-opacity"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black border-t border-[#222]">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block py-2 text-xs font-bold uppercase tracking-widest',
                    isActive ? 'text-white' : 'text-white/70'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-[#333]">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-xs font-bold uppercase tracking-widest text-white/70"
                  >
                    My Account
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block py-2 text-xs font-bold uppercase tracking-widest text-white/70"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false) }}
                    className="block py-2 text-xs font-bold uppercase tracking-widest text-white/70 w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-xs font-bold uppercase tracking-widest text-white/70"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-xs font-bold uppercase tracking-widest text-white/70"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
