import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingBag, Search, Menu, X, Heart,
  LayoutDashboard, ShoppingCart, MapPin, UserCog,
  LogOut, LogIn, UserPlus, User, ChevronDown,
} from 'lucide-react'
import { AnimatePresence, m } from 'framer-motion'
import { useCartStore }     from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { useAuth }          from '../../hooks/useAuth'
import { categoryService, type Category } from '../../services/category.service'
import { cn } from '../../utils/cn'

// ── Animation variants ──────────────────────────────────────────────────────
const dropdownVariants = {
  hidden:  { opacity: 0, y: -6, scaleY: 0.96 },
  visible: { opacity: 1, y:  0, scaleY: 1    },
  exit:    { opacity: 0, y: -6, scaleY: 0.96 },
}
const dropdownTransition = { duration: 0.16, ease: [0.25, 0.1, 0.25, 1] as const }

const mobileVariants = {
  hidden:  { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto' },
  exit:    { opacity: 0, height: 0 },
}

// ── Composant Navbar ────────────────────────────────────────────────────────
export default function Navbar() {
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [userMenuOpen,  setUserMenuOpen]  = useState(false)
  const [catsOpen,      setCatsOpen]      = useState(false)
  const [categories,    setCategories]    = useState<Category[]>([])

  const cartCount    = useCartStore((s) => s.count())
  const wishCount    = useWishlistStore((s) => s.count())
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()
  const catRef       = useRef<HTMLDivElement>(null)

  // Fermer tous les menus au changement de route
  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
    setCatsOpen(false)
  }, [location.pathname])

  // Charger les catégories une seule fois
  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {})
  }, [])

  // Fermer le menu catégories si clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const closeAll = () => {
    setMobileOpen(false)
    setUserMenuOpen(false)
    setCatsOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    closeAll()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-40 bg-black text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity flex-shrink-0"
          >
            SHOP
          </Link>

          {/* ── Desktop nav links ──────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-6">

            {/* Accueil */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn('text-xs font-bold uppercase tracking-widest transition-opacity',
                  isActive ? 'opacity-100 border-b border-white pb-0.5' : 'opacity-70 hover:opacity-100')
              }
            >
              Accueil
            </NavLink>

            {/* Boutique */}
            <NavLink
              to="/products"
              className={({ isActive }) =>
                cn('text-xs font-bold uppercase tracking-widest transition-opacity',
                  isActive ? 'opacity-100 border-b border-white pb-0.5' : 'opacity-70 hover:opacity-100')
              }
            >
              Boutique
            </NavLink>

            {/* Catégories ▼ */}
            <div ref={catRef} className="relative">
              <button
                onClick={() => setCatsOpen((o) => !o)}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
              >
                Catégories
                <m.span
                  animate={{ rotate: catsOpen ? 180 : 0 }}
                  transition={{ duration: 0.18 }}
                  className="inline-block"
                >
                  <ChevronDown size={12} />
                </m.span>
              </button>

              <AnimatePresence>
                {catsOpen && (
                  <m.div
                    className="absolute top-full left-0 mt-2 w-52 bg-white text-black shadow-xl py-1 z-50"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={dropdownTransition}
                    style={{ originY: 'top' }}
                  >
                    <Link
                      to="/products"
                      onClick={closeAll}
                      className="flex items-center px-4 py-2.5 text-xs font-bold hover:bg-[#F5F5F5] transition-colors border-b border-[#EBEBEB] uppercase tracking-wider"
                    >
                      Toutes les catégories
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.slug}`}
                        onClick={closeAll}
                        className="flex items-center justify-between px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors"
                      >
                        <span>{cat.name}</span>
                        {cat.products_count !== undefined && (
                          <span className="text-[10px] text-muted">{cat.products_count}</span>
                        )}
                      </Link>
                    ))}
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            {/* Nouveautés */}
            <NavLink
              to="/products?sort=newest"
              className={({ isActive }) =>
                cn('text-xs font-bold uppercase tracking-widest transition-opacity',
                  isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100')
              }
            >
              Nouveautés
            </NavLink>

            {/* Promotions */}
            <NavLink
              to="/products?has_discount=1"
              className={({ isActive }) =>
                cn('text-xs font-bold uppercase tracking-widest transition-opacity',
                  isActive ? 'opacity-100 text-red-400' : 'opacity-70 hover:opacity-100 hover:text-red-400')
              }
            >
              Promotions
            </NavLink>
          </div>

          {/* ── Icônes droite ──────────────────────────────────────────── */}
          <div className="flex items-center gap-1">

            {/* Recherche */}
            <Link
              to="/search"
              className="p-2 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Rechercher"
            >
              <Search size={18} />
            </Link>

            {/* Favoris */}
            <Link
              to={isAuthenticated ? '/account/wishlist' : '/login'}
              className="p-2 relative opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Favoris"
            >
              <Heart size={18} />
              {wishCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {wishCount > 99 ? '99+' : wishCount}
                </span>
              )}
            </Link>

            {/* Panier */}
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

            {/* Avatar / compte — desktop */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-label="Mon compte"
                className="relative p-2 opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
              >
                <User size={18} />
                {isAuthenticated && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <m.div
                      className="absolute right-0 mt-2 w-56 bg-white text-black shadow-xl z-20 py-1"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={dropdownTransition}
                      style={{ originY: 'top' }}
                    >
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-3 border-b border-[#EBEBEB]">
                            <p className="text-[10px] text-muted uppercase tracking-wider mb-0.5">Bonjour</p>
                            <p className="text-xs font-black truncate">{user?.name}</p>
                          </div>
                          <Link to="/account/wishlist" onClick={closeAll}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors">
                            <Heart size={13} className="text-red-500" /> Favoris
                          </Link>
                          <Link to="/account" onClick={closeAll}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors">
                            <LayoutDashboard size={13} className="text-muted" /> Tableau de bord
                          </Link>
                          <Link to="/account/orders" onClick={closeAll}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors">
                            <ShoppingCart size={13} className="text-muted" /> Commandes
                          </Link>
                          <Link to="/account/addresses" onClick={closeAll}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors">
                            <MapPin size={13} className="text-muted" /> Adresses
                          </Link>
                          <Link to="/account/profile" onClick={closeAll}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors">
                            <UserCog size={13} className="text-muted" /> Détails du compte
                          </Link>
                          {isAdmin && (
                            <Link to="/admin" onClick={closeAll}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors">
                              <LayoutDashboard size={13} className="text-muted" /> Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-[#F5F5F5] transition-colors border-t border-[#EBEBEB] text-red-500"
                          >
                            <LogOut size={13} /> Se déconnecter
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-3 border-b border-[#EBEBEB]">
                            <p className="text-[10px] text-muted uppercase tracking-wider">Mon compte</p>
                          </div>
                          <Link to="/login" onClick={closeAll}
                            className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold hover:bg-[#F5F5F5] transition-colors">
                            <LogIn size={14} /> Se connecter
                          </Link>
                          <div className="px-4 pb-3">
                            <Link to="/register" onClick={closeAll}
                              className="flex items-center justify-center gap-2 w-full py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#222] transition-colors">
                              <UserPlus size={13} /> Créer un compte
                            </Link>
                          </div>
                        </>
                      )}
                    </m.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Hamburger mobile */}
            <button
              className="lg:hidden p-2 opacity-70 hover:opacity-100 transition-opacity ml-1"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Menu mobile ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <m.div
            className="lg:hidden bg-black border-t border-[#222] overflow-hidden"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            <div className="px-4 py-4 space-y-0.5">
              {/* Nav links */}
              {[
                { to: '/',                    label: 'Accueil',    end: true },
                { to: '/products',            label: 'Boutique',   end: false },
                { to: '/products?sort=newest',label: 'Nouveautés', end: false },
                { to: '/products?has_discount=1', label: 'Promotions', end: false },
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={closeAll}
                  className={({ isActive }) =>
                    cn('block py-2.5 text-xs font-bold uppercase tracking-widest border-b border-[#1A1A1A]',
                      isActive ? 'text-white' : 'text-white/70')
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Catégories mobile */}
              {categories.length > 0 && (
                <div className="pt-1 pb-2 border-b border-[#1A1A1A]">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest py-2">Catégories</p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      onClick={closeAll}
                      className="block py-1.5 text-xs text-white/70 hover:text-white pl-2"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Compte */}
              <div className="pt-2 space-y-0.5">
                {isAuthenticated ? (
                  <>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider py-1.5">
                      Bonjour, {user?.name}
                    </p>
                    <Link to="/account/wishlist" onClick={closeAll}
                      className="flex items-center gap-2 py-2 text-xs text-white/70">
                      <Heart size={13} className="text-red-400" /> Favoris
                      {wishCount > 0 && <span className="text-red-400 font-bold">({wishCount})</span>}
                    </Link>
                    <Link to="/account" onClick={closeAll}
                      className="flex items-center gap-2 py-2 text-xs text-white/70">
                      <LayoutDashboard size={13} /> Tableau de bord
                    </Link>
                    <Link to="/account/orders" onClick={closeAll}
                      className="flex items-center gap-2 py-2 text-xs text-white/70">
                      <ShoppingCart size={13} /> Commandes
                    </Link>
                    <Link to="/account/profile" onClick={closeAll}
                      className="flex items-center gap-2 py-2 text-xs text-white/70">
                      <UserCog size={13} /> Mon compte
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={closeAll}
                        className="flex items-center gap-2 py-2 text-xs text-white/70">
                        <LayoutDashboard size={13} /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 py-2 text-xs text-red-400 w-full text-left">
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
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
