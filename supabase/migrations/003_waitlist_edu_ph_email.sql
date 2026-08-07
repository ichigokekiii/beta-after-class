-- Enforce .edu.ph school emails at the database layer (defense in depth).
-- Allow existing non-.edu.ph rows if any; only new inserts/updates are checked
-- once this constraint is added. If legacy rows exist, clean them first.

alter table waitlist_signups
  drop constraint if exists waitlist_signups_edu_ph_email;

alter table waitlist_signups
  add constraint waitlist_signups_edu_ph_email
  check (
    email ~* '^[^@[:space:]]+@([a-z0-9-]+\.)+edu\.ph$'
    or email ~* '^[^@[:space:]]+@edu\.ph$'
  );
