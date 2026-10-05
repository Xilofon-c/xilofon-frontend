import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheck, LoaderCircle, LogOut } from 'lucide-react'
import { fetchProfile, updateProfile, type Profile } from '../lib/accountApi'
import { apiError } from '../lib/apiClient'
import { initialsOf, isSignedIn, readSession, ROLE_LABEL } from '../lib/session'
import { AppScreen } from './AppScreen'
import {useNavigate} from 'react-router-dom';
import {useState} from 'react';
import api from '../api';



type Status = { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved' } | { kind: 'error'; message: string }

export function AccountPage() {
  const navigate = useNavigate()
  const [session] = useState(readSession)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [loading, setLoading] = useState(isSignedIn)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  useEffect(() => {
    if (!isSignedIn()) return
    let active = true
    fetchProfile()
      .then((data) => {
        if (!active) return
        setProfile(data)
        setName(data.name)
        setSurname(data.surname)
      })
      .catch((error) => {
        if (active) setStatus({ kind: 'error', message: apiError(error, 'Could not load your profile.') })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const fullName = `${name} ${surname}`.trim() || session.name
  const email = profile?.email ?? session.email
  const role = profile?.role ?? session.role
  const dirty = profile !== null && (name.trim() !== profile.name || surname.trim() !== profile.surname)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !surname.trim()) {
      setStatus({ kind: 'error', message: 'Enter your first name and surname.' })
      return
    }
    setStatus({ kind: 'saving' })
    try {
      const next = await updateProfile({ name: name.trim(), surname: surname.trim() })
      setProfile(next)
      setStatus({ kind: 'saved' })
    } catch (error) {
      setStatus({ kind: 'error', message: apiError(error, 'Could not save your profile.') })
    }
  }

  function edit(setter: (value: string) => void) {
    return (value: string) => {
      setter(value)
      if (status.kind !== 'saving') setStatus({ kind: 'idle' })
    }
  }

  return (
    <AppScreen title="Account" narrow>
      <form className="panel" onSubmit={onSubmit} aria-busy={loading}>
        <div className="panel-header">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-[16px] font-semibold text-white">
              {initialsOf(fullName)}
            </span>
            <div>
              <p className="text-[18px] font-semibold tracking-tight">{fullName}</p>
              <p className="panel-subtitle">{email}</p>
            </div>
          </div>
          <span className="badge badge-neutral">{ROLE_LABEL[role]} user</span>
        </div>
        <div className="panel-body grid gap-5 sm:grid-cols-2">
          {!isSignedIn() ? (
            <p className="alert alert-danger sm:col-span-2" role="alert">
              You are not logged in. Log in to load and save your profile.
            </p>
          ) : null}
          <div className="field">
            <label className="field-label" htmlFor="account-name">
              First name
            </label>
            <input
              id="account-name"
              className="field-input"
              value={name}
              autoComplete="given-name"
              disabled={loading || !profile}
              placeholder={loading ? 'Loading…' : ''}
              onChange={(event) => edit(setName)(event.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="account-surname">
              Surname
            </label>
            <input
              id="account-surname"
              className="field-input"
              value={surname}
              autoComplete="family-name"
              disabled={loading || !profile}
              placeholder={loading ? 'Loading…' : ''}
              onChange={(event) => edit(setSurname)(event.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="account-email">
              Email
            </label>
            <input id="account-email" className="field-input" value={email} readOnly />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="account-role">
              Role
            </label>
            <input id="account-role" className="field-input" value={ROLE_LABEL[role]} readOnly />
          </div>
          {status.kind === 'saved' ? (
            <p className="alert alert-ok flex items-center gap-2 sm:col-span-2" role="status">
              <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Profile saved.
            </p>
          ) : null}
          {status.kind === 'error' ? (
            <p className="alert alert-danger sm:col-span-2" role="alert">
              {status.message}
            </p>
          ) : null}
        </div>
        <div className="panel-footer justify-between">
          <button type="button" className="btn btn-quiet" onClick={() => navigate('/logout')}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </button>
          <button type="submit" className="btn btn-primary" disabled={!dirty || status.kind === 'saving'}>
            {status.kind === 'saving' ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {status.kind === 'saving' ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </AppScreen>
  )
}
