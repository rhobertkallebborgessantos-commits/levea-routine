import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Leaf, Clock, Droplets, Flame, Info, AlertTriangle } from 'lucide-react';
import { Tea } from '@/hooks/useTeas';

interface TeaPreparationDrawerProps {
  tea: Tea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeaPreparationDrawer({ tea, open, onOpenChange }: TeaPreparationDrawerProps) {
  if (!tea) return null;

  const hasStructuredPreparation = 
    (tea.preparation_ingredients && tea.preparation_ingredients.length > 0) ||
    (tea.preparation_steps && tea.preparation_steps.length > 0);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DrawerTitle className="text-left">Como preparar</DrawerTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{tea.name}</p>
            </div>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 py-5 space-y-5">
          {/* Ingredients */}
          {tea.preparation_ingredients && tea.preparation_ingredients.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Ingredientes</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                {tea.preparation_ingredients.map((ingredient, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{ingredient}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Preparation Steps */}
          {tea.preparation_steps && tea.preparation_steps.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Como preparar</h3>
              </div>
              <div className="space-y-3">
                {tea.preparation_steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                      {i + 1}
                    </div>
                    <p className="text-sm text-muted-foreground pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fallback to legacy preparation field */}
          {!hasStructuredPreparation && tea.preparation && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Como preparar</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">{tea.preparation}</p>
              </div>
            </section>
          )}

          {/* Infusion Time */}
          {(tea.infusion_time || tea.best_time) && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Tempo de infusão</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {tea.infusion_time && (
                  <Badge variant="secondary" className="text-sm py-1.5 px-3">
                    ⏱️ {tea.infusion_time}
                  </Badge>
                )}
                {tea.best_time && (
                  <Badge variant="outline" className="text-sm py-1.5 px-3">
                    🕐 Melhor horário: {tea.best_time}
                  </Badge>
                )}
              </div>
            </section>
          )}

          {/* Preparation Notes */}
          {tea.preparation_notes && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Dicas</h3>
              </div>
              <div className="bg-levea-mint/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">{tea.preparation_notes}</p>
              </div>
            </section>
          )}

          {/* Safety Notes */}
          {tea.safety_notes && (
            <section>
              <div className="bg-destructive/10 rounded-lg p-4">
                <div className="flex items-center gap-2 text-destructive font-medium text-sm mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Atenção</span>
                </div>
                <p className="text-sm text-destructive/80">{tea.safety_notes}</p>
              </div>
            </section>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
