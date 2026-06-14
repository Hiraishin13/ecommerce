import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, Send, ShieldCheck, CreditCard, Smartphone } from 'lucide-react'
import toast from 'react-hot-toast'

const SHOP_LINKS = [
  { to: '/products',           label: 'Shop' },
  { to: '/products?category=', label: 'Collections' },
  { to: '/products?has_discount=1', label: 'En promotion' },
]

const HELP_LINKS = [
  { to: '/retours',    label: 'Retours & Échanges' },
  { to: '/privacy',   label: 'Politique de confidentialité' },
  { to: '/terms',     label: 'Termes & Conditions' },
]

const ABOUT_LINKS = [
  { to: '/notre-histoire', label: 'Notre histoire' },
  { to: '/contact',        label: 'Contact' },
  { to: '/magasin',        label: 'Localisateur de magasin' },
]

// SVG icons for social networks not in lucide-react
function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
    </svg>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    toast.success('Merci ! Vous êtes inscrit.')
    setEmail('')
  }

  return (
    <footer className="bg-[#0A0A0A] text-white mt-auto">

      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand + contact + social */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <p className="text-2xl font-black uppercase tracking-[0.25em] mb-1">AMF</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Africa · Mode · Fashion</p>
            </div>

            <div className="space-y-2.5 text-xs text-white/55">
              <div className="flex items-start gap-2.5">
                <MapPin size={13} className="flex-shrink-0 mt-0.5 text-white/30" />
                <span className="leading-relaxed">
                  Kinshasa Gombe, Avenue Colonel Lukusa<br />
                  Le Premier Mall, 1<sup>er</sup> niveau
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={13} className="flex-shrink-0 text-white/30" />
                <a href="mailto:retail@amf-africa.com" className="hover:text-white transition-colors">
                  retail@amf-africa.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={13} className="flex-shrink-0 text-white/30" />
                <a href="tel:+243900000929" className="hover:text-white transition-colors">
                  +243 900 000 929
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/amf_africa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-8 h-8 border border-[#2a2a2a] flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-colors"
              >
                <XIcon size={14} />
              </a>
              <a
                href="https://tiktok.com/@amf_africa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 border border-[#2a2a2a] flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-colors"
              >
                <TikTokIcon size={14} />
              </a>
            </div>
          </div>

          {/* Boutique */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.18em] mb-5 text-white/80">Boutique</h4>
            <ul className="space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-xs text-white/50 hover:text-white transition-colors uppercase tracking-wider">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.18em] mb-5 text-white/80">Aide</h4>
            <ul className="space-y-3">
              {HELP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-xs text-white/50 hover:text-white transition-colors uppercase tracking-wider">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.18em] mb-5 text-white/80">À propos de nous</h4>
            <ul className="space-y-3">
              {ABOUT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-xs text-white/50 hover:text-white transition-colors uppercase tracking-wider">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Newsletter ── */}
        <div className="mt-12 border-t border-[#1a1a1a] pt-10">
          <div className="max-w-md">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/80 mb-1">
              Recevoir des informations par e-mail
            </p>
            <p className="text-xs text-white/40 mb-4">
              Offres exclusives, nouveautés et actualités AMF directement dans votre boîte.
            </p>
            <form onSubmit={handleNewsletter} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse mail"
                required
                className="flex-1 bg-[#141414] border border-[#2a2a2a] px-4 py-3 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-white text-black flex items-center gap-1.5 hover:bg-white/90 transition-colors flex-shrink-0"
                aria-label="S'inscrire"
              >
                <Send size={13} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">OK</span>
              </button>
            </form>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 pt-6 border-t border-[#1a1a1a] flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">
            &copy; Copyright {year} AMF Africa. Tous droits réservés.
          </p>

          {/* Paiements sécurisés */}
          <div className="flex items-center gap-3">
            <ShieldCheck size={13} className="text-white/30" />
            <span className="text-[10px] text-white/30 uppercase tracking-widest mr-3">Paiements sécurisés</span>
            {[
              { icon: CreditCard, label: 'Visa / Mastercard' },
              { icon: Smartphone, label: 'Mobile Money' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                title={label}
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#2a2a2a] text-white/40"
              >
                <Icon size={11} />
                <span className="text-[9px] uppercase tracking-wider hidden sm:inline">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
