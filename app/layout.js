import { AuthProvider } from '@/lib/authContext'
import './globals.css'

export const metadata = {
  title: 'Training App',
  description: 'Strength training workout tracker',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
