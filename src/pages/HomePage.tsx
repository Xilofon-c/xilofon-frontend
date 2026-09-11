import { Header } from '../components/page1-main/Header'
import { Hero } from '../components/page1-main/Hero'
import { TrailerDimensionsSection } from '../components/page1-main/TrailerDimensions'

import { Footer } from '../components/page1-main/Footer'

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
