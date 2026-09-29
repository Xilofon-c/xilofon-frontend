import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AuthLayout } from './AuthLayout'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = email.trim()
    if (!value) {
      setError('Enter your email address.')
      return
    }
    if (!EMAIL_PATTERN.test(value)) {
      setError('Enter a valid email address, for example name@company.com.')
      return
    }
    setError(null)
    navigate('/input-pin', { state: { email: value } })
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter the email for your account. We send you a 4-digit PIN to confirm your identity."
      footer={
        <Link to="/login" className="link inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to log in
        </Link>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="reset-email">
            Work email
          </label>
          <input
            id="reset-email"
            className={`field-input${error ? ' is-invalid' : ''}`}
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'reset-email-error' : undefined}
          />
          {error ? (
            <p className="field-error" id="reset-email-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Send PIN
        </button>
      </form>
    </AuthLayout>
  )
}

export default ForgotPassword
