'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef } from 'react';

export function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const t = useTranslations('app');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog ref={dialogRef} className="dialog" aria-labelledby={titleId} onClose={onClose}>
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
