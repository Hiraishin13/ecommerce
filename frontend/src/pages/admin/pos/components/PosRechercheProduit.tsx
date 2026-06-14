import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, Plus, Loader2 } from 'lucide-react'
import { posService, type ProduitCaisse } from '../../../../services/pos.service'
import { useDebounce } from '../../../../hooks/useDebounce'
import { formatCDF } from '../../../../utils/formatCDF'

interface Props {
  onSelectProduit: (produit: ProduitCaisse) => void
}

function parseImages(raw: string | null): string | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed[0] ?? null : null
  } catch {
    return raw.startsWith('http') ? raw : null
  }
}

export default function PosRechercheProduit({ onSelectProduit }: Props) {
  const [query, setQuery]       = useState('')
  const [produits, setProduits] = useState<ProduitCaisse[]>([])
  const [loading, setLoading]   = useState(false)
  const [ouvert, setOuvert]     = useState(false)
  const inputRef                = useRef<HTMLInputElement>(null)
  const debouncedQuery          = useDebounce(query, 250)

  // Raccourci clavier : F2 ou Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2' || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const rechercher = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setProduits([])
      setOuvert(false)
      return
    }
    setLoading(true)
    try {
      const res = await posService.rechercherProduits(q)
      setProduits(res)
      setOuvert(true)
    } catch {
      setProduits([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { rechercher(debouncedQuery) }, [debouncedQuery, rechercher])

  const selectionner = (produit: ProduitCaisse) => {
    onSelectProduit(produit)
    setQuery('')
    setProduits([])
    setOuvert(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      {/* Champ de recherche */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { setQuery(''); setOuvert(false) }
          }}
          placeholder="Rechercher un produit… (F2)"
          className="w-full pl-9 pr-10 py-2.5 border border-accent text-sm focus:outline-none focus:border-black bg-white"
          autoComplete="off"
        />
        {loading && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted animate-spin" />
        )}
      </div>

      {/* Liste de résultats */}
      {ouvert && produits.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-accent shadow-lg max-h-72 overflow-y-auto">
          {produits.map((p) => {
            const img = parseImages(p.images)
            return (
              <button
                key={p.id}
                onClick={() => selectionner(p)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#FAFAFA] text-left transition-colors border-b border-accent last:border-b-0"
              >
                {/* Miniature */}
                <div className="w-9 h-9 bg-accent flex-shrink-0">
                  {img && (
                    <img src={img} alt={p.name} className="w-full h-full object-cover" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{p.name}</p>
                  {p.sku && (
                    <p className="text-[10px] text-muted">{p.sku}</p>
                  )}
                </div>
                {/* Prix + stock */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black">{formatCDF(p.price)}</p>
                  <p className={`text-[10px] ${p.stock <= 0 ? 'text-red-500' : 'text-muted'}`}>
                    {p.a_des_variantes ? 'variantes' : `stock: ${p.stock}`}
                  </p>
                </div>
                <Plus size={14} className="text-muted flex-shrink-0" />
              </button>
            )
          })}
        </div>
      )}

      {ouvert && query && produits.length === 0 && !loading && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-accent p-3 text-xs text-muted text-center">
          Aucun produit trouvé pour « {query} »
        </div>
      )}
    </div>
  )
}
