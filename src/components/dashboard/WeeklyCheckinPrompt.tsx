import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useLatestCheckin } from '@/hooks/useWeeklyCheckin';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function WeeklyCheckinPrompt() {
  const navigate = useNavigate();
  const { data: existingCheckin, isLoading } = useLatestCheckin();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekLabel = `${format(weekStart, 'dd', { locale: ptBR })} - ${format(weekEnd, 'dd MMM', { locale: ptBR })}`;

  if (isLoading) return null;

  if (existingCheckin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Check-in concluído!</p>
              <p className="text-xs text-muted-foreground">
                Aderência: {existingCheckin.adherence_score}% • Semana {weekLabel}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card
        className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 cursor-pointer hover:border-primary/40 transition-colors"
        onClick={() => navigate('/checkin')}
      >
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Fazer check-in semanal</p>
            <p className="text-xs text-muted-foreground">
              Revise sua semana e receba recomendações
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
