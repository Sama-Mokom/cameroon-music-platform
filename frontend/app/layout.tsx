import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AudioPlayerLayout } from '@/components/audio/AudioPlayerLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cameroon Music Industry Platform',
  description: 'Connect, Create, and Celebrate Cameroonian Music',
  icons: {
    icon: '/logo-removebg-preview.png',
    shortcut: '/logo-removebg-preview.png',
    apple: '/logo-removebg-preview.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-removebg-preview.png" type="image/jpeg" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <AudioPlayerLayout />
        </Providers>
      </body>
    </html>
  )
}
