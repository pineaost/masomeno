import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { isLocale, locales } from '@/i18n/config';
import { getMessages } from '@/i18n/messages';
import { palette } from '@/lib/palette';
import { brandIcons, brandName } from '@/lib/brand';
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
    title: brandName,
    description: messages.meta.description,
    appleWebApp: { capable: true, title: brandName },
    manifest: '/manifest.webmanifest',
    icons: {
      icon: { url: brandIcons.favicon.src, sizes: brandIcons.favicon.sizes, type: 'image/png' },
      apple: { url: brandIcons.apple.src, sizes: brandIcons.apple.sizes, type: 'image/png' },
    },
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
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
