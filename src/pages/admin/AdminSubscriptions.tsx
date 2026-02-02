import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Pause,
  Play,
  Settings,
  History,
} from 'lucide-react';
import { formatPrice, getStatusInfo } from '@/hooks/useSubscription';

interface SubscriptionWithUser {
  id: string;
  user_id: string;
  status: 'active' | 'pending' | 'overdue' | 'cancelled' | 'expired' | 'paused';
  payment_method: 'pix' | 'credit_card' | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  scheduled_change_type?: string | null;
  plan: {
    name: string;
    price_cents: number;
    interval: string;
  } | null;
  user_email?: string;
}

interface SubscriptionChange {
  id: string;
  user_id: string;
  subscription_id: string;
  change_type: string;
  from_plan_id: string | null;
  to_plan_id: string | null;
  amount_charged_cents: number;
  amount_credited_cents: number;
  effective_at: string;
  scheduled_for: string | null;
  notes: string | null;
  created_at: string;
}

function useAdminSubscriptions(statusFilter: string) {
  return useQuery({
    queryKey: ['admin-subscriptions', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          plan:subscription_plans!subscriptions_plan_id_fkey(name, price_cents, interval)
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
        paused: 0,
        total: statusCounts?.length || 0,
      };

      statusCounts?.forEach((sub) => {
        const status = sub.status as keyof typeof counts;
        if (status in counts) {
          counts[status]++;
        }
      });

      // Calculate MRR (Monthly Recurring Revenue)
      const { data: activeWithPlans, error: mrrError } = await supabase
        .from('subscriptions')
        .select(`
          plan:subscription_plans!subscriptions_plan_id_fkey(price_cents, interval)
        `)
        .eq('status', 'active');

      if (mrrError) throw mrrError;

      let mrr = 0;
      activeWithPlans?.forEach((sub: any) => {
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

function useSubscriptionChanges() {
  return useQuery({
    queryKey: ['admin-subscription-changes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_changes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as SubscriptionChange[];
    },
  });
}

function useSubscriptionSettings() {
  return useQuery({
    queryKey: ['admin-subscription-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_settings')
        .select('*');

      if (error) throw error;
      return data;
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

function useUpdateSetting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      settingKey, 
      settingValue 
    }: { 
      settingKey: string; 
      settingValue: any;
    }) => {
      const { error } = await supabase
        .from('subscription_settings')
        .update({ 
          setting_value: settingValue,
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', settingKey);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-settings'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-settings'] });
      toast({
        title: 'Configuração salva',
        description: 'A configuração foi atualizada.',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar a configuração.',
      });
    },
  });
}

function getChangeTypeInfo(type: string) {
  const typeMap: Record<string, { label: string; icon: any; color: string }> = {
    upgrade: { label: 'Upgrade', icon: TrendingUp, color: 'text-green-500' },
    downgrade: { label: 'Downgrade', icon: TrendingDown, color: 'text-orange-500' },
    pause: { label: 'Pausa', icon: Pause, color: 'text-yellow-500' },
    resume: { label: 'Retomada', icon: Play, color: 'text-blue-500' },
    cancel: { label: 'Cancelamento', icon: XCircle, color: 'text-red-500' },
    reactivate: { label: 'Reativação', icon: RefreshCw, color: 'text-green-500' },
  };
  return typeMap[type] || { label: type, icon: Clock, color: 'text-muted-foreground' };
}

export default function AdminSubscriptions() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [changeTypeFilter, setChangeTypeFilter] = useState('all');
  const { toast } = useToast();

  const { data: subscriptions, isLoading: subsLoading } = useAdminSubscriptions(statusFilter);
  const { data: metrics, isLoading: metricsLoading } = useSubscriptionMetrics();
  const { data: changes, isLoading: changesLoading } = useSubscriptionChanges();
  const { data: settings, isLoading: settingsLoading } = useSubscriptionSettings();
  const updateSubscription = useAdminUpdateSubscription();
  const updateSetting = useUpdateSetting();

  const filteredSubscriptions = subscriptions?.filter((sub) => 
    sub.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChanges = changes?.filter((change) =>
    changeTypeFilter === 'all' || change.change_type === changeTypeFilter
  );

  // Get settings as object
  const settingsObj: Record<string, any> = {};
  settings?.forEach((s: any) => {
    settingsObj[s.setting_key] = s.setting_value;
  });

  const handleToggleSetting = (key: string, currentValue: any) => {
    updateSetting.mutate({
      settingKey: key,
      settingValue: { ...currentValue, enabled: !currentValue.enabled },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestão de Assinaturas</h1>
          <p className="text-slate-400">Visualize e gerencie todas as assinaturas</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {metricsLoading ? (
            [...Array(6)].map((_, i) => (
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
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <Pause className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{metrics?.counts.paused || 0}</p>
                      <p className="text-sm text-slate-400">Pausadas</p>
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

        <Tabs defaultValue="subscriptions" className="w-full">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-slate-700">
              Assinaturas
            </TabsTrigger>
            <TabsTrigger value="changes" className="data-[state=active]:bg-slate-700">
              <History className="h-4 w-4 mr-2" />
              Histórico de Mudanças
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
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
                        <SelectItem value="paused">Pausadas</SelectItem>
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
                              {sub.scheduled_change_type && (
                                <Badge variant="outline" className="mt-1 text-orange-400 border-orange-400/50">
                                  {sub.scheduled_change_type === 'downgrade' ? 'Downgrade agendado' : 'Mudança agendada'}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={cn(
                                "capitalize",
                                getStatusInfo(sub.status as any).textColor
                              )}
                            >
                              <div className={cn(
                                "w-2 h-2 rounded-full mr-2",
                                getStatusInfo(sub.status as any).color
                              )} />
                              {getStatusInfo(sub.status as any).label}
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
                                <SelectItem value="paused">Pausar</SelectItem>
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
          </TabsContent>

          {/* Changes History Tab */}
          <TabsContent value="changes">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div>
                    <CardTitle className="text-white">Histórico de Mudanças</CardTitle>
                    <CardDescription className="text-slate-400">
                      Todas as mudanças de plano, pausas e cancelamentos
                    </CardDescription>
                  </div>
                  <Select value={changeTypeFilter} onValueChange={setChangeTypeFilter}>
                    <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="upgrade">Upgrades</SelectItem>
                      <SelectItem value="downgrade">Downgrades</SelectItem>
                      <SelectItem value="pause">Pausas</SelectItem>
                      <SelectItem value="resume">Retomadas</SelectItem>
                      <SelectItem value="cancel">Cancelamentos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {changesLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 bg-slate-700" />
                    ))}
                  </div>
                ) : filteredChanges?.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">
                    Nenhuma mudança registrada
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">Data</TableHead>
                        <TableHead className="text-slate-400">Tipo</TableHead>
                        <TableHead className="text-slate-400">Usuário</TableHead>
                        <TableHead className="text-slate-400">Valor Cobrado</TableHead>
                        <TableHead className="text-slate-400">Crédito</TableHead>
                        <TableHead className="text-slate-400">Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredChanges?.map((change) => {
                        const typeInfo = getChangeTypeInfo(change.change_type);
                        const Icon = typeInfo.icon;
                        return (
                          <TableRow key={change.id} className="border-slate-700">
                            <TableCell className="text-slate-300">
                              <div>
                                <p>{format(new Date(change.created_at), 'dd/MM/yyyy')}</p>
                                <p className="text-xs text-slate-500">
                                  {format(new Date(change.created_at), 'HH:mm')}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={cn("flex items-center gap-2", typeInfo.color)}>
                                <Icon className="h-4 w-4" />
                                <span>{typeInfo.label}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300 font-mono text-xs">
                              {change.user_id.slice(0, 8)}...
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {change.amount_charged_cents > 0 
                                ? formatPrice(change.amount_charged_cents) 
                                : '-'}
                            </TableCell>
                            <TableCell className="text-green-400">
                              {change.amount_credited_cents > 0 
                                ? formatPrice(change.amount_credited_cents) 
                                : '-'}
                            </TableCell>
                            <TableCell className="text-slate-400 text-sm max-w-[200px] truncate">
                              {change.notes || '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Configurações de Assinatura</CardTitle>
                  <CardDescription className="text-slate-400">
                    Controle as opções disponíveis para os usuários
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {settingsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 bg-slate-700" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {/* Allow Downgrades */}
                      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                        <div className="space-y-1">
                          <Label className="text-white font-medium">Permitir Downgrades</Label>
                          <p className="text-sm text-slate-400">
                            Usuários podem mudar de plano anual para mensal
                          </p>
                        </div>
                        <Switch
                          checked={settingsObj.allow_downgrades?.enabled !== false}
                          onCheckedChange={() => 
                            handleToggleSetting('allow_downgrades', settingsObj.allow_downgrades || { enabled: true })
                          }
                          disabled={updateSetting.isPending}
                        />
                      </div>

                      {/* Allow Pauses */}
                      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                        <div className="space-y-1">
                          <Label className="text-white font-medium">Permitir Pausas</Label>
                          <p className="text-sm text-slate-400">
                            Usuários podem pausar assinatura por até {settingsObj.allow_pauses?.max_days || 30} dias
                          </p>
                        </div>
                        <Switch
                          checked={settingsObj.allow_pauses?.enabled !== false}
                          onCheckedChange={() => 
                            handleToggleSetting('allow_pauses', settingsObj.allow_pauses || { enabled: true, max_days: 30, max_per_cycle: 1 })
                          }
                          disabled={updateSetting.isPending}
                        />
                      </div>

                      {/* Proration */}
                      <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/50">
                        <div className="space-y-1">
                          <Label className="text-white font-medium">Proration em Upgrades</Label>
                          <p className="text-sm text-slate-400">
                            Creditar tempo restante do plano atual ao fazer upgrade
                          </p>
                        </div>
                        <Switch
                          checked={settingsObj.proration_enabled?.enabled !== false}
                          onCheckedChange={() => 
                            handleToggleSetting('proration_enabled', settingsObj.proration_enabled || { enabled: true })
                          }
                          disabled={updateSetting.isPending}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Estatísticas de Mudanças</CardTitle>
                  <CardDescription className="text-slate-400">
                    Resumo das mudanças de assinatura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['upgrade', 'downgrade', 'pause', 'cancel'].map((type) => {
                      const count = changes?.filter(c => c.change_type === type).length || 0;
                      const typeInfo = getChangeTypeInfo(type);
                      const Icon = typeInfo.icon;
                      return (
                        <div key={type} className="p-4 rounded-lg bg-slate-700/50 text-center">
                          <Icon className={cn("h-6 w-6 mx-auto mb-2", typeInfo.color)} />
                          <p className="text-2xl font-bold text-white">{count}</p>
                          <p className="text-sm text-slate-400">{typeInfo.label}s</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
