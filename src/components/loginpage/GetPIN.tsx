import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, LoaderCircle } from 'lucide-react';
import api, { apiError } from '../../api';

const PIN_LENGTH = 4;
const RESEND_SECONDS = 30;

const GetPIN = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email: string | undefined = location.state?.email;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  if (!email) return <Navigate to="/forgot-password" replace />;

  const focusBox = (index: number) => {
    inputRefs.current[Math.max(0, Math.min(PIN_LENGTH - 1, index))]?.focus();
  };

  /** Writes digits from `index` on, so typing and pasting share one path. */
  const fillFrom = (index: number, digits: string) => {
    const next = [...pin];
    let last = index;
    for (let offset = 0; offset < digits.length && index + offset < PIN_LENGTH; offset++) {
      next[index + offset] = digits[offset];
      last = index + offset;
    }
    setPin(next);
    setError(null);
    focusBox(last + 1);
    if (next.every((digit) => digit !== '')) void verify(next);
  };

  const handlePinChange = (value: string, index: number) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      const next = [...pin];
      next[index] = '';
      setPin(next);
      return;
    }
    // A box that already holds a digit receives two characters; keep the new one.
    fillFrom(index, pin[index] && digits.length === 2 ? digits.slice(-1) : digits);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !pin[index] && index > 0) {
      event.preventDefault();
      const next = [...pin];
      next[index - 1] = '';
      setPin(next);
      focusBox(index - 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '');
    if (!digits) return;
    event.preventDefault();
    fillFrom(index, digits);
  };

  const verify = async (digits: string[]) => {
    if (loading) return;
    if (!digits.every((digit) => digit !== '')) {
      setError('PIN is incomplete');
      return;
    }
    const code = digits.join('');
    try {
      setLoading(true);
      setError(null);
      await api.post('/data/verify-pin', { email, pin: code });
      navigate('/reset-password', { state: { email, pin: code } });
    } catch (err) {
      setError(apiError(err, 'Something went wrong. Please try again.'));
      setPin(Array(PIN_LENGTH).fill(''));
      focusBox(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void verify(pin);
  };

  const resend = async () => {
    setError(null);
    setNotice(null);
    try {
      await api.post('/data/forgot-password', { email });
      setNotice('We sent a new PIN. It is valid for 15 minutes.');
      setResendIn(RESEND_SECONDS);
      setPin(Array(PIN_LENGTH).fill(''));
      focusBox(0);
    } catch (err) {
      setError(apiError(err, 'Could not send a new PIN.'));
    }
  };

      }
      catch(err:any){
         console.log('error response:', err.response?.data);
         const serverErrorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
    setError(serverErrorMessage);
      }
      finally{
        setLoading(false);
      

    }
  };

 
  
  return (
    <div className="flex justify-center md:pt-[30px] pb-0 ">
      <motion.div
        className="flex justify-center lg:h-[600px]"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex flex-col items-center px-4 pt-[100px] text-center md:pt-[130px]">
          <h1 className="text-4xl font-bold text-accent">Forgot Password?</h1>
          <p className="mt-5 max-w-[360px] text-base text-ink-muted">
            Enter the {PIN_LENGTH}-digit PIN code sent to{' '}
            <span className="font-semibold text-ink break-all">{email}</span>.
          </p>
          <form className="flex flex-col items-center" onSubmit={handleSubmit} noValidate>
            <motion.div
              className="mt-10 mb-6 flex gap-4 sm:gap-6"
              role="group"
              aria-label="PIN code"
              animate={error ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
            >
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  pattern="[0-9]*"
                  maxLength={2}
                  value={digit}
                  disabled={loading}
                  aria-label={`Digit ${index + 1} of ${PIN_LENGTH}`}
                  aria-invalid={Boolean(error)}
                  onChange={(e) => handlePinChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={(e) => handlePaste(e, index)}
                  onFocus={(e) => e.target.select()}
                  className={`h-[68px] w-[56px] rounded-xl border-2 text-center text-3xl font-semibold tabular-nums text-ink caret-accent transition-colors outline-none focus:border-accent focus:shadow-[var(--focus-ring)] disabled:opacity-60 ${
                    error ? 'border-danger' : digit ? 'border-accent bg-accent-soft' : 'border-gray-400'
                  }`}
                />
              ))}
            </motion.div>

            <div className="mb-5 min-h-5 text-sm" aria-live="polite">
              {error ? (
                <p className="text-red-500" role="alert">
                  {error}
                </p>
              ) : notice ? (
                <p className="text-ok">{notice}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="button-pin flex h-[56px] w-[300px] items-center justify-center gap-2 rounded-xl bg-accent text-lg text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
              {loading ? 'Verifying...' : 'Verify PIN'}
            </button>

            <p className="mt-6 text-sm text-ink-muted">
              Did not get the code?{' '}
              {resendIn > 0 ? (
                <span className="tabular-nums text-ink-faint">Send again in {resendIn}s</span>
              ) : (
                <button type="button" className="link" onClick={() => void resend()}>
                  Send a new PIN
                </button>
              )}
            </p>

            <Link
              to="/forgot-password"
              className="mt-4 inline-flex items-center gap-1 text-sm text-ink-faint hover:text-accent"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Use a different email
            </Link>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default GetPIN;
