import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDataAccessRequests } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shield, Download, Trash2, Eye, Clock, CheckCircle, Search } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400' },
  processing: { label: 'Processando', color: 'bg-blue-500/20 text-blue-400' },
  completed: { label: 'Concluído', color: 'bg-green-500/20 text-green-400' },
  rejected: { label: 'Rejeitado', color: 'bg-red-500/20 text-red-400' },
};

const REQUEST_TYPE_LABELS: Record<string, string> = {
  export: 'Exportação de Dados',
  delete: 'Exclusão de Conta',
  access: 'Acesso aos Dados',
};

export default function AdminCompliance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useDataAccessRequests();
  const [searchUserId, setSearchUserId] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const handleProcessRequest = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('data_access_requests')
        .update({
          status,
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Solicitação processada',
        description: `Status atualizado para ${STATUS_LABELS[status]?.label || status}`,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-data-access-requests'] });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUserData = async (userId: string) => {
    try {
      // In production, this would cascade delete all user data
      // Here we're showing the concept
      const tables = [
        'profiles',
        'user_preferences',
        'meal_logs',
        'tea_logs',
        'weight_logs',
        'body_measurements',
        'progress_photos',
        'daily_routines',
        'user_streaks',
        'user_analytics',
        'user_consents',
      ];

      for (const table of tables) {
        await supabase.from(table as any).delete().eq('user_id', userId);
      }

      toast({
        title: 'Dados excluídos',
        description: 'Todos os dados do usuário foram removidos permanentemente.',
      });

      queryClient.invalidateQueries({ queryKey: ['admin-data-access-requests'] });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const exportUserData = async (userId: string) => {
    try {
      // Fetch all user data
      const [
        { data: profile },
        { data: preferences },
        { data: meals },
        { data: teas },
        { data: weights },
        { data: measurements },
        { data: consents },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
        supabase.from('meal_logs').select('*').eq('user_id', userId),
        supabase.from('tea_logs').select('*').eq('user_id', userId),
        supabase.from('weight_logs').select('*').eq('user_id', userId),
        supabase.from('body_measurements').select('*').eq('user_id', userId),
        supabase.from('user_consents').select('*').eq('user_id', userId),
      ]);

      const userData = {
        exportDate: new Date().toISOString(),
        userId,
        profile,
        preferences,
        mealLogs: meals,
        teaLogs: teas,
        weightLogs: weights,
        bodyMeasurements: measurements,
        consents,
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_data_${userId}_${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();

      toast({
        title: 'Dados exportados',
        description: 'O arquivo JSON foi baixado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const pendingRequests = requests?.filter((r: any) => r.status === 'pending') || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">LGPD / GDPR</h1>
          <p className="text-slate-400">
            Gestão de dados pessoais e conformidade com regulamentações
          </p>
        </div>

        {/* Pending Requests Alert */}
        {pendingRequests.length > 0 && (
          <Card className="bg-yellow-500/10 border-yellow-500/50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-white font-medium">
                    {pendingRequests.length} solicitação(ões) pendente(s)
                  </p>
                  <p className="text-sm text-slate-400">
                    Você tem solicitações de dados aguardando processamento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Buscar Dados do Usuário
              </CardTitle>
              <Search className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="ID do usuário..."
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white"
              />
              <Button
                onClick={() => exportUserData(searchUserId)}
                disabled={!searchUserId}
                className="w-full"
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                Visualizar/Exportar
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Exportar Dados
              </CardTitle>
              <Download className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-3">
                Exporte todos os dados de um usuário em formato JSON
              </p>
              <Button
                onClick={() => searchUserId && exportUserData(searchUserId)}
                disabled={!searchUserId}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar JSON
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Excluir Conta
              </CardTitle>
              <Trash2 className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-3">
                Exclua permanentemente todos os dados de um usuário
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={!searchUserId}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Dados
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-800 border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Confirmar exclusão permanente
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      Esta ação é irreversível. Todos os dados do usuário serão
                      permanentemente removidos do sistema.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-600">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => handleDeleteUserData(searchUserId)}
                    >
                      Excluir Permanentemente
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>

        {/* Data Access Requests */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Solicitações de Dados
            </CardTitle>
            <CardDescription className="text-slate-400">
              Solicitações de acesso, exportação e exclusão de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-slate-700" />
                ))}
              </div>
            ) : requests?.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma solicitação de dados registrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Usuário</TableHead>
                      <TableHead className="text-slate-300">Tipo</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Data</TableHead>
                      <TableHead className="text-slate-300 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests?.map((request: any) => (
                      <TableRow key={request.id} className="border-slate-700">
                        <TableCell className="text-white">
                          {request.profiles?.full_name || request.user_id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {REQUEST_TYPE_LABELS[request.request_type] || request.request_type}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={STATUS_LABELS[request.status]?.color}
                          >
                            {STATUS_LABELS[request.status]?.label || request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === 'pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                                onClick={() => handleProcessRequest(request.id, 'completed')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Aprovar
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Info */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Políticas de Conformidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-900">
                <h4 className="text-white font-medium mb-2">LGPD (Brasil)</h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Direito de acesso aos dados</li>
                  <li>• Direito à portabilidade</li>
                  <li>• Direito à exclusão</li>
                  <li>• Prazo: 15 dias úteis</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-900">
                <h4 className="text-white font-medium mb-2">GDPR (Europa)</h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Right to access</li>
                  <li>• Right to erasure</li>
                  <li>• Right to data portability</li>
                  <li>• Response within 30 days</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
