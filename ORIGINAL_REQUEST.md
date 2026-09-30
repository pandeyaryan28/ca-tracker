# Original User Request

## Initial Request — 2026-08-28T13:20:17Z

Build a production-ready, fully responsive, Apple-minimalist web application for CA Foundation exam preparation tracking, integrated with Firebase Cloud Firestore for real-time data persistence and deployed to Firebase Hosting.

Working directory: /home/pandeyaryan28/Documents/ca-tracker
Integrity mode: development

## Requirements

### R1. Minimal Daily Dashboard (Command Center)
- Provide a focused "Today's Action Plan" aggregating scheduled lessons, pending revisions, and upcoming tests due for today with direct 1-tap completion toggles.
- Display individual real-time completion percentages (%) with sleek visual progress indicators (radial gauges/slim bars) for all 4 CA Foundation subjects:
  1. Accounting
  2. Business Laws
  3. Quantitative Aptitude (Maths, LR, Stats)
  4. Business Economics
- Include a live exam target countdown and daily study metrics.

### R2. Hierarchical Lesson Checklist & Timeline Tracker
- Group syllabus items hierarchically: Subject > Chapter > Lesson/Topic.
- Support target completion date assignment and status toggles (Pending | In Progress | Completed) with automatic completion timestamp logging.
- Include fast search, subject filtering, status filtering, and custom topic/chapter creation.

### R3. Test Series & Score Logger
- Form to log chapter tests, unit tests, and full mock tests (Test Name, Subject, Date Attempted, Marks Obtained, Total Marks, Notes/Weaknesses).
- Automatic score percentage calculation and CA Foundation pass threshold indicators (40% individual paper, 50% aggregate).
- Interactive test history log and performance analytics.

### R4. Multi-Stage Revision Planner
- Structured tracker for spaced revision cycles (R1, R2, R3+).
- Track Last Revised Date, Next Target Date, confidence level (Low/Medium/High), and mistake notebook reviews.
- 1-tap revision increment button that automatically logs the revision date and schedules the next cycle.

### R5. Schedule Ingestion Hub & Customization
- Provide a pre-loaded comprehensive CA Foundation syllabus blueprint across all 4 papers.
- Support flexible JSON/CSV schedule import and export so custom chapter schedules and target dates can be ingested or edited easily.

### R6. Apple-Inspired UI/UX & Theming
- Minimalist, distraction-free aesthetic with refined typography, soft neutral zinc palette, subtle borders, and smooth micro-interactions.
- Seamless Dark Mode and Light Mode with instant toggle.
- Fluid responsive layout: desktop sidebar navigation and mobile bottom dock navigation with zero horizontal overflow and touch-friendly targets (>= 44px).

### R7. Firebase Backend & Live Hosting Deployment
- Integrate Firebase Cloud Firestore with offline persistence and user-scoped data structure.
- Create a dedicated Firebase project, configure firebase.json for SPA rewrites, build the production bundle, and deploy live to Firebase Hosting.

## Acceptance Criteria

### Core Functionality & State
- [ ] Dashboard displays today's actionable items and allows 1-tap check-off that immediately updates Firestore.
- [ ] Subject-wise progress gauges accurately compute completion % across all 4 subjects.
- [ ] Lesson checklist supports hierarchical viewing, search, status switching, and auto-stamping completion dates.
- [ ] Test series logger calculates percentages accurately, saves test records, and renders past performance analytics.
- [ ] Revision planner supports multi-cycle progression (R1 -> R2 -> R3) with target date updates.
- [ ] Schedule ingestion hub allows importing custom schedules and loads the default CA Foundation syllabus.

### UI/UX & Responsiveness
- [ ] Dark and Light mode toggle seamlessly switches themes across all components.
- [ ] Layout is fully responsive on desktop (1280px+), tablet (768px), and mobile (375px-430px) viewports with no horizontal scroll.
- [ ] Desktop displays sidebar navigation; mobile displays bottom navigation dock.

### Deployment & Build
- [ ] Project builds cleanly (npm run build) without TypeScript or bundling errors.
- [ ] Application is deployed to a live, publicly accessible Firebase Hosting URL.
