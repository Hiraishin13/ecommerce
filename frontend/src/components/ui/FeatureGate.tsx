import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface Props {
  allowed: boolean
  feature?: string
  children: ReactNode
  /** If true, render children but overlaid with a lock. Default: render placeholder. */
  overlay?: boolean
}

export default function FeatureGate({ allowed, feature, children, overlay = false }: Props) {
  const navigate = useNavigate()

  if (allowed) return <>{children}</>

  if (overlay) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none opacity-30">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px]">
          <Lock size={20} className="text-muted mb-2" />
          <p className="text-xs font-bold uppercase tracking-wider text-muted text-center px-4">
            Upgrade your plan to unlock {feature ?? 'this feature'}
          </p>
          <button
            onClick={() => navigate('/admin/subscription')}
            className="mt-3 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-black text-white hover:bg-gray-800 transition-colors"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-accent bg-[#FAFAFA]">
      <Lock size={20} className="text-muted mb-3" />
      <p className="text-sm font-bold mb-1">Feature not available</p>
      <p className="text-xs text-muted mb-4">
        {feature ? `"${feature.replace(/_/g, ' ')}" is` : 'This feature is'} not included in your current plan.
      </p>
      <button
        onClick={() => navigate('/admin/subscription')}
        className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-black text-white hover:bg-gray-800 transition-colors"
      >
        View Plans
      </button>
    </div>
  )
}
