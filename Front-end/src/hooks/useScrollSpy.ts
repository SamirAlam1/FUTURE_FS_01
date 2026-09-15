import { useEffect, useRef, useState } from 'react'

/**
 * Tracks which section is currently in view
 */
export function useScrollSpy(ids: string[], rootMargin = '-20% 0px -60% 0px') {
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const elements = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin },
    )

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [ids, rootMargin])

  return active
}

/**
 * Initialises scroll-reveal on all .reveal elements in the document.
 * Call once at app root or per-section.
 */
export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target) // fire once
          }
        })
      },
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' },
    )

    const elements = document.querySelectorAll('.reveal')
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

/**
 * Stagger observer — adds 'visible' to container so CSS nth-child delays fire
 */
export function useStagger(ref: React.RefObject<Element | null>) {
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])
}
