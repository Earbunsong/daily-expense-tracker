# Business Requirements Document (BRD)
## Daily Expense Tracker System

**Version:** 1.0
**Date:** June 10, 2026
**Tech Stack:** Next.js (Frontend + API Routes), PostgreSQL

---

## 1. Project Overview

A web application that helps a user record and track their daily spending. The user can add expenses, organize them by category, and view summaries (daily, weekly, monthly) to understand their spending habits.

## 2. Business Objectives

- Allow users to record every expense quickly (less than 30 seconds per entry)
- Help users see where their money goes by category
- Show spending trends over time so users can control their budget
- Keep data safe and private for each user

## 3. Scope

**In scope (Version 1):**
- User registration and login
- Add, edit, delete expense records
- Expense categories (Food, Transport, Shopping, Bills, Health, Other)
- Dashboard with daily/weekly/monthly summary
- Simple charts (spending by category, spending over time)
- Set a monthly budget and show warning when close to limit

**Out of scope (future versions):**
- Mobile app (native)
- Multi-currency support
- Receipt photo upload / OCR
- Bank account integration
- Shared/family accounts

## 4. Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | User can register with email and password | High |
| FR-02 | User can log in and log out | High |
| FR-03 | User can add an expense (amount, category, date, note) | High |
| FR-04 | User can edit or delete their own expense | High |
| FR-05 | User can view expense list filtered by date range and category | High |
| FR-06 | System shows total spending for today, this week, this month | High |
| FR-07 | System shows a pie chart of spending by category | Medium |
| FR-08 | System shows a line/bar chart of spending over time | Medium |
| FR-09 | User can set a monthly budget | Medium |
| FR-10 | System shows a warning when spending reaches 80% of budget | Medium |
| FR-11 | User can export expenses to CSV | Low |

## 5. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | Pages should load in under 2 seconds |
| NFR-02 | Passwords must be hashed (bcrypt or argon2) |
| NFR-03 | Each user can only see their own data |
| NFR-04 | The app should work on mobile browser (responsive design) |
| NFR-05 | API must validate all input (e.g., amount must be a positive number) |

## 6. System Architecture

```
[Browser]
   │
   ▼
[Next.js Frontend (React, App Router)]
   │  fetch / server actions
   ▼
[Next.js API Routes (/app/api/...)]
   │  Prisma ORM (recommended)
   ▼
[PostgreSQL Database]
```

**Recommended libraries:**
- **Prisma** — ORM for PostgreSQL (type-safe, easy migrations)
- **NextAuth.js (Auth.js)** — authentication
- **Zod** — input validation
- **Recharts** or **Chart.js** — charts
- **Tailwind CSS** — styling

## 7. Database Design (Draft)

### users
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| email | varchar, unique | |
| password_hash | varchar | |
| created_at | timestamp | |

### categories
| Column | Type | Notes |
|--------|------|-------|
| id | serial (PK) | |
| name | varchar | e.g., Food, Transport |
| icon | varchar | optional |

### expenses
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| category_id | int (FK → categories) | |
| amount | numeric(12,2) | always positive |
| note | text | optional |
| spent_at | date | the date of spending |
| created_at | timestamp | |

### budgets
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| month | date | first day of month |
| amount | numeric(12,2) | budget limit |

## 8. API Endpoints (Draft)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create new user |
| POST | /api/auth/login | Login (handled by NextAuth) |
| GET | /api/expenses?from=&to=&category= | List expenses with filters |
| POST | /api/expenses | Create expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/summary?period=month | Totals by category and by day |
| GET | /api/budget?month= | Get budget for a month |
| PUT | /api/budget | Set or update budget |

## 9. User Stories

1. As a user, I want to add my expense in a few seconds, so I do not forget to record it.
2. As a user, I want to see how much I spent today and this month, so I know my situation quickly.
3. As a user, I want to see which category takes the most money, so I can reduce spending there.
4. As a user, I want to get a warning when I am close to my budget, so I can stop overspending.

## 10. Assumptions and Risks

**Assumptions:**
- Single currency (e.g., USD or KHR) in version 1
- One user = one account (no sharing)

**Risks:**
- If validation is weak, wrong data (negative amounts, future dates) can break reports → use Zod on both client and API
- Date/timezone issues — store `spent_at` as a plain date chosen by the user, not server time

## 11. Suggested Development Phases

1. **Phase 1:** Database setup (Prisma + PostgreSQL), authentication
2. **Phase 2:** Expense CRUD (add/edit/delete/list)
3. **Phase 3:** Dashboard with summaries and charts
4. **Phase 4:** Budget feature and warnings
5. **Phase 5:** Polish UI, CSV export, testing
