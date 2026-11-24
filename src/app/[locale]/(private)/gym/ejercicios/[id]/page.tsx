import { TrackingDetail } from '@/features/tracking-screen';

export default async function ExercisePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  return <TrackingDetail locale={locale} detail={{ kind: 'exercise', id }} />;
}
