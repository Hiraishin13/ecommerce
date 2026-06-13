import { cn } from '../../utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'black' | 'white'
  className?: string
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
}

const colorMap = {
  black: 'border-black border-t-transparent',
  white: 'border-white border-t-transparent',
}

export default function Spinner({ size = 'md', color = 'black', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block rounded-full animate-spin',
        sizeMap[size],
        colorMap[color],
        className
      )}
    />
  )
}
