import { useState } from 'react';
import { format, differenceInDays, addYears } from 'date-fns';
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
import { Badge } from '@/components/ui/badge';
import { formatPrice, SubscriptionPlan, Subscription } from '@/hooks/useSubscription';
import { TrendingUp, Check, CreditCard, AlertCircle } from 'lucide-react';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription & { plan: SubscriptionPlan };
  annualPlan: SubscriptionPlan;
  onConfirm: () => Promise<void>;
  isPending: boolean;
}

export function UpgradeDialog({
  open,
  onOpenChange,
  subscription,
  annualPlan,
  onConfirm,
  isPending,
}: UpgradeDialogProps) {
  const currentPlan = subscription.plan;
  const isPixPayment = subscription.payment_method === 'pix';

  // Calculate proration
  const now = new Date();
  const periodEnd = new Date(subscription.current_period_end);
  const periodStart = new Date(subscription.current_period_start);
  const totalDays = differenceInDays(periodEnd, periodStart);
  const remainingDays = Math.max(0, differenceInDays(periodEnd, now));
  
  // Credit for unused monthly time
  const dailyRate = currentPlan.price_cents / totalDays;
  const creditCents = Math.round(dailyRate * remainingDays);
  
  // Amount to charge for upgrade
  const upgradeAmount = Math.max(0, annualPlan.price_cents - creditCents);
  
  // New renewal date
  const newRenewalDate = addYears(now, 1);

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Fazer upgrade para Anual
          </DialogTitle>
          <DialogDescription>
            Economize mais de 2 meses com o plano anual
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Plan comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground mb-1">Plano atual</p>
              <p className="font-medium">{currentPlan.name}</p>
              <p className="text-sm text-muted-foreground">{formatPrice(currentPlan.price_cents)}/mês</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-xs text-muted-foreground mb-1">Novo plano</p>
              <p className="font-medium text-primary">{annualPlan.name}</p>
              <p className="text-sm text-muted-foreground">{formatPrice(annualPlan.price_cents)}/ano</p>
            </div>
          </div>

          {/* Proration details */}
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Crédito restante ({remainingDays} dias)</span>
              <span className="text-green-600">-{formatPrice(creditCents)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plano Anual</span>
              <span>{formatPrice(annualPlan.price_cents)}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
              <span>Total a pagar agora</span>
              <span className="text-primary">{formatPrice(upgradeAmount)}</span>
            </div>
          </div>

          {/* New renewal date */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-700">Nova data de renovação</p>
              <p className="text-green-600">
                {format(newRenewalDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Pix warning */}
          {isPixPayment && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-700">Pagamento via cartão necessário</p>
                <p className="text-yellow-600">
                  Para fazer upgrade, você precisa adicionar um cartão de crédito para pagamentos recorrentes.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isPending || isPixPayment}
            className="w-full sm:w-auto"
          >
            {isPending ? 'Processando...' : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Confirmar upgrade
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
