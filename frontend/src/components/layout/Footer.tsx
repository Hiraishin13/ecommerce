import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="text-xl font-black uppercase tracking-[0.2em] mb-3">SHOP</p>
            <p className="text-xs text-white/60 leading-relaxed">
              Premium products, minimal design. Quality that speaks for itself.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white/80">Shop</h4>
            <ul className="space-y-2">
              {[
                { to: '/products', label: 'All Products' },
                { to: '/search', label: 'Search' },
                { to: '/cart', label: 'Cart' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs text-white/60 hover:text-white transition-colors uppercase tracking-wider"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white/80">Account</h4>
            <ul className="space-y-2">
              {[
                { to: '/login', label: 'Login' },
                { to: '/register', label: 'Register' },
                { to: '/account', label: 'My Account' },
                { to: '/account/orders', label: 'Orders' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs text-white/60 hover:text-white transition-colors uppercase tracking-wider"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white/80">Info</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'About Us' },
                { to: '/', label: 'Contact' },
                { to: '/', label: 'Privacy Policy' },
                { to: '/', label: 'Terms & Conditions' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="text-xs text-white/60 hover:text-white transition-colors uppercase tracking-wider"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#222] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 uppercase tracking-wider">
            &copy; {year} SHOP. All rights reserved.
          </p>
          <p className="text-xs text-white/40 uppercase tracking-wider">
            Made with precision.
          </p>
        </div>
      </div>
    </footer>
  )
}
