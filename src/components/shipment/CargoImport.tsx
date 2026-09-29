import { useId, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Upload } from 'lucide-react'
import { extractCargoFromDocument } from '../../lib/bolApi'
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
  children?: ReactNode
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

export function CargoImport({ onImported, children }: CargoImportProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
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

  return (
    <div className="relative flex shrink-0 flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-busy={busy}
          title="Import cargo from a BOL, spreadsheet, or CSV"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {busy ? 'Importing…' : 'Import'}
        </button>
        {children}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept={ACCEPT}
        tabIndex={-1}
        onChange={onChange}
      />

      {error ? (
        <p className="max-w-[16rem] text-right text-[12px] leading-5 text-danger" role="alert">
          {error}
        </p>
      ) : status ? (
        <p className="max-w-[16rem] text-right text-[12px] leading-5 text-ok" role="status">
          {status}
        </p>
      ) : null}
    </div>
  )
}
