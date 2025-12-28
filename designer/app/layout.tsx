import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ayu Palette Designer',
  description: 'Design and preview ayu color schemes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
