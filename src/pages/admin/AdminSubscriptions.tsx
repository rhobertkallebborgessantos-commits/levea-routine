import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  Search, 
  CreditCard, 
  QrCode, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { formatPrice, getStatusInfo } from '@/hooks/useSubscription';

interface SubscriptionWithUser {
  id: string;
  user_id: string;
  status: 'active' | 'pending' | 'overdue' | 'cancelled' | 'expired';
  payment_method: 'pix' | 'credit_card' | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  plan: {
    name: string;
    price_cents: number;
    interval: string;
  } | null;
  user_email?: string;
}

function useAdminSubscriptions(statusFilter: string) {
  return useQuery({
    queryKey: ['admin-subscriptions', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          plan:subscription_plans(name, price_cents, interval)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SubscriptionWithUser[];
    },
  });
}

function useSubscriptionMetrics() {
  return useQuery({
    queryKey: ['admin-subscription-metrics'],
    queryFn: async () => {
      // Get subscription counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from('subscriptions')
        .select('status');

      if (statusError) throw statusError;

      const counts = {
        active: 0,
        pending: 0,
        overdue: 0,
        cancelled: 0,
        expired: 0,
        total: statusCounts?.length || 0,
      };

      statusCounts?.forEach((sub) => {
        counts[sub.status as keyof typeof counts]++;
      });

      // Calculate MRR (Monthly Recurring Revenue)
      const { data: activeWithPlans, error: mrrError } = await supabase
        .from('subscriptions')
        .select(`
          plan:subscription_plans(price_cents, interval)
        `)
        .eq('status', 'active');

      if (mrrError) throw mrrError;

      let mrr = 0;
      activeWithPlans?.forEach((sub) => {
        if (sub.plan) {
          // Convert yearly to monthly
          const monthlyAmount = sub.plan.interval === 'yearly' 
            ? sub.plan.price_cents / 12 
            : sub.plan.price_cents;
          mrr += monthlyAmount;
        }
      });

      return { counts, mrr };
    },
  });
}

function useAdminUpdateSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      subscriptionId, 
      status 
    }: { 
      subscriptionId: string; 
      status: string;
    }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status,
          cancelled_at: status === 'cancelled' ? new Date().toISOString() : null,
        })
        .eq('id', subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-metrics'] });
      toast({
        title: 'Assinatura atualizada',
        description: 'O status da assinatura foi alterado.',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar a assinatura.',
      });
    },
  });
}

export default function AdminSubscriptions() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: subscriptions, isLoading: subsLoading } = useAdminSubscriptions(statusFilter);
  const { data: metrics, isLoading: metricsLoading } = useSubscriptionMetrics();
  const updateSubscription = useAdminUpdateSubscription();

  const filteredSubscriptions = subscriptions?.filter((sub) => 
    sub.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestão de Assinaturas</h1>
          <p className="text-slate-400">Visualize e gerencie todas as assinaturas</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {metricsLoading ? (
            [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 bg-slate-700" />
            ))
          ) : (
            <>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{metrics?.counts.active || 0}</p>
                      <p className="text-sm text-slate-400">Ativas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{metrics?.counts.pending || 0}</p>
                      <p className="text-sm text-slate-400">Pendentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{metrics?.counts.overdue || 0}</p>
                      <p className="text-sm text-slate-400">Atrasadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-500/20">
                      <XCircle className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{metrics?.counts.cancelled || 0}</p>
                      <p className="text-sm text-slate-400">Canceladas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {formatPrice(metrics?.mrr || 0)}
                      </p>
                      <p className="text-sm text-slate-400">MRR</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Subscriptions Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div>
                <CardTitle className="text-white">Assinaturas</CardTitle>
                <CardDescription className="text-slate-400">
                  {metrics?.counts.total || 0} assinaturas no total
                </CardDescription>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-slate-700 border-slate-600 text-white w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="overdue">Atrasadas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                    <SelectItem value="expired">Expiradas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {subsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 bg-slate-700" />
                ))}
              </div>
            ) : filteredSubscriptions?.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                Nenhuma assinatura encontrada
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">ID Usuário</TableHead>
                    <TableHead className="text-slate-400">Plano</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Pagamento</TableHead>
                    <TableHead className="text-slate-400">Período</TableHead>
                    <TableHead className="text-slate-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions?.map((sub) => (
                    <TableRow key={sub.id} className="border-slate-700">
                      <TableCell className="text-slate-300 font-mono text-xs">
                        {sub.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="text-white">
                        <div>
                          <p className="font-medium">{sub.plan?.name || '-'}</p>
                          <p className="text-sm text-slate-400">
                            {sub.plan ? formatPrice(sub.plan.price_cents) : '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "capitalize",
                            getStatusInfo(sub.status).textColor
                          )}
                        >
                          <div className={cn(
                            "w-2 h-2 rounded-full mr-2",
                            getStatusInfo(sub.status).color
                          )} />
                          {getStatusInfo(sub.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {sub.payment_method === 'pix' ? (
                          <div className="flex items-center gap-1">
                            <QrCode className="h-4 w-4" /> Pix
                          </div>
                        ) : sub.payment_method === 'credit_card' ? (
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" /> Cartão
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        <div>
                          <p>{format(new Date(sub.current_period_start), 'dd/MM/yy')}</p>
                          <p className="text-slate-500">até {format(new Date(sub.current_period_end), 'dd/MM/yy')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={sub.status}
                          onValueChange={(value) => 
                            updateSubscription.mutate({ 
                              subscriptionId: sub.id, 
                              status: value 
                            })
                          }
                        >
                          <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Ativar</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="overdue">Atrasada</SelectItem>
                            <SelectItem value="cancelled">Cancelar</SelectItem>
                            <SelectItem value="expired">Expirar</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
