'use client'
import { Space_Grotesk } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import "bootstrap/dist/css/bootstrap.min.css";
import 'aos/dist/aos.css';
import "/public/style/swiper/swiper-bundle.min.css"
import "/public/assets/font/font-awesome.css"
import "/public/assets/font/risebot.css"
import "/public/assets/font/font-awesome.css"
import "/public/style/dist/app.css"
import { Toaster } from 'react-hot-toast'

const grotesk = Space_Grotesk({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
    variable: "--grotesk",
    display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${grotesk.variable} header-fixed page-loaded`}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
