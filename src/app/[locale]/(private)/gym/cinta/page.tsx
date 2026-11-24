import { TrackingDetail } from '@/features/tracking-screen';

export default async function TreadmillPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <TrackingDetail locale={locale} detail={{ kind: 'treadmill' }} />;
}
