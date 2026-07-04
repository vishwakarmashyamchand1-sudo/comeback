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
  index.css              Design system — tokens, onboarding + main-app components (from comeback.css)
  main.jsx               Entry — renders <Root>
  Root.jsx               Phase switch: onboarding flow → main app (localStorage flag)
  App.jsx                Onboarding step router + transitions + generating/plan-ready
  lib/
    store.jsx            useReducer store, persists to localStorage (Skip / resume)
    derive.js            Age, BMI, BMI band, field validators (pure)
  components/
    UI.jsx               Onboarding primitives: StatusBar, ProgressSteps, TextField …
  screens/               ONBOARDING
    Step1.jsx  Basic stats  → name, gender, DOB (→ age), height/weight (→ BMI)
    Step2.jsx  Background    → level, last active, days/week, time
    Step3.jsx  Goal          → goal, target, urgency
    Step4.jsx  Diet          → diet type, restrictions, supplements
    Step5.jsx  Health        → injuries, conditions, exercises to avoid
    Generating.jsx          Animated plan-build → plan ready
  app/                   MAIN APP (post-onboarding)
    AppShell.jsx         4-tab bottom nav + pushed-screen stack
    data.js              Mock data (workout, nutrition, circle, patterns …)
    components.jsx       StatusBar, TabBar, Bar, CoachCard, Thumb, PushHeader
    screens/
      workout.jsx        Dashboard · WorkoutPlan · ActiveWorkout · PostSession
      diet.jsx           Diet (calorie ring, water, macros) · FoodPhoto (analyse→results)
      social.jsx         Coach chat · Progress · Circle (+ empty)
      ExerciseBrowser.jsx  Search grid + detail bottom sheet
public/
  manifest via vite.config.js · icon-192/512/180.png · favicon.svg
```

## Navigation model

`Root` shows onboarding until "Let's go", then flips to `AppShell` (flag in `localStorage`).
The app has **4 tabs** — Workout, Diet, Coach, Progress — plus **pushed full screens**
(Workout Plan → Active → Post-session, Food Photo, Exercise Browser, Circle) managed by a
simple stack in `AppShell`. Interactions are live: tab switch, set logging + timer, water
tap, session rating, meal-type select, muscle filters, exercise detail sheet.

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
