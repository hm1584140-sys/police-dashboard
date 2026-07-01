import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cairo, Tajawal, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AdminProvider } from '@/lib/admin-context'
import { SectorProvider } from '@/lib/sector-context'

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800', '900'],
})
const tajawal = Tajawal({
  variable: '--font-tajawal',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
export const metadata: Metadata = {
  title: 'بوابة عمليات جهاز الشرطة | SOPs & Operations Portal',
  description:
    'لوحة تحكم متكاملة لجهاز الشرطة - كتيب البروتوكولات، هياكل القطاعات، شارات الخدمة، كتيب الجزاءات والمخالفات المرورية',
  generator: 'v0.app',
}
export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0e1a',
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${tajawal.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <AdminProvider>
          <SectorProvider>
            {children}
          </SectorProvider>
        </AdminProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}