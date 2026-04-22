export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  priceDisplay: string
  features: string[]
  popular?: boolean
  badge?: string
  trees: number
  points: number
  mode: "payment" | "subscription"
  interval?: "month" | "quarter" | "year"
  is_csr?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: "sprout",
    name: "Sprout",
    description: "Perfect for individual impact",
    priceInCents: 29900,
    priceDisplay: "₹299",
    features: [
      "1 Tree planted",
      "Digital GPS certificate",
      "100 Green Points",
      "Email updates",
    ],
    trees: 1,
    points: 100,
    mode: "payment",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Most popular for gifting",
    priceInCents: 99900,
    priceDisplay: "₹999",
    features: [
      "5 Trees planted",
      "Planting video + photos",
      "Physical certificate",
      "600 Green Points",
      "Quarterly impact reports",
    ],
    popular: true,
    badge: "Most Popular",
    trees: 5,
    points: 600,
    mode: "payment",
  },
  {
    id: "legacy",
    name: "Legacy",
    description: "For those who dream big",
    priceInCents: 499900,
    priceDisplay: "₹4,999",
    features: [
      "25 Trees planted",
      "Site visit invitation",
      "Premium physical certificate",
      "3,500 Green Points",
      "Annual impact meeting",
    ],
    trees: 25,
    points: 3500,
    mode: "payment",
  },
]

export const SUBSCRIPTIONS: Product[] = [
  {
    id: "monthly-sapling",
    name: "Monthly Sapling",
    description: "Plant & Chill",
    priceInCents: 24900,
    priceDisplay: "₹249/mo",
    features: [
      "1 tree per month (12/year)",
      "Monthly digital certificate",
      "1,200 points/year",
      "Cancel anytime",
    ],
    badge: "Plant & Chill",
    trees: 12,
    points: 1200,
    mode: "subscription",
    interval: "month",
  },
  {
    id: "quarterly-grove",
    name: "Quarterly Grove",
    description: "Forest Builder",
    priceInCents: 69900,
    priceDisplay: "₹699/quarter",
    features: [
      "4 trees per quarter (16/year)",
      "Quarterly video updates",
      "3,000 points/year",
      "Personalized impact report",
    ],
    badge: "Forest Builder",
    trees: 16,
    points: 3000,
    mode: "subscription",
    interval: "quarter",
  },
  {
    id: "annual-forest",
    name: "Annual Forest",
    description: "Legacy Maker",
    priceInCents: 249900,
    priceDisplay: "₹2,499/year",
    features: [
      "30 trees per year",
      "Site visit invitation",
      "8,000 points/year",
      "Premium certificate bundle",
      "Personal impact webpage",
    ],
    popular: true,
    badge: "Best Value",
    trees: 30,
    points: 8000,
    mode: "subscription",
    interval: "year",
  },
]
