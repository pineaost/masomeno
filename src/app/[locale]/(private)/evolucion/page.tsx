import { PrivateScreen, type ScreenParams } from '@/features/private-screen';

export default function ProgressPage(props: ScreenParams) {
  return <PrivateScreen {...props} screen="progress" />;
}
