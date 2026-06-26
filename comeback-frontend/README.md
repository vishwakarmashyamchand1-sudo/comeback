# Comeback — React PWA

AI fitness coaching onboarding for Indian urban professionals returning to the gym after a gap. Built with **Vite + React + vite-plugin-pwa**. Installable, works offline, ports the `comeback.css` design system 1:1.

## Run it

```bash
cd comeback-pwa
npm install
npm run dev          # http://localhost:5173
```

Build & preview the production PWA (service worker only runs in build/preview unless devOptions are on):

```bash
npm run build
npm run preview
```

Open on a phone (same Wi-Fi) via the network URL Vite prints, then **Add to Home Screen** to install it as a standalone app.

## What's inside

```
src/
  index.css              Design system — tokens, components (ported from comeback.css)
  main.jsx               Entry — wraps <App> in <OnboardingProvider>
  App.jsx                Step router + transitions + generating/plan-ready
  lib/
    store.jsx            useReducer store, persists to localStorage (Skip / resume)
    derive.js            Age, BMI, BMI band, field validators (pure)
  components/
    UI.jsx               StatusBar, ProgressSteps, ObHeader, TextField, SuffixField,
                         Pill, OptionCard, CheckRow, PrimaryButton …
  screens/
    Step1.jsx  Basic stats  → name, gender, DOB (→ age), height/weight (→ BMI)
    Step2.jsx  Background    → level, last active, days/week, time
    Step3.jsx  Goal          → goal, target, urgency
    Step4.jsx  Diet          → diet type, restrictions, supplements
    Step5.jsx  Health        → injuries, conditions, exercises to avoid
    Generating.jsx          Animated plan-build → plan ready
public/
  manifest via vite.config.js · icon-192/512/180.png · favicon.svg
```

## Design system → code mapping

| Token / class            | Where |
|--------------------------|-------|
| `--c-*`, `--r-*`, `--s-*`| `src/index.css :root` — same names as `comeback.css` |
| `.btn`, `.input`, `.pill`, `.opt-card`, `.day-chip`, `.inj-card` | `src/index.css`, rendered by `components/UI.jsx` |
| Phone frame              | `.app-shell` — full viewport on mobile, framed device ≥460px |

## State, validation & motion

- **State** lives in one reducer (`lib/store.jsx`) and auto-saves to `localStorage` — refreshing or hitting **Skip** resumes where you left off.
- **Derived, read-only**: age (from DOB) and BMI + colour band (from height/weight) recompute live in Step 1.
- **Validation**: height 100–230 cm, weight 30–250 kg; the **Continue** button stays disabled until each step's required fields are valid.
- **Motion**: 280 ms slide+fade between steps, spinner + staged checklist on the generating screen; all suppressed under `prefers-reduced-motion`.

## Notes

- Tabler icons load from CDN and are cached by the service worker for offline use. To fully self-host, `npm i @tabler/icons-webfont` and import it in `main.jsx` instead of the CDN `<link>` in `index.html`.
- The "Let's go" button on the plan-ready screen is a stub — wire it to your dashboard/route when that module exists.
