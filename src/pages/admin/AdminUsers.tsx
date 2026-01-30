import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAdminUsers } from '@/hooks/useAdminData';
import { Search, Filter, Eye, MessageSquare, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [inactiveFilter, setInactiveFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: users, isLoading } = useAdminUsers({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    inactiveDays: inactiveFilter !== 'all' ? parseInt(inactiveFilter) : undefined,
    search: search || undefined,
  });

  const filteredUsers = users?.filter((user) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.user_id?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const exportUsers = () => {
    if (!filteredUsers) return;

    const csv = [
      ['Nome', 'Status', 'Plano', 'Plataforma', 'Último Login', 'Criado em'].join(','),
      ...filteredUsers.map((u) =>
        [
          u.full_name || 'Não informado',
          u.subscription_status || 'active',
          u.subscription_plan || 'free',
          u.platform || 'web',
          u.last_login_at ? format(new Date(u.last_login_at), 'dd/MM/yyyy HH:mm') : 'Nunca',
          format(new Date(u.created_at), 'dd/MM/yyyy'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestão de Usuários</h1>
            <p className="text-slate-400">
              {filteredUsers?.length || 0} usuários encontrados
            </p>
          </div>
          <Button onClick={exportUsers} variant="outline" className="border-slate-600">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Buscar por nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-600 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={inactiveFilter} onValueChange={setInactiveFilter}>
                <SelectTrigger className="w-[180px] bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Inatividade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="7">Inativos 7+ dias</SelectItem>
                  <SelectItem value="14">Inativos 14+ dias</SelectItem>
                  <SelectItem value="30">Inativos 30+ dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-300">Nome</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Plano</TableHead>
                    <TableHead className="text-slate-300">Plataforma</TableHead>
                    <TableHead className="text-slate-300">Último Login</TableHead>
                    <TableHead className="text-slate-300">Criado em</TableHead>
                    <TableHead className="text-slate-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-slate-700">
                        <TableCell colSpan={7}>
                          <Skeleton className="h-10 w-full bg-slate-700" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers?.length === 0 ? (
                    <TableRow className="border-slate-700">
                      <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers?.map((user) => (
                      <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="text-white font-medium">
                          {user.full_name || 'Não informado'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.cancelled_at ? 'destructive' : 'default'}
                            className={
                              user.cancelled_at
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-green-500/20 text-green-400'
                            }
                          >
                            {user.cancelled_at ? 'Cancelado' : 'Ativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300 capitalize">
                          {user.subscription_plan || 'free'}
                        </TableCell>
                        <TableCell className="text-slate-300 capitalize">
                          {user.platform || 'web'}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {user.last_login_at
                            ? format(new Date(user.last_login_at), "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })
                            : 'Nunca'}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-slate-400 hover:text-white"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-white">
                                    Detalhes do Usuário
                                  </DialogTitle>
                                  <DialogDescription className="text-slate-400">
                                    Informações completas do usuário
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedUser && (
                                  <div className="space-y-4 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-slate-400">Nome</p>
                                        <p className="text-white">
                                          {selectedUser.full_name || 'Não informado'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-slate-400">ID do Usuário</p>
                                        <p className="text-white font-mono text-xs">
                                          {selectedUser.user_id}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-slate-400">Status</p>
                                        <p className="text-white">
                                          {selectedUser.cancelled_at ? 'Cancelado' : 'Ativo'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-slate-400">Plano</p>
                                        <p className="text-white capitalize">
                                          {selectedUser.subscription_plan || 'free'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-slate-400">Plataforma</p>
                                        <p className="text-white capitalize">
                                          {selectedUser.platform || 'web'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-slate-400">Onboarding</p>
                                        <p className="text-white">
                                          {selectedUser.onboarding_completed
                                            ? 'Completo'
                                            : 'Pendente'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-slate-400">Último Login</p>
                                        <p className="text-white">
                                          {selectedUser.last_login_at
                                            ? format(
                                                new Date(selectedUser.last_login_at),
                                                "dd/MM/yyyy 'às' HH:mm"
                                              )
                                            : 'Nunca'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-slate-400">Criado em</p>
                                        <p className="text-white">
                                          {format(new Date(selectedUser.created_at), 'dd/MM/yyyy')}
                                        </p>
                                      </div>
                                    </div>

                                    {selectedUser.user_preferences?.[0] && (
                                      <div className="pt-4 border-t border-slate-700">
                                        <h4 className="font-medium text-white mb-2">Preferências</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-slate-400">Objetivo</p>
                                            <p className="text-white capitalize">
                                              {selectedUser.user_preferences[0].goal?.replace('_', ' ') ||
                                                'Não definido'}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-slate-400">Peso Atual</p>
                                            <p className="text-white">
                                              {selectedUser.user_preferences[0].current_weight
                                                ? `${selectedUser.user_preferences[0].current_weight} kg`
                                                : 'Não informado'}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-slate-400">Peso Meta</p>
                                            <p className="text-white">
                                              {selectedUser.user_preferences[0].target_weight
                                                ? `${selectedUser.user_preferences[0].target_weight} kg`
                                                : 'Não informado'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-400 hover:text-white"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
