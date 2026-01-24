import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateUserPreferences } from '@/hooks/useProfile';
import { useUpdateProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { RequireAuth } from '@/hooks/useAuth';
import { 
  GENDERS,
  GOALS, 
  ACTIVITY_LEVELS, 
  DIETARY_RESTRICTIONS, 
  DIETING_EXPERIENCE,
  STRUGGLES, 
  TIME_SLOTS,
  generateDiagnosis,
} from '@/lib/constants';
import { Leaf, ChevronLeft, ChevronRight, Check, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';
import { Card } from '@/components/ui/card';

type TimeBlock = Database['public']['Enums']['time_block'];

interface OnboardingData {
  gender: 'female' | 'male' | 'other' | null;
  age: string;
  height: string;
  currentWeight: string;
  targetWeight: string;
  primaryGoal: 'fat_loss' | 'belly_reduction' | 'health' | 'routine' | null;
  dietaryRestrictions: string[];
  medicalNotes: string;
  activityLevel: 'low' | 'medium' | 'high' | null;
  previousDietingExperience: string | null;
  struggles: string[];
  timeSlots: TimeBlock[];
}

const TOTAL_STEPS = 10;

function OnboardingContent() {
  const [step, setStep] = useState(1);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    gender: null,
    age: '',
    height: '',
    currentWeight: '',
    targetWeight: '',
    primaryGoal: null,
    dietaryRestrictions: [],
    medicalNotes: '',
    activityLevel: null,
    previousDietingExperience: null,
    struggles: [],
    timeSlots: [],
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const updatePreferences = useUpdateUserPreferences();
  const updateProfile = useUpdateProfile();

  const progress = (step / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const diagnosis = generateDiagnosis({
    gender: data.gender,
    age: data.age ? parseInt(data.age) : null,
    currentWeight: data.currentWeight ? parseFloat(data.currentWeight) : null,
    targetWeight: data.targetWeight ? parseFloat(data.targetWeight) : null,
    height: data.height ? parseFloat(data.height) : null,
    primaryGoal: data.primaryGoal,
    activityLevel: data.activityLevel,
    dietaryRestrictions: data.dietaryRestrictions,
    struggles: data.struggles,
  });

  const handleComplete = async () => {
    try {
      await updatePreferences.mutateAsync({
        gender: data.gender,
        age: data.age ? parseInt(data.age) : null,
        height: data.height ? parseFloat(data.height) : null,
        current_weight: data.currentWeight ? parseFloat(data.currentWeight) : null,
        target_weight: data.targetWeight ? parseFloat(data.targetWeight) : null,
        primary_goal: data.primaryGoal,
        dietary_restrictions: data.dietaryRestrictions,
        medical_notes: data.medicalNotes || null,
        activity_level: data.activityLevel,
        previous_dieting_experience: data.previousDietingExperience,
        struggles: data.struggles,
        available_time_slots: data.timeSlots,
        diagnosis_summary: diagnosis.summary,
        weekly_focus: diagnosis.weeklyFocus,
        daily_calorie_target: diagnosis.dailyCalories,
        protein_target: diagnosis.proteinTarget,
        meals_per_day: 4, // Default
      });

      await updateProfile.mutateAsync({
        onboarding_completed: true,
      });

      toast({
        title: 'Bem-vindo à LEVEA! 🌿',
        description: 'Seu método personalizado está pronto.',
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Algo deu errado',
        description: 'Por favor, tente novamente.',
      });
    }
  };

  const toggleRestriction = (value: string) => {
    setData(prev => ({
      ...prev,
      dietaryRestrictions: value === 'none' 
        ? ['none']
        : prev.dietaryRestrictions.includes(value)
          ? prev.dietaryRestrictions.filter(s => s !== value)
          : [...prev.dietaryRestrictions.filter(s => s !== 'none'), value],
    }));
  };

  const toggleStruggle = (value: string) => {
    setData(prev => ({
      ...prev,
      struggles: prev.struggles.includes(value)
        ? prev.struggles.filter(s => s !== value)
        : [...prev.struggles, value],
    }));
  };

  const toggleTimeSlot = (value: TimeBlock) => {
    setData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(value)
        ? prev.timeSlots.filter(s => s !== value)
        : [...prev.timeSlots, value],
    }));
  };

  const canContinue = () => {
    switch (step) {
      case 1: return data.gender !== null;
      case 2: return data.age !== '';
      case 3: return data.currentWeight !== '' && data.targetWeight !== '';
      case 4: return data.primaryGoal !== null;
      case 5: return data.dietaryRestrictions.length > 0;
      case 6: return true; // Medical notes optional
      case 7: return data.activityLevel !== null;
      case 8: return data.previousDietingExperience !== null;
      case 9: return true; // Struggles optional
      case 10: return data.timeSlots.length > 0;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Vamos começar! Qual seu gênero?
              </h1>
              <p className="text-muted-foreground">
                Isso nos ajuda a calcular suas necessidades
              </p>
            </div>
            <div className="space-y-3">
              {GENDERS.map((gender) => (
                <button
                  key={gender.value}
                  onClick={() => setData({ ...data, gender: gender.value })}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all",
                    data.gender === gender.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{gender.icon}</span>
                    <p className="font-medium text-foreground">{gender.label}</p>
                    {data.gender === gender.value && (
                      <Check className="ml-auto h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Qual sua idade?
              </h1>
              <p className="text-muted-foreground">
                Usamos para calcular seu metabolismo
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">Idade (anos)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="ex: 35"
                  value={data.age}
                  onChange={(e) => setData({ ...data, age: e.target.value })}
                  className="text-lg text-center"
                  min={18}
                  max={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="ex: 165"
                  value={data.height}
                  onChange={(e) => setData({ ...data, height: e.target.value })}
                  className="text-lg text-center"
                />
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Seu peso atual e meta
              </h1>
              <p className="text-muted-foreground">
                Vamos definir um objetivo realista juntos
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentWeight">Peso atual (kg)</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  placeholder="ex: 75"
                  value={data.currentWeight}
                  onChange={(e) => setData({ ...data, currentWeight: e.target.value })}
                  className="text-lg text-center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetWeight">Peso desejado (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  placeholder="ex: 65"
                  value={data.targetWeight}
                  onChange={(e) => setData({ ...data, targetWeight: e.target.value })}
                  className="text-lg text-center"
                />
              </div>
              {data.currentWeight && data.targetWeight && (
                <p className="text-center text-sm text-muted-foreground">
                  Meta: perder {(parseFloat(data.currentWeight) - parseFloat(data.targetWeight)).toFixed(1)}kg de forma saudável
                </p>
              )}
            </div>
          </>
        );

      case 4:
        return (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Qual seu foco principal?
              </h1>
              <p className="text-muted-foreground">
                Isso define como vamos estruturar seu método
              </p>
            </div>
            <div className="space-y-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => setData({ ...data, primaryGoal: goal.value })}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all",
                    data.primaryGoal === goal.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <p className="font-medium text-foreground">{goal.label}</p>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    {data.primaryGoal === goal.value && (
                      <Check className="ml-auto h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        );

      case 5:
        return (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Restrições alimentares?
              </h1>
              <p className="text-muted-foreground">
                Selecione todas que se aplicam
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DIETARY_RESTRICTIONS.map((restriction) => (
                <button
                  key={restriction.value}
                  onClick={() => toggleRestriction(restriction.value)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    data.dietaryRestrictions.includes(restriction.value)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  <span className="text-2xl block mb-2">{restriction.icon}</span>
                  <p className="font-medium text-foreground text-sm">{restriction.label}</p>
                </button>
              ))}
            </div>
          </>
        );

      case 6:
        return (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Alguma condição médica?
              </h1>
              <p className="text-muted-foreground">
                Opcional — nos ajuda a personalizar melhor
              </p>
            </div>
            <div className="space-y-4">
              <Card className="p-4 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    LEVEA não substitui acompanhamento médico. Sempre consulte um profissional de saúde antes de mudanças significativas na alimentação.
                  </p>
                </div>
              </Card>
              <div className="space-y-2">
                <Label htmlFor="medical">Condições ou medicamentos (opcional)</Label>
                <Textarea
                  id="medical"
                  placeholder="Ex: diabetes tipo 2, hipotireoidismo, uso de medicamentos..."
                  value={data.medicalNotes}
                  onChange={(e) => setData({ ...data, medicalNotes: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Você pode pular se não se aplica
              </p>
            </div>
          </>
        );

      case 7:
        return (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Seu nível de atividade
              </h1>
              <p className="text-muted-foreground">
                Como é seu dia a dia?
              </p>
            </div>
            <div className="space-y-3">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setData({ ...data, activityLevel: level.value })}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all",
                    data.activityLevel === level.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <p className="font-medium text-foreground">{level.label}</p>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                    {data.activityLevel === level.value && (
                      <Check className="ml-auto h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        );

      case 8:
        return (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Experiência com dietas
              </h1>
              <p className="text-muted-foreground">
                Isso nos ajuda a entender seu histórico
              </p>
            </div>
            <div className="space-y-3">
              {DIETING_EXPERIENCE.map((exp) => (
                <button
                  key={exp.value}
                  onClick={() => setData({ ...data, previousDietingExperience: exp.value })}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all",
                    data.previousDietingExperience === exp.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{exp.icon}</span>
                    <div>
                      <p className="font-medium text-foreground">{exp.label}</p>
                      <p className="text-sm text-muted-foreground">{exp.description}</p>
                    </div>
                    {data.previousDietingExperience === exp.value && (
                      <Check className="ml-auto h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        );

      case 9:
        return (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display font-bold text-foreground">
                Maiores dificuldades
              </h1>
              <p className="text-muted-foreground">
                Selecione todas que você enfrenta
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {STRUGGLES.map((struggle) => (
                <button
                  key={struggle.value}
                  onClick={() => toggleStruggle(struggle.value)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all",
                    data.struggles.includes(struggle.value)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  )}
                >
                  <span className="text-xl block mb-1">{struggle.icon}</span>
                  <p className="font-medium text-foreground text-xs">{struggle.label}</p>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Você pode pular se nenhum se aplica
            </p>
          </>
        );

      case 10:
        if (!showDiagnosis) {
          return (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Horários disponíveis
                </h1>
                <p className="text-muted-foreground">
                  Quando você pode receber lembretes?
                </p>
              </div>
              <div className="space-y-3">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.value}
                    onClick={() => toggleTimeSlot(slot.value as TimeBlock)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      data.timeSlots.includes(slot.value as TimeBlock)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 bg-card"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{slot.icon}</span>
                      <div>
                        <p className="font-medium text-foreground">{slot.label}</p>
                        <p className="text-sm text-muted-foreground">{slot.time}</p>
                      </div>
                      {data.timeSlots.includes(slot.value as TimeBlock) && (
                        <Check className="ml-auto h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          );
        } else {
          return (
            <>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Seu Diagnóstico Inicial
                </h1>
                <p className="text-muted-foreground">
                  Preparamos um resumo personalizado
                </p>
              </div>
              
              <Card className="p-5 space-y-4 bg-gradient-to-br from-levea-mint to-levea-cream border-0">
                <p className="text-foreground leading-relaxed">{diagnosis.summary}</p>
                
                <div className="pt-4 border-t border-border/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Meta calórica diária</span>
                    <span className="font-semibold text-foreground">~{diagnosis.dailyCalories} kcal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Meta de proteína</span>
                    <span className="font-semibold text-foreground">~{diagnosis.proteinTarget}g/dia</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>🎯 Foco dos primeiros 7 dias:</strong><br />
                  {diagnosis.weeklyFocus}
                </p>
              </Card>
            </>
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-foreground">LEVEA</span>
        </div>
        <span className="text-sm text-muted-foreground">Passo {step} de {TOTAL_STEPS}</span>
      </header>

      {/* Progress */}
      <div className="px-4">
        <Progress value={progress} className="h-1" />
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${showDiagnosis}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-4 flex justify-between items-center max-w-md mx-auto w-full">
        <Button
          variant="ghost"
          onClick={() => {
            if (showDiagnosis) {
              setShowDiagnosis(false);
            } else {
              handleBack();
            }
          }}
          disabled={step === 1 && !showDiagnosis}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        {step < TOTAL_STEPS ? (
          <Button
            onClick={handleNext}
            disabled={!canContinue()}
            className="gap-2"
          >
            Continuar
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : !showDiagnosis ? (
          <Button
            onClick={() => setShowDiagnosis(true)}
            disabled={!canContinue()}
            className="gap-2"
          >
            Ver Diagnóstico
            <Sparkles className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={updatePreferences.isPending}
            className="gap-2"
          >
            {updatePreferences.isPending ? 'Configurando...' : 'Começar Método'}
            <Check className="h-4 w-4" />
          </Button>
        )}
      </footer>
    </div>
  );
}

export default function Onboarding() {
  return (
    <RequireAuth>
      <OnboardingContent />
    </RequireAuth>
  );
}
