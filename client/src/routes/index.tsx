import About from '@/components/landing/About'
import Footer from '@/components/landing/Footer'
import Hero from '@/components/landing/Hero'
import Navbar from '@/components/landing/Navbar'
import Services from '@/components/landing/Services'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <>
  <Navbar />
  <Hero />
  <About />
  <Services />
  <Footer />
    </>
  )
}
