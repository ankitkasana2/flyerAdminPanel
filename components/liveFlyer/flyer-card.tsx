"use client";

import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { type Flyer } from "@/lib/flyer-data";

interface FlyerCardProps {
  flyer: Flyer;
  onEdit: (flyer: Flyer) => void;
  onDelete: (flyer: Flyer) => void;
}

export function FlyerCard({ flyer, onEdit, onDelete }: FlyerCardProps) {
  return (
    <div className="h-full flex flex-col relative group overflow-hidden rounded-xl bg-black/90 border border-neutral-800 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-red-900/30">
      {/* Image */}
      <div className="relative w-full aspect-[4/5]">
        <Image
          src={flyer.image || "/placeholder.svg"}
          alt={flyer.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        {/* Hover Buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={() => onEdit(flyer)}
            className="p-2 bg-black text-white rounded-full hover:bg-red-600 transition-colors duration-200"
            title="Edit Flyer"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(flyer)}
            className="p-2 bg-black text-white rounded-full hover:bg-red-600 transition-colors duration-200"
            title="Delete Flyer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 flex flex-col bg-gradient-to-t from-black to-transparent px-4 py-3 text-center">
        <p className="font-semibold text-white text-sm truncate">
          {flyer.title}
        </p>
        <div className="flex justify-center items-center gap-3 mt-2 text-xs text-gray-300">
          <span className="px-3 py-1 rounded-full bg-red-600/80 text-white font-medium shadow">
            {/* $ */}
            {String(flyer.price || "0")}
          </span>
          <span className="px-3 py-1 rounded-full bg-neutral-800/80 text-white/80 font-medium">
            {flyer.formType}
          </span>
        </div>

        {/* Categories */}
        {flyer.categories && flyer.categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-auto pt-3">
            {flyer.categories.map((cat, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-900/60 text-gray-400 border border-neutral-800 backdrop-blur-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
