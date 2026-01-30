import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMotivationalMessagesAdmin, useDailyTipsAdmin } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Lightbulb, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminContent() {
  const { data: messages, isLoading: loadingMessages } = useMotivationalMessagesAdmin();
  const { data: tips, isLoading: loadingTips } = useDailyTipsAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newMessage, setNewMessage] = useState('');
  const [newMessageCategory, setNewMessageCategory] = useState('');
  const [editingMessage, setEditingMessage] = useState<any>(null);

  const [newTipTitle, setNewTipTitle] = useState('');
  const [newTipContent, setNewTipContent] = useState('');
  const [newTipCategory, setNewTipCategory] = useState('');
  const [editingTip, setEditingTip] = useState<any>(null);

  const handleAddMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from('motivational_messages').insert({
        message: newMessage,
        category: newMessageCategory || null,
      });

      if (error) throw error;

      toast({ title: 'Mensagem adicionada!' });
      setNewMessage('');
      setNewMessageCategory('');
      queryClient.invalidateQueries({ queryKey: ['admin-motivational-messages'] });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const { error } = await supabase.from('motivational_messages').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Mensagem removida!' });
      queryClient.invalidateQueries({ queryKey: ['admin-motivational-messages'] });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleTip = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_tips')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin-daily-tips'] });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddTip = async () => {
    if (!newTipTitle.trim() || !newTipContent.trim()) return;

    try {
      const { error } = await supabase.from('daily_tips').insert({
        title: newTipTitle,
        content: newTipContent,
        category: newTipCategory || null,
        is_active: true,
      });

      if (error) throw error;

      toast({ title: 'Dica adicionada!' });
      setNewTipTitle('');
      setNewTipContent('');
      setNewTipCategory('');
      queryClient.invalidateQueries({ queryKey: ['admin-daily-tips'] });
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
          <h1 className="text-2xl font-bold text-white">Gestão de Conteúdo</h1>
          <p className="text-slate-400">
            Edite mensagens motivacionais, dicas e configurações do sistema
          </p>
        </div>

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="messages" className="data-[state=active]:bg-primary">
              <MessageSquare className="w-4 h-4 mr-2" />
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="tips" className="data-[state=active]:bg-primary">
              <Lightbulb className="w-4 h-4 mr-2" />
              Dicas Diárias
            </TabsTrigger>
          </TabsList>

          {/* Motivational Messages */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Adicionar Nova Mensagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Mensagem</Label>
                  <Textarea
                    placeholder="Digite a mensagem motivacional..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Categoria (opcional)</Label>
                  <Input
                    placeholder="Ex: manhã, tarde, progresso..."
                    value={newMessageCategory}
                    onChange={(e) => setNewMessageCategory(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={handleAddMessage}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Mensagem
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Mensagens Existentes</CardTitle>
                <CardDescription className="text-slate-400">
                  {messages?.length || 0} mensagens cadastradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMessages ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full bg-slate-700" />
                    ))}
                  </div>
                ) : messages?.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">
                    Nenhuma mensagem cadastrada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {messages?.map((msg: any) => (
                      <div
                        key={msg.id}
                        className="flex items-start justify-between p-4 rounded-lg bg-slate-900"
                      >
                        <div className="flex-1">
                          <p className="text-white">{msg.message}</p>
                          {msg.category && (
                            <Badge variant="outline" className="mt-2 border-slate-600 text-slate-400">
                              {msg.category}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          onClick={() => handleDeleteMessage(msg.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Tips */}
          <TabsContent value="tips" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Adicionar Nova Dica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Título</Label>
                  <Input
                    placeholder="Título da dica..."
                    value={newTipTitle}
                    onChange={(e) => setNewTipTitle(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Conteúdo</Label>
                  <Textarea
                    placeholder="Conteúdo da dica..."
                    value={newTipContent}
                    onChange={(e) => setNewTipContent(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Categoria (opcional)</Label>
                  <Input
                    placeholder="Ex: nutrição, exercício, mindfulness..."
                    value={newTipCategory}
                    onChange={(e) => setNewTipCategory(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={handleAddTip}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Dica
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Dicas Cadastradas</CardTitle>
                <CardDescription className="text-slate-400">
                  {tips?.length || 0} dicas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTips ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full bg-slate-700" />
                    ))}
                  </div>
                ) : tips?.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">
                    Nenhuma dica cadastrada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tips?.map((tip: any) => (
                      <div
                        key={tip.id}
                        className="flex items-start justify-between p-4 rounded-lg bg-slate-900"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">{tip.title}</h4>
                            <Badge
                              variant="outline"
                              className={
                                tip.is_active
                                  ? 'border-green-500/50 text-green-400'
                                  : 'border-slate-600 text-slate-400'
                              }
                            >
                              {tip.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{tip.content}</p>
                          {tip.category && (
                            <Badge variant="outline" className="mt-2 border-slate-600 text-slate-400">
                              {tip.category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={tip.is_active}
                            onCheckedChange={() => handleToggleTip(tip.id, tip.is_active)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
