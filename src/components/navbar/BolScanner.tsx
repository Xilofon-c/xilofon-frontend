import { useEffect, useId, useRef, useState } from 'react'
import { CameraIcon, CloseIcon } from './NavIcons'

type BolScannerProps = {
  open: boolean
  onClose: () => void
}

export function BolScanner({ open, onClose }: BolScannerProps) {
  const titleId = useId()
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const video = videoRef.current
    let stream: MediaStream | null = null
    let cancelled = false

    async function startCamera() {
      setError(null)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' } },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        if (!video) return
        video.srcObject = stream
        await video.play()
      } catch {
        if (!cancelled) {
          setError('Camera access is required to scan a bill of lading barcode.')
        }
      }
    }

    void startCamera()

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      cancelled = true
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
      stream?.getTracks().forEach((track) => track.stop())
      if (video) video.srcObject = null
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-[#14081c]/95 text-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <header className="flex items-center justify-between gap-3 px-4 pt-[max(0.85rem,env(safe-area-inset-top))] pb-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-white/55 uppercase">
            Loading bay
          </p>
          <h2 id={titleId} className="text-base font-semibold tracking-tight">
            Scan BOL barcode
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/16"
          aria-label="Close scanner"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </header>

      <div
        className="relative mx-4 min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black"
        style={{ containerType: 'size' }}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted
          playsInline
        />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(20,8,28,0.35)_0%,transparent_22%,transparent_78%,rgba(20,8,28,0.45)_100%)]" />

        <div className="pointer-events-none absolute inset-0 grid place-items-center p-5">
          <div className="relative aspect-square w-[min(78cqmin,24rem)]">
            <span className="absolute top-0 left-0 h-8 w-8 rounded-tl-md border-t-2 border-l-2 border-white" />
            <span className="absolute top-0 right-0 h-8 w-8 rounded-tr-md border-t-2 border-r-2 border-white" />
            <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-md border-b-2 border-l-2 border-white" />
            <span className="absolute right-0 bottom-0 h-8 w-8 rounded-br-md border-r-2 border-b-2 border-white" />
            <span className="absolute top-1/2 right-3 left-3 h-px -translate-y-1/2 bg-accent/80 shadow-[0_0_16px_rgba(129,70,141,0.8)]" />
          </div>
        </div>

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#14081c]/80 p-6 text-center">
            <div>
              <p className="text-sm leading-6 text-white/85">{error}</p>
              <button
                type="button"
                className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-semibold"
                onClick={() => fileRef.current?.click()}
              >
                Upload barcode photo
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <p className="max-w-[38ch] text-[13px] leading-5 text-white/65">
          Hold the printed BOL barcode inside the frame to identify the load.
        </p>
        <button
          type="button"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-3 text-sm font-semibold"
          onClick={() => fileRef.current?.click()}
        >
          <CameraIcon className="h-4 w-4" />
          Photo
        </button>
        <input
          ref={(node) => {
            fileRef.current = node
            if (node) node.setAttribute('capture', 'environment')
          }}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Upload a barcode photo"
        />
      </div>
    </div>
  )
}
