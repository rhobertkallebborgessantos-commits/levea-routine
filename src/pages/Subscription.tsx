import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RequireAuth, useAuth } from '@/hooks/useAuth';
import { 
  useUserSubscription, 
  useSubscriptionPlans,
  usePaymentHistory,
  useInvoices,
  useCancelSubscription,
  useReactivateSubscription,
  useCreateSubscription,
  useSimulatePixPayment,
  useUpgradeSubscription,
  useDowngradeSubscription,
  usePauseSubscription,
  useResumeSubscription,
  useCancelScheduledChange,
  useSubscriptionSettings,
  calculateUpgradeProration,
  formatPrice,
  getStatusInfo,
} from '@/hooks/useSubscription';
import { UpgradeDialog, DowngradeDialog, PauseDialog, ResumeDialog, CancellationSurveyDialog } from '@/components/subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  Leaf, 
  ArrowLeft, 
  CreditCard, 
  QrCode, 
  Calendar, 
  Check, 
  X,
  Clock,
  Download,
  RefreshCw,
  AlertTriangle,
  Receipt,
  Sparkles,
  Crown,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';

function SubscriptionSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

function SubscriptionContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'pix' | 'credit_card' | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Dialog states
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);

  const { data: subscription, isLoading: subLoading } = useUserSubscription();
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: payments, isLoading: paymentsLoading } = usePaymentHistory();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const { data: settings } = useSubscriptionSettings();

  const cancelSubscription = useCancelSubscription();
  const reactivateSubscription = useReactivateSubscription();
  const createSubscription = useCreateSubscription();
  const simulatePixPayment = useSimulatePixPayment();
  const upgradeSubscription = useUpgradeSubscription();
  const downgradeSubscription = useDowngradeSubscription();
  const pauseSubscription = usePauseSubscription();
  const resumeSubscription = useResumeSubscription();
  const cancelScheduledChange = useCancelScheduledChange();

  // Reset subscription for testing (only for current user)
  const handleResetSubscription = async () => {
    if (!user) return;
    setIsResetting(true);
    try {
      // Delete in order: subscription_changes, invoices, payments, subscriptions
      await supabase.from('subscription_changes').delete().eq('user_id', user.id);
      await supabase.from('invoices').delete().eq('user_id', user.id);
      await supabase.from('payments').delete().eq('user_id', user.id);
      await supabase.from('subscriptions').delete().eq('user_id', user.id);
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-changes'] });
      
      setHasAutoSelected(false);
      setSelectedPlan(null);
      
      toast({
        title: 'Assinatura resetada',
        description: 'Você pode testar novamente o fluxo de assinatura.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao resetar',
        description: 'Por favor, tente novamente.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Auto-select annual plan when plans load (default to annual)
  const annualPlan = plans?.find(p => p.interval === 'yearly');
  const monthlyPlan = plans?.find(p => p.interval === 'monthly');
  
  useEffect(() => {
    if (plans && !selectedPlan && !hasAutoSelected && annualPlan) {
      setSelectedPlan(annualPlan.id);
      setHasAutoSelected(true);
    }
  }, [plans, selectedPlan, hasAutoSelected, annualPlan]);

  const isLoading = subLoading || plansLoading;

  // Redirect to dashboard if user already has active subscription and came from auth flow
  useEffect(() => {
    if (!isLoading && subscription && (subscription.status === 'active' || subscription.status === 'paused')) {
      // Check if user just came from auth (has pending navigation)
      const fromAuth = sessionStorage.getItem('fromAuth');
      if (fromAuth) {
        sessionStorage.removeItem('fromAuth');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [subscription, isLoading, navigate]);

  // Check settings
  const allowDowngrades = settings?.allow_downgrades?.enabled !== false;
  const allowPauses = settings?.allow_pauses?.enabled !== false;
  const maxPauseDays = settings?.allow_pauses?.max_days || 30;
  const canPause = subscription?.pause_count_this_cycle === 0 || !subscription?.pause_count_this_cycle;

  // Determine available actions based on current plan
  const isAnnualPlan = subscription?.plan?.interval === 'yearly';
  const isMonthlyPlan = subscription?.plan?.interval === 'monthly';
  const isPaused = subscription?.status === 'paused';
  const hasScheduledDowngrade = subscription?.scheduled_change_type === 'downgrade';

  const handleCancelSubscription = async (reason: string, reasonCategory: string, feedback: string) => {
    if (!subscription || !user) return;
    try {
      // Log the cancellation reason
      await supabase.from('cancellation_logs').insert({
        user_id: user.id,
        reason: reason,
        reason_category: reasonCategory,
        feedback: feedback || null,
      });

      // Cancel the subscription
      await cancelSubscription.mutateAsync(subscription.id);
      
      setShowCancellationDialog(false);
      toast({
        title: 'Assinatura cancelada',
        description: 'Você ainda tem acesso até o fim do período atual.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao cancelar',
        description: 'Por favor, tente novamente.',
      });
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;
    try {
      await reactivateSubscription.mutateAsync(subscription.id);
      toast({
        title: 'Assinatura reativada! 🎉',
        description: 'Bem-vindo de volta ao LEVEA.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao reativar',
        description: 'Por favor, tente novamente.',
      });
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !selectedPaymentMethod) return;
    try {
      const result = await createSubscription.mutateAsync({
        planId: selectedPlan,
        paymentMethod: selectedPaymentMethod,
      });
      setShowPlanSelector(false);
      setSelectedPlan(null);
      setSelectedPaymentMethod(null);
      
      if (selectedPaymentMethod === 'credit_card') {
        toast({
          title: 'Assinatura ativada! 🎉',
          description: 'Bem-vindo ao LEVEA! Vamos configurar sua rotina.',
        });
        // Redirect to onboarding after successful payment
        navigate('/onboarding');
      } else {
        toast({
          title: 'Aguardando pagamento',
          description: 'Pague o Pix para ativar sua assinatura.',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao assinar',
        description: 'Por favor, tente novamente.',
      });
    }
  };

  const handleSimulatePixPayment = async (paymentId: string) => {
    try {
      await simulatePixPayment.mutateAsync(paymentId);
      toast({
        title: 'Pagamento confirmado! 🎉',
        description: 'Bem-vindo ao LEVEA! Vamos configurar sua rotina.',
      });
      // Redirect to onboarding after successful Pix payment
      navigate('/onboarding');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao confirmar',
        description: 'Por favor, tente novamente.',
      });
    }
  };

  const handleUpgrade = async () => {
    if (!subscription || !annualPlan) return;
    try {
      const { chargeAmount } = calculateUpgradeProration(subscription, annualPlan);
      await upgradeSubscription.mutateAsync({
        subscriptionId: subscription.id,
        newPlanId: annualPlan.id,
        prorationAmount: chargeAmount,
      });
      toast({
        title: 'Upgrade realizado! 🎉',
        description: 'Seu plano foi atualizado para anual.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer upgrade',
        description: 'Por favor, tente novamente.',
      });
    }
  };

  const handleDowngrade = async () => {
    if (!subscription || !monthlyPlan) return;
    try {
      await downgradeSubscription.mutateAsync({
        subscriptionId: subscription.id,
        newPlanId: monthlyPlan.id,
      });
      toast({
        title: 'Mudança agendada',
        description: 'Seu plano mudará para mensal na próxima renovação.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao agendar mudança',
        description: 'Por favor, tente novamente.',
      });
    }
  };

  const handlePause = async (days: number) => {
    if (!subscription) return;
    try {
      await pauseSubscription.mutateAsync({
        subscriptionId: subscription.id,
        pauseDays: days,
      });
      toast({
        title: 'Assinatura pausada',
        description: `Sua assinatura foi pausada por ${days} dias.`,
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao pausar',
        description: 'Por favor, tente novamente.',
      });
    }
  };

  const handleResume = async () => {
    if (!subscription) return;
    try {
      await resumeSubscription.mutateAsync(subscription.id);
      toast({
        title: 'Assinatura retomada! 🎉',
        description: 'Seu acesso completo foi restaurado.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao retomar',
        description: 'Por favor, tente novamente.',
      });
    }
  };

  const handleCancelScheduledChange = async () => {
    if (!subscription) return;
    try {
      await cancelScheduledChange.mutateAsync(subscription.id);
      toast({
        title: 'Mudança cancelada',
        description: 'Seu plano permanecerá o mesmo.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao cancelar mudança',
        description: 'Por favor, tente novamente.',
      });
    }
  };

  // Find pending Pix payment
  const pendingPixPayment = payments?.find(p => p.status === 'pending' && p.payment_method === 'pix');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold text-foreground">Minha Assinatura</span>
            </div>
          </div>
          
          {/* Dev Reset Button - Only for specific test account */}
          {user?.id === '4745a1f4-17be-420e-b669-f191f992df64' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetSubscription}
              disabled={isResetting}
              className="text-xs gap-1"
            >
              <RotateCcw className={cn("h-3 w-3", isResetting && "animate-spin")} />
              {isResetting ? 'Resetando...' : 'Reset (Dev)'}
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {isLoading ? (
          <SubscriptionSkeleton />
        ) : !subscription ? (
          // No subscription - show payment gate with plan selector
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Payment Gate Message */}
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Ative sua assinatura para continuar
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Para acessar o método LEVEA e começar sua transformação, escolha um plano abaixo.
                </p>
              </div>
            </div>

            {/* Plans - Annual first */}
            <div className="space-y-4">
              {[...(plans || [])]
                .sort((a, b) => (a.interval === 'yearly' ? -1 : 1))
                .map((plan) => {
                  const isAnnual = plan.interval === 'yearly';
                  const monthlyEquivalent = isAnnual ? Math.round(plan.price_cents / 12) : null;
                  const isSelected = selectedPlan === plan.id;

                  return (
                    <Card 
                      key={plan.id}
                      className={cn(
                        "cursor-pointer transition-all border-2 relative overflow-hidden",
                        isSelected 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                          : isAnnual
                            ? "border-primary/50 hover:border-primary bg-gradient-to-br from-primary/5 to-transparent"
                            : "border-border hover:border-primary/30"
                      )}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {/* Most Popular Badge */}
                      {isAnnual && (
                        <div className="absolute top-0 right-0">
                          <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground px-3 py-1">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Mais popular
                          </Badge>
                        </div>
                      )}

                      <CardHeader className={cn(isAnnual && "pt-8")}>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <CardDescription>
                              {isAnnual 
                                ? "Melhor custo-benefício" 
                                : "Ideal para começar e testar o método"
                              }
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-foreground">
                              {formatPrice(plan.price_cents)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              /{isAnnual ? 'ano' : 'mês'}
                            </p>
                            {monthlyEquivalent && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ~{formatPrice(monthlyEquivalent)}/mês
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Savings highlight for annual */}
                        {isAnnual && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-green-700">
                              Economize mais de 2 meses
                            </span>
                          </div>
                        )}

                        <ul className="space-y-2">
                          {(plan.features as string[])?.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Selection indicator */}
                        <div className={cn(
                          "flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-all",
                          isSelected 
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-muted/50 text-muted-foreground"
                        )}>
                          {isSelected ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span className="font-medium">Selecionado</span>
                            </>
                          ) : (
                            <span>Selecionar plano</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {/* Payment method section */}
            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Método de pagamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <button
                      onClick={() => setSelectedPaymentMethod('pix')}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all",
                        selectedPaymentMethod === 'pix'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <QrCode className="h-6 w-6 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">Pix</p>
                        <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                      </div>
                      {selectedPaymentMethod === 'pix' && (
                        <Check className="h-5 w-5 text-primary ml-auto" />
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedPaymentMethod('credit_card')}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all",
                        selectedPaymentMethod === 'credit_card'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">Cartão de Crédito</p>
                        <p className="text-sm text-muted-foreground">Pagamento recorrente</p>
                      </div>
                      {selectedPaymentMethod === 'credit_card' && (
                        <Check className="h-5 w-5 text-primary ml-auto" />
                      )}
                    </button>
                  </CardContent>
                </Card>

                <Button 
                  onClick={handleSubscribe}
                  disabled={!selectedPaymentMethod || createSubscription.isPending}
                  className="w-full h-12 text-lg"
                >
                  {createSubscription.isPending ? 'Processando...' : 'Assinar agora'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Ao assinar, você concorda com nossos termos de uso e política de privacidade.
                </p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          // Has subscription - show details
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="invoices">Faturas</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Pending Pix Payment Alert */}
                {pendingPixPayment && (
                  <Card className="border-yellow-500/50 bg-yellow-500/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-600">
                        <Clock className="h-5 w-5" />
                        Aguardando pagamento Pix
                      </CardTitle>
                      <CardDescription>
                        Copie o código ou escaneie o QR Code para pagar
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-background rounded-lg p-4 text-center">
                        <QrCode className="h-32 w-32 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-2">QR Code (simulado)</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Código Pix:</p>
                        <code className="block p-3 bg-muted rounded-lg text-sm break-all">
                          {pendingPixPayment.pix_code}
                        </code>
                      </div>
                      <Button 
                        onClick={() => handleSimulatePixPayment(pendingPixPayment.id)}
                        disabled={simulatePixPayment.isPending}
                        className="w-full"
                        variant="secondary"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Simular pagamento (Demo)
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Paused Alert */}
                {isPaused && subscription.pause_until && (
                  <Card className="border-yellow-500/50 bg-yellow-500/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-600">
                        <Pause className="h-5 w-5" />
                        Assinatura pausada
                      </CardTitle>
                      <CardDescription>
                        Sua assinatura está pausada até{' '}
                        <strong>{format(new Date(subscription.pause_until), "dd 'de' MMMM", { locale: ptBR })}</strong>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => setShowResumeDialog(true)}
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Retomar agora
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Scheduled Downgrade Alert */}
                {hasScheduledDowngrade && (
                  <Card className="border-blue-500/50 bg-blue-500/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600">
                        <TrendingDown className="h-5 w-5" />
                        Mudança de plano agendada
                      </CardTitle>
                      <CardDescription>
                        Seu plano mudará para Mensal em{' '}
                        <strong>{format(new Date(subscription.current_period_end), "dd 'de' MMMM", { locale: ptBR })}</strong>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline"
                        onClick={handleCancelScheduledChange}
                        disabled={cancelScheduledChange.isPending}
                        className="w-full"
                      >
                        Cancelar mudança
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Current Plan */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          {subscription.plan?.name || 'Plano'}
                        </CardTitle>
                        <CardDescription>
                          {subscription.plan?.description}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="outline"
                        className={cn(
                          "capitalize",
                          getStatusInfo(subscription.status as any).textColor
                        )}
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          getStatusInfo(subscription.status as any).color
                        )} />
                        {getStatusInfo(subscription.status as any).label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Valor</p>
                        <p className="font-semibold">
                          {formatPrice(subscription.plan?.price_cents || 0)}
                          <span className="text-muted-foreground font-normal">
                            /{subscription.plan?.interval === 'yearly' ? 'ano' : 'mês'}
                          </span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Método de pagamento</p>
                        <p className="font-semibold flex items-center gap-2">
                          {subscription.payment_method === 'pix' ? (
                            <>
                              <QrCode className="h-4 w-4" /> Pix
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4" /> Cartão
                            </>
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Início</p>
                        <p className="font-semibold">
                          {format(new Date(subscription.current_period_start), "dd 'de' MMM, yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Próxima cobrança</p>
                        <p className="font-semibold">
                          {format(new Date(subscription.current_period_end), "dd 'de' MMM, yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    {subscription.cancel_at_period_end && (
                      <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-600">Cancelamento agendado</p>
                            <p className="text-sm text-muted-foreground">
                              Sua assinatura será encerrada em {format(new Date(subscription.current_period_end), "dd 'de' MMMM, yyyy", { locale: ptBR })}.
                              Você ainda tem acesso até lá.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    {/* Plan change buttons */}
                    {!subscription.cancel_at_period_end && !isPaused && (
                      <div className="w-full grid grid-cols-2 gap-3">
                        {/* Upgrade button for monthly users */}
                        {isMonthlyPlan && annualPlan && (
                          <Button 
                            onClick={() => setShowUpgradeDialog(true)}
                            className="col-span-2"
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Upgrade para Anual
                          </Button>
                        )}

                        {/* Downgrade button for annual users */}
                        {isAnnualPlan && monthlyPlan && allowDowngrades && !hasScheduledDowngrade && (
                          <Button 
                            variant="outline"
                            onClick={() => setShowDowngradeDialog(true)}
                            className="col-span-1"
                          >
                            <TrendingDown className="h-4 w-4 mr-2" />
                            Mudar para Mensal
                          </Button>
                        )}

                        {/* Pause button */}
                        {allowPauses && canPause && (
                          <Button 
                            variant="outline"
                            onClick={() => setShowPauseDialog(true)}
                            className={cn(isAnnualPlan && allowDowngrades && !hasScheduledDowngrade ? "col-span-1" : "col-span-2")}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar assinatura
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Cancel/Reactivate buttons */}
                    {subscription.cancel_at_period_end ? (
                      <Button 
                        onClick={handleReactivateSubscription}
                        disabled={reactivateSubscription.isPending}
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reativar assinatura
                      </Button>
                    ) : !isPaused && (
                      <Button 
                        variant="outline" 
                        className="w-full text-destructive hover:text-destructive"
                        onClick={() => setShowCancellationDialog(true)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar assinatura
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Pagamentos</CardTitle>
                    <CardDescription>Seus pagamentos recentes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {paymentsLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : payments?.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum pagamento registrado
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {payments?.map((payment) => (
                          <div 
                            key={payment.id}
                            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {payment.payment_method === 'pix' ? (
                                <QrCode className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                              )}
                              <div>
                                <p className="font-medium">
                                  {formatPrice(payment.amount_cents)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(payment.created_at), "dd/MM/yyyy 'às' HH:mm")}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant={payment.status === 'paid' ? 'default' : 'secondary'}
                              className={cn(
                                payment.status === 'paid' && "bg-green-500",
                                payment.status === 'pending' && "bg-yellow-500",
                                payment.status === 'failed' && "bg-red-500"
                              )}
                            >
                              {payment.status === 'paid' && 'Pago'}
                              {payment.status === 'pending' && 'Pendente'}
                              {payment.status === 'failed' && 'Falhou'}
                              {payment.status === 'refunded' && 'Estornado'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invoices" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Faturas</CardTitle>
                    <CardDescription>Suas faturas e recibos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {invoicesLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : invoices?.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma fatura registrada
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {invoices?.map((invoice) => (
                          <div 
                            key={invoice.id}
                            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Receipt className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{invoice.invoice_number}</p>
                                <p className="text-sm text-muted-foreground">
                                  Vencimento: {format(new Date(invoice.due_date), 'dd/MM/yyyy')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-semibold">{formatPrice(invoice.amount_cents)}</p>
                                <Badge 
                                  variant="outline"
                                  className={cn(
                                    invoice.status === 'paid' && "text-green-600 border-green-600",
                                    invoice.status === 'open' && "text-yellow-600 border-yellow-600"
                                  )}
                                >
                                  {invoice.status === 'paid' && 'Pago'}
                                  {invoice.status === 'open' && 'Aberto'}
                                  {invoice.status === 'void' && 'Cancelado'}
                                </Badge>
                              </div>
                              <Button variant="ghost" size="icon" disabled>
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </main>

      <BottomNav />

      {/* Dialogs */}
      {subscription && annualPlan && (
        <UpgradeDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          subscription={subscription}
          annualPlan={annualPlan}
          onConfirm={handleUpgrade}
          isPending={upgradeSubscription.isPending}
        />
      )}

      {subscription && monthlyPlan && (
        <DowngradeDialog
          open={showDowngradeDialog}
          onOpenChange={setShowDowngradeDialog}
          subscription={subscription}
          monthlyPlan={monthlyPlan}
          onConfirm={handleDowngrade}
          isPending={downgradeSubscription.isPending}
        />
      )}

      {subscription && (
        <PauseDialog
          open={showPauseDialog}
          onOpenChange={setShowPauseDialog}
          subscription={subscription}
          maxPauseDays={maxPauseDays}
          onConfirm={handlePause}
          isPending={pauseSubscription.isPending}
        />
      )}

      {subscription && (
        <ResumeDialog
          open={showResumeDialog}
          onOpenChange={setShowResumeDialog}
          subscription={subscription}
          onConfirm={handleResume}
          isPending={resumeSubscription.isPending}
        />
      )}

      {subscription && (
        <CancellationSurveyDialog
          open={showCancellationDialog}
          onOpenChange={setShowCancellationDialog}
          periodEndDate={new Date(subscription.current_period_end)}
          onConfirm={handleCancelSubscription}
          isLoading={cancelSubscription.isPending}
        />
      )}
    </div>
  );
}

export default function Subscription() {
  return (
    <RequireAuth>
      <SubscriptionContent />
    </RequireAuth>
  );
}
