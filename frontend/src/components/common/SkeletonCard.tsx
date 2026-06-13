export default function SkeletonCard() {
  return (
    <div className="bg-white animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-[3/4] bg-accent" />
      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="h-3 bg-accent rounded w-1/3" />
        <div className="h-4 bg-accent rounded w-3/4" />
        <div className="h-3 bg-accent rounded w-1/2" />
        <div className="h-4 bg-accent rounded w-1/4" />
      </div>
    </div>
  )
}
