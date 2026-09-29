import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheck, LogOut } from 'lucide-react'
import { clearSession, initialsOf, readSession, ROLE_LABEL, writeSession } from '../lib/session'
import { AppScreen } from './AppScreen'

export function AccountPage() {
  const navigate = useNavigate()
  const [session] = useState(readSession)
  const [name, setName] = useState(session.name)
  const [saved, setSaved] = useState(false)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    writeSession({ ...session, name: name.trim() || session.name })
    setSaved(true)
  }

  function signOut() {
    clearSession()
    navigate('/login')
  }

  return (
    <AppScreen
      kicker="Profile"
      title="Account"
      description="Your profile and access role. An administrator changes roles."
      narrow
    >
      <form className="panel" onSubmit={onSubmit}>
        <div className="panel-header">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-[14px] font-semibold text-white">
              {initialsOf(name || session.name)}
            </span>
            <div>
              <p className="panel-title">{name || session.name}</p>
              <p className="panel-subtitle">{session.email}</p>
            </div>
          </div>
          <span className="badge badge-neutral">{ROLE_LABEL[session.role]} user</span>
        </div>
        <div className="panel-body grid gap-5 sm:grid-cols-2">
          <div className="field sm:col-span-2">
            <label className="field-label" htmlFor="account-name">
              Full name
            </label>
            <input
              id="account-name"
              className="field-input"
              value={name}
              autoComplete="name"
              onChange={(event) => {
                setName(event.target.value)
                setSaved(false)
              }}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="account-email">
              Email
            </label>
            <input id="account-email" className="field-input" value={session.email} readOnly />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="account-role">
              Role
            </label>
            <input id="account-role" className="field-input" value={ROLE_LABEL[session.role]} readOnly />
          </div>
          {saved ? (
            <p className="alert alert-ok flex items-center gap-2 sm:col-span-2" role="status">
              <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Profile saved.
            </p>
          ) : null}
        </div>
        <div className="panel-footer justify-between">
          <button type="button" className="btn btn-quiet" onClick={signOut}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
          <button type="submit" className="btn btn-primary">
            Save changes
          </button>
        </div>
      </form>
    </AppScreen>
  )
}
