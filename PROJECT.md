# Project: CA Foundation Exam Preparation Tracker (ca-tracker)

## Architecture
- **Frontend Stack**: Vite 6 + React 18 + TypeScript 5 + Tailwind CSS v3 + Lucide React + Canvas Confetti + Vitest 3.
- **Design Language**: Apple-minimalist aesthetic (neutral Zinc palette `zinc-950` to `zinc-50`, 1px hairline borders `border-zinc-200 dark:border-zinc-800`, subtle backdrop-blur `backdrop-blur-xl`, SF Pro typography scale, tabular-nums for metrics, >=44px touch targets).
- **Navigation Architecture**: Responsive dual-mode layout:
  - Desktop (>=1024px): Left collapsible glass sidebar with navigation items and quick progress summary.
  - Mobile (<1024px): Floating bottom dock with high-contrast active icons, zero horizontal overflow, and full touch accessibility.
- **Data & State Management**: Dual-tier storage architecture:
  - Tier 1 (Cloud): Firebase Cloud Firestore with `initializeFirestore` and `persistentLocalCache({ tabManager: persistentMultipleTabManager() })` for multi-tab offline synchronization.
  - Tier 2 (Local): LocalStorage synchronous cache and fallback for 100% offline functionality.
  - State Layer: React Context (`DataContext`, `ThemeContext`).
- **Domain Logic**:
  - Official ICAI 4-Paper Syllabus Blueprint pre-loaded (45 chapters, 129 topics across Accounting, Business Laws, Quantitative Aptitude, Business Economics).
  - ICAI Dual Passing Rules (>=40% per subject, >=50% aggregate).
  - Spaced Repetition Formula ($I_{\text{next}} = \text{base} \times \text{multiplier}$ for R1, R2, R3+).
  - Import/Export Engine (JSON/CSV with validation, schema enforcement, and conflict resolution).

## Feature Inventory
| # | Feature | Description | Milestone | Status |
|---|---------|-------------|-----------|--------|
| 1 | Apple Minimalist Design System | Zinc color palette, dark/light theme toggle, typography, micro-interactions, >=44px touch targets | M1 | DONE |
| 2 | Responsive Shell & Dual Navigation | Desktop collapsible sidebar + mobile bottom floating dock with zero horizontal scroll | M1 | DONE |
| 3 | Core State & Seed Blueprint | Pre-loaded ICAI syllabus (4 papers, 45 chapters, 129 topics) with ID deduplication | M1 | DONE |
| 4 | Firebase Modular Client Setup | Firebase app initialization, Firestore multi-tab offline persistence config, security rules | M2 | DONE |
| 5 | Offline-First Data Repository Hooks | Synchronized CRUD hooks with LocalStorage fallback | M2 | DONE |
| 6 | Today's Action Plan Widget | Dynamic daily aggregation of due lessons, pending revisions, and scheduled mock tests with 1-tap complete | M3 | DONE |
| 7 | 4-Subject Progress Gauges | Real-time completion percentage gauges for Accounting, Laws, Quant, Economics | M3 | DONE |
| 8 | Live Exam Countdown & Metrics | Precision countdown to CA Foundation exam date, daily study streak tracker, daily study metrics | M3 | DONE |
| 9 | Hierarchical Checklist View | 3-tier tree (Subject > Chapter > Topic) with status indicators, badges, and smooth accordion controls | M4 | DONE |
| 10 | Status Toggling & Timestamping | 1-tap transition (Pending -> In Progress -> Completed) with automatic startedAt / completedAt timestamp logging | M4 | DONE |
| 11 | Checklist Search & Filtering | Multi-criteria filter (Subject, Status, Due Date range) and instant fuzzy/tokenized search | M4 | DONE |
| 12 | Custom Topic/Chapter Creation | Modal to add custom chapters or sub-topics with validation and immediate persistence | M4 | DONE |
| 13 | Schedule Ingestion & Export Hub | Full syllabus blueprint reset, CSV/JSON file import with validation & conflict resolution (Merge/Overwrite/Skip), JSON/CSV export, template download | M4 | DONE |
| 14 | Test Series Logger Form | Form to log Chapter, Unit, and Mock tests (Name, Subject, Date, Marks, Total Marks, Notes) | M5 | DONE |
| 15 | ICAI Pass/Fail Rule Engine | Automatic score percentage calculation and CA Foundation threshold indicators (40% subject, 50% aggregate) | M5 | DONE |
| 16 | Test Analytics & Weak Area Tracker | Historical test log, subject-wise score trends, score trajectory regression, and Chapter Weakness Index | M5 | DONE |
| 17 | Spaced Revision Planner | Spaced repetition tracker (R1, R2, R3+) with automatic next target date calculation ($+3, +7, +14, +30, +45$ days modified by confidence) | M5 | DONE |
| 18 | Revision 1-Tap Increment & Mistake Log | 1-tap revision progression button, confidence rating (Low/Med/High), and mistake notebook logger | M5 | DONE |
| 19 | Comprehensive E2E Testing Suite | Opaque-box automated tests covering Tiers 1-4 (Features, Boundaries, Combinations, Real-World Workflows) | M6 | DONE |
| 20 | Adversarial Coverage Hardening | Tier 5 white-box challenger analysis, edge cases, error boundary stress testing, and fixes | M6 | DONE |
| 21 | Production Build & SPA Configuration | Clean `npm run build` bundle, `firebase.json` SPA rewrites & security headers | M7 | DONE |
| 22 | Live Firebase Hosting Deployment | Public live deployment to Firebase Hosting and verification of live URL (`https://ca-tracker-ap28-2026.web.app`) | M7 | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Foundation Setup & Shell (R6) | Vite, React, TS, Tailwind, Apple Zinc theme, responsive navigation, seed blueprint data | none | DONE |
| M2 | Data Layer & Firebase Sync (R7) | Firebase SDK, Firestore offline persistence, synced repository hooks, offline fallback | M1 | DONE |
| M3 | Daily Command Dashboard (R1) | Action plan with 1-tap complete, 4-subject progress gauges, live exam countdown, daily streak | M1, M2 | DONE |
| M4 | Checklist & Ingestion Hub (R2, R5) | Hierarchical tree, search/filter, custom topics, JSON/CSV import/export engine | M1, M2 | DONE |
| M5 | Test Logger & Revision Planner (R3, R4) | Test logger, 40/50% threshold pass engine, analytics, spaced revision planner, mistake notebook | M1, M2 | DONE |
| M6 | Comprehensive Testing & Hardening | Opaque-box E2E test execution (Tiers 1-4) + Tier 5 adversarial hardening (313 tests) | M3, M4, M5 | DONE |
| M7 | Production Build & Live Deployment | Production bundling, Firebase Hosting deployment (`https://ca-tracker-ap28-2026.web.app`) | M6 | DONE |

## Live Deployment
- **URL**: https://ca-tracker-ap28-2026.web.app
- **Firebase Project**: `ca-tracker-ap28-2026`
- **Hosting Target**: Production Live SPA
