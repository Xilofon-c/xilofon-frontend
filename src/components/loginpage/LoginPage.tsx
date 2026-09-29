import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { ROLE_LABEL, writeSession, type UserRole } from '../../lib/session'
import { AuthLayout } from './AuthLayout'

type AuthTab = 'login' | 'signup'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 6

export function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<AuthTab>('login')
  const [role, setRole] = useState<UserRole>('office')
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const signup = tab === 'signup'

  function switchTab(next: AuthTab) {
    setTab(next)
    setError(null)
    setPassword('')
    setConfirm('')
  }

  function validate() {
    if (!email.trim() || !password || (signup && (!name.trim() || !surname.trim()))) {
      return 'Fill in all fields.'
    }
    if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address, for example name@company.com.'
    if (password.length < MIN_PASSWORD) return `The password must have at least ${MIN_PASSWORD} characters.`
    if (signup && password !== confirm) return 'The passwords do not match.'
    if (signup && !agreed) return 'Accept the terms and conditions to continue.'
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const problem = validate()
    setError(problem)
    if (problem) return

    setIsLoading(true)
    try {
      // Mock request until the auth endpoint exists.
      await new Promise((resolve) => setTimeout(resolve, 600))
      const fullName = signup ? `${name.trim()} ${surname.trim()}` : email.trim().split('@')[0]
      writeSession({ name: fullName, email: email.trim(), role })
      navigate(role === 'loader' ? '/shipments' : '/')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordToggle = (
    <button
      type="button"
      className="absolute top-1/2 right-1.5 grid h-8 w-8 -translate-y-1/2 place-items-center rounded text-ink-faint hover:text-ink"
      onClick={() => setShowPassword((current) => !current)}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      aria-pressed={showPassword}
    >
      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
    </button>
  )

  return (
    <AuthLayout
      title={signup ? 'Create your account' : 'Log in to SmartCargo'}
      description={signup ? 'Set up access for the office or the loading bay.' : 'Welcome back. Enter your details to continue.'}
      footer={
        signup ? (
          <>
            Already have an account?{' '}
            <button type="button" className="link" onClick={() => switchTab('login')}>
              Log in
            </button>
          </>
        ) : (
          <>
            New to SmartCargo?{' '}
            <button type="button" className="link" onClick={() => switchTab('signup')}>
              Create an account
            </button>
          </>
        )
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <span className="field-label" id="role-label">
            I work in
          </span>
          <div className="segmented grid grid-cols-2" role="group" aria-labelledby="role-label">
            {(['office', 'loader'] as const).map((option) => (
              <button key={option} type="button" aria-pressed={role === option} onClick={() => setRole(option)}>
                {option === 'office' ? 'Office' : 'Loading bay'}
              </button>
            ))}
          </div>
          <p className="field-hint">
            {role === 'office'
              ? 'Create bills of lading and shipment data.'
              : 'Scan barcodes and load trailers by the plan.'}
          </p>
        </div>

        {signup ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label className="field-label" htmlFor="auth-name">
                First name
              </label>
              <input
                id="auth-name"
                className="field-input"
                autoComplete="given-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="auth-surname">
                Last name
              </label>
              <input
                id="auth-surname"
                className="field-input"
                autoComplete="family-name"
                value={surname}
                onChange={(event) => setSurname(event.target.value)}
              />
            </div>
          </div>
        ) : null}

        <div className="field">
          <label className="field-label" htmlFor="auth-email">
            Work email
          </label>
          <input
            id="auth-email"
            className="field-input"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="field">
          <div className="flex items-baseline justify-between">
            <label className="field-label" htmlFor="auth-password">
              Password
            </label>
            {!signup ? (
              <Link to="/forgot-password" className="link text-[13px]">
                Forgot password?
              </Link>
            ) : null}
          </div>
          <div className="relative">
            <input
              id="auth-password"
              className="field-input pr-11"
              type={showPassword ? 'text' : 'password'}
              autoComplete={signup ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {passwordToggle}
          </div>
          {signup ? <p className="field-hint">At least {MIN_PASSWORD} characters.</p> : null}
        </div>

        {signup ? (
          <div className="field">
            <label className="field-label" htmlFor="auth-confirm">
              Confirm password
            </label>
            <input
              id="auth-confirm"
              className="field-input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </div>
        ) : null}

        {signup ? (
          <label className="flex items-start gap-2.5 text-[13px] text-ink-muted">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            <span>
              I agree to the{' '}
              <a href="/terms" className="link">
                terms and conditions
              </a>
              .
            </span>
          </label>
        ) : null}

        {error ? (
          <p className="alert alert-danger" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary w-full" disabled={isLoading} aria-busy={isLoading}>
          {isLoading
            ? signup
              ? 'Creating account…'
              : 'Logging in…'
            : signup
              ? `Create ${ROLE_LABEL[role].toLowerCase()} account`
              : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  )
}
