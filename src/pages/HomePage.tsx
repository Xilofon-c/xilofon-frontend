import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { TrailerDimensionsSection } from '../components/TrailerDimensions'

import { Footer } from '../components/Footer'

export function HomePage() {
  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <TrailerDimensionsSection />
       
      </main>
      <Footer />
    </div>
  )
}
