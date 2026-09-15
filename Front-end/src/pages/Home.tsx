import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Experience from '../sections/Experience'
import Education from '../sections/Education'
import Skills from '../sections/Skills'
import Certifications from '../sections/Certifications'
import ProjectsPreview from '../sections/ProjectsPreview'
import Contact from '../sections/Contact'

export default function Home() {
  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      {/* Skip to main content — keyboard accessibility */}
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">
        <Hero />
        <About />
        <Experience />
        <Education />
        <Skills />
        <Certifications />
        <ProjectsPreview />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
