import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard,
  Users,
  TrendingDown,
  Activity,
  AlertTriangle,
  FileText,
  MessageSquare,
  DollarSign,
  Download,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  CreditCard,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  { href: '/admin/subscriptions', label: 'Assinaturas', icon: CreditCard },
  { href: '/admin/churn', label: 'Churn & Cancelamentos', icon: TrendingDown },
  { href: '/admin/engagement', label: 'Engajamento', icon: Activity },
  { href: '/admin/risks', label: 'Riscos & Alertas', icon: AlertTriangle },
  { href: '/admin/content', label: 'Conteúdo', icon: FileText },
  { href: '/admin/communications', label: 'Comunicações', icon: MessageSquare },
  { href: '/admin/financial', label: 'Financeiro', icon: DollarSign },
  { href: '/admin/reports', label: 'Relatórios', icon: Download },
  { href: '/admin/compliance', label: 'LGPD/GDPR', icon: Shield },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin');
      return;
    }

    if (user) {
      checkAdminStatus();
      fetchUnreadAlerts();
    }
  }, [user, authLoading]);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data: adminCheck } = await supabase.rpc('is_admin', { _user_id: user.id });
    
    if (!adminCheck) {
      await supabase.auth.signOut();
      navigate('/admin');
      return;
    }

    setIsAdmin(true);

    const { data: role } = await supabase.rpc('get_admin_role', { _user_id: user.id });
    setAdminRole(role);
  };

  const fetchUnreadAlerts = async () => {
    const { count } = await supabase
      .from('admin_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('is_acknowledged', false);
    
    setUnreadAlerts(count || 0);
  };

  const handleLogout = async () => {
    if (user) {
      await supabase.from('admin_access_logs').insert({
        admin_id: user.id,
        action: 'logout',
        user_agent: navigator.userAgent,
      });
    }
    await supabase.auth.signOut();
    navigate('/admin');
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 bg-slate-700" />
          <Skeleton className="h-4 w-32 bg-slate-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-200 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-semibold text-white">Admin Panel</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  {item.href === '/admin/risks' && unreadAlerts > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadAlerts}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.email}</p>
              <p className="text-xs text-slate-400 capitalize">
                {adminRole?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-slate-600 text-slate-300 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-400"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-4 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-400 hover:text-white"
              onClick={() => navigate('/admin/risks')}
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
