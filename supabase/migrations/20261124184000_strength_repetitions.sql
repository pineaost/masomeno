alter table public.strength_entries
  add column repetitions integer check (repetitions between 1 and 999);

grant insert (repetitions), update (repetitions) on public.strength_entries to authenticated;
