import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, subMonths } from 'date-fns';
import { Download, FileSpreadsheet, Users, TrendingDown, Activity, DollarSign } from 'lucide-react';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: any;
  table: string;
  columns: string[];
}

const reportTypes: ReportType[] = [
  {
    id: 'users',
    name: 'Usuários',
    description: 'Lista completa de usuários com status e métricas',
    icon: Users,
    table: 'profiles',
    columns: ['full_name', 'subscription_plan', 'subscription_status', 'platform', 'last_login_at', 'created_at'],
  },
  {
    id: 'cancellations',
    name: 'Cancelamentos',
    description: 'Histórico de cancelamentos com motivos',
    icon: TrendingDown,
    table: 'cancellation_logs',
    columns: ['user_id', 'reason', 'reason_category', 'feedback', 'cancelled_at'],
  },
  {
    id: 'engagement',
    name: 'Engajamento',
    description: 'Dados de uso e sessões dos usuários',
    icon: Activity,
    table: 'user_analytics',
    columns: ['user_id', 'date', 'session_count', 'total_session_duration_seconds', 'modules_accessed'],
  },
];

export default function AdminReports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [period, setPeriod] = useState('30');

  const generateCSV = (data: any[], columns: string[]): string => {
    const headers = columns.join(',');
    const rows = data.map((row) =>
      columns.map((col) => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value).includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (report: ReportType) => {
    setLoading(report.id);

    try {
      const startDate = format(subDays(new Date(), parseInt(period)), 'yyyy-MM-dd');

      let query = supabase.from(report.table as any).select(report.columns.join(','));

      // Add date filter based on table
      if (report.table === 'profiles') {
        query = query.gte('created_at', startDate);
      } else if (report.table === 'cancellation_logs') {
        query = query.gte('cancelled_at', startDate);
      } else if (report.table === 'user_analytics') {
        query = query.gte('date', startDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: 'Sem dados',
          description: 'Não há dados para exportar no período selecionado.',
        });
        return;
      }

      const csv = generateCSV(data, report.columns);
      const filename = `${report.id}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadCSV(csv, filename);

      toast({
        title: 'Exportação concluída',
        description: `${data.length} registros exportados para ${filename}`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro na exportação',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleExportAll = async () => {
    for (const report of reportTypes) {
      await handleExport(report);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Relatórios & Exportação</h1>
            <p className="text-slate-400">
              Exporte dados do sistema em formato CSV
            </p>
          </div>
          <Button onClick={handleExportAll} variant="outline" className="border-slate-600">
            <Download className="w-4 h-4 mr-2" />
            Exportar Todos
          </Button>
        </div>

        {/* Period Filter */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Período</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[200px] bg-slate-900 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                    <SelectItem value="365">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{report.name}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {report.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-xs text-slate-500">
                      Colunas: {report.columns.join(', ')}
                    </div>
                    <Button
                      onClick={() => handleExport(report)}
                      disabled={loading === report.id}
                      className="w-full"
                    >
                      {loading === report.id ? (
                        'Exportando...'
                      ) : (
                        <>
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Exportar CSV
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Custom Report Builder (placeholder) */}
        <Card className="bg-slate-800/50 border-slate-700 border-dashed">
          <CardContent className="py-8 text-center">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-slate-500" />
            <h3 className="text-lg font-medium text-white mb-2">
              Construtor de Relatórios Personalizados
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Em breve: crie relatórios personalizados selecionando colunas específicas,
              filtros avançados e agendamento automático.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
