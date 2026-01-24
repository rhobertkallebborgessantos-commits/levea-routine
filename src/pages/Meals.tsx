import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Utensils, Plus, Trash2, Flame, Beef, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FoodSearch } from '@/components/meals/FoodSearch';
import { MealTray, TrayItem } from '@/components/meals/MealTray';
import { useMealLogs, useAddMeal, useDeleteMeal, Food, calculateNutrition } from '@/hooks/useMeals';
import { useMealSummary } from '@/hooks/useTodayMeals';
import { MEAL_TYPES } from '@/lib/constants';
import { MealSuggestion } from '@/lib/meal-suggestions';
import { cn } from '@/lib/utils';
import { BottomNav } from '@/components/BottomNav';
import { MealSuggestions } from '@/components/meals/MealSuggestions';
import { toast } from 'sonner';

export default function Meals() {
  const navigate = useNavigate();
  const { data: meals = [], isLoading } = useMealLogs();
  const { data: summary } = useMealSummary();
  const addMeal = useAddMeal();
  const deleteMeal = useDeleteMeal();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [mealTray, setMealTray] = useState<TrayItem[]>([]);
  const [mealType, setMealType] = useState<string>(MEAL_TYPES[0].value);
  const [notes, setNotes] = useState('');
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuggestionSelect = (suggestion: MealSuggestion, mealTypeValue: string) => {
    setMealType(mealTypeValue);
    // Add all items from the suggestion
    suggestion.items.forEach((item, index) => {
      setTimeout(() => {
        addMeal.mutate({
          mealType: mealTypeValue,
          foodName: item.foodName,
          portionGrams: item.portionGrams,
          calories: Math.round(suggestion.totalCalories / suggestion.items.length),
          protein: Math.round((suggestion.totalProtein / suggestion.items.length) * 10) / 10,
          notes: index === 0 ? `Combo: ${suggestion.name}` : undefined,
        });
      }, index * 100);
    });
  };

  // Add food to tray
  const handleAddToTray = (food: Food) => {
    setMealTray((prev) => [...prev, { food, portion: 100 }]);
  };

  // Update portion in tray
  const handleUpdatePortion = (index: number, portion: number) => {
    setMealTray((prev) =>
      prev.map((item, i) => (i === index ? { ...item, portion } : item))
    );
  };

  // Remove from tray
  const handleRemoveFromTray = (index: number) => {
    setMealTray((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit all items in tray
  const handleAddMeals = async () => {
    if (mealTray.length === 0) return;

    setIsSubmitting(true);

    try {
      // Add each item sequentially with small delays
      for (let i = 0; i < mealTray.length; i++) {
        const item = mealTray[i];
        const nutrition = calculateNutrition(item.food, item.portion);

        await new Promise<void>((resolve, reject) => {
          addMeal.mutate(
            {
              mealType,
              foodId: item.food.id,
              foodName: item.food.name,
              portionGrams: item.portion,
              calories: nutrition.calories,
              protein: nutrition.protein,
              notes: i === 0 && notes ? notes : undefined,
            },
            {
              onSuccess: () => resolve(),
              onError: (err) => reject(err),
            }
          );
        });

        // Small delay between items
        if (i < mealTray.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      toast.success(
        `${mealTray.length} ${mealTray.length === 1 ? 'alimento registrado' : 'alimentos registrados'}!`
      );
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao registrar refeição');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setMealTray([]);
    setMealType(MEAL_TYPES[0].value);
    setNotes('');
  };

  const handleDelete = () => {
    if (deletingMealId) {
      deleteMeal.mutate(deletingMealId);
      setDeletingMealId(null);
    }
  };

  const handleOpenDialog = (presetMealType?: string) => {
    resetForm();
    if (presetMealType) {
      setMealType(presetMealType);
    }
    setIsAddDialogOpen(true);
  };

  // Group meals by meal type
  const mealsByType = MEAL_TYPES.map((type) => ({
    ...type,
    meals: meals.filter((m) => m.meal_type === type.value),
  }));

  const caloriePercent = summary
    ? Math.min(100, (summary.totalCalories / summary.targetCalories) * 100)
    : 0;
  const proteinPercent = summary
    ? Math.min(100, (summary.totalProtein / summary.targetProtein) * 100)
    : 0;

  // Get added food IDs for the tray (to show "added" state in search)
  const addedFoodIds = mealTray.map((item) => item.food.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <Utensils className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Alimentação</h1>
          </div>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </motion.header>

      {/* Nutrition Summary */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-4"
        >
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4 space-y-3">
              {/* Calories */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-destructive" />
                    <span className="font-medium">Calorias</span>
                  </div>
                  <span className="text-muted-foreground">
                    {summary.totalCalories} / {summary.targetCalories} kcal
                  </span>
                </div>
                <Progress value={caloriePercent} className="h-2" />
              </div>

              {/* Protein */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Beef className="h-4 w-4 text-primary" />
                    <span className="font-medium">Proteína</span>
                  </div>
                  <span className="text-muted-foreground">
                    {summary.totalProtein}g / {summary.targetProtein}g
                  </span>
                </div>
                <Progress value={proteinPercent} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Meals List */}
      <main className="px-4 pb-24 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          mealsByType.map((mealBlock, index) => (
            <motion.div
              key={mealBlock.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-border/50 overflow-hidden">
                <CardHeader className="pb-2 bg-muted/30">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="text-lg">{mealBlock.icon}</span>
                    {mealBlock.label}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {mealBlock.time}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {mealBlock.meals.length > 0 ? (
                    <div className="divide-y divide-border">
                      {mealBlock.meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="p-3 flex items-center gap-3 group"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {meal.food_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {meal.portion_grams}g • {meal.calories} kcal • {meal.protein}g prot
                            </p>
                          </div>
                          <button
                            onClick={() => setDeletingMealId(meal.id)}
                            className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {/* Meal Suggestions for empty blocks */}
                      <div className="p-3">
                        <MealSuggestions
                          mealType={mealBlock.value}
                          mealLabel={mealBlock.label}
                          onSelectSuggestion={(suggestion) => handleSuggestionSelect(suggestion, mealBlock.value)}
                        />
                      </div>
                      <button
                        onClick={() => handleOpenDialog(mealBlock.value)}
                        className="w-full p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-t border-border"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar manualmente
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </main>

      {/* Add Meal Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Montar Refeição</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Meal Type */}
            <div className="space-y-2">
              <Label>Tipo de Refeição</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Food Search (Multi mode) */}
            <div className="space-y-2">
              <Label>Buscar Alimentos</Label>
              <FoodSearch
                mode="multi"
                onSelect={handleAddToTray}
                addedFoodIds={addedFoodIds}
              />
            </div>

            {/* Meal Tray */}
            <MealTray
              items={mealTray}
              onUpdatePortion={handleUpdatePortion}
              onRemove={handleRemoveFromTray}
            />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Ex: com azeite, grelhado..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Submit */}
            <Button
              className="w-full"
              onClick={handleAddMeals}
              disabled={mealTray.length === 0 || isSubmitting}
            >
              {isSubmitting
                ? 'Salvando...'
                : `Registrar Refeição${mealTray.length > 0 ? ` (${mealTray.length})` : ''}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingMealId} onOpenChange={() => setDeletingMealId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover refeição?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
