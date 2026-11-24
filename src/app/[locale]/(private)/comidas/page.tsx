import { PrivateScreen, type ScreenParams } from '@/features/private-screen';

export default function FoodPage(props: ScreenParams) {
  return <PrivateScreen {...props} screen="diary" />;
}
