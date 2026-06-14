import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { m } from 'framer-motion'
import { stagger, staggerItem } from '../../utils/motion'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const SECTORS = [
  { value: 'mode',         label: 'Mode & Vêtements' },
  { value: 'electronique', label: 'Électronique' },
  { value: 'pharmacie',    label: 'Pharmacie' },
  { value: 'restaurant',   label: 'Restaurant' },
  { value: 'beaute',       label: 'Beauté & Cosmétique' },
  { value: 'maison',       label: 'Maison & Décoration' },
  { value: 'sport',        label: 'Sport & Loisirs' },
  { value: 'autre',        label: 'Autre' },
]

interface Branding {
  primary_color?: string
  secondary_color?: string
  font_heading?: string
  font_body?: string
  logo_url?: string
  favicon_url?: string
}

interface SocialLinks {
  facebook?: string
  instagram?: string
  twitter?: string
  tiktok?: string
  whatsapp?: string
}

interface Settings {
  currency?: string
  language?: string
  timezone?: string
  social?: SocialLinks
  seo_title?: string
  seo_description?: string
}

export default function AdminSettingsPage() {
  const { tenant, setTenant } = useAuthStore()
  const [tab, setTab] = useState<'general' | 'branding' | 'social' | 'seo'>('general')

  // General
  const [name, setName]     = useState('')
  const [sector, setSector] = useState('autre')
  const [domain, setDomain] = useState('')

  // Branding
  const [branding, setBranding] = useState<Branding>({
    primary_color:   '#000000',
    secondary_color: '#ffffff',
    font_heading:    'Inter',
    font_body:       'Inter',
    logo_url:        '',
    favicon_url:     '',
  })

  // Settings (social + SEO + config)
  const [settings, setSettings] = useState<Settings>({
    currency: 'USD',
    language: 'fr',
    timezone: 'Africa/Kinshasa',
    social:   {},
    seo_title: '',
    seo_description: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    api.get('/admin/settings')
      .then((r) => {
        const t = r.data.tenant
        setName(t.name ?? '')
        setSector(t.sector ?? 'autre')
        setDomain(t.domain ?? '')
        if (t.branding) setBranding({ ...branding, ...t.branding })
        if (t.settings) setSettings({ ...settings, ...t.settings })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const r = await api.patch('/admin/settings', { name, sector, domain, branding, settings })
      const updated = r.data.tenant
      if (tenant) {
        setTenant({ ...tenant, name: updated.name, sector: updated.sector, branding: updated.branding })
      }
      toast.success('Paramètres sauvegardés')
    } catch { toast.error('Erreur lors de la sauvegarde') }
    finally { setSaving(false) }
  }

  if (loading) return <p className="text-muted text-xs">Chargement...</p>

  return (
    <m.div variants={stagger(0.05)} initial="hidden" animate="visible" className="max-w-2xl">
      <m.h1 variants={staggerItem} className="text-xl font-black uppercase tracking-wider mb-6">
        Paramètres de la boutique
      </m.h1>

      {/* Tabs */}
      <m.div variants={staggerItem} className="flex gap-0 border-b border-accent mb-6">
        {(['general', 'branding', 'social', 'seo'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-black text-black' : 'border-transparent text-muted hover:text-black'
            }`}
          >
            {t}
          </button>
        ))}
      </m.div>

      <m.div variants={staggerItem} className="bg-white border border-accent p-6 space-y-5">
        {tab === 'general' && (
          <>
            <Input label="Nom de la boutique" value={name} onChange={(e) => setName(e.target.value)} />

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

            <Input
              label="Domaine personnalisé (ex: monshop.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="monshop.com"
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Devise</label>
              <select
                className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
                value={settings.currency}
                onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
              >
                {['USD','EUR','CDF','XAF','XOF','GBP'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Langue</label>
              <select
                className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
                value={settings.language}
                onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value }))}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ln">Lingala</option>
                <option value="sw">Swahili</option>
              </select>
            </div>
          </>
        )}

        {tab === 'branding' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Couleur principale</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.primary_color}
                    onChange={(e) => setBranding((b) => ({ ...b, primary_color: e.target.value }))}
                    className="w-10 h-10 border border-accent cursor-pointer"
                  />
                  <span className="text-sm font-mono">{branding.primary_color}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Couleur secondaire</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.secondary_color}
                    onChange={(e) => setBranding((b) => ({ ...b, secondary_color: e.target.value }))}
                    className="w-10 h-10 border border-accent cursor-pointer"
                  />
                  <span className="text-sm font-mono">{branding.secondary_color}</span>
                </div>
              </div>
            </div>

            <Input
              label="URL du logo"
              value={branding.logo_url ?? ''}
              onChange={(e) => setBranding((b) => ({ ...b, logo_url: e.target.value }))}
              placeholder="https://..."
            />

            <Input
              label="URL du favicon"
              value={branding.favicon_url ?? ''}
              onChange={(e) => setBranding((b) => ({ ...b, favicon_url: e.target.value }))}
              placeholder="https://..."
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Police titre</label>
              <select
                className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
                value={branding.font_heading}
                onChange={(e) => setBranding((b) => ({ ...b, font_heading: e.target.value }))}
              >
                {['Inter','Poppins','Montserrat','Playfair Display','Oswald','Raleway'].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Police corps</label>
              <select
                className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
                value={branding.font_body}
                onChange={(e) => setBranding((b) => ({ ...b, font_body: e.target.value }))}
              >
                {['Inter','Poppins','Open Sans','Lato','Nunito','Roboto'].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {tab === 'social' && (
          <>
            {(['facebook','instagram','twitter','tiktok','whatsapp'] as const).map((platform) => (
              <Input
                key={platform}
                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                value={settings.social?.[platform] ?? ''}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    social: { ...(s.social ?? {}), [platform]: e.target.value },
                  }))
                }
                placeholder={`https://${platform}.com/votre-page`}
              />
            ))}
          </>
        )}

        {tab === 'seo' && (
          <>
            <Input
              label="Titre SEO"
              value={settings.seo_title ?? ''}
              onChange={(e) => setSettings((s) => ({ ...s, seo_title: e.target.value }))}
              placeholder="Ma boutique en ligne"
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Description SEO</label>
              <textarea
                value={settings.seo_description ?? ''}
                onChange={(e) => setSettings((s) => ({ ...s, seo_description: e.target.value }))}
                placeholder="Description de votre boutique pour les moteurs de recherche..."
                rows={4}
                className="w-full border border-accent px-4 py-3 text-sm focus:outline-none focus:border-black resize-none"
              />
              <p className="text-[10px] text-muted mt-1">{(settings.seo_description ?? '').length}/160 caractères recommandés</p>
            </div>
          </>
        )}

        <Button onClick={handleSave} loading={saving}>Sauvegarder</Button>
      </m.div>
    </m.div>
  )
}
