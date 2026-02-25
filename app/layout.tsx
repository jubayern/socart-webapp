import type { Metadata } from 'next'
import './globals.css'
import InitUser from '../components/InitUser'

export const metadata: Metadata = {
  title: 'SoCart',
  description: 'Best products, best prices.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body>
        <InitUser />
        {children}
      </body>
    </html>
  )
}
