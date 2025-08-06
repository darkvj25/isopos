import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePosAuth } from '@/hooks/usePosAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Warehouse, 
  Receipt, 
  BarChart3, 
  Settings, 
  LogOut,
  User,
  Clock
} from 'lucide-react';
import { formatPhilippineDateTime } from '@/utils/pos';

interface PosLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'cashier'] },
  { path: '/pos', label: 'Sales Terminal', icon: ShoppingCart, roles: ['admin', 'cashier'] },
  { path: '/products', label: 'Products', icon: Package, roles: ['admin'] },
  { path: '/inventory', label: 'Inventory', icon: Warehouse, roles: ['admin', 'cashier'] },
  { path: '/sales', label: 'Sales History', icon: Receipt, roles: ['admin', 'cashier'] },
  { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export const PosLayout = ({ children }: PosLayoutProps) => {
  const location = useLocation();
  const { currentUser, logout } = usePosAuth();

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(currentUser?.role || '')
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex">
      {/* Sidebar */}
      <div className="w-64 pos-sidebar pos-shadow flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[hsl(var(--pos-sidebar-active))]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[hsl(var(--pos-sidebar-active))] rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">PH POS</h1>
              <p className="text-sm text-[hsl(var(--pos-sidebar-foreground))]/70">Point of Sale</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-12 text-left transition-colors ${
                    isActive 
                      ? 'pos-sidebar-active' 
                      : 'text-[hsl(var(--pos-sidebar-foreground))] hover:bg-[hsl(var(--pos-sidebar-active))]/20 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-[hsl(var(--pos-sidebar-active))]/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[hsl(var(--pos-sidebar-active))] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.fullName}</p>
              <p className="text-xs text-[hsl(var(--pos-sidebar-foreground))]/70 capitalize">
                {currentUser?.role}
              </p>
            </div>
          </div>
          
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start gap-3 h-10 text-[hsl(var(--pos-sidebar-foreground))] hover:bg-[hsl(var(--destructive))]/20 hover:text-[hsl(var(--destructive))]"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[hsl(var(--pos-header))] border-b border-[hsl(var(--border))] p-4 pos-card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
                {navigationItems.find(item => item.path === location.pathname)?.label || 'POS System'}
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Welcome back, {currentUser?.fullName}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatPhilippineDateTime(new Date())}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};