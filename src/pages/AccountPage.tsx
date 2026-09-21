import { AppScreen } from './AppScreen'

export function AccountPage() {
  return (
    <AppScreen kicker='' title="Account">
      <p className="section-copy">
        Office and loading users manage their profile, role, and yard access here.
      </p>
      <div className="panel" style={{ marginTop: 24, padding: 24 }}>
        <div className="field">
          <label htmlFor="account-name">Name</label>
          <input id="account-name" className="field-input" defaultValue="Operations user" readOnly />
        </div>
        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="account-role">Role</label>
          <input id="account-role" className="field-input" defaultValue="Office" readOnly />
        </div>
      </div>
    </AppScreen>
  )
}
