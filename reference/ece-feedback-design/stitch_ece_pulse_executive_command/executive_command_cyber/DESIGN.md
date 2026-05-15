---
name: Executive Command Cyber
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#b9cac9'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#839493'
  outline-variant: '#3a4a49'
  surface-tint: '#00dddd'
  primary: '#ffffff'
  on-primary: '#003737'
  primary-container: '#00fbfb'
  on-primary-container: '#007070'
  inverse-primary: '#006a6a'
  secondary: '#6bd8cb'
  on-secondary: '#003732'
  secondary-container: '#29a195'
  on-secondary-container: '#00302b'
  tertiary: '#ffffff'
  on-tertiary: '#263235'
  tertiary-container: '#d7e5e8'
  on-tertiary-container: '#5a6769'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#00fbfb'
  primary-fixed-dim: '#00dddd'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f4f'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#d7e5e8'
  tertiary-fixed-dim: '#bbc9cb'
  on-tertiary-fixed: '#111e20'
  on-tertiary-fixed-variant: '#3c494b'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  stats-xl:
    fontFamily: Sora
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 2rem
  margin-mobile: 1.5rem
  margin-desktop: 4rem
  stack-sm: 0.5rem
  stack-md: 1.5rem
  stack-lg: 3rem
---

## Brand & Style

This design system embodies a "Cyber-Executive" aesthetic—a fusion of high-end corporate professionalism and futuristic data visualization. The interface functions as a high-stakes command center, prioritizing clarity, speed, and premium materiality. 

The visual narrative is driven by **Glassmorphism**. UI elements appear as floating panes of smart glass, utilizing backdrop blurs and micro-thin borders to create depth without visual clutter. The atmosphere is quiet, dark, and focused, evoking the feeling of a premium night-mode environment where critical data is illuminated by soft neon accents. Every interaction should feel smooth and intentional, utilizing gradual transitions rather than abrupt changes.

## Colors

The palette is anchored in a deep, atmospheric "Obsidian Teal" spectrum. The background is not a flat black, but a sophisticated gradient starting from a very dark teal and descending into true black.

- **Primary (Cyan Neon):** Used sparingly for critical action points, data peaks, and active states. It should feel like a light source.
- **Secondary (Teal Highlights):** Used for supporting information, secondary buttons, and decorative accents that provide depth.
- **Surface (Glass):** A semi-transparent layer (`rgba(255, 255, 255, 0.03)`) with a subtle `1px` border of `rgba(0, 255, 255, 0.1)`.
- **Accents:** Use soft glows (outer shadows) in Primary Cyan to indicate focus or "Pulse" states.

## Typography

The typography system balances the technical precision of **Inter** with the modern, geometric flair of **Sora**. 

- **Headlines:** Sora is used for all major headings and data visualizations to provide a "tech-forward" personality.
- **Body:** Inter handles all long-form text and interface labels, ensuring maximum readability in dark environments.
- **Data/Labels:** **JetBrains Mono** is introduced for secondary labels, timestamps, and ID numbers to reinforce the "command center" and "pulse" data-tracking nature of the product.

All text on dark backgrounds should use a high-contrast white (`#F8FAFC`) for primary content and a muted slate (`#94A3B8`) for secondary information.

## Layout & Spacing

The layout follows a **spacious fixed-grid** philosophy. Content is contained within a 1440px max-width container to prevent horizontal eye strain on ultrawide monitors common in executive environments.

- **Grid:** A 12-column grid with a generous 32px (2rem) gutter to ensure elements "breathe."
- **Alignment:** Strict adherence to left-alignment for text, while data cards should be perfectly symmetrical. 
- **Density:** Maintain low information density on landing views (Executive Overview) and medium density for drill-down feedback reports.
- **Safe Zones:** Use large 64px (4rem) vertical margins between major sections to emphasize the premium, minimalist aesthetic.

## Elevation & Depth

Depth in this design system is not achieved through traditional shadows, but through **Tonal Layering and Refraction**.

- **Level 1 (Base):** The dark teal-to-black gradient background.
- **Level 2 (Cards/Panes):** Semi-transparent glass panels with a `12px` to `20px` backdrop-blur. Each panel features a `1px` inner stroke of `rgba(255, 255, 255, 0.05)` to catch the light.
- **Level 3 (Popovers/Modals):** Increased opacity and a soft Cyan outer glow (`drop-shadow: 0 0 20px rgba(0, 255, 255, 0.15)`) to simulate the element being physically closer to the user and emitting light.

Avoid solid backgrounds; everything should feel like a lens through which the base gradient is still partially visible.

## Shapes

The shape language is defined by "Large Softness." We use **Rounded (Level 2)** settings to ensure the UI feels approachable and high-end rather than aggressive.

- **Standard Elements:** 16px (1rem) corner radius for buttons and input fields.
- **Large Containers:** 24px (1.5rem) corner radius for glass cards and dashboard sections.
- **Decorative:** Small circular pips for status indicators (Online/Offline) to contrast against the large rounded rectangles.

## Components

### Buttons
- **Primary:** Solid Cyan (#00FFFF) with black text. On hover, add a `0 0 15px` cyan glow.
- **Ghost:** Transparent with a 1px Cyan border. On hover, fill with `rgba(0, 255, 255, 0.1)`.

### Cards (Glass Panes)
All cards must feature `backdrop-filter: blur(16px)` and a subtle gradient border from `rgba(0, 255, 255, 0.2)` at the top-left to `transparent` at the bottom-right.

### Input Fields
Dark, recessed fields with `rgba(0, 0, 0, 0.4)` background. The focus state should illuminate the entire border in Cyan with a soft inner glow.

### Chips/Badges
Small, pill-shaped elements with lowercase JetBrains Mono text. Use a low-opacity version of the status color (e.g., Teal for positive feedback, Red for negative) as the background.

### Feedback Pulse (Special Component)
A custom data visualization component consisting of a thin Cyan line chart that glows. "Pulse" points should have a radiating ring animation to draw executive attention.

### Empty States
Avoid generic icons. Use minimalist, wireframe-style illustrations with thin Cyan lines and high transparency to maintain the sophisticated atmosphere.