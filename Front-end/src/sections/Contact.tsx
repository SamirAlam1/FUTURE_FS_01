import { useEffect, useRef, useState } from 'react'
import { DEVELOPER } from '../data/portfolio'

/* =========================
   Icons
========================= */

function MailIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1-2.063-2.065 2.064 2.064 0 0 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C23.2.774 22.4 0 22.222 0h.003z" />
    </svg>
  )
}

/* =========================
   Rock Paper Scissors
========================= */

type RPSChoice = 'rock' | 'paper' | 'scissors'
type RPSResult = 'win' | 'lose' | 'draw' | null

const RPS_CHOICES: RPSChoice[] = ['rock', 'paper', 'scissors']

const RPS_LABEL: Record<RPSChoice, string> = {
  rock: 'Rock',
  paper: 'Paper',
  scissors: 'Scissors',
}

function getResult(
  player: RPSChoice,
  computer: RPSChoice,
): RPSResult {
  if (player === computer) {
    return 'draw'
  }

  if (
    (player === 'rock' && computer === 'scissors') ||
    (player === 'paper' && computer === 'rock') ||
    (player === 'scissors' && computer === 'paper')
  ) {
    return 'win'
  }

  return 'lose'
}

function RPSGame() {
  const [playerChoice, setPlayerChoice] =
    useState<RPSChoice | null>(null)

  const [computerChoice, setComputerChoice] =
    useState<RPSChoice | null>(null)

  const [result, setResult] = useState<RPSResult>(null)

  const handleChoice = (choice: RPSChoice) => {
    const randomIndex = Math.floor(
      Math.random() * RPS_CHOICES.length,
    )

    const computer = RPS_CHOICES[randomIndex]

    setPlayerChoice(choice)
    setComputerChoice(computer)
    setResult(getResult(choice, computer))
  }

  let resultLabel = ''

  if (result === 'win') {
    resultLabel = 'You win!'
  } else if (result === 'lose') {
    resultLabel = 'Computer wins!'
  } else if (result === 'draw') {
    resultLabel = 'Draw!'
  }

  let resultColor = 'var(--text-primary)'

  if (result === 'win') {
    resultColor = 'var(--success)'
  } else if (result === 'lose') {
    resultColor = 'var(--error)'
  }

  return (
    <div
      className="w-full rounded-2xl border px-6 py-9 sm:px-8 sm:py-10 text-center"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--bg)',
      }}
      role="region"
      aria-label="Rock Paper Scissors mini game"
    >
      {/* Game title */}
      <div className="flex items-center justify-center gap-2">
        <span
          className="text-[24px] leading-none"
          aria-hidden="true"
        >
          🎮
        </span>

        <h2
          className="text-[26px] sm:text-[28px] font-bold leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Mini Game Zone
        </h2>
      </div>

      {/* Subtitle */}
      <p
        className="mt-7 text-[17px] sm:text-[18px] leading-relaxed"
        style={{ color: 'var(--text-muted)' }}
      >
        Play Rock–Paper–Scissors against the computer!
      </p>

      {/* Choices */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-[350px] mx-auto mt-9">
        {RPS_CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => handleChoice(choice)}
            className="btn-game"
            aria-label={'Choose ' + RPS_LABEL[choice]}
          >
            {RPS_LABEL[choice]}
          </button>
        ))}
      </div>

      {/* Result */}
      {playerChoice !== null &&
        computerChoice !== null && (
          <div
            className="mt-8 space-y-3"
            aria-live="polite"
          >
            <p
              className="text-[17px] sm:text-[18px]"
              style={{ color: 'var(--text-primary)' }}
            >
              You chose:{' '}
              <strong>
                {RPS_LABEL[playerChoice]}
              </strong>
            </p>

            <p
              className="text-[17px] sm:text-[18px]"
              style={{ color: 'var(--text-primary)' }}
            >
              Computer chose:{' '}
              <strong>
                {RPS_LABEL[computerChoice]}
              </strong>
            </p>

            <p
              className="text-[22px] sm:text-[23px] font-bold pt-1"
              style={{ color: resultColor }}
            >
              {resultLabel}
            </p>
          </div>
        )}
    </div>
  )
}

/* =========================
   Contact Section
========================= */

export default function Contact() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target
              .querySelectorAll('.reveal')
              .forEach((element) => {
                element.classList.add('visible')
              })
          }
        })
      },
      {
        threshold: 0.05,
      },
    )

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  /*
   * No custom type predicate is needed here.
   * filter(Boolean) removes null values safely.
   */
  const socials = [
  DEVELOPER.socials.github
    ? {
        href: DEVELOPER.socials.github,
        label: 'GitHub',
        icon: <GithubIcon />,
      }
    : null,

  DEVELOPER.socials.linkedin
    ? {
        href: DEVELOPER.socials.linkedin,
        label: 'LinkedIn',
        icon: <LinkedInIcon />,
      }
    : null,
].filter(
  (
    social,
  ): social is {
    href: string
    label: string
    icon: React.JSX.Element
  } => social !== null,
)
  
  return (
    <section
      id="contact"
      ref={ref}
      className="py-20 md:py-28 border-t"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8">
        {/* Section heading */}
        <div className="section-tag reveal">
          <span className="section-tag-dot" />

          <span className="section-tag-label">
            LET'S CONNECT
          </span>
        </div>

        <h2
          className="text-h1 reveal"
          style={{
            color: 'var(--text-primary)',
            maxWidth: '600px',
            marginBottom: '8px',
          }}
        >
          Have a project in mind?{' '}
          <span style={{ color: 'var(--accent)' }}>
            Let's talk.
          </span>
        </h2>

        <p
          className="text-body reveal"
          style={{
            color: 'var(--text-muted)',
            maxWidth: '480px',
            marginBottom: '48px',
          }}
        >
          I'm open to full-time roles, freelance work, and
          interesting collaborations. Drop me a line — I read
          everything.
        </p>

        {/* 
          LEFT  = Email + Connect With Me
          RIGHT = Mini Game
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* =========================
              LEFT SIDE
          ========================= */}
          <div className="reveal">
            {/* Email */}
            <div className="mb-10">
              <p
                className="text-caption font-semibold mb-2"
                style={{
                  color: 'var(--text-muted)',
                  letterSpacing: '0.08em',
                }}
              >
                EMAIL ME
              </p>

              <a
                href={'mailto:' + DEVELOPER.email}
                className="inline-flex items-center gap-2 text-[17px] sm:text-[18px] font-semibold link-underline"
                style={{
                  color: 'var(--text-primary)',
                }}
              >
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <MailIcon />
                </span>

                <span>{DEVELOPER.email}</span>
              </a>
            </div>

            {/* Connect With Me */}
            {socials.length > 0 && (
              <div>
                <p
                  className="text-caption font-semibold mb-4"
                  style={{
                    color: 'var(--text-muted)',
                    letterSpacing: '0.08em',
                  }}
                >
                  CONNECT WITH ME
                </p>

                <div className="space-y-3">
                  {socials.map((social) => (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex items-center gap-4 group w-fit"
                    >
                      <span
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: 'var(--bg)',
                          border: '1px solid var(--border)',
                          color: 'var(--accent)',
                          transition:
                            'transform 180ms var(--ease-out), border-color 180ms var(--ease-out)',
                        }}
                      >
                        {social.icon}
                      </span>

                      <span>
                        <span
                          className="block text-caption font-semibold uppercase"
                          style={{
                            color: 'var(--text-muted)',
                            letterSpacing: '0.06em',
                          }}
                        >
                          {social.label}
                        </span>

                        <span
                          className="block text-[16px] font-semibold"
                          style={{
                            color: 'var(--text-primary)',
                          }}
                        >
                          {social.label}
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* =========================
              RIGHT SIDE — MINI GAME
          ========================= */}
          <div className="reveal flex items-center justify-center">
            <div className="w-full max-w-[560px]">
              <RPSGame />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
