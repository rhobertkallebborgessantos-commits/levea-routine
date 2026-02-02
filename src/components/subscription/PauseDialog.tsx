import { useState } from 'react';
import { format, addDays } from 'date-fns';
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
import { Slider } from '@/components/ui/slider';
import { Subscription, SubscriptionPlan } from '@/hooks/useSubscription';
import { Pause, Calendar, AlertCircle, Play } from 'lucide-react';

interface PauseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription & { plan: SubscriptionPlan };
  maxPauseDays: number;
  onConfirm: (days: number) => Promise<void>;
  isPending: boolean;
}

export function PauseDialog({
  open,
  onOpenChange,
  subscription,
  maxPauseDays,
  onConfirm,
  isPending,
}: PauseDialogProps) {
  const [pauseDays, setPauseDays] = useState(14);
  const resumeDate = addDays(new Date(), pauseDays);

  const handleConfirm = async () => {
    await onConfirm(pauseDays);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pause className="h-5 w-5 text-yellow-600" />
            Pausar assinatura
          </DialogTitle>
          <DialogDescription>
            Pause sua assinatura por até {maxPauseDays} dias
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Duration selector */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Duração da pausa</span>
              <span className="font-semibold text-lg">{pauseDays} dias</span>
            </div>
            <Slider
              value={[pauseDays]}
              onValueChange={(value) => setPauseDays(value[0])}
              min={7}
              max={maxPauseDays}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>7 dias</span>
              <span>{maxPauseDays} dias</span>
            </div>
          </div>

          {/* Resume date */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30">
            <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium">Data de retorno</p>
              <p className="text-sm text-muted-foreground">
                {format(resumeDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Info box */}
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium">Durante a pausa:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <Play className="h-3 w-3" />
                Sua cobrança será congelada
              </li>
              <li className="flex items-center gap-2">
                <Play className="h-3 w-3" />
                Você pode retornar a qualquer momento
              </li>
              <li className="flex items-center gap-2">
                <Play className="h-3 w-3" />
                Acesso será limitado (somente leitura)
              </li>
            </ul>
          </div>

          {/* Limit notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              Você pode pausar apenas 1 vez por ciclo de cobrança.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            variant="secondary"
            onClick={handleConfirm} 
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? 'Processando...' : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pausar por {pauseDays} dias
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
