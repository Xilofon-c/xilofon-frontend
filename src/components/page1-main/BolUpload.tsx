import { useId, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { formatFileSize } from '../../lib/format'
import './BolUpload.css'

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

function extensionOf(name: string) {
  const parts = name.toLowerCase().split('.')
  return parts.length > 1 ? parts.at(-1)! : ''
}

function isAllowed(file: File) {
  const ext = extensionOf(file.name)
  if (ACCEPT_EXT.includes(ext)) return true
  return file.type.startsWith('image/') || file.type === 'application/pdf'
}

export function BolUpload() {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  function applyFile(next: File | null) {
    if (!next) {
      setFile(null)
      setError(null)
      return
    }
    if (!isAllowed(next)) {
      setError('Use a PDF, image, or common document (Word, Excel, CSV, TXT).')
      return
    }
    if (next.size > MAX_BYTES) {
      setError('File is larger than 15 MB.')
      return
    }
    setError(null)
    setFile(next)
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    applyFile(event.target.files?.[0] ?? null)
    event.target.value = ''
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    applyFile(event.dataTransfer.files?.[0] ?? null)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      inputRef.current?.click()
    }
  }

  function removeFile() {
    setFile(null)
    setError(null)
  }

  return (
    <div>
      {file ? (
        <div className="file-card">
          <span className="file-icon" aria-hidden="true">
            <FileText className="h-5 w-5" />
          </span>
          <div className="file-meta">
            <p className="file-name">{file.name}</p>
            <span className="file-size">
              {formatFileSize(file.size)} · {extensionOf(file.name).toUpperCase() || 'File'}
            </span>
          </div>
          <div className="file-actions">
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => inputRef.current?.click()}>
              Replace
            </button>
            <button className="btn btn-quiet btn-sm" type="button" onClick={removeFile} aria-label="Remove document">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`dropzone${dragging ? ' is-dragging' : ''}${error ? ' is-invalid' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={onKeyDown}
          aria-label="Upload bill of lading"
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
          aria-describedby={`${inputId}-hint`}
        >
          <span className="drop-icon" aria-hidden="true">
            <Upload className="h-5 w-5" />
          </span>
          <div>
            <p className="drop-title">
              Drop the BOL here or <span className="link">browse files</span>
            </p>
            <p className="drop-hint" id={`${inputId}-hint`}>
              PDF, image, Word, Excel, CSV, or TXT. Maximum 15 MB.
            </p>
          </div>
        </div>
      )}

      <input
        id={inputId}
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept={ACCEPT}
        tabIndex={-1}
        onChange={onChange}
        aria-label="Bill of lading file"
      />

      {error ? (
        <p className="alert alert-danger mt-3" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
