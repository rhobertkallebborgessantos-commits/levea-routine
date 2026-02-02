import { useState } from 'react';
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
  formatPrice,
  getStatusInfo,
} from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'pix' | 'credit_card' | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const { data: subscription, isLoading: subLoading } = useUserSubscription();
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: payments, isLoading: paymentsLoading } = usePaymentHistory();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();

  const cancelSubscription = useCancelSubscription();
  const reactivateSubscription = useReactivateSubscription();
  const createSubscription = useCreateSubscription();

  // Auto-select annual plan when plans load (default to annual)
  const annualPlan = plans?.find(p => p.interval === 'yearly');
  if (plans && !selectedPlan && !hasAutoSelected && annualPlan) {
    setSelectedPlan(annualPlan.id);
    setHasAutoSelected(true);
  }
  const simulatePixPayment = useSimulatePixPayment();

  const isLoading = subLoading || plansLoading;

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    try {
      await cancelSubscription.mutateAsync(subscription.id);
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
      toast({
        title: selectedPaymentMethod === 'credit_card' ? 'Assinatura ativada! 🎉' : 'Aguardando pagamento',
        description: selectedPaymentMethod === 'credit_card' 
          ? 'Bem-vindo ao LEVEA!' 
          : 'Pague o Pix para ativar sua assinatura.',
      });
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
        description: 'Sua assinatura está ativa.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao confirmar',
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
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {isLoading ? (
          <SubscriptionSkeleton />
        ) : !subscription ? (
          // No subscription - show plan selector
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Escolha o plano ideal para sua jornada
              </h1>
              <p className="text-muted-foreground">
                Cancele a qualquer momento. Sem taxas escondidas.
              </p>
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
                          getStatusInfo(subscription.status).textColor
                        )}
                      >
                        <div className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          getStatusInfo(subscription.status).color
                        )} />
                        {getStatusInfo(subscription.status).label}
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
                    {subscription.cancel_at_period_end ? (
                      <Button 
                        onClick={handleReactivateSubscription}
                        disabled={reactivateSubscription.isPending}
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reativar assinatura
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                            <X className="h-4 w-4 mr-2" />
                            Cancelar assinatura
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Você continuará tendo acesso ao LEVEA até o fim do período atual em{' '}
                              <strong>{format(new Date(subscription.current_period_end), "dd 'de' MMMM, yyyy", { locale: ptBR })}</strong>.
                              Após essa data, seu acesso será suspenso.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Voltar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelSubscription}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Confirmar cancelamento
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
