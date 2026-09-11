import { useId, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
    <motion.section
      className="section"
      id="bol"
      aria-labelledby="bol-title"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="wrapbol">

        <div className="panel bol-drop">
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
            <div className="drop-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 16V4m0 0 4 4M12 4 8 8M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>{file ? 'Replace document' : 'Drop BOL here or click to browse'}</h3>
            <p id={`${inputId}-hint`}>
              PDF, images, Word, Excel, CSV, or plain text. Maximum 15 MB.
            </p>
            <p className="drop-hint">Keyboard: focus and press Enter</p>
          </div>

          <input
            id={inputId}
            ref={inputRef}
            className="visually-hidden"
            type="file"
            accept={ACCEPT}
            onChange={onChange}
          />
          <label htmlFor={inputId} className="visually-hidden">
            Bill of lading file
          </label>

          <AnimatePresence>
            {file ? (
              <motion.div
                className="file-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <div className="file-meta">
                  <p className="file-name">{file.name}</p>
                  <span className="file-size">
                    {formatFileSize(file.size)} · {file.type || 'unknown type'}
                  </span>
                </div>
                <div className="file-actions">
                  <button className="btn btn-ghost" type="button" onClick={() => inputRef.current?.click()}>
                    Replace
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={removeFile}>
                    Remove
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {error ? (
            <p className="bol-error" role="alert">
              {error}
            </p>
          ) : file ? (
            <p className="bol-ok">Document staged locally.</p>
          ) : null}
        </div>
      </div>
    </motion.section>
  )
}
