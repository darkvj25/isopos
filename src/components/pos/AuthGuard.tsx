import { ReactNode } from 'react';
import { usePosAuth } from '@/hooks/usePosAuth';
import { LoginPage } from '@/components/pos/LoginPage';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'cashier';
}

export const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
  const { currentUser, isLoading } = usePosAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading POS System...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  if (requiredRole && currentUser.role !== requiredRole && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-lg pos-card-shadow">
          <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-muted-foreground">
            Required role: {requiredRole} | Your role: {currentUser.role}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};