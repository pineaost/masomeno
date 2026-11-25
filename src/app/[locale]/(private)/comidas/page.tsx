import { PrivateScreen, type ScreenParams } from '@/features/private-screen';

export default async function FoodPage({ params, searchParams }: ScreenParams & {
  searchParams: Promise<{ fecha?: string | string[] }>;
}) {
  const { fecha } = await searchParams;
  return <PrivateScreen params={params} screen="diary" date={typeof fecha === 'string' ? fecha : undefined} />;
}
