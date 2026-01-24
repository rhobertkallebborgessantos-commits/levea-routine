import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Flame,
  Target,
  Sparkles,
  Utensils,
  Leaf,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useWeeklyStats,
  useLatestWeight,
  useLatestCheckin,
  useSubmitCheckin,
} from '@/hooks/useWeeklyCheckin';
import { RequireAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type Step = 'intro' | 'weight' | 'review' | 'results';

function WeeklyCheckinContent() {
  const navigate = useNavigate();
  const { data: weeklyStats, isLoading: loadingStats } = useWeeklyStats();
  const { data: latestWeight } = useLatestWeight();
  const { data: existingCheckin, isLoading: loadingCheckin } = useLatestCheckin();
  const submitCheckin = useSubmitCheckin();

  const [step, setStep] = useState<Step>('intro');
  const [currentWeight, setCurrentWeight] = useState('');
  const [results, setResults] = useState<{
    adherenceScore: number;
    summary: string;
    focus: string;
    adjustments: string[];
    weightChange: number | null;
  } | null>(null);

  const isLoading = loadingStats || loadingCheckin;

  // If already checked in this week, show results
  if (existingCheckin && step === 'intro') {
    return (
      <div className="min-h-screen bg-background">
        <Header onBack={() => navigate('/dashboard')} />
        <main className="max-w-lg mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Check-in já realizado!
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Você já fez seu check-in semanal. Volte na próxima semana!
                </p>
                <div className="p-4 rounded-lg bg-background/80 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Aderência</span>
                    <span className="font-semibold text-foreground">
                      {existingCheckin.adherence_score}%
                    </span>
                  </div>
                  {existingCheckin.analysis_summary && (
                    <p className="text-sm text-foreground">
                      {existingCheckin.analysis_summary}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Voltar ao Dashboard
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!currentWeight || !weeklyStats) return;

    const result = await submitCheckin.mutateAsync({
      currentWeight: parseFloat(currentWeight),
      weeklyStats,
      previousWeight: latestWeight,
    });

    setResults(result);
    setStep('results');
  };

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                Check-in Semanal
              </h1>
              <p className="text-muted-foreground">
                Vamos revisar sua semana e ajustar o plano para a próxima!
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={<Utensils className="h-5 w-5" />}
                  label="Refeições"
                  value={`${weeklyStats?.mealsCompleted || 0}`}
                  sublabel="registradas"
                  color="text-primary"
                />
                <StatCard
                  icon={<Leaf className="h-5 w-5" />}
                  label="Chás"
                  value={`${weeklyStats?.teasConsumed || 0}`}
                  sublabel="consumidos"
                  color="text-green-500"
                />
                <StatCard
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="Tarefas"
                  value={`${weeklyStats?.routinesCompleted || 0}/${weeklyStats?.totalRoutines || 0}`}
                  sublabel="concluídas"
                  color="text-blue-500"
                />
                <StatCard
                  icon={<Flame className="h-5 w-5" />}
                  label="Dias Ativos"
                  value={`${weeklyStats?.daysActive || 0}/7`}
                  sublabel="na semana"
                  color="text-amber-500"
                />
              </div>
            )}

            <Button className="w-full" size="lg" onClick={() => setStep('weight')}>
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        );

      case 'weight':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Qual seu peso hoje?
              </h2>
              <p className="text-muted-foreground text-sm">
                {latestWeight
                  ? `Último registro: ${latestWeight} kg`
                  : 'Este será seu primeiro registro'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-center block">
                  Peso atual (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder={latestWeight?.toString() || '70.0'}
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="text-center text-2xl h-14"
                />
              </div>

              {currentWeight && latestWeight && (
                <WeightChangePreview
                  current={parseFloat(currentWeight)}
                  previous={latestWeight}
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('intro')} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={() => setStep('review')}
                disabled={!currentWeight}
                className="flex-1"
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 'review':
        const previewAdherence = weeklyStats
          ? Math.round(
              ((weeklyStats.mealsCompleted / Math.max(weeklyStats.totalMeals, 1)) * 40) +
                ((weeklyStats.routinesCompleted / Math.max(weeklyStats.totalRoutines, 1)) * 40) +
                ((weeklyStats.daysActive / 7) * 20)
            )
          : 0;

        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center py-4">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Confirmar Check-in
              </h2>
              <p className="text-muted-foreground text-sm">
                Revise os dados antes de finalizar
              </p>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Peso registrado</span>
                  <span className="font-semibold text-foreground">{currentWeight} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Refeições registradas</span>
                  <span className="font-semibold text-foreground">
                    {weeklyStats?.mealsCompleted || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chás consumidos</span>
                  <span className="font-semibold text-foreground">
                    {weeklyStats?.teasConsumed || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dias ativos</span>
                  <span className="font-semibold text-foreground">
                    {weeklyStats?.daysActive || 0}/7
                  </span>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Aderência estimada</span>
                    <span className="font-semibold text-primary">{previewAdherence}%</span>
                  </div>
                  <Progress value={previewAdherence} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('weight')} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitCheckin.isPending}
                className="flex-1"
              >
                {submitCheckin.isPending ? 'Salvando...' : 'Finalizar'}
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 'results':
        if (!results) return null;

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-3xl font-bold text-primary">
                  {results.adherenceScore}%
                </span>
              </motion.div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Sua Aderência Semanal
              </h2>
              {results.weightChange !== null && (
                <div className="flex items-center justify-center gap-1 text-sm">
                  {results.weightChange < 0 ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">
                        {Math.abs(results.weightChange).toFixed(1)} kg perdidos
                      </span>
                    </>
                  ) : results.weightChange > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-500">
                        +{results.weightChange.toFixed(1)} kg
                      </span>
                    </>
                  ) : (
                    <>
                      <Minus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Peso estável</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-foreground">{results.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Foco da Próxima Semana
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">{results.focus}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Ajustes Recomendados
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {results.adjustments.map((adj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{adj}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onBack={() => navigate('/dashboard')} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </main>
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Check-in Semanal</h1>
        </div>
      </div>
    </motion.header>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  color: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className={cn('mb-2', color)}>{icon}</div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </CardContent>
    </Card>
  );
}

function WeightChangePreview({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;

  return (
    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50">
      {diff < 0 ? (
        <>
          <TrendingDown className="h-5 w-5 text-green-500" />
          <span className="text-green-500 font-medium">
            {Math.abs(diff).toFixed(1)} kg a menos
          </span>
        </>
      ) : diff > 0 ? (
        <>
          <TrendingUp className="h-5 w-5 text-amber-500" />
          <span className="text-amber-500 font-medium">+{diff.toFixed(1)} kg a mais</span>
        </>
      ) : (
        <>
          <Minus className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Peso mantido</span>
        </>
      )}
    </div>
  );
}

export default function WeeklyCheckin() {
  return (
    <RequireAuth>
      <WeeklyCheckinContent />
    </RequireAuth>
  );
}
