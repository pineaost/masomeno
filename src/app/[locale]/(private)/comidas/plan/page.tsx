import { PrivateScreen, type ScreenParams } from '@/features/private-screen';

export default function PlanPage(props: ScreenParams) {
  return <PrivateScreen {...props} screen="plan" />;
}
