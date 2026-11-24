import { PrivateScreen, type ScreenParams } from '@/features/private-screen';

export default function GymPage(props: ScreenParams) {
  return <PrivateScreen {...props} screen="gym" />;
}
