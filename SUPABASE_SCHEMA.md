# Supabase Database Schema (TutorBridge)

This document outlines the key tables and fields used by the app, based on the current codebase.

## invoices
Stores payments from students to tutors and TutorBridge's commission tracking.

- id: uuid | primary key (or text id)
- match_id: uuid | nullable — link to a match/session
- request_id: uuid | nullable — link to a request when applicable
- student_id: text — student user id
- tutor_id: text — tutor user id
- amount: numeric — total payment amount (BDT)
- status: text — one of: pending, received, confirmed, paid
- commission_rate: numeric — fraction (e.g., 0.10 for 10%)
- commission_amount: numeric — optional; if null, UI derives as round(amount * commission_rate)
- commission_status: text — one of: pending, collected
- commission_collected_at: timestamptz — when commission was collected
- created_at: timestamptz — default now()

Notes:
- UI maps to fields:
  - amount_total = amount
  - payment_status = status
- Admin can mark commission as collected (updates commission_status and commission_collected_at).

## users (reference)
The app references users by id and role (student, tutor, admin). Fields are inferred from auth/profile usage.
- id: uuid/text
- email: text
- role: text — student | tutor | admin
- status: text — active | pending | blocked
- created_at: timestamptz

## requests (reference)
Student tutoring requests used in admin/reporting views.
- id: uuid/text
- subject: text
- location: text
- student_id: text
- status: text — open | matched | closed
- created_at: timestamptz

## Suggested SQL (example)
```sql
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  match_id uuid,
  request_id uuid,
  student_id text not null,
  tutor_id text not null,
  amount numeric not null,
  status text not null default 'pending',
  commission_rate numeric not null default 0.10,
  commission_amount numeric,
  commission_status text not null default 'pending',
  commission_collected_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists invoices_student_id_idx on invoices(student_id);
create index if not exists invoices_tutor_id_idx on invoices(tutor_id);
create index if not exists invoices_request_id_idx on invoices(request_id);
```

Adjust types/constraints to match your existing database if it already exists.
