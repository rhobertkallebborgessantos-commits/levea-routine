import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEngagementAnalytics } from '@/hooks/useAdminData';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Activity, Clock, Users, Zap, TrendingUp, TrendingDown } from 'lucide-react';

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  meals: 'Refeições',
  tea: 'Chás',
  progress: 'Progresso',
  settings: 'Configurações',
  checkin: 'Check-in Semanal',
};

export default function AdminEngagement() {
  const { data: engagement, isLoading } = useEngagementAnalytics();

  const moduleChartData = Object.entries(engagement?.moduleAccess || {})
    .map(([key, value]) => ({
      module: MODULE_LABELS[key] || key,
      acessos: value,
    }))
    .sort((a, b) => b.acessos - a.acessos);

  // Mock engagement heatmap data
  const engagementLevels = [
    { label: 'Alta', count: 245, percentage: 35, color: 'bg-green-500' },
    { label: 'Média', count: 312, percentage: 45, color: 'bg-yellow-500' },
    { label: 'Baixa', count: 89, percentage: 13, color: 'bg-orange-500' },
    { label: 'Risco', count: 54, percentage: 7, color: 'bg-red-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Engajamento & Uso</h1>
          <p className="text-slate-400">Métricas de engajamento e comportamento dos usuários</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Sessões/Usuário (7d)
              </CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-slate-700" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-white">
                    {engagement?.avgSessionsPerUser || 0}
                  </div>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +12% vs semana anterior
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Duração Média (min)
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-slate-700" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-white">
                    {engagement?.avgSessionDuration || 0}
                  </div>
                  <p className="text-xs text-slate-400">minutos por sessão</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Sessões</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-slate-700" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-white">
                    {engagement?.totalSessions?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-slate-400">últimos 7 dias</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-slate-700" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-white">
                    {engagement?.uniqueActiveUsers || 0}
                  </div>
                  <p className="text-xs text-slate-400">últimos 7 dias</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Module Access Chart */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Módulos Mais Acessados</CardTitle>
              <CardDescription className="text-slate-400">
                Frequência de acesso por funcionalidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full bg-slate-700" />
              ) : moduleChartData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  Nenhum dado disponível
                </div>
              ) : (
                <ChartContainer
                  config={{
                    acessos: { label: 'Acessos', color: 'hsl(var(--primary))' },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moduleChartData} layout="vertical">
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis
                        type="category"
                        dataKey="module"
                        stroke="#64748b"
                        fontSize={12}
                        width={100}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="acessos"
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Engagement Heatmap */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Mapa de Engajamento</CardTitle>
              <CardDescription className="text-slate-400">
                Distribuição de usuários por nível de engajamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engagementLevels.map((level) => (
                  <div key={level.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{level.label}</span>
                      <span className="text-white font-medium">
                        {level.count} ({level.percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${level.color} rounded-full transition-all`}
                        style={{ width: `${level.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700">
                <h4 className="text-sm font-medium text-white mb-3">Legenda</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-slate-400">Alta: 5+ sessões/semana</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-slate-400">Média: 2-4 sessões/semana</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-slate-400">Baixa: 1 sessão/semana</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-slate-400">Risco: 0 sessões/semana</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Drop-off Analysis */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Análise de Abandono por Funcionalidade</CardTitle>
            <CardDescription className="text-slate-400">
              Onde os usuários param de usar o app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Onboarding → Dashboard</span>
                  <span className="text-green-500 font-medium">92%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full">
                  <div className="h-full w-[92%] bg-green-500 rounded-full" />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Dashboard → Refeições</span>
                  <span className="text-yellow-500 font-medium">68%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full">
                  <div className="h-full w-[68%] bg-yellow-500 rounded-full" />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Refeições → Registro Diário</span>
                  <span className="text-orange-500 font-medium">45%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full">
                  <div className="h-full w-[45%] bg-orange-500 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
