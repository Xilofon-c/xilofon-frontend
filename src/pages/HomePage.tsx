import { Hero } from '../components/page1-main/Hero'
import { TrailerDimensionsSection } from '../components/page1-main/TrailerDimensions'
import { Footer } from '../components/page1-main/Footer'

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
