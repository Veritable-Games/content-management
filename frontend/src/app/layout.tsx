import './globals.css'
import type { Metadata } from 'next'
import MainLayout from '@/components/layouts/MainLayout'

export const metadata: Metadata = {
  title: {
    template: '%s | Veritable Games',
    default: 'Veritable Games',
  },
  description: 'Creating memorable gaming experiences',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-background text-foreground">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
