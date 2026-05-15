---
name: Cyber-Executive Command
colors:
  surface: '#0d1515'
  surface-dim: '#0d1515'
  surface-bright: '#333b3b'
  surface-container-lowest: '#081010'
  surface-container-low: '#151d1e'
  surface-container: '#192122'
  surface-container-high: '#232b2c'
  surface-container-highest: '#2e3637'
  on-surface: '#dce4e4'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dce4e4'
  inverse-on-surface: '#2a3232'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dce6'
  primary: '#e0fdff'
  on-primary: '#00373a'
  primary-container: '#00f2fe'
  on-primary-container: '#006a70'
  inverse-primary: '#00696f'
  secondary: '#c6c6cd'
  on-secondary: '#2e3036'
  secondary-container: '#47494f'
  on-secondary-container: '#b7b8bf'
  tertiary: '#fff6e4'
  on-tertiary: '#3b2f00'
  tertiary-container: '#fed83a'
  on-tertiary-container: '#725e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ff6ff'
  primary-fixed-dim: '#00dce6'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f53'
  secondary-fixed: '#e2e2e9'
  secondary-fixed-dim: '#c6c6cd'
  on-secondary-fixed: '#1a1b21'
  on-secondary-fixed-variant: '#45474c'
  tertiary-fixed: '#ffe173'
  tertiary-fixed-dim: '#e8c423'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#554500'
  background: '#0d1515'
  on-background: '#dce4e4'
  surface-variant: '#2e3637'
typography:
  display-kpi:
    fontFamily: metropolis
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: metropolis
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: metropolis
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: metropolis
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: metropolis
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: jetbrainsMono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  display-kpi-mobile:
    fontFamily: metropolis
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 24px
  gutter: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  widget-gap: 24px
---

## Brand & Style

This design system is engineered for executive-level oversight in the ECE Pulse Feedback ecosystem. It balances the high-intensity aesthetics of a futuristic command center with the disciplined, structural clarity of high-end BI tools. The visual language conveys intelligence, real-time responsiveness, and "mission-critical" stability.

The style is a hybrid of **Glassmorphism** and **Corporate Modernism**. It utilizes deep atmospheric depth, translucent surfacing, and precise neon accents to differentiate data streams. The interface should feel like a premium digital cockpit—dark, focused, and powerful.

**Key Principles:**
- **Executive Precision:** Every pixel serves a data purpose; no unnecessary decorative elements.
- **Atmospheric Depth:** Use of gradients and blurs to create a multi-layered information architecture.
- **Radiant Feedback:** Interactive elements emit a soft glow, simulating hardware feedback in a digital space.

## Colors

The palette is built upon a **Deep Navy Base** to reduce eye strain and provide a canvas for vibrant data visualization. 

- **Primary Neon Cyan (#00F2FE):** Reserved for primary actions, active states, and critical "Pulse" indicators. Use with a 10-15px blur shadow to create the "Cyberpunk" glow.
- **Surfaces:** Utilize semi-transparent backgrounds (`rgba(255, 255, 255, 0.03)`) with a `backdrop-filter: blur(20px)` to create the glass effect.
- **Borders:** Containers should feature a subtle top-down linear gradient border from white (10% opacity) to white (2% opacity) to simulate light catching on glass edges. Active cards may use a primary cyan outer glow.

## Typography

Typography focuses on **high-impact legibility** for data analysis. 

- **KPIs & Metrics:** Use `display-kpi` for primary numbers. These should be white and highly prominent.
- **Labels:** Use `jetbrainsMono` for technical labels, timestamps, and secondary metadata to reinforce the "system monitoring" aesthetic.
- **Hierarchy:** Maintain high contrast between primary text (White) and secondary text (Slate-400).

## Layout & Spacing

The layout follows a **structured fluid grid** reminiscent of high-end BI dashboards.

- **Grid:** 12-column system on desktop with a fixed 24px margin.
- **Density:** High information density but with generous "internal" whitespace within cards to maintain the executive feel.
- **Responsibility:** On mobile, widgets stack vertically. The sidebar collapses into a bottom navigation bar or a compact hamburger menu to maximize screen real estate for charts.
- **Padding:** Always maintain at least 24px between major data widgets to prevent visual clutter.

## Elevation & Depth

Depth is communicated through **Z-axis layering** and **glow intensity** rather than traditional drop shadows.

- **Level 0 (Base):** Deep navy gradient background.
- **Level 1 (Cards):** Translucent glass layer. `background: rgba(255, 255, 255, 0.03)`, `backdrop-filter: blur(12px)`.
- **Level 2 (Active/Hover):** Cards gain a `0 0 15px rgba(0, 242, 254, 0.3)` outer glow and a slightly more opaque background.
- **Level 3 (Overlays/Modals):** Darker glass with a solid 1px border `rgba(255, 255, 255, 0.15)`.

## Shapes

The design uses **hyper-rounded corners** for containers to contrast with the sharp, technical data inside.

- **Containers:** Dashboard widgets and cards must use a `20px` radius.
- **Data Bars:** Chart bars should have fully rounded caps (pill-shaped) to feel modern and "soft" despite the dark aesthetic.
- **Interactive Elements:** Buttons and toggles use a slightly tighter `12px` radius for a professional, tool-like appearance.

## Components

### Buttons & Actions
- **Primary:** Solid Cyan (#00F2FE) background with black text. Features a 10px outer glow of the same color.
- **Ghost:** Transparent background with 1px Cyan border. On hover, fills with 10% opacity Cyan.

### Data Visualization
- **Charts:** Use smooth Bezier curves for line graphs. Gradients should flow from the accent color to transparent.
- **KPI Widgets:** Features a large metric, a small sparkline, and a percentage change indicator (using success/danger colors).

### Input Fields
- **Style:** Dark, semi-transparent fills with a "bottom-border only" focus state in Cyan. 
- **Feedback:** Real-time validation uses a subtle glow under the input field (Red for error, Green for success).

### Monitoring Panels (Real-time)
- Based on the reference image's 'Real-time tracking' card:
- Use **Vertical Steppers** for event timelines.
- Active steps should "pulse" with a soft Cyan animation.
- Timestamps are set in `label-sm` (Monospaced).

### Interactive Widgets
- Elements should respond to hover with a "lift" (TranslateY -4px) and an increase in backdrop blur intensity.
- Use **Ripple Animations** for button clicks to emphasize the tactile SaaS experience.