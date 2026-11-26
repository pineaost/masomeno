'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef } from 'react';

export function Dialog({
  title,
  onClose,
  children,
  fitViewport = false,
  compact = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  fitViewport?: boolean;
  compact?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const t = useTranslations('app');
  const workDialog = fitViewport && !compact;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const viewport = window.visualViewport;
    if (!workDialog || !viewport) return;
    function syncViewport() {
      if (!dialog || !viewport) return;
      dialog.style.setProperty('--meal-visual-height', `${viewport.height}px`);
      dialog.style.setProperty('--meal-visual-top', `${viewport.offsetTop}px`);
    }
    syncViewport();
    viewport.addEventListener('resize', syncViewport);
    viewport.addEventListener('scroll', syncViewport);
    return () => {
      viewport.removeEventListener('resize', syncViewport);
      viewport.removeEventListener('scroll', syncViewport);
    };
  }, [workDialog]);

  return (
    <dialog ref={dialogRef} className={`dialog${compact ? ' dialog-compact' : workDialog ? ' meal-dialog' : ''}`}
      aria-labelledby={titleId} onClose={onClose}>
      <div className="dialog-heading">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-button" type="button" aria-label={t('close')} onClick={() => dialogRef.current?.close()}>
          <X size={21} aria-hidden />
        </button>
      </div>
      {children}
    </dialog>
  );
}
