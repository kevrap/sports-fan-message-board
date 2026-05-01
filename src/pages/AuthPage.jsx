import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')
  const [forgotSubmitting, setForgotSubmitting] = useState(false)

  function switchTab(t) {
    setTab(t)
    setError('')
    setEmail('')
    setPassword('')
    setConfirm('')
    setShowForgot(false)
    setForgotMsg('')
  }

  async function handleForgot(e) {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setForgotSubmitting(true)
    setForgotMsg('')
    const { error: err } = await resetPassword(forgotEmail.trim())
    setForgotSubmitting(false)
    if (err) {
      setForgotMsg('Could not send reset email. Please try again.')
    } else {
      setForgotMsg('Check your email for a password reset link.')
    }
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
        <h1 className="auth-brand">
          <img src="/img/heat.png" alt="" className="nav-brand-icon" />
          Miami Heat Fan Club
        </h1>

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

        {tab === 'login' && !showForgot && (
          <button type="button" className="forgot-link" onClick={() => setShowForgot(true)}>
            Forgot password?
          </button>
        )}

        {tab === 'login' && showForgot && (
          <form className="forgot-form" onSubmit={handleForgot}>
            <p className="forgot-instructions">Enter your email and we'll send you a reset link.</p>
            <input
              className="form-input"
              type="email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            {forgotMsg && (
              <p className={forgotMsg.startsWith('Check') ? 'forgot-success' : 'form-error'}>
                {forgotMsg}
              </p>
            )}
            <div className="forgot-actions">
              <button type="submit" className="btn btn-primary" disabled={forgotSubmitting}>
                {forgotSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForgot(false); setForgotMsg('') }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="auth-divider"><span>or</span></div>

        <button type="button" className="btn btn-google" onClick={signInWithGoogle}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  )
}
