import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import LoadingScreen from '../components/Loading'
import { BolUpload } from '../components/page1-main/BolUpload'
import { TrailerDimensionsForm } from '../components/page1-main/TrailerDimensions'
import { ShipmentTable } from '../components/shipment/ShipmentTable'
import { useTrailerForm } from '../hooks/useTrailerForm'
import { readRole } from '../lib/session'
import { SHIPMENTS } from '../lib/shipments'
import type { NewShipmentState } from '../lib/trailer'
import { AppScreen } from './AppScreen'

/** The splash plays once per page load, not on every return to Home. */
let splashShown = false

const avgVolume = Math.round(SHIPMENTS.reduce((sum, row) => sum + row.volume, 0) / SHIPMENTS.length)

const KPIS = [
  { label: 'Loading now', value: SHIPMENTS.filter((row) => row.status === 'Loading').length },
  { label: 'Drafts', value: SHIPMENTS.filter((row) => row.status === 'Draft').length },
  { label: 'Completed', value: SHIPMENTS.filter((row) => row.status === 'Completed').length },
  { label: 'Avg. volume used', value: `${avgVolume}%` },
]

export function HomePage() {
  const [showLoader, setShowLoader] = useState(() => !splashShown)
  const navigate = useNavigate()
  const trailerForm = useTrailerForm()
  const trailerStep = useRef<HTMLDivElement>(null)
  const [trailerError, setTrailerError] = useState(false)
  const isOffice = readRole() === 'office'

  function continueToPlan() {
    if (trailerForm.isEmpty) {
      navigate('/shipments/new')
      return
    }
    const trailer = trailerForm.validateAll()
    if (!trailer) {
      setTrailerError(true)
      trailerStep.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    navigate('/shipments/new', { state: { trailer } satisfies NewShipmentState })
  }

  return (
    <>
      {showLoader && (
        <LoadingScreen
          isLoading={false}
          minDuration={1200}
          onFinished={() => {
            splashShown = true
            setShowLoader(false)
          }}
        />
      )}
      <AppScreen title="Load planning">
        {isOffice ? (
          <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className="panel px-4 py-3">
                <dt className="text-[13px] text-ink-faint">{kpi.label}</dt>
                <dd className="mt-0.5 text-[22px] font-semibold tracking-tight tabular-nums">{kpi.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <section className="panel mb-6" aria-labelledby="plan-title">
          <div className="panel-header">
            <div>
              <p className="text-[12px] font-semibold tracking-[0.06em] text-ink-faint uppercase" id="plan-title">
                Plan a new load
              </p>
              <h2 className="mt-1 text-[26px] leading-tight font-bold tracking-tight text-accent sm:text-[30px]">
                Enter the vehicle size
              </h2>
              <p className="panel-subtitle">Two steps, then SmartCargo calculates the arrangement.</p>
            </div>
          </div>

          <div className="panel-body scroll-mt-20 border-b border-line" ref={trailerStep}>
            <h3 className="mb-4 flex items-center gap-2.5 text-[14px] font-semibold">
              <span className="step-badge">1</span>
              Trailer dimensions
            </h3>
            <TrailerDimensionsForm form={trailerForm} />
          </div>

          <div className="panel-body">
            <h3 className="mb-1 flex items-center gap-2.5 text-[14px] font-semibold" id="bol-title">
              <span className="step-badge">2</span>
              Bill of lading
            </h3>
            <p className="mb-4 ml-[34px] text-[13px] text-ink-faint">
              Upload the BOL. SmartCargo reads the cargo list from it. You can also enter the cargo by hand in the next
              step.
            </p>
            <BolUpload />
          </div>

          <div className="panel-footer">
            {trailerError && !trailerForm.spec && !trailerForm.isEmpty ? (
              <p className="mr-auto text-[13px] text-danger" role="alert">
                Correct the trailer dimensions in step 1.
              </p>
            ) : null}
            <button type="button" className="btn btn-primary" onClick={continueToPlan}>
              Continue to cargo plan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="panel overflow-hidden" aria-labelledby="recent-title">
          <div className="panel-header">
            <div>
              <h2 className="panel-title" id="recent-title">
                Recent shipments
              </h2>
              <p className="panel-subtitle">The last five loads from all staff.</p>
            </div>
            <Link to="/shipments" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>
          <ShipmentTable rows={SHIPMENTS.slice(0, 5)} />
        </section>
      </AppScreen>
    </>
  )
}
