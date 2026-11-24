import { PrivateScreen, type ScreenParams } from '@/features/private-screen';

export default function RecipesPage(props: ScreenParams) {
  return <PrivateScreen {...props} screen="recipes" />;
}
