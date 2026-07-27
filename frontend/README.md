# Private Teachers Morocco App

## Project Overview
A full-stack application for managing teacher availability and profiles in Morocco. Built with React frontend and Django backend.

## Tech Stack
**Frontend:**
- React 18
- Tailwind CSS
- Create React App
- Axios for API calls

**Backend:**
- Django 4.2
- Django REST Framework
- PostgreSQL (default)
- Python 3.11

## Project Structure
```
project_root/
├── api/              # Django backend
│   ├── models.py     # Database models
│   ├── views.py      # API endpoints
│   ├── serializers.py# Data serialization
│   └── urls.py       # URL routing
├── frontend/         # React frontend
│   ├── src/          # React components
│   │   ├── pages/    # Main pages
│   │   ├── components/ # Reusable UI components
│   │   └── App.js    # Root component
│   ├── public/       # Static assets
│   └── README.md     # This file
├── manage.py         # Django entry point
└── requirements.txt  # Python dependencies
```

## Setup Instructions
1. **Backend Setup**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

2. **Frontend Setup**
```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start development server
npm start
```

## Key Features
- Teacher profile management
- Availability calendar
- User authentication
- Dashboard analytics
- Responsive design

## API Endpoints
- `GET /api/teachers/` - List all teachers
- `POST /api/teachers/` - Create new teacher
- `GET /api/availability/` - Check teacher availability