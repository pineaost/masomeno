'use client';

import { useId, useState, type ReactNode } from 'react';

export function RecipeFilters({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return <div className="recipe-filter-group">
    <button type="button" className="button secondary recipe-filter-toggle" aria-controls={id}
      aria-expanded={open} onClick={() => setOpen(!open)}>{label}</button>
    <div id={id} className="recipe-filter-options" data-open={open}>{children}</div>
  </div>;
}
