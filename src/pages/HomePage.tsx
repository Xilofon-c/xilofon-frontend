import { Hero } from '../components/Hero'
import { TrailerDimensionsSection } from '../components/TrailerDimensions'
import { Footer } from '../components/Footer'

export function HomePage() {
  return (
    <div className="page">
      <main id="main">
        <Hero />
        <TrailerDimensionsSection />
      </main>
      <Footer />
    </div>
  )
}
