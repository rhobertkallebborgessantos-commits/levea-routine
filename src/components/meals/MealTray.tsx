import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Beef, Edit2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Food, calculateNutrition } from '@/hooks/useMeals';
import { cn } from '@/lib/utils';

export interface TrayItem {
  food: Food;
  portion: number;
}

interface MealTrayProps {
  items: TrayItem[];
  onUpdatePortion: (index: number, portion: number) => void;
  onRemove: (index: number) => void;
}

const QUICK_PORTIONS = [50, 100, 150, 200];

export function MealTray({ items, onUpdatePortion, onRemove }: MealTrayProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // Calculate totals
  const totals = items.reduce(
    (acc, item) => {
      const nutrition = calculateNutrition(item.food, item.portion);
      return {
        calories: acc.calories + nutrition.calories,
        protein: acc.protein + nutrition.protein,
      };
    },
    { calories: 0, protein: 0 }
  );

  const startEditing = (index: number, currentPortion: number) => {
    setEditingIndex(index);
    setEditValue(String(currentPortion));
  };

  const confirmEdit = () => {
    if (editingIndex !== null) {
      const value = parseInt(editValue, 10);
      if (!isNaN(value) && value > 0) {
        onUpdatePortion(editingIndex, value);
      }
      setEditingIndex(null);
      setEditValue('');
    }
  };

  if (items.length === 0) {
    return (
      <Card className="border-dashed border-2 border-border bg-muted/20">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Busque alimentos acima para montar sua refeição
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-2 bg-muted/30">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          🍽️ Sua Refeição
          <span className="text-xs text-muted-foreground ml-auto">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
              const nutrition = calculateNutrition(item.food, item.portion);
              const isEditing = editingIndex === index;

              return (
                <motion.div
                  key={`${item.food.id}-${index}`}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.food.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {nutrition.calories} kcal • {nutrition.protein}g prot
                      </p>
                      
                      {/* Portion controls */}
                      <div className="flex items-center gap-2 mt-2">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 h-7 text-xs"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmEdit();
                                if (e.key === 'Escape') setEditingIndex(null);
                              }}
                            />
                            <span className="text-xs text-muted-foreground">g</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={confirmEdit}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(index, item.portion)}
                              className="flex items-center gap-1 text-xs bg-muted rounded px-2 py-1 hover:bg-muted/80 transition-colors"
                            >
                              {item.portion}g
                              <Edit2 className="h-3 w-3 text-muted-foreground" />
                            </button>
                            <div className="flex gap-1">
                              {QUICK_PORTIONS.map((portion) => (
                                <button
                                  key={portion}
                                  onClick={() => onUpdatePortion(index, portion)}
                                  className={cn(
                                    "text-xs px-1.5 py-0.5 rounded transition-colors",
                                    item.portion === portion
                                      ? "bg-primary text-primary-foreground"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                  )}
                                >
                                  {portion}g
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onRemove(index)}
                      className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors shrink-0"
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Totals */}
        <div className="p-3 bg-muted/50 border-t border-border">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Total</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-destructive">
                <Flame className="h-4 w-4" />
                {totals.calories} kcal
              </span>
              <span className="flex items-center gap-1 text-primary">
                <Beef className="h-4 w-4" />
                {Math.round(totals.protein * 10) / 10}g prot
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
