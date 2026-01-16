"use client"

export default function FlyerImage({ flyer }) {
  const isPremium = flyer.price === "$40"
  const hasPhoto = flyer.formType === "With Photo"

  return (
    <div className="w-24 h-32 relative">
      {isPremium && (
        <div className="absolute z-30 top-4 left-0 rotate-[-40deg]">
          <div className="px-2 py-[3px] text-[11px] bg-yellow-400 rounded-sm font-bold">
            Premium
          </div>
        </div>
      )}

      {hasPhoto && (
        <div className="absolute z-20 top-2 left-[-12px] rotate-[-37deg]">
          <img src="/rib.png" className="w-[22px] h-[22px]" />
        </div>
      )}

      <img
        src={flyer.preview || "/event-flyer.png"}
        className="w-full h-full object-cover rounded border border-[#333]"
      />
    </div>
  )
}
