import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { PageHeading } from '@/components/page-heading';
import { localePath } from '@/i18n/config';

export default function NotFound() {
  const locale = useLocale();
  const t = useTranslations('notFound');
  return (
    <main className="login-screen">
      <section className="panel section-panel">
        <PageHeading title={t('title')} />
        <Link href={localePath(locale)} className="text-link">{t('back')}</Link>
      </section>
    </main>
  );
}
