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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSendMessage, useAdminMessages, useReengagementCampaigns } from '@/hooks/useAdminData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Megaphone, RefreshCw, Send, Plus, Users } from 'lucide-react';

export default function AdminCommunications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sendMessage = useSendMessage();
  const { data: messages, isLoading: loadingMessages } = useAdminMessages();
  const { data: campaigns, isLoading: loadingCampaigns } = useReengagementCampaigns();

  // Individual message state
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [isBroadcast, setIsBroadcast] = useState(false);

  // Campaign state
  const [campaignName, setCampaignName] = useState('');
  const [campaignTriggerHours, setCampaignTriggerHours] = useState('24');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignContent, setCampaignContent] = useState('');

  const handleSendMessage = async () => {
    if (!messageTitle.trim() || !messageContent.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha título e conteúdo da mensagem.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sendMessage.mutateAsync({
        title: messageTitle,
        content: messageContent,
        messageType,
        isBroadcast,
      });

      toast({
        title: 'Mensagem enviada!',
        description: isBroadcast ? 'Broadcast enviado para todos os usuários.' : 'Mensagem enviada.',
      });

      setMessageTitle('');
      setMessageContent('');
      setIsBroadcast(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignName.trim() || !campaignTitle.trim() || !campaignContent.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos da campanha.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('reengagement_campaigns').insert({
        name: campaignName,
        trigger_type: 'inactivity',
        trigger_hours: parseInt(campaignTriggerHours),
        message_title: campaignTitle,
        message_content: campaignContent,
        is_active: true,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({ title: 'Campanha criada!' });
      setCampaignName('');
      setCampaignTitle('');
      setCampaignContent('');
      setCampaignTriggerHours('24');
      queryClient.invalidateQueries({ queryKey: ['admin-reengagement-campaigns'] });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleCampaign = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('reengagement_campaigns')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['admin-reengagement-campaigns'] });
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
          <h1 className="text-2xl font-bold text-white">Comunicações</h1>
          <p className="text-slate-400">
            Envie mensagens e gerencie campanhas de re-engajamento
          </p>
        </div>

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="messages" className="data-[state=active]:bg-primary">
              <MessageSquare className="w-4 h-4 mr-2" />
              Mensagens
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Campanhas
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary">
              <Megaphone className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Send Messages */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Enviar Mensagem</CardTitle>
                <CardDescription className="text-slate-400">
                  Envie mensagens individuais ou broadcasts para todos os usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isBroadcast}
                      onCheckedChange={setIsBroadcast}
                    />
                    <Label className="text-slate-300">
                      Broadcast (enviar para todos)
                    </Label>
                  </div>
                  {isBroadcast && (
                    <Badge variant="outline" className="border-primary text-primary">
                      <Users className="w-3 h-3 mr-1" />
                      Todos os usuários
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Título</Label>
                  <Input
                    placeholder="Título da mensagem..."
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Conteúdo</Label>
                  <Textarea
                    placeholder="Escreva sua mensagem..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Tipo</Label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informação</SelectItem>
                      <SelectItem value="success">Sucesso</SelectItem>
                      <SelectItem value="warning">Aviso</SelectItem>
                      <SelectItem value="promotion">Promoção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSendMessage} disabled={sendMessage.isPending}>
                  <Send className="w-4 h-4 mr-2" />
                  {sendMessage.isPending ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Re-engagement Campaigns */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Criar Campanha de Re-engajamento</CardTitle>
                <CardDescription className="text-slate-400">
                  Configure mensagens automáticas para usuários inativos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nome da Campanha</Label>
                  <Input
                    placeholder="Ex: Volta para nós!"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Disparar após (horas de inatividade)</Label>
                  <Select value={campaignTriggerHours} onValueChange={setCampaignTriggerHours}>
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 horas</SelectItem>
                      <SelectItem value="48">48 horas</SelectItem>
                      <SelectItem value="72">72 horas</SelectItem>
                      <SelectItem value="168">1 semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Título da Mensagem</Label>
                  <Input
                    placeholder="Sentimos sua falta!"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Conteúdo</Label>
                  <Textarea
                    placeholder="Mensagem de re-engajamento..."
                    value={campaignContent}
                    onChange={(e) => setCampaignContent(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>

                <Button onClick={handleCreateCampaign}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Campanha
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Campanhas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCampaigns ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full bg-slate-700" />
                    ))}
                  </div>
                ) : campaigns?.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">
                    Nenhuma campanha configurada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {campaigns?.map((campaign: any) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-900"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">{campaign.name}</h4>
                            <Badge
                              variant="outline"
                              className={
                                campaign.is_active
                                  ? 'border-green-500/50 text-green-400'
                                  : 'border-slate-600 text-slate-400'
                              }
                            >
                              {campaign.is_active ? 'Ativo' : 'Pausado'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">
                            Dispara após {campaign.trigger_hours}h de inatividade
                          </p>
                        </div>
                        <Switch
                          checked={campaign.is_active}
                          onCheckedChange={() =>
                            handleToggleCampaign(campaign.id, campaign.is_active)
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Message History */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Histórico de Mensagens</CardTitle>
                <CardDescription className="text-slate-400">
                  Últimas mensagens enviadas
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
                    Nenhuma mensagem enviada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {messages?.map((msg: any) => (
                      <div
                        key={msg.id}
                        className="p-4 rounded-lg bg-slate-900"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">{msg.title}</h4>
                            {msg.is_broadcast && (
                              <Badge variant="outline" className="border-primary/50 text-primary">
                                Broadcast
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            {format(new Date(msg.created_at), "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{msg.content}</p>
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
