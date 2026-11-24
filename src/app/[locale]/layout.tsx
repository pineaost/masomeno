import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { AppShell } from '@/components/app-shell';
import { DemoProvider } from '@/features/demo-provider';
import { isLocale, locales } from '@/i18n/config';
import { getMessages } from '@/i18n/messages';
import { palette } from '@/lib/palette';
import '../globals.css';

const manrope = localFont({
  src: '../../assets/manrope.ttf',
  weight: '200 800',
  display: 'swap',
  variable: '--font-manrope',
});

type LocaleParams = { params: Promise<{ locale: string }> };

export const viewport: Viewport = { viewportFit: 'cover', themeColor: palette.petrol };
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = await getMessages(locale);

  return {
    title: 'masomeno.',
    description: messages.meta.description,
    appleWebApp: { capable: true, title: 'masomeno.' },
    manifest: '/manifest.webmanifest',
    icons: { icon: '/brand.svg', apple: '/apple-touch-icon.png' },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={manrope.variable}>
      <body>
        <NextIntlClientProvider>
          <DemoProvider key={locale}>
            <AppShell>{children}</AppShell>
          </DemoProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
