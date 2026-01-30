import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useChurnAnalytics } from '@/hooks/useAdminData';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingDown, Users, Calendar, AlertTriangle } from 'lucide-react';

const REASON_LABELS: Record<string, string> = {
  lack_of_time: 'Falta de tempo',
  no_results: 'Sem resultados visíveis',
  too_complex: 'App muito complexo',
  price: 'Preço',
  other: 'Outros',
};

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#6366f1'];

export default function AdminChurn() {
  const { data: churnData, isLoading } = useChurnAnalytics();

  const reasonChartData = Object.entries(churnData?.byReason || {}).map(([key, value]) => ({
    name: REASON_LABELS[key] || key,
    value,
  }));

  const dailyChartData = Object.entries(churnData?.byDay || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: format(new Date(date), 'dd/MM', { locale: ptBR }),
      count,
    }));

  // Calculate churn rate (mock - would need subscription data)
  const weeklyChurnRate = 2.4;
  const monthlyChurnRate = 8.2;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Churn & Cancelamentos</h1>
          <p className="text-slate-400">Análise detalhada de cancelamentos e retenção</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Total Cancelamentos (30d)
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-slate-700" />
              ) : (
                <div className="text-2xl font-bold text-white">
                  {churnData?.totalCancellations || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Churn Semanal</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{weeklyChurnRate}%</div>
              <p className="text-xs text-slate-400">meta: &lt;2%</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Churn Mensal</CardTitle>
              <Calendar className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{monthlyChurnRate}%</div>
              <p className="text-xs text-slate-400">meta: &lt;5%</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Principal Motivo</CardTitle>
              <Users className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24 bg-slate-700" />
              ) : (
                <div className="text-lg font-bold text-white">
                  {reasonChartData[0]?.name || 'N/A'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cancellations by Reason */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Motivos de Cancelamento</CardTitle>
              <CardDescription className="text-slate-400">
                Distribuição por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full bg-slate-700" />
              ) : reasonChartData.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-slate-400">
                  Nenhum dado de cancelamento disponível
                </div>
              ) : (
                <ChartContainer
                  config={{
                    value: { label: 'Cancelamentos', color: 'hsl(0 84% 60%)' },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reasonChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelLine={false}
                      >
                        {reasonChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Daily Cancellations */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Cancelamentos por Dia</CardTitle>
              <CardDescription className="text-slate-400">Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full bg-slate-700" />
              ) : dailyChartData.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-slate-400">
                  Nenhum dado disponível
                </div>
              ) : (
                <ChartContainer
                  config={{
                    count: { label: 'Cancelamentos', color: 'hsl(0 84% 60%)' },
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyChartData}>
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: '#ef4444' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Cancellations List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Cancelamentos Recentes</CardTitle>
            <CardDescription className="text-slate-400">
              Lista dos últimos cancelamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-slate-700" />
                ))}
              </div>
            ) : churnData?.cancellations.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                Nenhum cancelamento registrado
              </p>
            ) : (
              <div className="space-y-2">
                {churnData?.cancellations.slice(0, 10).map((cancellation: any) => (
                  <div
                    key={cancellation.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm text-white">
                          Usuário cancelou assinatura
                        </p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(cancellation.cancelled_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-red-500/50 text-red-400">
                      {REASON_LABELS[cancellation.reason_category] || cancellation.reason}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
