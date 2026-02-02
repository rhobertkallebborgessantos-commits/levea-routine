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
import { Subscription, SubscriptionPlan } from '@/hooks/useSubscription';
import { Play, Check } from 'lucide-react';

interface ResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription & { plan: SubscriptionPlan };
  onConfirm: () => Promise<void>;
  isPending: boolean;
}

export function ResumeDialog({
  open,
  onOpenChange,
  subscription,
  onConfirm,
  isPending,
}: ResumeDialogProps) {
  const pauseUntil = subscription.pause_until ? new Date(subscription.pause_until) : null;

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-600" />
            Retomar assinatura
          </DialogTitle>
          <DialogDescription>
            Reative sua assinatura agora
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {pauseUntil && (
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground mb-1">Pausa programada até</p>
              <p className="font-semibold">
                {format(pauseUntil, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-700">Ao retomar</p>
              <ul className="text-green-600 space-y-1 mt-1">
                <li>• Acesso completo será restaurado imediatamente</li>
                <li>• Sua cobrança será retomada no próximo ciclo</li>
                <li>• Nenhum valor será cobrado agora</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Manter pausa
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? 'Processando...' : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Retomar agora
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
