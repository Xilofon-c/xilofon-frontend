import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import LoadingScreen from '../components/Loading'
import { BolUpload } from '../components/page1-main/BolUpload'
import { TrailerDimensionsForm } from '../components/page1-main/TrailerDimensions'
import { ShipmentTable } from '../components/shipment/ShipmentTable'
import { useTrailerForm } from '../hooks/useTrailerForm'
import { buildBolRequest, generateBolPdf, importBol } from '../lib/bolApi'
import { newShipmentId } from '../lib/cargo'
import { readRole } from '../lib/session'
import { useShipmentList } from '../hooks/useShipmentList'
import type { NewShipmentState } from '../lib/trailer'
import { DEFAULT_TRAILER_TYPE } from '../lib/trailerTypes'
import { AppScreen } from './AppScreen'


let splashShown = false

export function HomePage() {
  const [showLoader, setShowLoader] = useState(() => !splashShown)
  const navigate = useNavigate()
  const trailerForm = useTrailerForm()
  const trailerStep = useRef<HTMLDivElement>(null)
  const [trailerError, setTrailerError] = useState(false)
  const [bolFile, setBolFile] = useState<File | null>(null)
  const [bolError, setBolError] = useState<string | null>(null)
  const [continuing, setContinuing] = useState(false)
  const isOffice = readRole() === 'office'
  const { rows, error } = useShipmentList()
  const list = rows ?? []
  const loaded = rows !== null && !error
  const placed = list.reduce((sum, row) => sum + row.stats.placed, 0)
  const unplaced = list.reduce((sum, row) => sum + row.stats.unplaced, 0)
  const avgVolume = list.length > 0 ? Math.round(list.reduce((sum, row) => sum + row.stats.volume_percent, 0) / list.length) : 0
  const kpis = [
    { label: 'Shipments', value: loaded ? String(list.length) : '—' },
    { label: 'Boxes placed', value: loaded ? String(placed) : '—' },
    { label: 'Left out', value: loaded ? String(unplaced) : '—' },
    { label: 'Avg. volume used', value: loaded ? `${avgVolume}%` : '—' },
  ]

  async function continueToPlan() {
    setBolError(null)
    const trailer = trailerForm.isEmpty ? null : trailerForm.validateAll()
    if (!trailerForm.isEmpty && !trailer) {
      setTrailerError(true)
      trailerStep.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    setTrailerError(false)

    if (!bolFile) {
      if (!trailer) {
        navigate('/shipments/new')
        return
      }
      navigate('/shipments/new', { state: { trailer } satisfies NewShipmentState })
      return
    }

    const spec = trailer ?? { ...DEFAULT_TRAILER_TYPE.spec, units: 'metric' as const }
    setContinuing(true)
    try {
      const items = await importBol(bolFile)
      const shipmentId = newShipmentId()
      const filename = await generateBolPdf(buildBolRequest(items, spec, shipmentId), shipmentId)
      const savedId = /^BOL-(.+)\.pdf$/i.exec(filename)?.[1] ?? shipmentId
      navigate('/shipments/new', { state: { trailer: spec, items, shipmentId: savedId } satisfies NewShipmentState })
    } catch (caught) {
      setBolError(caught instanceof Error ? caught.message : 'Could not read the BOL.')
    } finally {
      setContinuing(false)
    }
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
            {kpis.map((kpi) => (
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
            <BolUpload onFileChange={setBolFile} />
          </div>

          <div className="panel-footer">
            {trailerError && !trailerForm.spec && !trailerForm.isEmpty ? (
              <p className="mr-auto text-[13px] text-danger" role="alert">
                Correct the trailer dimensions in step 1.
              </p>
            ) : bolError ? (
              <p className="mr-auto text-[13px] text-danger" role="alert">
                {bolError}
              </p>
            ) : null}
            <button type="button" className="btn btn-primary" onClick={() => void continueToPlan()} disabled={continuing} aria-busy={continuing}>
              {continuing ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {continuing ? 'Reading the BOL…' : 'Continue to cargo plan'}
              {continuing ? null : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
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
          {error ? (
            <p className="alert alert-danger m-4" role="alert">
              {error}
            </p>
          ) : rows === null ? (
            <p className="empty-state flex items-center justify-center gap-2">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading shipments…
            </p>
          ) : (
            <ShipmentTable rows={rows.slice(0, 5)} />
          )}
        </section>
      </AppScreen>
    </>
  )
}
