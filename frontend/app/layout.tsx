import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AudioPlayerLayout } from '@/components/audio/AudioPlayerLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cameroon Music Industry Platform',
  description: 'Connect, Create, and Celebrate Cameroonian Music',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <AudioPlayerLayout />
        </Providers>
      </body>
    </html>
  )
}
