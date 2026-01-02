import './globals.css'
import { Oswald } from 'next/font/google'
// import ConditionalNavbar from './components/ConditionalNavbar'
import AuthProvider from './components/AuthProvider'
import { LanguageProvider } from './components/LanguageProvider'

// const oswald = Oswald({ subsets: ['latin'], weight: ['400','700'] })

export const metadata = {
  title: 'FLADVart',
  description: 'Creative Agency',
  icons: {
    icon: [
      { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-128x128.png', sizes: '128x128', type: 'image/png' }
    ],
    shortcut: '/icon-96x96.png',
    apple: '/icon-128x128.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body 
      // className={`${oswald.className} bg-[#0C0F1D] text-white`} 
      suppressHydrationWarning={true}>
        <AuthProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}