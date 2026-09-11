import { useId, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react'
import { extractCargoFromDocument } from '../../lib/bolApi'
import { formatFileSize } from '../../lib/format'
import { parseCargoFile } from '../../lib/parseCargoFile'
import type { CargoItem } from '../../types'

const ACCEPT =
  '.pdf,.png,.jpg,.jpeg,.webp,.gif,.tif,.tiff,.doc,.docx,.xls,.xlsx,.csv,.txt,application/pdf,image/*'

const ACCEPT_EXT = [
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'tif',
  'tiff',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'csv',
  'txt',
]

const MAX_BYTES = 15 * 1024 * 1024

type CargoImportProps = {
  onImported: (items: CargoItem[], fileName: string) => void
}

function extensionOf(name: string) {
  const parts = name.toLowerCase().split('.')
  return parts.length > 1 ? parts.at(-1)! : ''
}

function isAllowed(file: File) {
  const ext = extensionOf(file.name)
  if (ACCEPT_EXT.includes(ext)) return true
  return file.type.startsWith('image/') || file.type === 'application/pdf'
}

async function readFile(file: File): Promise<CargoItem[]> {
  try {
    return await parseCargoFile(file)
  } catch (error) {
    const ext = extensionOf(file.name)
    const localOnly = ext === 'csv' || ext === 'txt' || ext === 'tsv'
    if (localOnly) throw error
    return extractCargoFromDocument(file)
  }
}

export function CargoImport({ onImported }: CargoImportProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  async function applyFile(next: File | null) {
    if (!next) return
    if (!isAllowed(next)) {
      setError('Use a PDF, image, Word, Excel, CSV, or text file.')
      setStatus(null)
      return
    }
    if (next.size > MAX_BYTES) {
      setError('File is larger than 15 MB.')
      setStatus(null)
      return
    }

    setBusy(true)
    setError(null)
    try {
      const items = await readFile(next)
      onImported(items, next.name)
      setStatus(`Added ${items.length} object${items.length === 1 ? '' : 's'} from ${next.name}`)
    } catch (caught) {
      setStatus(null)
      setError(caught instanceof Error ? caught.message : 'Could not read that file.')
    } finally {
      setBusy(false)
    }
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    void applyFile(event.target.files?.[0] ?? null)
    event.target.value = ''
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    void applyFile(event.dataTransfer.files?.[0] ?? null)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <section className="px-4 py-3" aria-labelledby={`${inputId}-title`}>
      <h2 id={`${inputId}-title`} className="text-[11px] font-semibold tracking-[0.08em] text-accent uppercase">
        Import
      </h2>
      <p className="mt-1 mb-2 text-[12px] leading-5 text-ink-muted">
        Drop a BOL, Excel sheet, or CSV. Extracted cargo is appended to the list.
      </p>

      <div
        className={`grid min-h-[7.5rem] place-items-center rounded-xl border border-dashed px-3 py-4 text-center transition ${
          dragging ? 'border-accent bg-[#f5e7f6]' : error ? 'border-danger bg-[#fef6f6]' : 'border-line-strong bg-canvas-muted'
        } ${busy ? 'opacity-70' : 'cursor-pointer hover:border-accent hover:bg-[#f9f0fa]'}`}
        role="button"
        tabIndex={0}
        aria-busy={busy}
        aria-label="Upload bill of lading or cargo spreadsheet"
        onClick={() => inputRef.current?.click()}
        onKeyDown={onKeyDown}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          const next = event.relatedTarget
          if (next instanceof Node && event.currentTarget.contains(next)) return
          setDragging(false)
        }}
        onDrop={onDrop}
      >
        <p className="text-[13px] font-semibold text-ink">{busy ? 'Reading file…' : 'Drop file or click to browse'}</p>
        <p className="mt-1 text-[12px] text-ink-faint">PDF, Excel, CSV, Word, or image · 15 MB max</p>
      </div>

      <input
        id={inputId}
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept={ACCEPT}
        onChange={onChange}
      />

      {error ? (
        <p className="mt-2 text-[12px] text-danger" role="alert">
          {error}
        </p>
      ) : status ? (
        <p className="mt-2 text-[12px] text-ok">{status}</p>
      ) : (
        <p className="mt-2 text-[12px] text-ink-faint">
          Columns: name, length, width, height, weight, flags. Max {formatFileSize(MAX_BYTES)}.
        </p>
      )}
    </section>
  )
}
