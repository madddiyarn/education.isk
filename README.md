# School Journal

Role-based school online journal built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

## Features

- Login-only authentication with secure server-side password hashing
- Role-based dashboards for Moderator, Teacher, Methodist-Teacher, and Student
- Protected routes with middleware plus server-side role checks
- Prisma schema for users, classes, subjects, assignments, assessments, and grades
- Seed script with all required classes, default subjects, and a default moderator account
- Journal grade entry with real percentage and final mark calculations
- English and Russian locale routing via `/en` and `/ru`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.local.example` and set:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/school_journal?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/school_journal?schema=public"
AUTH_SECRET="replace-with-a-long-random-secret"
DEFAULT_LOCALE="en"
```

3. Run Prisma migrations:

```bash
npm run db:migrate
```

4. Seed the database:

```bash
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

## First Login

- Login: `moderator`
- Password: `Moderator123!`

## Example Flow

1. Moderator creates teacher, methodist, and student accounts.
2. Moderator assigns students to classes and teachers to class/subject combinations.
3. Methodist creates quarter assessment settings and generates SOR/SOCH assessment rows.
4. Teacher opens the assigned journal and enters scores.
5. Student logs in and sees only their own subject results, final percentage, and final mark.

## Verification

- `npm run typecheck`
- `npm run lint`
- `AUTH_SECRET="dev-secret-dev-secret-dev-secret" DATABASE_URL="postgresql://postgres:postgres@localhost:5432/school_journal?schema=public" npm run build`
