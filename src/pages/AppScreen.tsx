import type { ReactNode } from 'react'

export function AppScreen({
  kicker,
  title,
  children,
}: {
  kicker: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="page">
      <main id="main" className="section" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <p className="section-kicker">{kicker}</p>
          <h1 className="section-title">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  )
}
