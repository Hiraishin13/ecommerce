import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

// Wishlist is a UI-only placeholder — real implementation needs a wishlist service/store
export default function WishlistPage() {
  return (
    <div>
      <h1 className="text-xl font-black uppercase tracking-wider mb-6">Wishlist</h1>

      <div className="text-center py-20 border border-accent">
        <Heart size={40} className="mx-auto text-accent mb-4" />
        <p className="text-sm font-bold uppercase tracking-wider mb-2">Your wishlist is empty</p>
        <p className="text-xs text-muted mb-6">
          Save items you love to buy them later.
        </p>
        <Link to="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    </div>
  )
}
