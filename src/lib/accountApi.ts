import { api } from './apiClient'
import { writeSession, type Session, type UserRole } from './session'

export type Profile = {
  name: string
  surname: string
  email: string
  role: UserRole
}

export function sessionFromProfile(profile: Profile): Session {
  return { name: `${profile.name} ${profile.surname}`.trim(), email: profile.email, role: profile.role }
}

export async function fetchProfile() {
  const { data } = await api.get<Profile>('/data/me')
  writeSession(sessionFromProfile(data))
  return data
}

export async function updateProfile(patch: Pick<Profile, 'name' | 'surname'>) {
  const { data } = await api.patch<Profile>('/data/me', patch)
  writeSession(sessionFromProfile(data))
  return data
}
