import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CancellationSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodEndDate: Date;
  onConfirm: (reason: string, reasonCategory: string, feedback: string) => Promise<void>;
  isLoading?: boolean;
}

const CANCELLATION_REASONS = [
  { value: 'price', label: 'Preço muito alto', category: 'financial' },
  { value: 'not_using', label: 'Não estou usando o app', category: 'engagement' },
  { value: 'no_results', label: 'Não vi resultados', category: 'value' },
  { value: 'found_alternative', label: 'Encontrei uma alternativa melhor', category: 'competition' },
  { value: 'features_missing', label: 'Faltam funcionalidades que preciso', category: 'product' },
  { value: 'difficult_to_use', label: 'O app é difícil de usar', category: 'ux' },
  { value: 'personal_reasons', label: 'Motivos pessoais/financeiros temporários', category: 'personal' },
  { value: 'other', label: 'Outro motivo', category: 'other' },
];

export function CancellationSurveyDialog({
  open,
  onOpenChange,
  periodEndDate,
  onConfirm,
  isLoading = false,
}: CancellationSurveyDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [step, setStep] = useState<'survey' | 'confirm'>('survey');

  const selectedReasonData = CANCELLATION_REASONS.find(r => r.value === selectedReason);

  const handleContinue = () => {
    if (!selectedReason) return;
    setStep('confirm');
  };

  const handleBack = () => {
    setStep('survey');
  };

  const handleConfirm = async () => {
    if (!selectedReasonData) return;
    await onConfirm(
      selectedReasonData.label,
      selectedReasonData.category,
      feedback.trim()
    );
    // Reset state on success
    setSelectedReason('');
    setFeedback('');
    setStep('survey');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setSelectedReason('');
      setFeedback('');
      setStep('survey');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'survey' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                Antes de ir, nos conte o motivo
              </DialogTitle>
              <DialogDescription>
                Sua opinião é muito importante para melhorarmos o LEVEA.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <RadioGroup
                value={selectedReason}
                onValueChange={setSelectedReason}
                className="space-y-2"
              >
                {CANCELLATION_REASONS.map((reason) => (
                  <div
                    key={reason.value}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors",
                      selectedReason === reason.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedReason(reason.value)}
                  >
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label
                      htmlFor={reason.value}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-muted-foreground">
                  Quer compartilhar mais detalhes? (opcional)
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Conte-nos mais sobre sua experiência..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Voltar
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!selectedReason}
                className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Continuar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Confirmar cancelamento?
              </DialogTitle>
              <DialogDescription>
                Você continuará tendo acesso ao LEVEA até o fim do período atual em{' '}
                <strong>
                  {format(periodEndDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </strong>.
                Após essa data, seu acesso será suspenso.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Motivo selecionado:</strong> {selectedReasonData?.label}
                </p>
                {feedback && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Feedback:</strong> {feedback}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Voltar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? 'Cancelando...' : 'Confirmar cancelamento'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
