import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stewardship Dashboard',
  description: 'View your live biological assets, GPS data, and download your stewardship certificates.',
  robots: 'noindex, nofollow', // Block search engines from crawling secure user accounts
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
