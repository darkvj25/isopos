import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthGuard } from '@/components/pos/AuthGuard';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    const currentUser = localStorage.getItem('pos_current_user');
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <AuthGuard>
      <div className="min-h-screen">
        {/* This will redirect to login if not authenticated, or show loading */}
      </div>
    </AuthGuard>
  );
};

export default Index;
