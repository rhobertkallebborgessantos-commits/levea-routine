import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatPrice, SubscriptionPlan, Subscription } from '@/hooks/useSubscription';
import { TrendingDown, AlertCircle, Calendar, CreditCard } from 'lucide-react';

interface DowngradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription & { plan: SubscriptionPlan };
  monthlyPlan: SubscriptionPlan;
  onConfirm: () => Promise<void>;
  isPending: boolean;
}

export function DowngradeDialog({
  open,
  onOpenChange,
  subscription,
  monthlyPlan,
  onConfirm,
  isPending,
}: DowngradeDialogProps) {
  const currentPlan = subscription.plan;
  const isPixPayment = subscription.payment_method === 'pix';
  const effectiveDate = new Date(subscription.current_period_end);

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
            Mudar para Mensal
          </DialogTitle>
          <DialogDescription>
            Seu plano mudará na próxima renovação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Plan comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-xs text-muted-foreground mb-1">Plano atual</p>
              <p className="font-medium text-primary">{currentPlan.name}</p>
              <p className="text-sm text-muted-foreground">{formatPrice(currentPlan.price_cents)}/ano</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground mb-1">Novo plano</p>
              <p className="font-medium">{monthlyPlan.name}</p>
              <p className="text-sm text-muted-foreground">{formatPrice(monthlyPlan.price_cents)}/mês</p>
            </div>
          </div>

          {/* Effective date notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-700">Data efetiva da mudança</p>
              <p className="text-blue-600">
                {format(effectiveDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Important notes */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p>• Você mantém acesso completo até a data de renovação</p>
                <p>• Nenhum reembolso será emitido pelo período restante</p>
                <p>• Após a mudança, você será cobrado mensalmente</p>
              </div>
            </div>
          </div>

          {/* Pix warning */}
          {isPixPayment && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <CreditCard className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-700">Cartão de crédito necessário</p>
                <p className="text-yellow-600">
                  Para cobranças recorrentes mensais, adicione um cartão de crédito.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Manter plano anual
          </Button>
          <Button 
            variant="secondary"
            onClick={handleConfirm} 
            disabled={isPending || isPixPayment}
            className="w-full sm:w-auto"
          >
            {isPending ? 'Processando...' : 'Confirmar mudança'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
