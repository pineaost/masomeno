import { PrivateScreen, type ScreenParams } from '@/features/private-screen';

export default async function FoodPage({ params, searchParams }: ScreenParams & {
  searchParams: Promise<{ registrar?: string | string[] }>;
}) {
  return <PrivateScreen params={params} screen="diary" register={(await searchParams).registrar === '1'} />;
}
