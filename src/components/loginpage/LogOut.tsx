import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate, useNavigate } from 'react-router-dom'
import { LoaderCircle, LogOut as LogOutIcon } from 'lucide-react'
import { clearSession, isSignedIn, readSession, ROLE_LABEL } from '../../lib/session'

const card = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  shown: { opacity: 1, y: 0, scale: 1 },
}

const LogOut = () => {
  const navigate = useNavigate()
  const [session] = useState(readSession)
  const [leaving, setLeaving] = useState(false)
  const confirmRef = useRef<HTMLButtonElement>(null)

  const cancel = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/account')
  }

  const handleLogOut = () => {
    setLeaving(true)
    clearSession()
    // A short pause lets the user see that the action happened.
    window.setTimeout(() => navigate('/login', { replace: true }), 600)
  }

  useEffect(() => {
    confirmRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isSignedIn()) return <Navigate to="/login" replace />

  return (
    <main id="main" className="flex justify-center items-center px-4 pb-16">
      <motion.div
        className="relative -rotate-3 lg:w-[500px] lg:h-[500px] w-[350px] h-[350px] lg:mt-10 mt-24 bg-black rounded-xl flex"
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: -3, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <motion.div
          className="relative -rotate-3 lg:w-[480px] lg:h-[480px] w-[320px] h-[320px] bg-accent rounded-xl flex"
          initial={{ rotate: 0 }}
          animate={{ rotate: -3 }}
          transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
        >
          <motion.section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-copy"
            className="absolute lg:w-[460px] lg:h-[460px] w-[300px] h-[300px] -rotate-3 bg-accent-hover rounded-xl flex flex-col overflow-hidden shadow-[0_24px_60px_rgba(73,10,103,0.35)]"
            variants={card}
            initial="hidden"
            animate="shown"
            transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
          >
            <h1 id="logout-title" className="lg:text-[90px] text-[40px] pl-10 mt-5 font-extrabold text-white leading-tight">
              Log Out
            </h1>
            <p id="logout-copy" className="lg:text-[20px] text-[16px] text-white font-light pl-10 pr-6 pt-2 w-[300px] lg:w-[340px]">
              You can log back to your account in any moment!
            </p>

            <div className="mx-10 mt-4 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2 text-white">
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold">{session.name}</span>
                <span className="block truncate text-[12px] text-white/75">
                  {session.email} · {ROLE_LABEL[session.role]}
                </span>
              </span>
            </div>

            <div className="pl-10 flex flex-row mt-5 gap-4 relative z-10">
              <button
                ref={confirmRef}
                type="button"
                onClick={handleLogOut}
                disabled={leaving}
                aria-busy={leaving}
                className="inline-flex items-center gap-2 bg-white rounded-xl text-accent p-3 text-md md:text-xl font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-white disabled:opacity-70"
              >
                {leaving ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <LogOutIcon className="h-5 w-5" aria-hidden="true" />
                )}
                {leaving ? 'Logging out…' : 'Log Me Out'}
              </button>
             
            </div>
            <p className="hidden lg:block pl-10 mt-3 text-[12px] text-white/60">Press Esc to cancel.</p>

            <motion.img
              src="/leaving1.png"
              alt=""
              aria-hidden="true"
              className="hidden lg:block w-[150px] absolute right-6 bottom-0"
              initial={{ x: 0 }}
              animate={leaving ? { x: 220, opacity: 0 } : { x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeIn' }}
            />
          </motion.section>
        </motion.div>
      </motion.div>
    </main>
  )
}

export default LogOut
