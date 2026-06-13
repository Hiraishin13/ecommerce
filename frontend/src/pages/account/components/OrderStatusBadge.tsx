import type { OrderStatus } from '../../../services/order.service'
import { cn } from '../../../utils/cn'

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-[#F57C00] text-white' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-600 text-white' },
  processing: { label: 'Processing', color: 'bg-blue-800 text-white' },
  shipped: { label: 'Shipped', color: 'bg-[#1A1A1A] text-white' },
  delivered: { label: 'Delivered', color: 'bg-[#388E3C] text-white' },
  cancelled: { label: 'Cancelled', color: 'bg-[#D32F2F] text-white' },
}

interface Props {
  status: OrderStatus
  className?: string
}

export default function OrderStatusBadge({ status, className }: Props) {
  const config = statusConfig[status] || { label: status, color: 'bg-accent text-black' }
  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}
