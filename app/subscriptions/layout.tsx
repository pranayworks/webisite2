import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing & Plans',
  description: 'Select your stewardship plan and begin generating real-world environmental impact. Both One-time and B2B Subscriptions available.',
}

export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
