import { cn } from '../../utils/cn'

type BadgeVariant = 'NEW' | 'SALE' | 'OUT_OF_STOCK' | 'custom'
type BadgeColor = 'black' | 'red' | 'gray' | 'green' | 'orange'

interface BadgeProps {
  variant?: BadgeVariant
  color?: BadgeColor
  label?: string
  className?: string
}

const variantLabels: Partial<Record<BadgeVariant, string>> = {
  NEW: 'NEW',
  SALE: 'SALE',
  OUT_OF_STOCK: 'OUT OF STOCK',
}

const colorClasses: Record<BadgeColor, string> = {
  black: 'bg-black text-white',
  red: 'bg-[#D32F2F] text-white',
  gray: 'bg-[#E0E0E0] text-[#1A1A1A]',
  green: 'bg-[#388E3C] text-white',
  orange: 'bg-[#F57C00] text-white',
}

const defaultColors: Partial<Record<BadgeVariant, BadgeColor>> = {
  NEW: 'black',
  SALE: 'red',
  OUT_OF_STOCK: 'gray',
}

export default function Badge({ variant = 'custom', color, label, className }: BadgeProps) {
  const resolvedColor = color || defaultColors[variant] || 'black'
  const resolvedLabel = label || variantLabels[variant] || ''

  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5',
        'text-xs font-bold uppercase tracking-widest',
        colorClasses[resolvedColor],
        className
      )}
    >
      {resolvedLabel}
    </span>
  )
}
