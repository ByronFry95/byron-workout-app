'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import './login.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, signup, resetPassword } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('mode') === 'register') setIsLogin(false)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(email, password)
      }
      router.push('/workouts')
    } catch (err) {
      const messages = {
        'auth/invalid-credential': 'Email or password is incorrect.',
        'auth/wrong-password': 'Email or password is incorrect.',
        'auth/user-not-found': 'Email or password is incorrect.',
        'auth/email-already-in-use': 'An account already exists for this email.',
        'auth/weak-password': 'Choose a stronger password.',
        'auth/invalid-email': 'Enter a valid email address.',
      }
      setError(messages[err.code] || 'Unable to authenticate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Enter your email address first.')
      return
    }
    try {
      await resetPassword(email)
      setError('Password reset email sent.')
    } catch (err) {
      setError(err.code === 'auth/user-not-found' ? 'No account was found for that email.' : 'Unable to send the reset email.')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Byron Workout</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
          {isLogin && <button type="button" onClick={handlePasswordReset} className="forgot-btn">Forgot password?</button>}
        </form>

        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="toggle-btn"
        >
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  )
}
