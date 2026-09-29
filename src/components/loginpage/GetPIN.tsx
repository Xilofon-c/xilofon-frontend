import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AuthLayout } from './AuthLayout'

const PIN_LENGTH = 4

const GetPIN = () => {
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [pin, setPin] = useState<string[]>(() => Array(PIN_LENGTH).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  function setDigit(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1)
    setPin((current) => current.map((value, i) => (i === index ? digit : value)))
    setError(null)
    if (digit && index < PIN_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !pin[index] && index > 0) inputRefs.current[index - 1]?.focus()
    if (event.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < PIN_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH)
    if (!digits) return
    event.preventDefault()
    setPin(Array.from({ length: PIN_LENGTH }, (_, i) => digits[i] ?? ''))
    inputRefs.current[Math.min(digits.length, PIN_LENGTH - 1)]?.focus()
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (pin.some((digit) => digit === '')) {
      setError(`Enter all ${PIN_LENGTH} digits.`)
      return
    }
    setError('The PIN check is not connected yet.')
  }

  return (
    <AuthLayout
      title="Enter the PIN"
      description={
        email ? (
          <>
            We sent a {PIN_LENGTH}-digit PIN to <strong className="text-ink">{email}</strong>.
          </>
        ) : (
          `Enter the ${PIN_LENGTH}-digit PIN from your email.`
        )
      }
      footer={
        <Link to="/forgot-password" className="link inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Use a different email
        </Link>
      }
    >
      <form className="grid gap-4" onSubmit={onSubmit} noValidate>
        <fieldset className="field">
          <legend className="field-label mb-1.5">PIN code</legend>
          <div className="flex gap-3">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element
                }}
                className={`field-input h-14 w-14 p-0 text-center text-[22px] font-semibold tabular-nums${error ? ' is-invalid' : ''}`}
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                value={digit}
                aria-label={`Digit ${index + 1} of ${PIN_LENGTH}`}
                onChange={(event) => setDigit(index, event.target.value)}
                onKeyDown={(event) => onKeyDown(index, event)}
                onPaste={onPaste}
                onFocus={(event) => event.target.select()}
              />
            ))}
          </div>
          {error ? (
            <p className="field-error" role="alert">
              {error}
            </p>
          ) : null}
        </fieldset>

        <button type="submit" className="btn btn-primary w-full">
          Verify PIN
        </button>
        <p className="text-center text-[13px] text-ink-muted">
          {resent ? (
            'A new PIN is on the way.'
          ) : (
            <>
              No email?{' '}
              <button type="button" className="link" onClick={() => setResent(true)}>
                Send the PIN again
              </button>
            </>
          )}
        </p>
      </form>
    </AuthLayout>
  )
}

export default GetPIN
