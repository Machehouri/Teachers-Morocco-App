# Agent Configuration

## Skills Registry

This project uses QA and test-automation skills from [petrkindlmann/qa-skills](https://github.com/petrkindlmann/qa-skills).

All 50 skills are installed under `.agents/skills/`. The following are especially relevant:

- `qa-project-context` — Project context (auto-read before other QA skills)
- `unit-testing` — Jest/Vitest/pytest patterns
- `api-testing` — REST/GraphQL API testing
- `test-strategy` — QA strategy and test pyramid
- `playwright-automation` — E2E testing with Playwright
- `test-planning` — Sprint/release test plans
- `test-data-management` — Test data factories and fixtures
- `ci-cd-integration` — CI/CD pipeline setup
- `test-case-management` — Manual/hybrid test cases
- `ai-test-generation` — Generate tests from specs/PRDs
- `ai-bug-triage` — Classify and triage bugs
- `bug-reproduction` — Reproduce and minimize bugs
- `visual-testing` — Visual regression testing
- `performance-testing` — Load/stress testing
- `security-testing` — OWASP Top 10 testing
- `coverage-analysis` — Coverage measurement and gating
- `release-readiness` — Go/no-go checklists

## Test Commands

- **Frontend tests:** `cd frontend && npm test`
- **Backend tests:** `cd project_root && python manage.py test`
