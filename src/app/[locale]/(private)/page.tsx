import { PrivateScreen, type ScreenParams } from '@/features/private-screen';

export default function HomePage(props: ScreenParams) {
  return <PrivateScreen {...props} screen="home" />;
}
