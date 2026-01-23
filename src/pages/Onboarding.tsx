import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateUserPreferences } from '@/hooks/useProfile';
import { useUpdateProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { RequireAuth } from '@/hooks/useAuth';
import { 
  GOALS, 
  ACTIVITY_LEVELS, 
  FOOD_PREFERENCES, 
  STRUGGLES, 
  TIME_SLOTS,
} from '@/lib/constants';
import { Leaf, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type TimeBlock = Database['public']['Enums']['time_block'];

interface OnboardingData {
  goal: 'lose_weight' | 'maintain_weight' | 'build_habits' | null;
  currentWeight: string;
  height: string;
  activityLevel: 'low' | 'medium' | 'high' | null;
  foodPreference: 'balanced' | 'low_carb' | null;
  struggles: string[];
  timeSlots: TimeBlock[];
}

const TOTAL_STEPS = 6;

function OnboardingContent() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    goal: null,
    currentWeight: '',
    height: '',
    activityLevel: null,
    foodPreference: null,
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

  const handleComplete = async () => {
    try {
      await updatePreferences.mutateAsync({
        goal: data.goal,
        current_weight: data.currentWeight ? parseFloat(data.currentWeight) : null,
        height: data.height ? parseFloat(data.height) : null,
        activity_level: data.activityLevel,
        food_preference: data.foodPreference,
        struggles: data.struggles,
        available_time_slots: data.timeSlots,
      });

      await updateProfile.mutateAsync({
        onboarding_completed: true,
      });

      toast({
        title: 'Welcome to LEVEA! 🌿',
        description: 'Your personalized routine is ready.',
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please try again.',
      });
    }
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
      case 1: return data.goal !== null;
      case 2: return true; // Optional
      case 3: return data.activityLevel !== null;
      case 4: return data.foodPreference !== null;
      case 5: return true; // Optional
      case 6: return data.timeSlots.length > 0;
      default: return true;
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
        <span className="text-sm text-muted-foreground">Step {step} of {TOTAL_STEPS}</span>
      </header>

      {/* Progress */}
      <div className="px-4">
        <Progress value={progress} className="h-1" />
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Step 1: Goal */}
            {step === 1 && (
              <>
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    What's your main goal?
                  </h1>
                  <p className="text-muted-foreground">
                    We'll personalize your experience based on this
                  </p>
                </div>
                <div className="space-y-3">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setData({ ...data, goal: goal.value })}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                        data.goal === goal.value
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
                        {data.goal === goal.value && (
                          <Check className="ml-auto h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Weight & Height */}
            {step === 2 && (
              <>
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    Your measurements
                  </h1>
                  <p className="text-muted-foreground">
                    Optional — helps us personalize tips
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Current weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="e.g., 70"
                      value={data.currentWeight}
                      onChange={(e) => setData({ ...data, currentWeight: e.target.value })}
                      className="text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="e.g., 170"
                      value={data.height}
                      onChange={(e) => setData({ ...data, height: e.target.value })}
                      className="text-lg"
                    />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  You can skip this and add it later
                </p>
              </>
            )}

            {/* Step 3: Activity Level */}
            {step === 3 && (
              <>
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    How active are you?
                  </h1>
                  <p className="text-muted-foreground">
                    This helps us tailor your routine
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
            )}

            {/* Step 4: Food Preference */}
            {step === 4 && (
              <>
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    Food preference
                  </h1>
                  <p className="text-muted-foreground">
                    We'll suggest meals that match your style
                  </p>
                </div>
                <div className="space-y-3">
                  {FOOD_PREFERENCES.map((pref) => (
                    <button
                      key={pref.value}
                      onClick={() => setData({ ...data, foodPreference: pref.value })}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                        data.foodPreference === pref.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{pref.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">{pref.label}</p>
                          <p className="text-sm text-muted-foreground">{pref.description}</p>
                        </div>
                        {data.foodPreference === pref.value && (
                          <Check className="ml-auto h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 5: Struggles */}
            {step === 5 && (
              <>
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    What do you struggle with?
                  </h1>
                  <p className="text-muted-foreground">
                    Select all that apply — we'll help you overcome them
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {STRUGGLES.map((struggle) => (
                    <button
                      key={struggle.value}
                      onClick={() => toggleStruggle(struggle.value)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        data.struggles.includes(struggle.value)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                    >
                      <span className="text-2xl block mb-2">{struggle.icon}</span>
                      <p className="font-medium text-foreground text-sm">{struggle.label}</p>
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  You can skip this if none apply
                </p>
              </>
            )}

            {/* Step 6: Time Slots */}
            {step === 6 && (
              <>
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-display font-bold text-foreground">
                    When are you available?
                  </h1>
                  <p className="text-muted-foreground">
                    We'll schedule reminders around these times
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
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-4 flex justify-between items-center max-w-md mx-auto w-full">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={step === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        
        {step < TOTAL_STEPS ? (
          <Button
            onClick={handleNext}
            disabled={!canContinue()}
            className="gap-2"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={!canContinue() || updatePreferences.isPending}
            className="gap-2"
          >
            {updatePreferences.isPending ? 'Setting up...' : 'Complete Setup'}
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