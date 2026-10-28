# Skyhoch Education – Online Learning Platform (MVP)

A full-stack learning platform where students browse and buy courses, teachers manage students and live sessions, and admins manage courses and users.

- **Live demo:** https://skyhoch-education.vercel.app
- **Repository:** https://github.com/ShibinaSuhail/skyhoch-education

## Features

**Student**
- Register and log in
- Browse courses (search, max-price filter) and view course details
- Mock checkout, then instant enrollment
- Dashboard with enrolled courses, lessons and upcoming live sessions

**Teacher**
- See own courses with student and session counts
- View enrolled students per course
- Create, edit and delete class sessions (title, date/time, meeting link)

**Admin**
- Stats: users, courses, enrollments, revenue
- Course management: create, edit, publish/hide, delete
- User management: change role, activate/deactivate

**Security:** role-based access control (middleware + checks inside every server action and API route).

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Frontend and backend in one repo |
| Styling | Tailwind CSS | Fast, responsive UI |
| Database | PostgreSQL (Neon, free tier) | Hosted, easy to deploy |
| ORM | Prisma 6 | Type-safe queries and migrations |
| Auth | Auth.js (next-auth v5), bcryptjs | Credentials login, hashed passwords, JWT session |
| Validation | Zod | Every input is validated on the server |
| Hosting | Vercel | Auto-deploy from GitHub |

## Project structure

```
app/
  (auth)/login, register     auth pages
  courses/                   public list and detail pages
  checkout/[courseId]/       mock payment page
  student/ teacher/ admin/   role dashboards
  api/                       auth, register, checkout routes
components/                  shared UI (CourseCard, PayButton, CourseForm...)
lib/                         db client, admin guard
prisma/                      schema and seed
auth.ts, auth.config.ts      Auth.js setup
middleware.ts                role-based route protection
```

## Database

User, Course, Lesson, Enrollment, Payment, ClassSession.
`Enrollment` has a unique constraint on (userId, courseId), so a student cannot enroll twice.

## Setup (local)

Prerequisites: Node.js 20+, Git, a free Neon account.

```
git clone https://github.com/ShibinaSuhail/skyhoch-education.git
cd skyhoch-education
npm install
```

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL="<Neon pooled connection string>"
DIRECT_URL="<Neon direct connection string>"
AUTH_SECRET="<run: npx auth secret>"
```

Then:

```
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open http://localhost:3000

## Demo credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@skyhoch.test | Password@123 |
| Teacher | teacher@skyhoch.test | Password@123 |
| Student | student@skyhoch.test | Password@123 |

New registrations always become students.

## Technical decisions

- **Enrollment uses a database transaction:** Payment and Enrollment are created together, so one can never exist without the other.
- **Never trust the client:** user ID comes from the session and the price from the database, not from the request.
- **Role checks in two layers:** middleware blocks pages, and every API route / server action checks the role again.
- **Mock payment:** replacing it with Stripe only changes the checkout API (create a Checkout Session, save the Payment from the webhook).
- **Role is stored in the JWT:** after an admin changes a role, the user must log in again for it to apply.
- **Courses with enrollments are hidden, not deleted,** to keep payment history.

## Limitations / next steps

Real payments (Stripe), email verification, course progress tracking, video upload, tests.