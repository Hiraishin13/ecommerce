import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-xs', className)}>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          {idx > 0 && <ChevronRight size={12} className="text-muted flex-shrink-0" />}
          {item.href && idx < items.length - 1 ? (
            <Link
              to={item.href}
              className="text-muted uppercase tracking-wider hover:text-black transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-black uppercase tracking-wider font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
