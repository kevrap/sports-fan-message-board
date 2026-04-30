import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function switchTab(t) {
    setTab(t)
    setError('')
    setEmail('')
    setPassword('')
    setConfirm('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) return

    if (tab === 'signup') {
      if (password !== confirm) {
        setError('Passwords do not match.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
    }

    setSubmitting(true)

    if (tab === 'login') {
      const { error: err } = await signIn(email.trim(), password)
      if (err) {
        setError('Invalid email or password.')
      } else {
        navigate('/')
      }
    } else {
      const { error: err } = await signUp(email.trim(), password)
      if (err) {
        setError(err.message.includes('already registered')
          ? 'An account with that email already exists.'
          : err.message)
      } else {
        navigate('/')
      }
    }

    setSubmitting(false)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-brand">PostBoard</h1>

        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => switchTab('login')}
            type="button"
          >
            Log In
          </button>
          <button
            className={`auth-tab${tab === 'signup' ? ' active' : ''}`}
            onClick={() => switchTab('signup')}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <form className="post-form" onSubmit={handleSubmit}>
          <label className="form-label">
            Email
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="form-label">
            Password
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>

          {tab === 'signup' && (
            <label className="form-label">
              Confirm Password
              <input
                className="form-input"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </label>
          )}

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting
              ? (tab === 'login' ? 'Logging in...' : 'Creating account...')
              : (tab === 'login' ? 'Log In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  )
}
