import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import api, { apiError } from '../../api';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';



const rules = [
  { label: 'At least 8 characters', ok: (p: string) => p.length >= 8 },
  { label: 'At least one uppercase letter', ok: (p: string) => /[A-Z]/.test(p) },
  { label: 'At least one number', ok: (p: string) => /[0-9]/.test(p) },
];

const ResetPassword = () => {




  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const email = location.state?.email;
  const pin = location.state?.pin;
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const redirectTimer = useRef<number | undefined>(undefined);

  const valid = rules.every((r) => r.ok(password));

  useEffect(() => {
    return () => window.clearTimeout(redirectTimer.current);
  }, []);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!valid) return;

    try {
      setLoading(true);
      await api.post('/data/reset-password', { email, pin, new_password: password });
      setDone(true);
      redirectTimer.current = window.setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(apiError(err, 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (!email || !pin) return <Navigate to="/forgot-password" replace />;

  return (
    <div className=" relative min-h-screen flex justify-center items-center overflow-x-hidden px-4 py-10 pl-12   lg:pl-4">


      <motion.div
        className="relative z-10 bg-gradient-to-br from-accent/10 via-white to-accent/20 border border-white rounded-2xl shadow-lg w-full max-w-[360px] lg:max-w-[500px] min-h-[360px] lg:min-h-[420px] pb-8"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-accent/10 blur-3xl pointer-events-none" aria-hidden="true" />
         <div className="absolute -bottom-10 -right-32 w-[480px] h-[480px] rounded-full bg-accent-hover/15 blur-3xl pointer-events-none" aria-hidden="true" />
          
         

 


        <form
          className="relative flex flex-col pt-7 px-6 pl-10 lg:pl-13"
          onSubmit={handleResetPassword}
        >
         
            <h1 className="text-xl lg:text-4xl font-bold text-accent">Reset password</h1>
      
          <div className="relative mt-10 w-full lg:w-[380px] max-w-full">
            <label htmlFor="new-password" className="sr-only">
              New password
            </label>
            <input
              id="new-password"
              name="new-password"
            
              className="relative p-4 pr-20 border text-black text-lg lg:text-xl w-full border-accent rounded-sm"
              placeholder="Enter new password"
              value={password}
              type={showPassword ? 'text' : 'password'}
              onChange={(e) => setPassword(e.target.value)}
             
            />
            <button
              type="button"
              className="text-accent absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="mt-5">
            <ul id="password-rules" aria-live="polite">
              {rules.map((r) => (
                <li
                  key={r.label}
                  className={r.ok(password) ? 'text-green-600 text-base' : 'text-gray-600 text-base'}
                >
                  {r.ok(password) ? '✓' : '○'} {r.label}
                </li>
              ))}
            </ul>
            {done && (
              <p className="text-green-600 mt-2 text-base" role="status">
                Password updated. Log in with the new password.
              </p>
            )}
            {error && (
              <p className="text-red-700 mt-2 text-base" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="mt-10 flex gap-6 text-lg lg:text-xl">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="p-1.5 lg:p-3 px-4 lg:px-6 border border-accent text-accent bg-transparent rounded-xl hover:bg-accent/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || done || !valid}
              className="p-1.5 lg:p-3 px-4 lg:px-6 bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;