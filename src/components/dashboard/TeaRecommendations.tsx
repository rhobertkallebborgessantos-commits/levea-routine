import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Leaf, Check, Clock, Info, ChevronRight } from 'lucide-react';
import { useRecommendedTeas, useTodayTeaLogs, useLogTea, Tea } from '@/hooks/useTeas';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const purposeLabels: Record<string, string> = {
  'metabolism': 'Metabolismo',
  'digestion': 'Digestão',
  'anxiety': 'Ansiedade',
  'bloating': 'Inchaço',
  'sleep': 'Sono',
  // Legacy
  'metabolismo': 'Metabolismo',
  'digestao': 'Digestão',
  'ansiedade': 'Ansiedade',
  'retencao': 'Retenção',
  'compulsao': 'Compulsão',
  'saciedade': 'Saciedade',
  'sono': 'Sono',
};

const purposeColors: Record<string, string> = {
  'metabolism': 'bg-destructive/10 text-destructive',
  'digestion': 'bg-success/10 text-success',
  'anxiety': 'bg-levea-lavender text-purple-700',
  'bloating': 'bg-levea-sky text-blue-700',
  'sleep': 'bg-levea-lavender text-purple-700',
  // Legacy
  'metabolismo': 'bg-destructive/10 text-destructive',
  'digestao': 'bg-success/10 text-success',
  'ansiedade': 'bg-levea-lavender text-purple-700',
  'retencao': 'bg-levea-sky text-blue-700',
  'compulsao': 'bg-levea-rose text-rose-700',
  'saciedade': 'bg-levea-warm text-amber-700',
  'sono': 'bg-levea-lavender text-purple-700',
};

function TeaCard({ tea, isLogged, onLog }: { tea: Tea; isLogged: boolean; onLog: () => void }) {
  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all",
      isLogged 
        ? "bg-success/5 border-success/30" 
        : "bg-card border-border/50 hover:border-primary/30"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground truncate">{tea.name}</h4>
            {isLogged && <Check className="h-4 w-4 text-success shrink-0" />}
          </div>
          
          {/* Main benefit highlight */}
          {tea.main_benefit && (
            <p className="text-xs text-primary font-medium mt-0.5">{tea.main_benefit}</p>
          )}
          
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {tea.purpose.slice(0, 2).map((p) => (
              <Badge 
                key={p} 
                variant="secondary" 
                className={cn("text-xs px-1.5 py-0", purposeColors[p])}
              >
                {purposeLabels[p] || p}
              </Badge>
            ))}
          </div>
          
          {tea.best_time && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {tea.best_time}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {tea.preparation && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="font-medium mb-1">Preparo</p>
                  <p className="text-xs">{tea.preparation}</p>
                  {tea.safety_notes && (
                    <>
                      <p className="font-medium mt-2 mb-1 text-destructive">⚠️ Atenção</p>
                      <p className="text-xs">{tea.safety_notes}</p>
                    </>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {!isLogged && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLog}
              className="h-8 text-xs"
            >
              Tomei
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeaRecommendations() {
  const { data: teas, isLoading: teasLoading } = useRecommendedTeas();
  const { data: teaLogs } = useTodayTeaLogs();
  const logTea = useLogTea();

  const loggedTeaNames = teaLogs?.map(l => l.tea_name.toLowerCase()) || [];

  const handleLogTea = async (tea: Tea) => {
    try {
      await logTea.mutateAsync({ teaId: tea.id, teaName: tea.name });
      toast.success(`${tea.name} registrado! 🍵`);
    } catch (error) {
      toast.error('Erro ao registrar chá');
    }
  };

  if (teasLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!teas || teas.length === 0) return null;

  const teasLogged = teaLogs?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-foreground">
              <Leaf className="h-4 w-4 text-primary" />
              Chás Recomendados
            </CardTitle>
            <div className="flex items-center gap-2">
              {teasLogged > 0 && (
                <Badge variant="secondary" className="bg-success/10 text-success">
                  {teasLogged} tomado{teasLogged > 1 ? 's' : ''} hoje
                </Badge>
              )}
              <Button variant="ghost" size="sm" asChild className="h-7 px-2">
                <Link to="/tea">
                  Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {teas.slice(0, 3).map((tea) => (
            <TeaCard
              key={tea.id}
              tea={tea}
              isLogged={loggedTeaNames.includes(tea.name.toLowerCase())}
              onLog={() => handleLogTea(tea)}
            />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
