# SpendSense AI - Smart Expense Tracker

A production-ready MERN expense management platform for tracking transactions, budgets, recurring entries, savings goals, reports, notifications, and AI-driven financial insights.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Modules](#api-modules)
- [Security Notes](#security-notes)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [License](#license)

## Overview

SpendSense AI helps users make better financial decisions with:

- secure JWT authentication
- OTP-based email and phone verification
- complete income/expense tracking
- recurring transaction automation
- budget monitoring and alerts
- savings goal management
- monthly/category reporting and chart analytics
- downloadable monthly PDF report
- notification center
- AI-style rule-based financial insights and health scoring

## Key Features

- Authentication and account management
  - register, login, profile update
  - forgot/reset password via email
  - password change for logged-in users
  - email OTP + phone OTP verification flow
- Transactions
  - create, read, update, delete transactions
  - income and expense type handling
- Reporting and analytics
  - summary, category-wise, and monthly reports
  - dashboard charts using Recharts
- Budgeting
  - set monthly budgets and track status
- Recurring transactions
  - create recurring templates
  - generate upcoming recurring entries
  - toggle active/inactive rules
- Savings goals
  - set goals, add money, update/delete goals
- Notifications
  - unread count, mark single/all as read, delete notification
- PDF export
  - download monthly report as PDF
- AI insights
  - spending ratio checks, trend detection, category pressure, projected overspend, and health score

## Architecture

- Frontend: React + Vite SPA (`frontend`)
- Backend: Express REST API (`backend`)
- Database: MongoDB via Mongoose
- Auth: JWT bearer token
- Communication: Axios client with request interceptor for `Authorization` header
- CORS: allowlist using `http://localhost:5173` and `FRONTEND_URL`

## Tech Stack

Frontend

- React 19
- Vite 8
- Tailwind CSS 4
- React Router 7
- Recharts
- Axios
- react-hot-toast
- lucide-react

Backend

- Node.js + Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- bcryptjs
- Nodemailer
- PDFKit

## Project Structure

```text
smart-expense-tracker/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    server.js
  frontend/
    public/
    src/
      components/
      context/
      pages/
      services/
    vite.config.js
```

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd smart-expense-tracker

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment files

Create:

- `backend/.env`
- `frontend/.env`

Use the templates in [Environment Variables](#environment-variables).

### 3. Run locally

Terminal 1 (backend)

```bash
cd backend
npm run dev
```

Terminal 2 (frontend)

```bash
cd frontend
npm run dev
```

Local defaults:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<strong_random_secret>
FRONTEND_URL=https://smart-expense-tracker-plum-three.vercel.app,http://localhost:5173
FRONTEND_APP_URL=https://smart-expense-tracker-plum-three.vercel.app
NODE_ENV=development

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=<smtp_username>
MAIL_PASS=<smtp_password_or_app_password>
MAIL_FROM="SpendSense AI <no-reply@example.com>"
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=/api
VITE_PROXY_TARGET=https://smart-expense-tracker-zaxi.onrender.com
```

## Available Scripts

Backend (`backend/package.json`)

- `npm run dev`: start API with nodemon
- `npm start`: start API with node

Frontend (`frontend/package.json`)

- `npm run dev`: start Vite dev server
- `npm run build`: production build
- `npm run preview`: preview production build
- `npm run lint`: run ESLint

## API Modules

Base URL: `/api`

- `/auth`
  - register/login
  - phone/email OTP send + verify
  - forgot/reset password
  - profile get/update
  - change password
- `/transactions`
  - CRUD for transactions
- `/reports`
  - summary, category, monthly reports
- `/ai`
  - financial insight engine (`/insights`)
- `/budgets`
  - set budget, read budget status
- `/recurring`
  - recurring template CRUD, toggle, generate
- `/notifications`
  - list, unread count, mark read, delete
- `/pdf`
  - monthly PDF download
- `/saving-goals`
  - savings goal CRUD + add-money

## Security Notes

- JWT-protected routes use Bearer tokens.
- OTP records are hashed before validation and have expiry + attempt limits.
- Password reset links are tokenized and time-bound.
- CORS is restricted by explicit allowed origins.
- Do not commit `.env` files or secrets.

## Deployment

Suggested split deployment:

- Frontend: Vercel/Netlify
- Backend: Render/Railway/Fly.io
- Database: MongoDB Atlas

Deployment checklist:

1. Set production `FRONTEND_URL` in backend (comma-separated allowlist).
2. Set production `FRONTEND_APP_URL` in backend (single URL used in reset links).
3. Keep frontend API base as `/api` and use `frontend/vercel.json` rewrite to backend.
4. Configure SMTP credentials for OTP/reset flows.
5. Use a strong `JWT_SECRET`.
6. Restrict database user and network access.

## Roadmap

- Add automated tests (unit + integration + API)
- Add refresh token flow and token revocation
- Add rate limiting and request throttling middleware
- Add centralized logging/monitoring
- Add CI pipeline and quality gates

## License

ISC (as defined in `backend/package.json`).
