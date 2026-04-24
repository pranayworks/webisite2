import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Command Center',
  description: 'Manage Green Legacy global configurations and field operations.',
  robots: 'noindex, nofollow', // Critical: Never index admin pages
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
