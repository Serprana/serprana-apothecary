import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Serprana Apothecary | Custom Herbal Teas & Remedies',
  description: 'Handcrafted herbal teas and bulk herbs. Custom blends for every body. Located inside Casa Venao Café, Playa Venao, Panama.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-cream-100">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
