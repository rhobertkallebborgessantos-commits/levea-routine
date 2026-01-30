import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, AlertTriangle, RefreshCw, Users } from 'lucide-react';

// Mock data - in production this would come from Stripe/payment provider
const revenueData = [
  { month: 'Jan', revenue: 12500 },
  { month: 'Fev', revenue: 15200 },
  { month: 'Mar', revenue: 18900 },
  { month: 'Abr', revenue: 22100 },
  { month: 'Mai', revenue: 24800 },
  { month: 'Jun', revenue: 28500 },
];

const subscriptionsByPlan = [
  { name: 'Mensal', value: 450, color: '#22c55e' },
  { name: 'Anual', value: 180, color: '#3b82f6' },
  { name: 'Trial', value: 70, color: '#eab308' },
];

const paymentMethods = [
  { method: 'Cartão de Crédito', count: 520, percentage: 74 },
  { method: 'Pix', count: 150, percentage: 21 },
  { method: 'Boleto', count: 30, percentage: 5 },
];

export default function AdminFinancial() {
  // Mock financial KPIs
  const financialKPIs = {
    totalRevenue: 28500,
    mrr: 24200,
    activeSubscriptions: 700,
    churnRate: 4.2,
    avgTicket: 34.57,
    failedPayments: 12,
    refunds: 3,
    chargebacks: 1,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro & Assinaturas</h1>
          <p className="text-slate-400">
            Métricas de receita, MRR e gestão de assinaturas
          </p>
        </div>

        {/* Financial KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Receita Total (Mês)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                R$ {financialKPIs.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +15% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">MRR</CardTitle>
              <RefreshCw className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                R$ {financialKPIs.mrr.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400">receita recorrente mensal</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Assinaturas Ativas
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {financialKPIs.activeSubscriptions}
              </div>
              <p className="text-xs text-slate-400">
                Ticket médio: R$ {financialKPIs.avgTicket.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Churn Rate
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{financialKPIs.churnRate}%</div>
              <p className="text-xs text-slate-400">meta: &lt;3%</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Evolução de Receita</CardTitle>
            <CardDescription className="text-slate-400">Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: 'Receita', color: 'hsl(142 76% 36%)' },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `R$${value / 1000}k`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Receita']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(142 76% 36%)"
                    fill="hsl(142 76% 36% / 0.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Subscriptions by Plan */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Assinaturas por Plano</CardTitle>
              <CardDescription className="text-slate-400">
                Distribuição de assinantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: { label: 'Assinaturas' },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subscriptionsByPlan}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {subscriptionsByPlan.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex justify-center gap-4 mt-4">
                {subscriptionsByPlan.map((plan) => (
                  <div key={plan.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: plan.color }}
                    />
                    <span className="text-sm text-slate-400">{plan.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Métodos de Pagamento</CardTitle>
              <CardDescription className="text-slate-400">
                Distribuição por forma de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.method} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{method.method}</span>
                    <span className="text-white font-medium">
                      {method.count} ({method.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${method.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Payment Issues */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-slate-800 border-slate-700 border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Pagamentos Falhados
              </CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {financialKPIs.failedPayments}
              </div>
              <p className="text-xs text-slate-400">este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Reembolsos</CardTitle>
              <RefreshCw className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{financialKPIs.refunds}</div>
              <p className="text-xs text-slate-400">este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Chargebacks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{financialKPIs.chargebacks}</div>
              <p className="text-xs text-slate-400">este mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Integration Notice */}
        <Card className="bg-slate-800/50 border-slate-700 border-dashed">
          <CardContent className="py-6 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-slate-500" />
            <h3 className="text-lg font-medium text-white mb-2">
              Integração com Gateway de Pagamento
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Para dados financeiros em tempo real, configure a integração com Stripe ou
              outro gateway de pagamento.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
