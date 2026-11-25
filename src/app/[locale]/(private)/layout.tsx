import { AppShell } from '@/components/app-shell';
import { DemoProvider } from '@/features/demo-provider';
import { demoMode } from '@/lib/account';

export default function PrivateLayout({ children }: LayoutProps<'/[locale]'>) {
  const demo = demoMode();
  return (
    <AppShell demo={demo}>
      {demo ? <DemoProvider>{children}</DemoProvider> : children}
    </AppShell>
  );
}
