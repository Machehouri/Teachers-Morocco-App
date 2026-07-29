# Sprint Test Plan — Sprint 1

**Sprint:** Sprint 1 (Foundation)  
**Duration:** 2 weeks  
**Owner:** QA Team  
**Last Updated:** 2026-07-29

---

## Scope

| Area | Type | Risk Level |
|------|------|------------|
| User registration & JWT auth | New | HIGH |
| Teacher profile CRUD | New | HIGH |
| Booking creation with conflict prevention | New | CRITICAL |
| Review submission | New | MEDIUM |
| Availability management | New | MEDIUM |
| Notifications | New | MEDIUM |

## Coverage Summary

| Feature | Happy Path | Validation | Error | Edge Cases | Automated |
|---------|-----------|------------|-------|------------|-----------|
| Registration | ✅ | ✅ | ✅ | ✅ | Yes |
| Login/Token | ✅ | ✅ | ✅ | ❌ | Yes |
| List Teachers | ✅ | ✅ | ✅ | ✅ | Yes |
| Create Teacher | ✅ | ✅ | ✅ | ❌ | Yes |
| Book Slot | ✅ | ✅ | ✅ | ✅ | Yes |
| Create Review | ✅ | ✅ | ✅ | ❌ | Yes |
| Manage Availability | ✅ | ❌ | ✅ | ❌ | Yes |

## Effort Budget

| Activity | Estimated Hours | Assigned To |
|----------|----------------|-------------|
| Backend model unit tests | 4h | Dev |
| Backend serializer tests | 3h | Dev |
| Backend API integration tests | 6h | Dev |
| Frontend component tests | 4h | Dev |
| E2E setup + critical path tests | 6h | QA |
| **Buffer (25%)** | **5.75h** | — |
| **Total** | **28.75h** | — |

## Entry Criteria
- Code complete for in-scope features
- Backend running locally with test DB
- Frontend builds without errors

## Exit Criteria
- All unit tests pass
- All API integration tests pass
- Coverage >60% on backend models
- No P0/P1 defects open

## Test Data Requirements
- Test user fixtures (student + teacher roles)
- Test teacher profiles with subjects
- Test bookings with various statuses
- Test notifications

## Plan Risks
- No existing test infrastructure — first sprint builds foundation
- Booking concurrency tests may need `transaction.atomic` awareness
