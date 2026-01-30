import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useAdminAllowlist, useAddAdmin, useRemoveAdmin, useAccessLogs } from '@/hooks/useAdminData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, Trash2, History, Settings } from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  const { data: admins, isLoading: loadingAdmins } = useAdminAllowlist();
  const { data: accessLogs, isLoading: loadingLogs } = useAccessLogs();
  const addAdmin = useAddAdmin();
  const removeAdmin = useRemoveAdmin();

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'master_admin' | 'operational_admin'>('operational_admin');

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite o email do administrador.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addAdmin.mutateAsync({
        email: newAdminEmail,
        role: newAdminRole,
      });

      toast({
        title: 'Administrador adicionado',
        description: `${newAdminEmail} foi adicionado como ${newAdminRole === 'master_admin' ? 'Master Admin' : 'Operational Admin'}.`,
      });

      setNewAdminEmail('');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveAdmin = async (adminId: string, email: string) => {
    try {
      await removeAdmin.mutateAsync(adminId);
      toast({
        title: 'Administrador removido',
        description: `${email} foi removido da lista de administradores.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações</h1>
          <p className="text-slate-400">
            Gerencie administradores e configurações do painel
          </p>
        </div>

        {/* Add Admin */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Adicionar Administrador
            </CardTitle>
            <CardDescription className="text-slate-400">
              Adicione novos administradores à lista de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input
                  placeholder="admin@exemplo.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Função</Label>
                <Select value={newAdminRole} onValueChange={(v: any) => setNewAdminRole(v)}>
                  <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational_admin">Operational Admin</SelectItem>
                    <SelectItem value="master_admin">Master Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddAdmin} disabled={addAdmin.isPending}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {addAdmin.isPending ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Administradores
            </CardTitle>
            <CardDescription className="text-slate-400">
              Lista de emails autorizados a acessar o painel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAdmins ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-slate-700" />
                ))}
              </div>
            ) : admins?.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                Nenhum administrador configurado
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Função</TableHead>
                      <TableHead className="text-slate-300">Adicionado em</TableHead>
                      <TableHead className="text-slate-300 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins?.map((admin: any) => (
                      <TableRow key={admin.id} className="border-slate-700">
                        <TableCell className="text-white font-medium">{admin.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              admin.role === 'master_admin'
                                ? 'border-primary text-primary'
                                : 'border-slate-500 text-slate-300'
                            }
                          >
                            {admin.role === 'master_admin' ? 'Master Admin' : 'Operational Admin'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {format(new Date(admin.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-800 border-slate-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">
                                  Remover administrador
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Tem certeza que deseja remover {admin.email} da lista de
                                  administradores?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-slate-600">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Access Logs */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <History className="w-5 h-5" />
              Logs de Acesso
            </CardTitle>
            <CardDescription className="text-slate-400">
              Histórico de acessos ao painel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full bg-slate-700" />
                ))}
              </div>
            ) : accessLogs?.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Nenhum log de acesso</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {accessLogs?.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          log.action === 'login' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm text-white">
                          {log.action === 'login' ? 'Login' : 'Logout'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {log.ip_address || 'IP não disponível'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Permissions Info */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Permissões por Função
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-900 border border-primary/30">
                <h4 className="text-primary font-medium mb-3">Master Admin</h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>✓ Acesso completo a todas as funcionalidades</li>
                  <li>✓ Gerenciar lista de administradores</li>
                  <li>✓ Excluir dados de usuários (LGPD)</li>
                  <li>✓ Configurações do sistema</li>
                  <li>✓ Visualizar logs de acesso</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-700">
                <h4 className="text-slate-300 font-medium mb-3">Operational Admin</h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>✓ Visualizar dashboard e métricas</li>
                  <li>✓ Gerenciar conteúdo (mensagens, dicas)</li>
                  <li>✓ Enviar comunicações</li>
                  <li>✓ Exportar relatórios</li>
                  <li>✗ Não pode gerenciar administradores</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
