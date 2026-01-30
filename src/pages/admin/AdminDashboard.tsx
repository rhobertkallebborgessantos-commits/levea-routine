import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminDashboardKPIs } from '@/hooks/useAdminData';
import {
  Users,
  UserCheck,
  UserX,
  Activity,
  TrendingDown,
  TrendingUp,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';

function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  loading,
}: {
  title: string;
  value: number | string;
  description?: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  loading?: boolean;
}) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 bg-slate-700" />
        ) : (
          <>
            <div className="text-2xl font-bold text-white">{value}</div>
            {(description || trendValue) && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                {trendValue && <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : ''}>{trendValue}</span>}
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: kpis, isLoading } = useAdminDashboardKPIs();

  // Mock data for charts - in production this would come from the API
  const userGrowthData = [
    { name: 'Seg', users: 120 },
    { name: 'Ter', users: 145 },
    { name: 'Qua', users: 132 },
    { name: 'Qui', users: 168 },
    { name: 'Sex', users: 189 },
    { name: 'Sáb', users: 156 },
    { name: 'Dom', users: 142 },
  ];

  const cancellationData = [
    { name: 'Seg', value: 3 },
    { name: 'Ter', value: 5 },
    { name: 'Qua', value: 2 },
    { name: 'Qui', value: 4 },
    { name: 'Sex', value: 6 },
    { name: 'Sáb', value: 1 },
    { name: 'Dom', value: 2 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Visão geral do sistema em tempo real</p>
        </div>

        {/* Main KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total de Usuários"
            value={kpis?.totalUsers || 0}
            icon={Users}
            loading={isLoading}
            trend="up"
            trendValue="+12%"
            description="vs. mês anterior"
          />
          <KPICard
            title="Usuários Ativos (7d)"
            value={kpis?.activeUsers7d || 0}
            icon={UserCheck}
            loading={isLoading}
            trend="up"
            trendValue="+8%"
            description="vs. semana anterior"
          />
          <KPICard
            title="Online Agora"
            value={kpis?.onlineNow || 0}
            icon={Activity}
            loading={isLoading}
          />
          <KPICard
            title="Retenção D7"
            value={`${kpis?.retention7d || 0}%`}
            icon={TrendingUp}
            loading={isLoading}
            trend="neutral"
            description="taxa de retenção"
          />
        </div>

        {/* Inactive users row */}
        <div className="grid gap-4 md:grid-cols-3">
          <KPICard
            title="Inativos 7+ dias"
            value={kpis?.inactive7d || 0}
            icon={Clock}
            loading={isLoading}
          />
          <KPICard
            title="Inativos 14+ dias"
            value={kpis?.inactive14d || 0}
            icon={Clock}
            loading={isLoading}
          />
          <KPICard
            title="Inativos 30+ dias"
            value={kpis?.inactive30d || 0}
            icon={UserX}
            loading={isLoading}
          />
        </div>

        {/* Cancellations row */}
        <div className="grid gap-4 md:grid-cols-3">
          <KPICard
            title="Cancelamentos Hoje"
            value={kpis?.cancellationsToday || 0}
            icon={AlertTriangle}
            loading={isLoading}
          />
          <KPICard
            title="Cancelamentos Semana"
            value={kpis?.cancellationsWeek || 0}
            icon={AlertTriangle}
            loading={isLoading}
          />
          <KPICard
            title="Cancelamentos Mês"
            value={kpis?.cancellationsMonth || 0}
            icon={AlertTriangle}
            loading={isLoading}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Crescimento de Usuários</CardTitle>
              <CardDescription className="text-slate-400">Últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  users: { label: 'Usuários', color: 'hsl(var(--primary))' },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Cancelamentos</CardTitle>
              <CardDescription className="text-slate-400">Últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: { label: 'Cancelamentos', color: 'hsl(0 84% 60%)' },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cancellationData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
