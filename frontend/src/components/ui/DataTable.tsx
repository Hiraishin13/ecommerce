import type { ReactNode } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'
import Spinner from './Spinner'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
  emptyMessage?: string
  className?: string
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  sortKey,
  sortDir,
  onSort,
  emptyMessage = 'No data found.',
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-black">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-bold uppercase tracking-wider',
                  col.sortable && onSort && 'cursor-pointer select-none hover:text-muted',
                  col.className
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-16">
                <Spinner size="lg" className="mx-auto" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-16 text-muted text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-accent hover:bg-[#FAFAFA] transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.className)}>
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
