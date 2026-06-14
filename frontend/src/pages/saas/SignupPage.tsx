import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { m } from 'framer-motion'
import toast from 'react-hot-toast'
import { Check, ChevronRight } from 'lucide-react'
import { stagger, staggerItem } from '../../utils/motion'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { useDebounce } from '../../hooks/useDebounce'

interface Plan {
  id: number
  name: string
  slug: string
  price_monthly: number
  limits: { products_max: number; users_max: number }
  features: { pos: boolean; analytics: boolean; marketing: boolean; ai: boolean }
}

const SECTORS = [
  { value: 'mode',        label: 'Mode & Vêtements' },
  { value: 'electronique',label: 'Électronique' },
  { value: 'pharmacie',   label: 'Pharmacie' },
  { value: 'restaurant',  label: 'Restaurant' },
  { value: 'autre',       label: 'Autre' },
]

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function SignupPage() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.setAuth)

  const [step, setStep]       = useState(1)
  const [plans, setPlans]     = useState<Plan[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Step 1 — Shop info
  const [shopName, setShopName] = useState('')
  const [shopSlug, setShopSlug] = useState('')
  const [sector, setSector]     = useState('autre')
  const [slugManual, setSlugManual] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const debouncedSlug = useDebounce(shopSlug, 500)

  // Step 2 — Plan
  const [planId, setPlanId] = useState<number | null>(null)

  // Step 3 — Owner
  const [ownerName, setOwnerName]   = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')

  useEffect(() => {
    api.get('/saas/plans').then((r) => {
      const list: Plan[] = r.data.plans ?? []
      setPlans(list)
      if (list.length) setPlanId(list[0].id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!slugManual && shopName) {
      setShopSlug(slugify(shopName))
    }
  }, [shopName, slugManual])

  useEffect(() => {
    if (!debouncedSlug || debouncedSlug.length < 2) { setSlugAvailable(null); return }
    api.get(`/saas/tenants/${debouncedSlug}/check`)
      .then((r) => setSlugAvailable(r.data.available))
      .catch(() => setSlugAvailable(null))
  }, [debouncedSlug])

  const handleSubmit = async () => {
    if (!shopName || !shopSlug || !ownerName || !email || !password) {
      toast.error('Tous les champs sont requis.')
      return
    }
    if (slugAvailable === false) {
      toast.error('Cette URL est déjà prise.')
      return
    }
    setSubmitting(true)
    try {
      const r = await api.post('/saas/tenants', {
        shop_name: shopName,
        shop_slug: shopSlug,
        sector,
        plan_id: planId,
        owner_name: ownerName,
        email,
        password,
      })
      setAuth(r.data.user, r.data.access_token, r.data.tenant)
      toast.success('Boutique créée avec succès !')
      navigate('/admin')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de la création.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
      <m.div
        className="w-full max-w-lg"
        variants={stagger(0.06)}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <m.div variants={staggerItem} className="text-center mb-10">
          <p className="text-2xl font-black uppercase tracking-[0.2em] mb-1">AMF SaaS</p>
          <p className="text-sm text-muted">Créez votre boutique en ligne en 2 minutes</p>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-8 h-1 transition-colors ${s <= step ? 'bg-black' : 'bg-accent'}`} />
            ))}
          </div>
        </m.div>

        {/* Step 1 — Shop Info */}
        {step === 1 && (
          <m.div variants={staggerItem} className="bg-white border border-accent p-8 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider mb-4">Votre boutique</h2>
            <Input
              label="Nom de la boutique"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Ma Super Boutique"
            />
            <div>
              <Input
                label="URL de la boutique"
                value={shopSlug}
                onChange={(e) => { setShopSlug(slugify(e.target.value)); setSlugManual(true) }}
                placeholder="ma-super-boutique"
              />
              {shopSlug && slugAvailable !== null && (
                <p className={`text-xs mt-1 ${slugAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {slugAvailable ? '✓ URL disponible' : '✗ URL déjà prise'}
                </p>
              )}
              {shopSlug && <p className="text-xs text-muted mt-1">{shopSlug}.amf-africa.com</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Secteur</label>
              <select
                className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              >
                {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <Button fullWidth onClick={() => setStep(2)} disabled={!shopName || !shopSlug || slugAvailable === false}>
              Continuer <ChevronRight size={14} />
            </Button>
          </m.div>
        )}

        {/* Step 2 — Plan */}
        {step === 2 && (
          <m.div variants={staggerItem} className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider mb-4">Choisissez votre plan</h2>
            {plans.map((p) => (
              <div
                key={p.id}
                onClick={() => setPlanId(p.id)}
                className={`bg-white border-2 p-6 cursor-pointer transition-colors ${planId === p.id ? 'border-black' : 'border-accent hover:border-black/30'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-black uppercase tracking-wider">{p.name}</p>
                  {planId === p.id && <Check size={16} />}
                </div>
                <p className="text-xl font-black">
                  {p.price_monthly === 0 ? 'Gratuit' : `$${p.price_monthly}/mois`}
                </p>
                <div className="flex gap-3 mt-3 flex-wrap">
                  <span className="text-xs text-muted">{p.limits.products_max === -1 ? '∞ produits' : `${p.limits.products_max} produits`}</span>
                  {p.features.pos   && <span className="text-xs font-bold text-green-600">POS</span>}
                  {p.features.analytics && <span className="text-xs font-bold text-blue-600">Analytics</span>}
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>Retour</Button>
              <Button fullWidth onClick={() => setStep(3)}>Continuer <ChevronRight size={14} /></Button>
            </div>
          </m.div>
        )}

        {/* Step 3 — Owner */}
        {step === 3 && (
          <m.div variants={staggerItem} className="bg-white border border-accent p-8 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider mb-4">Votre compte administrateur</h2>
            <Input label="Nom complet" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Jean Dupont" />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean@exemple.com" />
            <Input label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="8+ caractères" />
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(2)}>Retour</Button>
              <Button fullWidth onClick={handleSubmit} loading={submitting}>
                Créer ma boutique
              </Button>
            </div>
          </m.div>
        )}
      </m.div>
    </div>
  )
}
