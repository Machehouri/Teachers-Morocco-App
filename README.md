# Private Teachers Morocco 🇲🇦

A full-stack platform connecting students with private teachers across Morocco — browse profiles, check availability, book sessions, and leave reviews.

## Features

- Teacher profiles with bio, city, subjects, pricing, and photos
- Availability calendar with slot management
- JWT authentication (signup / login / role-based access)
- Student booking system with real-time conflict prevention
- Review and rating system for teachers
- Email notifications via Resend
- In-app notification feed
- Responsive UI with Tailwind CSS

## Tech Stack

- **Frontend:** React 19, Tailwind CSS, React Router, React Hot Toast
- **Backend:** Django 6.0, Django REST Framework, SimpleJWT
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Email:** Resend API
- **Testing:** Jest + React Testing Library (frontend), Django TestCase (backend), Playwright (E2E)
- **CI:** GitHub Actions

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (for production)

### Installation

1. **Clone the repo**

   ```bash
   git clone <repo-url>
   cd Private-Teachers-Morocco-app
   ```

2. **Backend setup**

   ```bash
   cd project_root
   cp ../.env.example ../.env
   # Edit .env with your values
   pip install -r ../requirements.txt
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

3. **Frontend setup**

   ```bash
   cd frontend
   npm install
   npm start
   ```

## Environment Variables

See `.env.example` for all required variables.

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for development, `False` for production |
| `ALLOWED_HOSTS` | Comma-separated hostnames |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_HOST` | Database host |
| `DB_PORT` | Database port |
| `RESEND_API_KEY` | Resend email API key |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register/` | Register a new user |
| POST | `/api/token/` | Obtain JWT token pair |
| POST | `/api/token/refresh/` | Refresh access token |
| GET | `/teachers/` | List all teachers |
| POST | `/teachers/` | Create teacher profile |
| GET | `/teachers/{id}/` | Get teacher detail |
| PUT | `/teachers/{id}/` | Update teacher profile |
| DELETE | `/teachers/{id}/` | Delete teacher profile |
| GET | `/teachers/top/` | List top-rated teachers |
| GET | `/reviews/` | List all reviews |
| POST | `/reviews/` | Create a review |
| GET | `/bookings/` | List user bookings |
| POST | `/bookings/` | Create a booking |
| PATCH | `/bookings/{id}/` | Update booking status |
| GET | `/availability/` | List availability slots |
| POST | `/availability/` | Create availability slot |
| DELETE | `/availability/{id}/` | Delete availability slot |
| GET | `/notifications/` | List notifications |
| PATCH | `/notifications/{id}/read/` | Mark notification read |
| GET | `/notifications/unread_count/` | Get unread count |

## Testing

### Backend Tests (117 tests)

```bash
cd project_root
# requires SECRET_KEY in environment
$env:SECRET_KEY = "your-secret-key"  # Windows PowerShell
export SECRET_KEY="your-secret-key"   # Linux/macOS
python manage.py test api
```

### Frontend Tests (18 tests)

```bash
cd frontend
npm test
```

### E2E Tests (Playwright)

```bash
cd frontend
npx playwright install chromium
npx playwright test
```

### Run All Tests

On every push, GitHub Actions automatically runs all three test suites.

### QA Strategy

See `docs/qa-strategy.md` for the full testing strategy — risk matrix, test pyramid, quality gates, KPIs, and timeline.

## CI/CD

GitHub Actions workflow at `.github/workflows/tests.yml` runs on every push and pull request:
- **Backend** — Django tests with Python 3.11
- **Frontend** — Jest + RTL tests with Node 18
- **E2E** — Playwright tests against Chromium

## License

MIT
