import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRiskFlags, useAdminAlerts, useAcknowledgeAlert } from '@/hooks/useAdminData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Bell, CheckCircle, TrendingDown, UserX, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RISK_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  high_churn_probability: {
    label: 'Alta probabilidade de cancelamento',
    icon: TrendingDown,
    color: 'text-red-500',
  },
  decreasing_engagement: {
    label: 'Engajamento em queda',
    icon: AlertTriangle,
    color: 'text-orange-500',
  },
  inactive_critical: {
    label: 'Inativo por período crítico',
    icon: UserX,
    color: 'text-yellow-500',
  },
  never_completed_onboarding: {
    label: 'Nunca completou onboarding',
    icon: Clock,
    color: 'text-blue-500',
  },
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/50',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
};

export default function AdminRisks() {
  const { data: riskFlags, isLoading: loadingRisks } = useRiskFlags();
  const { data: alerts, isLoading: loadingAlerts } = useAdminAlerts();
  const acknowledgeAlert = useAcknowledgeAlert();
  const { toast } = useToast();

  const unacknowledgedAlerts = alerts?.filter((a) => !a.is_acknowledged) || [];
  const acknowledgedAlerts = alerts?.filter((a) => a.is_acknowledged) || [];

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert.mutateAsync(alertId);
      toast({
        title: 'Alerta reconhecido',
        description: 'O alerta foi marcado como lido.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível reconhecer o alerta.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Riscos & Alertas</h1>
          <p className="text-slate-400">
            Sistema de inteligência e alertas automáticos
          </p>
        </div>

        {/* Active Alerts */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Alertas do Sistema
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {unacknowledgedAlerts.length} alertas pendentes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingAlerts ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-slate-700" />
                ))}
              </div>
            ) : unacknowledgedAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>Nenhum alerta pendente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unacknowledgedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-slate-900 border border-slate-700"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className={`w-5 h-5 mt-0.5 ${
                          alert.severity === 'critical'
                            ? 'text-red-500'
                            : alert.severity === 'warning'
                            ? 'text-yellow-500'
                            : 'text-blue-500'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{alert.title}</p>
                          <Badge
                            variant="outline"
                            className={SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.info}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        {alert.description && (
                          <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                          {format(new Date(alert.created_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:text-white"
                      onClick={() => handleAcknowledge(alert.id)}
                      disabled={acknowledgeAlert.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Reconhecer
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Flags */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Usuários em Risco
            </CardTitle>
            <CardDescription className="text-slate-400">
              Usuários identificados automaticamente com alta probabilidade de churn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRisks ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-slate-700" />
                ))}
              </div>
            ) : riskFlags?.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>Nenhum usuário em risco identificado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {riskFlags?.map((flag: any) => {
                  const riskInfo = RISK_TYPE_LABELS[flag.risk_type] || {
                    label: flag.risk_type,
                    icon: AlertTriangle,
                    color: 'text-slate-400',
                  };
                  const Icon = riskInfo.icon;

                  return (
                    <div
                      key={flag.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-900"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            flag.risk_score >= 80
                              ? 'bg-red-500/20'
                              : flag.risk_score >= 50
                              ? 'bg-orange-500/20'
                              : 'bg-yellow-500/20'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${riskInfo.color}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {flag.profiles?.full_name || 'Usuário'}
                          </p>
                          <p className="text-sm text-slate-400">{riskInfo.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-slate-400">Score de Risco</p>
                          <p
                            className={`text-lg font-bold ${
                              flag.risk_score >= 80
                                ? 'text-red-500'
                                : flag.risk_score >= 50
                                ? 'text-orange-500'
                                : 'text-yellow-500'
                            }`}
                          >
                            {flag.risk_score}%
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:text-white"
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acknowledged Alerts History */}
        {acknowledgedAlerts.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Histórico de Alertas</CardTitle>
              <CardDescription className="text-slate-400">
                Alertas já reconhecidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {acknowledgedAlerts.slice(0, 10).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-slate-300">{alert.title}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {format(new Date(alert.acknowledged_at || alert.created_at), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
