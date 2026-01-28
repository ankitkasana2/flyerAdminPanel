export const CATEGORIES = [
  // Homepage carousels (first 11)
  "Recently Added",
  "Premium Flyers",
  "Basic Flyers",
  "DJ Image or Artist",
  "Ladies Night",
  "Brunch",
  "Summer",
  "Hookah Flyers",
  "Clean Flyers",
  "Drink Flyers",
  "Birthday Flyers",
  // Additional categories (rest of site & search)
  "Beach Party",
  "Pool Party",
  "Tropical",
  "Foam Party",
  "White Party",
  "All Black Party",
  "Halloween",
  "Winter",
  "Christmas",
  "Memorial Day",
  "Back to School",
  "President Day",
  "Saint Valentine's Day",
  "5 de Mayo",
  "Mexican Day",
  "4th of July",
  "Autumn / Fall Vibes",
  "Hip Hop Flyers",
  "Luxury Flyers",
  "Food Flyers",
  "Party Flyers",
]

export interface Flyer {
  id: string
  title: string
  categories: string[] // Changed from single category to array
  category?: string // Kept for backward compatibility if needed, but making optional or we can keep it as primary
  price: 10 | 15 | 40
  formType: "With Photo" | "Only Info" | "Birthday"
  image: string
  recentlyAdded: boolean
  fileNameOriginal?: string
}

// Generate demo flyers - 4 per category
export function generateDemoFlyers(): Flyer[] {
  const flyers: Flyer[] = []
  let id = 1

  const demoImages = [
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



  ]

  CATEGORIES.forEach((category) => {
    const prices: (10 | 15 | 40)[] = [10, 15, 40, 10]
    const formTypes: ("With Photo" | "Only Info" | "Birthday")[] = [
      "With Photo",
      "Only Info",
      "With Photo",
      "With Photo",
    ]

    for (let i = 0; i < 4; i++) {
      flyers.push({
        id: `flyer-${id}`,
        title: `${category} Flyer ${i + 1}`,
        category,
        categories: [category], // Populate array
        price: prices[i],
        formType: formTypes[i],
        image: demoImages[i % demoImages.length],
        recentlyAdded: i < 2,
      })
      id++
    }
  })

  return flyers
}

export function getRibbons(flyer: Flyer): Array<{ text: string; color: "gold" | "red"; size: "sm" | "md" }> {
  const ribbons: Array<{ text: string; color: "gold" | "red"; size: "sm" | "md" }> = []

  // Premium ribbon has priority - appears first (top)
  if (flyer.price === 40) {
    ribbons.push({ text: "PREMIUM", color: "gold", size: "md" })
  }

  // Photo ribbon appears below premium (if exists) or alone
  if (flyer.formType === "With Photo") {
    ribbons.push({ text: "PHOTO", color: "red", size: flyer.price === 40 ? "sm" : "md" })
  }

  return ribbons
}
