import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, Search, Menu, X,
  LayoutDashboard, ShoppingCart, MapPin, UserCog,
  Heart, LogOut, Download, LogIn, UserPlus, User,
} from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'

export default function Navbar() {
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const cartCount = useCartStore((s) => s.count())
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const closeAll = () => {
    setDropdownOpen(false)
    setMobileOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    closeAll()
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
          <div className="flex items-center gap-3">

            {/* Search */}
            <Link
              to="/search"
              className="p-2 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Rechercher"
            >
              <Search size={18} />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 relative opacity-70 hover:opacity-100 transition-opacity"
              aria-label={`Panier (${cartCount})`}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Avatar / User dropdown — desktop */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Mon compte"
                className="relative p-2 opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
              >
                <User size={18} />
                {isAuthenticated && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full" />
                )}
              </button>

              {dropdownOpen && (
                <>
                  {/* Overlay pour fermer */}
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />

                  <div className="absolute right-0 mt-2 w-56 bg-white text-black shadow-xl z-20 py-1">
                    {isAuthenticated ? (
                      <>
                        {/* Favoris */}
                        <Link
                          to="/account/wishlist"
                          onClick={closeAll}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold hover:bg-[#F5F5F5] transition-colors border-b border-[#EBEBEB]"
                        >
                          <Heart size={14} className="text-red-500" />
                          Favoris
                        </Link>

                        {/* Greeting */}
                        <div className="px-4 py-3 border-b border-[#EBEBEB]">
                          <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Bonjour</p>
                          <p className="text-xs font-black truncate">{user?.name}</p>
                        </div>

                        {/* Liens compte */}
                        <Link
                          to="/account"
                          onClick={closeAll}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors"
                        >
                          <LayoutDashboard size={13} className="text-muted" />
                          Tableau de bord
                        </Link>
                        <Link
                          to="/account/orders"
                          onClick={closeAll}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors"
                        >
                          <ShoppingCart size={13} className="text-muted" />
                          Commandes
                        </Link>
                        <Link
                          to="/account"
                          onClick={closeAll}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors"
                        >
                          <Download size={13} className="text-muted" />
                          Téléchargements
                        </Link>
                        <Link
                          to="/account/addresses"
                          onClick={closeAll}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors"
                        >
                          <MapPin size={13} className="text-muted" />
                          Adresses
                        </Link>
                        <Link
                          to="/account/profile"
                          onClick={closeAll}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors"
                        >
                          <UserCog size={13} className="text-muted" />
                          Détails du compte
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={closeAll}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors"
                          >
                            <LayoutDashboard size={13} className="text-muted" />
                            Admin Panel
                          </Link>
                        )}

                        {/* Déconnexion */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors border-t border-[#EBEBEB] text-red-500"
                        >
                          <LogOut size={13} />
                          Se déconnecter
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Non connecté */}
                        <div className="px-4 py-3 border-b border-[#EBEBEB]">
                          <p className="text-[10px] text-muted uppercase tracking-wider">Mon compte</p>
                        </div>
                        <Link
                          to="/login"
                          onClick={closeAll}
                          className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold hover:bg-[#F5F5F5] transition-colors"
                        >
                          <LogIn size={14} />
                          Se connecter
                        </Link>
                        <div className="px-4 pb-3">
                          <Link
                            to="/register"
                            onClick={closeAll}
                            className="flex items-center justify-center gap-2 w-full py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#222] transition-colors"
                          >
                            <UserPlus size={13} />
                            Créer un compte
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 opacity-70 hover:opacity-100 transition-opacity"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
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
                onClick={closeAll}
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

            <div className="pt-3 border-t border-[#333] space-y-0.5">
              {isAuthenticated ? (
                <>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider px-0 py-1">
                    Bonjour, {user?.name}
                  </p>
                  <Link to="/account/wishlist" onClick={closeAll}
                    className="flex items-center gap-2 py-2 text-xs font-bold text-white/70">
                    <Heart size={13} className="text-red-400" /> Favoris
                  </Link>
                  <Link to="/account" onClick={closeAll}
                    className="flex items-center gap-2 py-2 text-xs text-white/70">
                    <LayoutDashboard size={13} /> Tableau de bord
                  </Link>
                  <Link to="/account/orders" onClick={closeAll}
                    className="flex items-center gap-2 py-2 text-xs text-white/70">
                    <ShoppingCart size={13} /> Commandes
                  </Link>
                  <Link to="/account/addresses" onClick={closeAll}
                    className="flex items-center gap-2 py-2 text-xs text-white/70">
                    <MapPin size={13} /> Adresses
                  </Link>
                  <Link to="/account/profile" onClick={closeAll}
                    className="flex items-center gap-2 py-2 text-xs text-white/70">
                    <UserCog size={13} /> Détails du compte
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={closeAll}
                      className="flex items-center gap-2 py-2 text-xs text-white/70">
                      <LayoutDashboard size={13} /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 py-2 text-xs text-red-400 w-full text-left"
                  >
                    <LogOut size={13} /> Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeAll}
                    className="flex items-center gap-2 py-2 text-xs font-bold text-white/70">
                    <LogIn size={13} /> Se connecter
                  </Link>
                  <Link to="/register" onClick={closeAll}
                    className="flex items-center gap-2 py-2 text-xs font-bold text-white/70">
                    <UserPlus size={13} /> Créer un compte
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
