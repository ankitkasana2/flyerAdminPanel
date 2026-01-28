import Image from "next/image"
import { type Flyer, getRibbons } from "@/lib/flyer-data"
import { RibbonBadge } from "../liveFlyer/ribbon-badge"


interface FlyerCardProps {
  flyer: Flyer
}

export function FlyerCard({ flyer }: FlyerCardProps) {
  const ribbons = getRibbons(flyer)

  return (
    <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-card border border-border">
      {/* Ribbons Container */}
      <div className="absolute top-3 left-3 space-y-1.5 z-10">
        {ribbons.map((ribbon, idx) => (
          <RibbonBadge key={idx} text={ribbon.text} color={ribbon.color} size={ribbon.size} />
        ))}
      </div>

      {/* Flyer Image */}
      <div className="relative w-full h-48 overflow-hidden bg-muted">
        <Image
          src={flyer.image || "/placeholder.svg"}
          alt={flyer.title || "flyer"}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Flyer Info */}
      <div className="p-3 text-center border-t border-border">
        <p className="font-semibold text-sm text-foreground truncate">{flyer.title}</p>
        {flyer.fileNameOriginal && (
          <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">
            {flyer.fileNameOriginal}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">${flyer.price}</p>
        <p className="text-xs text-muted-foreground">{flyer.formType}</p>

        {/* Categories */}
        {flyer.categories && flyer.categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mt-2">
            {flyer.categories.slice(0, 3).map((cat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground"
              >
                {cat}
              </span>
            ))}
            {flyer.categories.length > 3 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                +{flyer.categories.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
