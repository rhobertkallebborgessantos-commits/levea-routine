import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { RequireAuth, useAuth } from '@/hooks/useAuth';
import { useProfile, useUserPreferences, useUpdateProfile, useUpdateUserPreferences } from '@/hooks/useProfile';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { SettingsSkeleton } from '@/components/skeletons';
import { useToast } from '@/hooks/use-toast';
import { 
  GOALS, 
  ACTIVITY_LEVELS, 
  DIETARY_RESTRICTIONS,
  STRUGGLES, 
  TIME_SLOTS 
} from '@/lib/constants';
import { ArrowLeft, User, Settings2, Bell, Check, Save, BellRing, BellOff, Sun, Moon, Monitor, CreditCard, HelpCircle, MessageCircle, Mail, FileQuestion } from 'lucide-react';
import { LogoIcon } from '@/components/Logo';
import { cn } from '@/lib/utils';
import { BottomNav } from '@/components/BottomNav';
import { Database } from '@/integrations/supabase/types';
import { RemindersList } from '@/components/settings/RemindersList';

type TimeBlock = Database['public']['Enums']['time_block'];
type GoalType = typeof GOALS[number]['value'];
type ActivityLevelType = typeof ACTIVITY_LEVELS[number]['value'];

function SettingsContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: preferences, isLoading: preferencesLoading } = useUserPreferences();
  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdateUserPreferences();
  const { 
    isSupported: pushSupported, 
    permission: pushPermission, 
    isSubscribed: pushSubscribed, 
    isLoading: pushLoading, 
    subscribe: subscribePush, 
    unsubscribe: unsubscribePush,
    refreshPermission
  } = usePushNotifications();

  // Profile form state
  const [fullName, setFullName] = useState('');

  // Preferences form state
  const [goal, setGoal] = useState<GoalType | null>(null);
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevelType | null>(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [struggles, setStruggles] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeBlock[]>([]);


  // Load initial data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  useEffect(() => {
    if (preferences) {
      setGoal(preferences.primary_goal as GoalType || null);
      setCurrentWeight(preferences.current_weight?.toString() || '');
      setTargetWeight(preferences.target_weight?.toString() || '');
      setHeight(preferences.height?.toString() || '');
      setActivityLevel(preferences.activity_level as ActivityLevelType || null);
      setDietaryRestrictions(preferences.dietary_restrictions || []);
      setStruggles(preferences.struggles || []);
      setTimeSlots((preferences.available_time_slots as TimeBlock[]) || []);
    }
  }, [preferences]);

  // Refresh push permission when page gains focus (e.g., after user changes browser settings)
  useEffect(() => {
    const handleFocus = () => {
      console.log('[Settings] Page focused, refreshing push permission');
      refreshPermission();
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    });
    
    // Also refresh on mount
    refreshPermission();
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshPermission]);

  const toggleRestriction = (value: string) => {
    setDietaryRestrictions(prev => {
      if (value === 'none') return ['none'];
      return prev.includes(value)
        ? prev.filter(s => s !== value)
        : [...prev.filter(s => s !== 'none'), value];
    });
  };

  const toggleStruggle = (value: string) => {
    setStruggles(prev => 
      prev.includes(value) 
        ? prev.filter(s => s !== value) 
        : [...prev, value]
    );
  };

  const toggleTimeSlot = (value: TimeBlock) => {
    setTimeSlots(prev => 
      prev.includes(value) 
        ? prev.filter(s => s !== value) 
        : [...prev, value]
    );
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ full_name: fullName });
      toast({
        title: 'Perfil atualizado! ✓',
        description: 'Suas informações foram salvas.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Por favor, tente novamente.',
      });
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updatePreferences.mutateAsync({
        primary_goal: goal,
        current_weight: currentWeight ? parseFloat(currentWeight) : null,
        target_weight: targetWeight ? parseFloat(targetWeight) : null,
        height: height ? parseFloat(height) : null,
        activity_level: activityLevel,
        dietary_restrictions: dietaryRestrictions,
        struggles,
        available_time_slots: timeSlots,
      });
      toast({
        title: 'Preferências atualizadas! ✓',
        description: 'Sua rotina será ajustada de acordo.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Por favor, tente novamente.',
      });
    }
  };


  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isLoading = profileLoading || preferencesLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <LogoIcon size="sm" />
              <span className="font-display font-semibold text-foreground">Configurações</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              console.log('Bell clicked', { pushSupported, pushPermission, pushSubscribed, pushLoading });
              if (!pushSupported) {
                toast({
                  title: "Não suportado",
                  description: "Seu navegador não suporta notificações push",
                  variant: "destructive"
                });
                return;
              }
              if (pushPermission === 'denied') {
                toast({
                  title: "Permissão negada",
                  description: "Você negou as notificações. Habilite nas configurações do navegador.",
                  variant: "destructive"
                });
                return;
              }
              const result = pushSubscribed ? await unsubscribePush() : await subscribePush();
              console.log('Push result:', result);
              if (result && !pushSubscribed) {
                toast({
                  title: "Notificações ativadas! 🔔",
                  description: "Você receberá lembretes no seu dispositivo"
                });
              }
            }}
            disabled={pushLoading}
            className="relative"
          >
            {pushLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : pushSubscribed ? (
              <BellRing className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            {pushSubscribed && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {isLoading ? (
          <SettingsSkeleton />
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Preferências</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notificações</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Atualize seus dados de perfil</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome completo</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={updateProfile.isPending}
                      className="w-full gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {updateProfile.isPending ? 'Salvando...' : 'Salvar Perfil'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Appearance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>Escolha o tema do aplicativo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { value: 'light', label: 'Claro', icon: Sun },
                      { value: 'dark', label: 'Escuro', icon: Moon },
                      { value: 'system', label: 'Sistema', icon: Monitor },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          "w-full p-3 rounded-xl border-2 text-left transition-all",
                          theme === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 bg-card"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <option.icon className="h-5 w-5" />
                          <span className="font-medium text-foreground text-sm">{option.label}</span>
                          {theme === option.value && (
                            <Check className="h-4 w-4 text-primary ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Subscription */}
                <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/subscription')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Minha Assinatura
                    </CardTitle>
                    <CardDescription>Gerencie seu plano e pagamentos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Ver detalhes
                    </Button>
                  </CardContent>
                </Card>

                {/* Support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      Suporte
                    </CardTitle>
                    <CardDescription>Precisa de ajuda? Estamos aqui para você</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <a
                      href="mailto:rk.suportee@gmail.com"
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">Enviar e-mail</p>
                        <p className="text-xs text-muted-foreground">rk.suportee@gmail.com</p>
                      </div>
                    </a>
                    <a
                      href="https://wa.me/5511953315047?text=Olá! Preciso de ajuda com o app LEVEA."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">WhatsApp</p>
                        <p className="text-xs text-muted-foreground">Atendimento rápido</p>
                      </div>
                    </a>
                    <a
                      href="/faq"
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileQuestion className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">Perguntas Frequentes</p>
                        <p className="text-xs text-muted-foreground">Encontre respostas rápidas</p>
                      </div>
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Sair da Conta</CardTitle>
                    <CardDescription>Encerre sua sessão atual</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" onClick={handleSignOut} className="w-full">
                      Sair
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Goal */}
                <Card>
                  <CardHeader>
                    <CardTitle>Seu Objetivo</CardTitle>
                    <CardDescription>O que você quer alcançar?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {GOALS.map((g) => (
                      <button
                        key={g.value}
                        onClick={() => setGoal(g.value)}
                        className={cn(
                          "w-full p-3 rounded-xl border-2 text-left transition-all",
                          goal === g.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 bg-card"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{g.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{g.label}</p>
                          </div>
                          {goal === g.value && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Measurements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Medidas</CardTitle>
                    <CardDescription>Seus dados físicos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight">Peso atual (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder="ex: 70"
                          value={currentWeight}
                          onChange={(e) => setCurrentWeight(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetWeight">Peso meta (kg)</Label>
                        <Input
                          id="targetWeight"
                          type="number"
                          placeholder="ex: 65"
                          value={targetWeight}
                          onChange={(e) => setTargetWeight(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="ex: 170"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Level */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nível de Atividade</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {ACTIVITY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setActivityLevel(level.value)}
                        className={cn(
                          "w-full p-3 rounded-xl border-2 text-left transition-all",
                          activityLevel === level.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 bg-card"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{level.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{level.label}</p>
                          </div>
                          {activityLevel === level.value && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Dietary Restrictions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Restrições Alimentares</CardTitle>
                    <CardDescription>Selecione todas que se aplicam</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {DIETARY_RESTRICTIONS.map((restriction) => (
                        <button
                          key={restriction.value}
                          onClick={() => toggleRestriction(restriction.value)}
                          className={cn(
                            "p-3 rounded-xl border-2 text-left transition-all",
                            dietaryRestrictions.includes(restriction.value)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 bg-card"
                          )}
                        >
                          <span className="text-lg block mb-1">{restriction.icon}</span>
                          <p className="font-medium text-foreground text-xs">{restriction.label}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Struggles */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dificuldades</CardTitle>
                    <CardDescription>Selecione as que se aplicam</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {STRUGGLES.map((struggle) => (
                        <button
                          key={struggle.value}
                          onClick={() => toggleStruggle(struggle.value)}
                          className={cn(
                            "p-3 rounded-xl border-2 text-left transition-all",
                            struggles.includes(struggle.value)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 bg-card"
                          )}
                        >
                          <span className="text-lg block mb-1">{struggle.icon}</span>
                          <p className="font-medium text-foreground text-xs">{struggle.label}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Time Slots */}
                <Card>
                  <CardHeader>
                    <CardTitle>Horários Disponíveis</CardTitle>
                    <CardDescription>Quando você pode receber lembretes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot.value}
                        onClick={() => toggleTimeSlot(slot.value as TimeBlock)}
                        className={cn(
                          "w-full p-3 rounded-xl border-2 text-left transition-all",
                          timeSlots.includes(slot.value as TimeBlock)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 bg-card"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{slot.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">{slot.label}</p>
                            <p className="text-xs text-muted-foreground">{slot.time}</p>
                          </div>
                          {timeSlots.includes(slot.value as TimeBlock) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Button 
                  onClick={handleSavePreferences} 
                  disabled={updatePreferences.isPending}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updatePreferences.isPending ? 'Salvando...' : 'Salvar Preferências'}
                </Button>
              </motion.div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Push Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {pushSubscribed ? <BellRing className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5" />}
                      Notificações Push
                    </CardTitle>
                    <CardDescription>
                      Receba lembretes mesmo quando o app está fechado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!pushSupported ? (
                      <p className="text-sm text-muted-foreground">
                        Notificações push não são suportadas neste navegador.
                      </p>
                    ) : pushPermission === 'denied' ? (
                      <p className="text-sm text-destructive">
                        Notificações bloqueadas. Habilite nas configurações do navegador.
                      </p>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {pushSubscribed ? 'Ativadas' : 'Desativadas'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {pushSubscribed 
                              ? 'Você receberá lembretes de rotina' 
                              : 'Ative para receber lembretes'}
                          </p>
                        </div>
                        <Switch
                          checked={pushSubscribed}
                          onCheckedChange={(checked) => 
                            checked ? subscribePush() : unsubscribePush()
                          }
                          disabled={pushLoading}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Custom Reminders Management */}
                <RemindersList />
              </motion.div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function Settings() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}
