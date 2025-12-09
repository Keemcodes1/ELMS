# E-Landlord Management System (ELMS)

A comprehensive property management system for landlords, caretakers, and tenants.

## Project Structure

```
E Landlord/
├── elms_backend/       # Django backend
│   ├── users/          # User management & authentication
│   ├── properties/     # Property & unit management
│   ├── tenants/        # Tenant management
│   ├── finance/        # Payment, billing & invoicing
│   └── maintenance/    # Complaints & maintenance requests
├── frontend/           # React (Vite) frontend
└── manage.py           # Django management script
```

## Tech Stack

### Backend
- **Framework**: Django 5.x
- **API**: Django Rest Framework (DRF)
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TBD (Tailwind CSS recommended)

## Getting Started

### Backend Setup

1. Navigate to project root:
   ```bash
   cd "d:/afrivids/E Landlord"
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

3. Install dependencies:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

6. Start development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to frontend:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Features

- **Tenant Management**: Add, edit, delete tenant profiles
- **Property & Unit Management**: Track properties and occupancy
- **Payment Management**: Record rent, generate receipts, track arrears
- **Billing & Invoicing**: Auto-generate monthly invoices, utility bills
- **Maintenance**: Tenant complaint submission and tracking
- **Notifications**: SMS/Email reminders for rent due
- **Reports & Analytics**: Monthly profit/loss, occupancy rates
- **User Management**: Role-based access (Landlord, Caretaker, Tenant)

## Development Status

- [x] Project initialization
- [x] Django backend setup with core apps
- [x] React frontend setup with Vite
- [ ] Database configuration
- [ ] User authentication module
- [ ] Core module development

## License

Proprietary
