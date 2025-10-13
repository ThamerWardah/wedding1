import { Cairo, Great_Vibes } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
})

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-great-vibes',
})

export const metadata = {
  title: 'ليلة من العمر - دعوة زفاف',
  description: 'دعوة لحضور حفل زفافنا',
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="ar"
      dir="rtl"
    >
      <body className={`${cairo.variable} ${greatVibes.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
