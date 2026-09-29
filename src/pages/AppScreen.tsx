import type { ReactNode } from 'react'

export function AppScreen({
  title,
  narrow = false,
  children,
}: {
  /** Not shown on screen; it names the page for screen readers. */
  title: string
  /** Limits the content width for single-column forms. */
  narrow?: boolean
  children: ReactNode
}) {
  return (
    <div className="page">
      <main id="main" className="page-body">
        <div className="wrap" style={narrow ? { maxWidth: 720 } : undefined}>
          <h1 className="sr-only">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  )
}
