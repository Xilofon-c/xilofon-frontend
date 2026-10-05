import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  Box,
  CircleCheck,
  ClipboardList,
  LoaderCircle,
  PackageX,
  RefreshCw,
  Ruler,
  Shuffle,
  type LucideIcon,
} from 'lucide-react'
import { apiError } from '../lib/apiClient'
import { createReport, listReports, type Report } from '../lib/reportsApi'
import { isSignedIn } from '../lib/session'
import { SHIPMENTS } from '../lib/shipments'
import { AppScreen } from './AppScreen'

const ISSUE_TYPES: { label: string; hint: string; icon: LucideIcon }[] = [
  { label: 'Damaged cargo', hint: 'A box is crushed, wet, or open.', icon: PackageX },
  { label: 'Missing box', hint: 'A box on the BOL is not at the bay.', icon: Box },
  { label: 'Load does not match the plan', hint: 'A box does not fit where the plan puts it.', icon: Shuffle },
  { label: 'Wrong trailer size', hint: 'The trailer at the bay differs from the BOL.', icon: Ruler },
  { label: 'Other', hint: 'Any other problem with the load.', icon: AlertTriangle },
]

const STEPS = [
  'Stop loading the affected boxes.',
  'Scan the box barcodes, or write them down.',
  'Take a photo when a box is damaged.',
  'Send the report. The supervisor gets it immediately.',
]

const MAX_DESCRIPTION = 2000

function formatWhen(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function isThisWeek(iso: string) {
  return Date.now() - new Date(iso).getTime() < 7 * 24 * 60 * 60 * 1000
}

export function ReportPage() {
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0].label)
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [sentFor, setSentFor] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [reports, setReports] = useState<Report[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const signedIn = isSignedIn()

  const loadReports = useCallback(async () => {
    setListError(null)
    try {
      setReports(await listReports(8))
    } catch (error) {
      setReports([])
      setListError(apiError(error, 'Could not load the reports.'))
    }
  }, [])

  useEffect(() => {
    if (signedIn) void loadReports()
  }, [signedIn, loadReports])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const shipment = String(new FormData(form).get('shipment') ?? '').trim()
    setSending(true)
    setSendError(null)
    setSentFor(null)
    try {
      const saved = await createReport({ shipment_ref: shipment, issue_type: issueType, description: description.trim() })
      setSentFor(saved.shipment_ref)
      setReports((current) => [saved, ...(current ?? [])].slice(0, 8))
      form.reset()
      setDescription('')
      setIssueType(ISSUE_TYPES[0].label)
    } catch (error) {
      setSendError(apiError(error, 'Could not send the report.'))
    } finally {
      setSending(false)
    }
  }

  function clear() {
    setSentFor(null)
    setSendError(null)
    setDescription('')
    setIssueType(ISSUE_TYPES[0].label)
  }

  const openCount = reports?.filter((report) => report.status === 'open').length ?? 0
  const weekCount = reports?.filter((report) => isThisWeek(report.created_at)).length ?? 0

  return (
    <AppScreen title="Report a problem">
      <header className="mb-6">
        <p className="text-[12px] font-semibold tracking-[0.06em] text-ink-faint uppercase">Loading bay</p>
        <h2 className="mt-1 text-[26px] leading-tight font-bold tracking-tight text-accent sm:text-[30px]">
          Report a problem
        </h2>
        <p className="page-copy">
          Tell the supervisor when the load does not match the plan. SmartCargo saves each report with its shipment.
        </p>
      </header>

      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="panel px-4 py-3">
          <dt className="text-[13px] text-ink-faint">Open reports</dt>
          <dd className="mt-0.5 text-[22px] font-semibold tracking-tight tabular-nums">{reports ? openCount : '—'}</dd>
        </div>
        <div className="panel px-4 py-3">
          <dt className="text-[13px] text-ink-faint">Sent this week</dt>
          <dd className="mt-0.5 text-[22px] font-semibold tracking-tight tabular-nums">{reports ? weekCount : '—'}</dd>
        </div>
        <div className="panel col-span-2 px-4 py-3 lg:col-span-1">
          <dt className="text-[13px] text-ink-faint">Resolved</dt>
          <dd className="mt-0.5 text-[22px] font-semibold tracking-tight tabular-nums">
            {reports ? reports.length - openCount : '—'}
          </dd>
        </div>
      </dl>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
        <form className="panel" onSubmit={onSubmit} aria-labelledby="report-form-title">
          <div className="panel-header">
            <div>
              <h3 className="panel-title" id="report-form-title">
                New report
              </h3>
              <p className="panel-subtitle">All fields are necessary.</p>
            </div>
          </div>
          <div className="panel-body grid gap-6">
            {!signedIn ? (
              <p className="alert alert-danger" role="alert">
                Log in to send a report.
              </p>
            ) : null}

            <div className="field">
              <label className="field-label" htmlFor="report-shipment">
                Shipment or BOL number
              </label>
              <input
                id="report-shipment"
                className="field-input mono uppercase"
                name="shipment"
                placeholder="TRK-8921"
                autoComplete="off"
                list="report-shipment-options"
                maxLength={40}
                required
              />
              <datalist id="report-shipment-options">
                {SHIPMENTS.map((shipment) => (
                  <option key={shipment.id} value={shipment.id}>
                    {shipment.vehicle} · {shipment.destination}
                  </option>
                ))}
              </datalist>
              <p className="field-hint">The number is on the BOL, under the barcode.</p>
            </div>

            <fieldset className="field">
              <legend className="field-label mb-2">Problem type</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {ISSUE_TYPES.map(({ label, hint, icon: Icon }) => {
                  const selected = issueType === label
                  return (
                    <label
                      key={label}
                      className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border p-3 transition-colors ${
                        selected ? 'border-accent bg-accent-soft' : 'border-line-strong hover:border-ink-faint'
                      } has-[:focus-visible]:shadow-[var(--focus-ring)]`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={label}
                        checked={selected}
                        onChange={() => setIssueType(label)}
                        className="sr-only"
                      />
                      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-accent' : 'text-ink-faint'}`} aria-hidden="true" />
                      <span>
                        <span className="block text-[14px] font-semibold">{label}</span>
                        <span className="block text-[13px] text-ink-faint">{hint}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div className="field">
              <label className="field-label" htmlFor="report-issue">
                Description
              </label>
              <textarea
                id="report-issue"
                className="field-input"
                name="issue"
                required
                rows={6}
                maxLength={MAX_DESCRIPTION}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Which boxes are affected, and what did you see?"
              />
              <div className="flex justify-between gap-3">
                <p className="field-hint">Include box barcodes when you have them.</p>
                <p className="field-hint tabular-nums">
                  {description.length}/{MAX_DESCRIPTION}
                </p>
              </div>
            </div>

            {sentFor !== null ? (
              <p className="alert alert-ok flex items-center gap-2" role="status">
                <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                Report for {sentFor} sent to the supervisor.
              </p>
            ) : null}
            {sendError ? (
              <p className="alert alert-danger" role="alert">
                {sendError}
              </p>
            ) : null}
          </div>
          <div className="panel-footer">
            <button type="reset" className="btn btn-quiet" onClick={clear}>
              Clear
            </button>
            <button type="submit" className="btn btn-primary" disabled={sending || !signedIn} aria-busy={sending}>
              {sending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {sending ? 'Sending…' : 'Send report'}
            </button>
          </div>
        </form>

        <aside className="grid content-start gap-6">
          <section className="panel" aria-labelledby="report-steps-title">
            <div className="panel-header">
              <h3 className="panel-title" id="report-steps-title">
                Before you send
              </h3>
            </div>
            <ol className="panel-body grid gap-3">
              {STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-[14px] text-ink-muted">
                  <span className="step-badge">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section className="panel overflow-hidden" aria-labelledby="report-recent-title">
            <div className="panel-header">
              <h3 className="panel-title" id="report-recent-title">
                Recent reports
              </h3>
              {signedIn ? (
                <button type="button" className="btn btn-quiet btn-sm px-2" onClick={() => void loadReports()} aria-label="Refresh reports">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
            {!signedIn ? (
              <p className="empty-state">Log in to see the reports.</p>
            ) : reports === null ? (
              <p className="empty-state flex items-center justify-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading…
              </p>
            ) : listError ? (
              <p className="alert alert-danger m-4">{listError}</p>
            ) : reports.length === 0 ? (
              <div className="empty-state">
                <ClipboardList className="mx-auto mb-2 h-6 w-6 text-ink-faint" aria-hidden="true" />
                <strong>No reports yet</strong>
                Reports you send show here.
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {reports.map((report) => (
                  <li key={report.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="mono font-semibold">{report.shipment_ref}</span>
                      <span className={`badge ${report.status === 'open' ? 'badge-warn' : 'badge-ok'}`}>
                        {report.status === 'open' ? 'Open' : 'Resolved'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] font-medium text-ink">{report.issue_type}</p>
                    <p className="line-clamp-2 text-[13px] text-ink-muted">{report.description}</p>
                    <p className="mt-1 text-[12px] text-ink-faint">{formatWhen(report.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </AppScreen>
  )
}
