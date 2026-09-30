# E2E Test Infra: CA Foundation Exam Preparation Tracker

## Test Philosophy
- Opaque-box, requirement-driven testing. Validates exact user behaviors, formulas, and state persistence without depending on private internal components.
- Systematic 4-tier + Tier 5 adversarial coverage model:
  - Tier 1: Feature Coverage (>=5 test cases per feature covering happy path).
  - Tier 2: Boundary & Corner Cases (empty inputs, zero values, max thresholds, invalid CSVs, leap years, timezone offsets).
  - Tier 3: Cross-Feature Combinations (Pairwise interactions: Ingestion -> Checklist toggle -> Dashboard recalculation -> Revision cycle -> Test series score -> Pass/Fail aggregate).
  - Tier 4: Real-World Workload Scenarios (Complete 30-day student study workflows, bulk schedule imports, full mock exam simulation across all 4 subjects).
  - Tier 5: Adversarial Coverage Hardening (Stress tests, memory leaks, offline reconnection races, malformed payloads).

## Feature Inventory & Target Test Allocations
| # | Feature | Requirement Source | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|---------------------|:------:|:------:|:------:|:------:|
| 1 | Apple Minimalist Design & Theme | R6 | 5 | 5 | ✓ | ✓ |
| 2 | Responsive Shell & Dual Navigation | R6 | 5 | 5 | ✓ | ✓ |
| 3 | Seed Blueprint & 4 Subjects | R5 | 5 | 5 | ✓ | ✓ |
| 4 | Firebase & Offline Storage Layer | R7 | 5 | 5 | ✓ | ✓ |
| 5 | Today's Action Plan & 1-Tap Toggle | R1 | 5 | 5 | ✓ | ✓ |
| 6 | 4-Subject Completion Gauges | R1 | 5 | 5 | ✓ | ✓ |
| 7 | Live Exam Countdown & Metrics | R1 | 5 | 5 | ✓ | ✓ |
| 8 | Hierarchical Checklist (Subject > Chapter > Topic) | R2 | 5 | 5 | ✓ | ✓ |
| 9 | Status Transitions & Auto-Timestamping | R2 | 5 | 5 | ✓ | ✓ |
| 10 | Search & Multi-Filter Engine | R2 | 5 | 5 | ✓ | ✓ |
| 11 | Custom Topic & Chapter Creation | R2 | 5 | 5 | ✓ | ✓ |
| 12 | Schedule Ingestion & Export (JSON/CSV) | R5 | 5 | 5 | ✓ | ✓ |
| 13 | Test Series Logger & Threshold Calculator | R3 | 5 | 5 | ✓ | ✓ |
| 14 | Test Performance Analytics & Trajectory | R3 | 5 | 5 | ✓ | ✓ |
| 15 | Spaced Revision Planner (R1, R2, R3+) | R4 | 5 | 5 | ✓ | ✓ |
| 16 | 1-Tap Revision Increment & Mistake Log | R4 | 5 | 5 | ✓ | ✓ |
| 17 | Firebase Hosting & SPA Routing | R7 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Test Framework: Vitest / Playwright / Node runner executing automated unit, integration, and E2E simulation suites.
- Test Runner Location: `tests/` directory with `tests/run_all_tests.ts` or `npm test`.
- Pass/Fail Semantics: Exit code 0 on 100% test pass, non-zero on any failure.
- Thresholds:
  - Tier 1: >= 85 test cases
  - Tier 2: >= 85 test cases
  - Tier 3: >= 17 pairwise integration cases
  - Tier 4: >= 8 end-to-end realistic user workflows
  - Total Target: >= 195 comprehensive test cases.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised |
|---|----------|--------------------|
| 1 | Full Student Day-1 Onboarding: Fresh load -> default blueprint verify -> set exam date -> check countdown -> complete 3 topics across 2 subjects | F1, F3, F6, F7, F8, F9, F10 |
| 2 | Spaced Repetition Workflow: Complete topic -> auto-schedule R1 (+3d) -> increment to R2 with High confidence (+10.5d) -> add mistake note -> verify Action Plan due status | F5, F8, F9, F15, F16 |
| 3 | Custom Syllabus Ingestion & Conflict Resolution: Export CSV -> edit target dates & add custom chapter -> Import with "Merge" mode -> verify additions without data loss | F8, F11, F12, F13 |
| 4 | Complete 4-Paper Mock Exam Cycle: Log Paper 1 (65/100, Pass), Paper 2 (38/100, Fail individual), Paper 3 (70/100, Pass), Paper 4 (55/100, Pass) -> Aggregate 228/400 (57%) -> Verify Overall Fail status due to Paper 2 | F13, F14, F6 |
| 5 | Offline-to-Online Seamless Sync: Go offline -> toggle 5 topic statuses -> log 1 mock test -> reconnect -> verify persistence across tabs and reload | F4, F9, F13, F6 |
| 6 | Extreme Boundary Schedule Ingestion: Ingest malformed CSV with missing headers, negative hours, and duplicate IDs -> verify graceful error reporting without crashing state | F12 |
| 7 | Full Theme & Viewport Responsive Adaptation: Switch between Light/Dark -> Resize viewport 375px -> 768px -> 1440px -> verify zero horizontal overflow, nav toggle, and tap targets >=44px | F1, F2 |
| 8 | 100% Syllabus Mastery Simulation: Mark all 129 topics complete -> verify all 4 gauges hit 100%, streak counter increments, celebration micro-interaction triggers | F5, F6, F7, F8, F9 |
