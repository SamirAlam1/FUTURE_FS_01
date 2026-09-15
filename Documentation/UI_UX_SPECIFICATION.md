# UI/UX Specification

**Product:** Samir Alam — Developer Portfolio  
**Version:** 1.0  
**Status:** As-built — reflects `frontend/src/index.css` and component source

---

## 1. Design Philosophy

The interface follows three principles:
1. **Editorial restraint** — every element earns its place; decoration serves hierarchy, not novelty
2. **Craft over template** — spacing, typography, and motion are calibrated manually, not generated from defaults
3. **Honest interaction** — hover states, transitions, and focus rings give clear feedback without being distracting

---

## 2. Colour Tokens

All values are CSS custom properties. The `.dark` class on `<html>` overrides them.

### Light Mode (`:root`)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#F5F4F1` | Page background |
| `--surface` | `#FFFFFF` | Cards, panels |
| `--surface-elevated` | `#EDECEA` | Hover states, chips |
| `--surface-overlay` | `rgba(245,244,241,0.94)` | Navbar backdrop blur |
| `--text-primary` | `#111110` | Headings, body text |
| `--text-secondary` | `#4A4A48` | Subtext, descriptions |
| `--text-muted` | `#8A8A87` | Labels, placeholders, inactive nav |
| `--border` | `#DDDBD7` | Default borders |
| `--border-subtle` | `#EEEDEA` | Dividers |
| `--accent` | `#2A7A68` | Primary colour: links, icons, indicators |
| `--accent-hover` | `#1E6054` | Accent on hover |
| `--accent-surface` | `#EAF4F1` | Accent background tint |
| `--accent-text` | `#1C5A4D` | Text on accent-surface |
| `--cta` | `#111110` | Primary button background |
| `--cta-hover` | `#2A2A28` | Primary button hover |
| `--cta-text` | `#F5F4F1` | Primary button text |
| `--footer-bg` | `#0F0F0E` | Footer (always dark) |

### Dark Mode (`.dark`)

| Token | Value |
|-------|-------|
| `--bg` | `#0D0D0C` |
| `--surface` | `#151513` |
| `--surface-elevated` | `#1C1C1A` |
| `--text-primary` | `#EDEBE4` |
| `--text-secondary` | `#A5A29C` |
| `--text-muted` | `#605E58` |
| `--border` | `#242320` |
| `--accent` | `#48B29C` |
| `--accent-surface` | `#162E29` |
| `--cta` | `#EDEBE4` |
| `--cta-text` | `#0D0D0C` |

---

## 3. Typography

### Fonts

| Role | Family | Source |
|------|--------|--------|
| Body / UI | DM Sans | Google Fonts |
| Display / Italic accents | Instrument Serif | Google Fonts |
| Monospace / code / labels | JetBrains Mono | Google Fonts |

### Type Scale

All sizes use `clamp()` for fluid scaling — no breakpoint overrides required.

| Class | Size (clamp) | Weight | Line-height | Letter-spacing |
|-------|-------------|--------|-------------|----------------|
| `.text-display` | clamp(40px, 5.5vw, 70px) | 700 | 1.03 | -0.04em |
| `.text-h1` | clamp(34px, 4vw, 52px) | 700 | 1.08 | -0.035em |
| `.text-h2` | clamp(26px, 2.8vw, 38px) | 600 | 1.14 | -0.025em |
| `.text-h3` | clamp(18px, 1.6vw, 21px) | 600 | 1.30 | -0.015em |
| `.text-body-lg` | clamp(15px, 1.1vw, 17px) | 400 | 1.78 | — |
| `.text-body` | 15px | 400 | 1.70 | — |
| `.text-small` | 13px | 400 | 1.60 | — |
| `.text-caption` | 11px | 400 | 1.50 | 0.02em |

**Italic serif accents** (`font-serif italic`) are used at display/h1 sizes for one keyword in each section heading, always in `--accent` colour.

---

## 4. Spacing

No custom spacing tokens — Tailwind's default 4px base scale is used throughout. Common patterns:

| Context | Value |
|---------|-------|
| Section vertical padding | `py-20 md:py-28` (80px / 112px) |
| Container max-width | `max-w-[1280px]` |
| Container horizontal padding | `px-5 sm:px-8` (20px / 32px) |
| Section tag → heading gap | `mb-20px` (section-tag margin-bottom) |
| Heading → body gap | `mb-8px` inline |
| Card inner padding | `p-5` (20px) |
| Card gap in grid | `gap-5` (20px) |

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | 3px | Monospace chips |
| `--radius-sm` | 6px | Small badges |
| `--radius-md` | 10px | Inputs, small cards |
| `--radius-lg` | 14px | Cards |
| `--radius-xl` | 20px | Large cards |
| `--radius-pill` | 999px | Buttons, status badges |

---

## 6. Shadow Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 3px …` | Subtle lift |
| `--shadow-sm` | `0 2px 8px …` | Input focus, small cards |
| `--shadow-md` | `0 6px 24px …` | Floating elements, hover |
| `--shadow-lg` | `0 16px 48px …` | Project cards on hover, photo |

Dark mode values have higher opacity to remain visible.

---

## 7. Motion System

### Easing

| Token | Curve | Usage |
|-------|-------|-------|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Buttons, icon buttons, nav pill, skill pills — any element that physically "springs" |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Reveals, dropdowns, card lift — elements entering the screen |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` | Crossfades |

### Speed

| Token | Duration | Usage |
|-------|----------|-------|
| `--t-fast` | 120ms | Active/pressed states |
| `--t-base` | 200ms | Hover transitions |
| `--t-slow` | 380ms | Nav pill slide, scroll reveal |

### Named Animations

| Animation | Trigger | Behaviour |
|-----------|---------|-----------|
| Scroll reveal | IntersectionObserver (threshold 0.06) | `.reveal` elements fade in + translateY 14px→0 over 550ms `--ease-out` |
| Stagger children | IntersectionObserver on container | CSS nth-child delays (0, 60, 120, … ms) |
| Typewriter | React state machine | 60ms/char type, 35ms/char erase, 1800ms pause |
| Ping dot | CSS `@keyframes ping` | Scale 1→1.6 + fade, 2s infinite |
| Shimmer text | CSS `background-position` | Gradient animates 4s linear infinite |
| Border beam | CSS `::after` with gradient | CTA button shimmer on hover |
| Nav pill | CSS `left` + `width` | 380ms spring, DOM rect measurement |
| Card 3D tilt | `mousemove` → `rotateX/Y` | Max ±3°, `perspective(800px)` |
| Toast enter | `@keyframes slideInUp` | 0.35s `--ease-out` |
| Login fade-up | `@keyframes loginFadeUp` | 0.45s `--ease-out` on mount |
| Scroll hint | `@keyframes scrollPulse` | 2s ease-in-out infinite, scaleY 1→1.15 |

**Reduced motion:** All transitions/animations are disabled when `prefers-reduced-motion: reduce` matches.

---

## 8. Components

### 8.1 Section Tag

```
● label
```
- Dot: 5px circle, `--accent` background
- Label: JetBrains Mono 11.5px, `--accent` colour, 0.06em letter-spacing
- Used at the top of every section

### 8.2 Buttons

| Class | Background | Border | Text | Radius |
|-------|-----------|--------|------|--------|
| `.btn-primary` | `--cta` | `--cta` | `--cta-text` | pill |
| `.btn-outline` | transparent | `--border` | `--text-secondary` | pill |
| `.btn-ghost` | transparent | none | `--text-muted` | `--radius-md` |

All buttons: `translateY(-1px)` + `--shadow-md` on hover; `translateY(0)` on active.  
`.btn-beam` adds a `::after` shimmer border effect on hover.

### 8.3 Icon Button (`.icon-btn`)

36×36px circle, border `--border`, colour `--text-muted`.  
Hover: `scale(1.08)` with spring easing.  
Active: `scale(0.96)`.

### 8.4 Inputs (`.input-base`)

- Border: 1.5px `--border`; hover: `--text-muted`; focus: `--accent` + 3px `--accent-surface` ring
- Error state (`.has-error`): `--error` border + `--error-surface` ring
- Floating labels: position and font-size animate when input has value or focus

### 8.5 Cards

All cards use:
- `border: 1px solid --border`
- `background: --surface`
- Hover: `translateY(-3px)`, `--shadow-lg`, `border-color: --text-muted`
- Project cards additionally: 3D perspective tilt on `mousemove` (max ±3°)

### 8.6 Tech Badges (`.tech-badge`)

JetBrains Mono 11px, `--surface-elevated` background, `--text-muted` colour, pill radius.

### 8.7 Skill Pills (`.skill-pill`)

13px, `--surface` background, `--border` border, `--text-secondary` colour.  
Hover: `--accent` border + text, `--accent-surface` background, `translateY(-1px)`.

---

## 9. Page Layouts

### 9.1 Home (`/`)
Full-width sections stacked vertically. Each section: `max-w-[1280px]` centred container with `px-5 sm:px-8`. Alternating background: `--bg` / `--surface`.

### 9.2 Projects (`/projects`)
Header bar (breadcrumb + title), filter bar (search + category pills + sort), results summary, 1→2→3 column grid.

### 9.3 Admin Panel
Fixed-width sidebar (208px on desktop) + main content area. Top bar with page title. Sidebar collapses to overlay on mobile.

---

## 10. Responsive Breakpoints

Uses Tailwind's default scale:

| Breakpoint | Min-width | Key changes |
|------------|-----------|-------------|
| default | 0px | Single column, mobile menu |
| `sm` | 640px | 2-column project grid, wider padding |
| `md` | 768px | Desktop nav visible, mobile menu hidden |
| `lg` | 1024px | Hero 2-column, contact 2-column |
| (max) | 1280px | Container max-width |

---

## 11. Accessibility

| Feature | Implementation |
|---------|----------------|
| Focus visible | `outline: 2px solid --accent; outline-offset: 2px` on all `:focus-visible` |
| ARIA labels | All icon buttons, social links, nav toggles have `aria-label` |
| ARIA current | Active nav link: `aria-current="page"` |
| ARIA expanded | Mobile menu toggle: `aria-expanded`, `aria-controls` |
| ARIA invalid | Form fields: `aria-invalid`, `aria-describedby` for errors |
| ARIA hidden | Decorative elements: `aria-hidden="true"` |
| Roles | `role="alert"` on error messages; `role="group"` on filter buttons |
| Semantic HTML | `<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`, `<blockquote>` |
| Reduced motion | All animations disabled via `prefers-reduced-motion: reduce` |
| Colour contrast | All text meets WCAG AA against their backgrounds |
| Keyboard navigation | All interactive elements reachable and operable via keyboard |
