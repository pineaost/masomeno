'use client';

import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { signOut } from '@/app/[locale]/(private)/configuracion/actions';
import type { Locale } from '@/i18n/config';

function SignOutButton({ mobile }: { mobile: boolean }) {
  const { pending } = useFormStatus();
  const t = useTranslations('settings');
  return <button type="submit" className={mobile ? 'button secondary' : undefined} disabled={pending} aria-busy={pending}>
    <LogOut size={20} strokeWidth={1.8} aria-hidden />{t(pending ? 'signingOut' : 'signOut')}
  </button>;
}

export function SignOut({ locale, mobile = false }: { locale: Locale; mobile?: boolean }) {
  return <form action={signOut.bind(null, locale)} className={mobile ? 'mobile-sign-out settings-panel' : undefined}>
    <SignOutButton mobile={mobile} />
  </form>;
}
