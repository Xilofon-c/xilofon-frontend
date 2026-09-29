import { useState, type FormEvent } from 'react'
import { CircleCheck } from 'lucide-react'
import { AppScreen } from './AppScreen'

const ISSUE_TYPES = [
  'Damaged cargo',
  'Missing box',
  'Load does not match the plan',
  'Wrong trailer size',
  'Other',
]

export function ReportPage() {
  const [sentFor, setSentFor] = useState<string | null>(null)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const shipment = new FormData(form).get('shipment')
    setSentFor(typeof shipment === 'string' ? shipment.trim() : '')
    form.reset()
  }

  return (
    <AppScreen title="Report a problem" narrow>
      <form className="panel" onSubmit={onSubmit} onChange={() => setSentFor(null)}>
        <div className="panel-body grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="field">
              <label className="field-label" htmlFor="report-shipment">
                Shipment or BOL number
              </label>
              <input
                id="report-shipment"
                className="field-input mono"
                name="shipment"
                placeholder="TRK-8921"
                autoComplete="off"
                required
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="report-type">
                Problem type
              </label>
              <select id="report-type" className="field-input" name="type" defaultValue={ISSUE_TYPES[0]}>
                {ISSUE_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="report-issue">
              Description
            </label>
            <textarea
              id="report-issue"
              className="field-input"
              name="issue"
              required
              rows={5}
              placeholder="Which boxes are affected, and what did you see?"
            />
            <p className="field-hint">Include box barcodes when you have them.</p>
          </div>
          {sentFor !== null ? (
            <p className="alert alert-ok flex items-center gap-2" role="status">
              <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Report for {sentFor || 'the shipment'} sent to the supervisor.
            </p>
          ) : null}
        </div>
        <div className="panel-footer">
          <button type="reset" className="btn btn-quiet" onClick={() => setSentFor(null)}>
            Clear
          </button>
          <button type="submit" className="btn btn-primary">
            Send report
          </button>
        </div>
      </form>
    </AppScreen>
  )
}
