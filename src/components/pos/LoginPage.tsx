import { useState } from 'react';
import { usePosAuth } from '@/hooks/usePosAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Store, User, Lock } from 'lucide-react';

export const LoginPage = () => {
  const { login } = usePosAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = login(username, password);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="w-full max-w-md">
        <Card className="pos-card-shadow border-2">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
                <Store className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Philippines POS
              </CardTitle>
              <CardDescription className="text-[hsl(var(--muted-foreground))]">
                Point of Sale System
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-[hsl(var(--destructive))]/10 border border-[hsl(var(--destructive))]/20 rounded-md">
                  <AlertCircle className="w-4 h-4 text-[hsl(var(--destructive))]" />
                  <span className="text-sm text-[hsl(var(--destructive))]">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-[hsl(var(--foreground))]">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[hsl(var(--foreground))]">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full pos-button-primary py-6 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">Demo Accounts:</p>
                <div className="space-y-1 text-xs text-[hsl(var(--muted-foreground))]">
                  <p><strong>Admin:</strong> admin / admin123</p>
                  <p><strong>Cashier:</strong> cashier / cashier123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Made for Philippine Businesses
          </p>
        </div>
      </div>
    </div>
  );
};