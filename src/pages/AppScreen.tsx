import type { ReactNode } from 'react'

export function AppScreen({
  kicker,
  title,
  description,
  actions,
  narrow = false,
  children,
}: {
  kicker?: string
  title: string
  description?: ReactNode
  actions?: ReactNode
  /** Limits the content width for single-column forms. */
  narrow?: boolean
  children: ReactNode
}) {
  return (
    <div className="page">
      <main id="main" className="page-body">
        <div className="wrap" style={narrow ? { maxWidth: 720 } : undefined}>
          <header className="page-header">
            <div>
              {kicker ? <p className="page-kicker">{kicker}</p> : null}
              <h1 className="page-title">{title}</h1>
              {description ? <p className="page-copy">{description}</p> : null}
            </div>
            {actions ? <div className="page-actions">{actions}</div> : null}
          </header>
          {children}
        </div>
      </main>
    </div>
  )
}
