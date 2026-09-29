import { useState, type FormEvent } from 'react'
import { AppScreen } from './AppScreen'

export function ReportPage() {
  const [sent, setSent] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSent(true)
  }

  return (
    <AppScreen kicker="" title="Report" >
      <p className="section-copy">
        Flag a problem with a shipment — damaged cargo, missing boxes, or a load that does not match
        the plan. The report goes to the supervisor.
      </p>

      <form className="panel" style={{ marginTop: 20, padding: 18 }} onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="report-shipment">Shipment or BOL</label>
          <input id="report-shipment" className="field-input" name="shipment" required />
        </div>
        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="report-issue">What went wrong</label>
          <textarea
            id="report-issue"
            className="field-input"
            name="issue"
            required
            rows={5}
            style={{ minHeight: 120, padding: '12px 14px', resize: 'vertical' }}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <button type="submit" className="btn btn-primary">
            Send to supervisor
          </button>
        </div>
        {sent ? (
          <p className="field-hint" style={{ marginTop: 12 }}>
            Report queued for the supervisor.
          </p>
        ) : null}
      </form>
    </AppScreen>
  )
}
