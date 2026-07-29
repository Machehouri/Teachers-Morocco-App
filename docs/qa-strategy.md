# QA Strategy: Private Teachers Morocco

**Version:** 1.0  
**Owner:** QA Team  
**Last Updated:** 2026-07-29  
**Review Cadence:** Quarterly

---

## 1. Executive Summary

Private Teachers Morocco is a full-stack platform connecting students with private teachers. This strategy defines a risk-based testing approach covering the Django REST API backend and React frontend. Primary risks are booking concurrency, JWT auth integrity, and data consistency across reviews/ratings.

**Goal:** Establish a healthy test pyramid (70% unit, 20% integration, 10% E2E) within one quarter, with CI gates enforcing coverage thresholds and flakiness limits.

---

## 2. Scope & Objectives

### In Scope
- Backend: All API endpoints (teachers, reviews, bookings, availability, notifications, auth)
- Frontend: All pages (Home, Login, Signup, Teachers, TeacherProfile, Dashboard, CreateTeacher, EditTeacher, Availability)
- Non-functional: JWT auth flow, booking conflict prevention, email notification
- Browsers: Chrome (primary), Firefox (secondary)

### Out of Scope
- Third-party email delivery (Resend) — tested at contract level only
- Payment integration (not yet implemented)
- Mobile native apps
- Performance/load testing (deferred to Phase 2)

### Objectives
1. Achieve 80% unit test coverage on critical backend models and serializers within 6 weeks
2. Reduce defect escape rate to <5% by end of quarter
3. Establish CI pipeline with automated test gates on every PR within 4 weeks
4. Achieve <10 min CI pipeline duration for PRs

---

## 3. Test Levels & Types

| Level | What It Validates | Owner | Framework | Target Count | Run Frequency |
|-------|-------------------|-------|-----------|-------------|---------------|
| **Unit** | Models, serializers, permissions, validation | Developers | Django TestCase / Jest + RTL | 70% of all tests | Every commit |
| **Integration** | API endpoints, auth flows, DB queries | Developers + QA | DRF APITestCase / Supertest | 20% of all tests | Every PR |
| **E2E** | Critical user journeys (signup, browse, book) | QA/SDET | Playwright | 10% of all tests | Pre-deploy + nightly |
| **API** | Contract compliance, error handling, pagination | Developers | DRF APITestCase | Per endpoint | Every PR |
| **Visual** | UI rendering, layout, responsive | QA | React Testing Library | Key pages | Every PR |

---

## 4. Test Pyramid Analysis

### Current State
- **Unit:** 0 tests (empty `tests.py`)
- **Integration:** 0 tests
- **E2E:** 0 tests
- **CI pipeline:** Not configured
- **Shape:** No pyramid — no tests exist

### Target State (end of Phase 1)
- **Unit:** 40+ tests targeting models, serializers, permissions, validators
- **Integration:** 15+ tests covering all API endpoints via DRF test client
- **E2E:** 5+ critical path tests via Playwright
- **Ratio:** Unit 65%, Integration 25%, E2E 10%

### Action Plan
1. **Build unit foundation** — test all models for creation, constraints, and string representations
2. **Add serializer tests** — validate validation logic, field outputs, edge cases
3. **Layer integration tests** — test every endpoint with auth, error paths, and pagination
4. **Cap with E2E** — cover signup → browse teachers → book flow

---

## 5. Risk Assessment Matrix

| Feature Area | Impact | Likelihood | Score | Testing Approach |
|-------------|--------|------------|-------|-----------------|
| Booking creation & conflict prevention | 5 - Catastrophic | 3 - Possible | 15 - CRIT | Unit + integration + E2E + concurrency tests |
| JWT authentication & token refresh | 5 - Catastrophic | 2 - Unlikely | 10 - HIGH | Integration + security |
| Teacher profile CRUD | 4 - Major | 3 - Possible | 12 - HIGH | Unit + integration |
| Review submission & rating avg | 3 - Moderate | 3 - Possible | 9 - MED | Unit + integration |
| User registration | 3 - Moderate | 2 - Unlikely | 6 - MED | Integration |
| Notification creation & read | 2 - Minor | 3 - Possible | 6 - MED | Unit + integration |
| Availability management | 3 - Moderate | 2 - Unlikely | 6 - MED | Unit + integration |
| Email notification | 2 - Minor | 2 - Unlikely | 4 - LOW | Contract test only |

---

## 6. Environment Strategy

| Environment | Purpose | Test Types | Data | Deploy Trigger |
|------------|---------|------------|------|---------------|
| **Local** | Developer feedback | Unit, integration | SQLite, fixtures | On save |
| **CI** | Automated validation | Unit, integration, lint | Ephemeral SQLite | On push/PR |
| **Staging** | Pre-production validation | E2E, visual | Production-like | On merge to main |
| **Production** | Monitoring | Smoke | Live | On deploy |

---

## 7. Tool Selection

| Need | Selected Tool | Rationale |
|------|-------------|-----------|
| Backend testing | Django TestCase / DRF APITestCase | Native to Django, no extra dependencies, CI-friendly |
| Frontend unit | Jest + React Testing Library | Already in `package.json`, standard CRA setup |
| Frontend runner | react-scripts test | Preconfigured, zero config needed |
| E2E | Playwright | Cross-browser, auto-waiting, API context, trace viewer |
| Coverage (backend) | coverage.py + pytest-cov | Industry standard for Python |
| Coverage (frontend) | Jest built-in via Istanbul | Already available via `--coverage` flag |
| CI | GitHub Actions | Free for public repos, native ecosystem |

---

## 8. Entry/Exit Criteria

### Unit — Entry: code compiles, function has documented contract. Exit: all branches covered, edge cases tested, coverage target met.

### Integration — Entry: unit tests pass, test DB seeded. Exit: all endpoints tested, error paths validated.

### E2E — Entry: integration tests pass, app running. Exit: all critical user journeys pass, no P0/P1 defects.

### Release — Entry: all levels pass, no CRITICAL/HIGH defects open. Exit: smoke tests pass in production, monitoring shows no anomalies for 30 min.

---

## 9. Quality Gates

| Gate | Checks | Enforced |
|------|--------|----------|
| **PR** | Unit tests pass; no coverage decrease; no lint errors | CI blocks merge |
| **Merge** | All PR checks pass; branch up to date with main | CI block |
| **Deploy** | Full integration + E2E pass on staging | Manual approval |
| **Nightly** | Full E2E + visual regression | Reviewed by QA next morning |

---

## 10. Metrics & KPIs

| Metric | Definition | Target | Cadence |
|--------|-----------|--------|---------|
| **Code Coverage (backend)** | Lines covered by unit + integration | >80% | Per PR |
| **Code Coverage (frontend)** | Lines covered by unit | >60% | Per PR |
| **Test Pyramid Ratio** | Unit:Integration:E2E split | 70:20:10 | Monthly |
| **Flakiness Rate** | Non-deterministic failures | <2% | Weekly |
| **Defect Escape Rate** | Defects found in prod vs total | <5% | Per release |
| **CI Pipeline Duration** | Push to green signal | <10 min | Weekly |

---

## 11. Timeline & Milestones

### Phase 1 — Foundation (Weeks 1-4)
- Risk assessment complete
- Backend unit tests for all models, serializers, permissions
- Frontend unit tests for all components
- CI pipeline with test gate
- Baseline coverage metrics documented

### Phase 2 — Coverage Expansion (Weeks 5-8)
- Integration tests for all API endpoints
- E2E tests for top 5 critical journeys
- Coverage gates on PRs
- Nightly test runs

### Phase 3 — Quality Gates (Weeks 9-12)
- Coverage thresholds enforced in CI
- Flakiness tracking and quarantine
- First quarterly strategy review

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| No existing tests makes coverage jump unrealistic | High | Medium | Set phased targets (40%→60%→80%) |
| Booking concurrency hard to reproduce in tests | Medium | High | Use `select_for_update` + transactional tests |
| Email dependency (Resend) unreliable in CI | Low | Medium | Mock at contract level, no real API calls |
| Team unfamiliar with Playwright | Medium | Low | Start with 1-2 simple tests, expand gradually |

---

## 13. Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-07-29 | 1.0 | Agent | Initial strategy document |
