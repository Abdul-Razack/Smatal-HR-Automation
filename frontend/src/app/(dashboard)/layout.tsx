import { AppLayout } from '@/components/layouts/AppLayout';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { GlobalModalProvider } from '@/shared/modals/GlobalModalProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppLayout>
        <ErrorBoundary>
          {children}
          <GlobalModalProvider />
        </ErrorBoundary>
      </AppLayout>
    </ProtectedRoute>
  );
}
