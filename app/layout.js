import { AuthProvider } from '@/lib/authContext'
import { WorkoutSessionProvider } from '@/lib/workoutSessionContext'
import GlobalSessionBar from '@/components/GlobalSessionBar'
import NavShell from '@/components/NavShell'
import ViewportManager from '@/components/ViewportManager'
import './globals.css'

export const metadata = {
  title: 'Training App',
  description: 'Strength training workout tracker',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#ec3013',
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <WorkoutSessionProvider>
            <ViewportManager />
            <NavShell>{children}</NavShell>
            <GlobalSessionBar />
          </WorkoutSessionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
