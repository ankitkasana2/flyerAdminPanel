"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Flyer } from "@/lib/flyer-data";
import { FlyerCard } from "./flyer-card";

interface CategorySectionProps {
  category: string;
  flyers: Flyer[];
  onEdit: (flyer: Flyer) => void;
  onDelete: (flyer: Flyer) => void;
}

export function CategorySection({
  category,
  flyers,
  onEdit,
  onDelete,
}: CategorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [displayFlyers, setDisplayFlyers] = useState<Flyer[]>(flyers);

  // ✅ Local image list for "All" category
  const LOCAL_IMAGES = [
    "/pic10.jpg",
    "/pic11.jpg",
    "/pic21.jpg",
    "/pic22.jpg",
    "/pic23.jpg",
    "/pic24.jpg",
    "/pic25.jpg",
    "/pic26.jpg",
    "/pic27.jpg",
    "/pic28.jpg",
    "/pic29.jpg",
    "/pic30.jpg",
    "/pic31.jpg",
    "/pic32.jpg",
    "/pic33.jpg",
    "/pic34.jpg",
    "/pic35.jpg",
    "/pic36.jpg",
    "/pic37.jpg",
    "/pic38.jpg",
    "/pic39.jpg",
    "/pic40.jpg",
    "/pic41.jpg",
  ];

  // ✅ Inject local demo flyers ONLY for the "All" category
  // useEffect(() => {
  //   if (category === "All") {
  //     const localFlyers: Flyer[] = LOCAL_IMAGES.map((img, i) => ({
  //       id: `local-${i}`,
  //       title: `Flyer ${i + 1}`,
  //       category: "All", // ✅ Required by Flyer interface
  //       price: 10,       // ✅ Must be one of: 10 | 15 | 40
  //       formType: "With Image",
  //       image: img,
  //       recentlyAdded: false, // ✅ Required by Flyer interface
  //     }));

  //     setDisplayFlyers(localFlyers);
  //   } else {
  //     setDisplayFlyers(flyers);
  //   }
  // }, [category, flyers]);

  useEffect(() => {
    if (category === "All") {
      const localFlyers: Flyer[] = LOCAL_IMAGES.map((img, i) => ({
        id: `local-${i}`,
        title: `Flyer ${i + 1}`,
        category: "All",
        categories: ["All"],
        price: 10,
        formType: "With Photo",
        image: img,
        recentlyAdded: false,
      }));

      // 👉 Always show local flyers for "All" category, even if no real flyers
      setDisplayFlyers(localFlyers);
    } else {
      setDisplayFlyers(flyers);
    }
  }, [category, flyers]);


  // Scroll logic
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (dir: "left" | "right") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: dir === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  if (displayFlyers.length === 0) return (
    <section className="space-y-6">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-black text-white tracking-tight">
            {category}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="h-1 w-12 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
            <p className="text-sm font-medium text-gray-400">
              0 flyers
            </p>
          </div>
        </div>
      </div>
      <div className="text-center py-12 text-gray-400">
        <p>No flyers available in this category</p>
      </div>
    </section>
  );

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-black text-white tracking-tight">
            {category}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="h-1 w-12 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
            <p className="text-sm font-medium text-gray-400">
              {displayFlyers.length} flyers
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Flyers */}
      <div className="relative group">
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-black/80 shadow-2xl rounded-full p-3 transition-all duration-300 transform hover:scale-110"
            title="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {displayFlyers.map((flyer) => (
            <div key={flyer.id} className="flex-shrink-0 w-52 sm:w-56 md:w-60">
              <FlyerCard flyer={flyer} onEdit={onEdit} onDelete={onDelete} />
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/60 hover:bg-black/80 shadow-2xl rounded-full p-3 transition-all duration-300 transform hover:scale-110"
            title="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        )}
      </div>
    </section>
  );
}
