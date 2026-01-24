import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X, Leaf, Plus, User } from 'lucide-react';
import { useFoods, Food } from '@/hooks/useMeals';
import { FOOD_CATEGORIES } from '@/lib/constants';
import { CustomFoodDialog } from './CustomFoodDialog';
import { cn } from '@/lib/utils';

interface FoodSearchProps {
  onSelect: (food: Food) => void;
  selectedFood: Food | null;
  onClear: () => void;
}

export function FoodSearch({ onSelect, selectedFood, onClear }: FoodSearchProps) {
  const { foods, isLoading, searchTerm, setSearchTerm, category, setCategory } = useFoods();
  const [showResults, setShowResults] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchTerm]);

  const handleFoodCreated = (food: Food) => {
    onSelect(food);
    setShowResults(false);
    setSearchTerm('');
  };

  if (selectedFood) {
    return (
      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex-1">
          <p className="font-medium text-foreground flex items-center gap-1.5">
            {selectedFood.name}
            {selectedFood.is_custom && (
              <User className="h-3 w-3 text-muted-foreground" />
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedFood.calories_per_100g} kcal | {selectedFood.protein_per_100g}g proteína /100g
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar alimento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <Badge
          variant={category === null ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setCategory(null)}
        >
          Todos
        </Badge>
        {FOOD_CATEGORIES.map((cat) => (
          <Badge
            key={cat.value}
            variant={category === cat.value ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCategory(cat.value)}
          >
            {cat.icon} {cat.label}
          </Badge>
        ))}
      </div>

      {/* Results */}
      {showResults && (
        <ScrollArea className="h-48 rounded-lg border border-border">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : foods.length > 0 ? (
            <div className="divide-y divide-border">
              {foods.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => {
                    onSelect(food);
                    setShowResults(false);
                    setSearchTerm('');
                  }}
                  className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        {food.name}
                        {food.is_low_carb && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-success/10 text-success">
                            Low Carb
                          </Badge>
                        )}
                        {food.is_custom && (
                          <User className="h-3 w-3 text-muted-foreground" />
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {FOOD_CATEGORIES.find((c) => c.value === food.category)?.icon}{' '}
                        {food.calories_per_100g} kcal • {food.protein_per_100g}g prot /100g
                      </p>
                      {food.swap_suggestion && (
                        <p className="text-xs text-primary/70 mt-1 flex items-center gap-1">
                          💡 Alternativa: {food.swap_suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              
              {/* Add custom food button at bottom of results */}
              <button
                type="button"
                onClick={() => setShowCustomDialog(true)}
                className="w-full p-3 text-left hover:bg-primary/5 transition-colors flex items-center gap-2 text-primary"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Adicionar "{searchTerm}" como alimento personalizado
                </span>
              </button>
            </div>
          ) : (
            <div className="p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Nenhum alimento encontrado
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomDialog(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Criar alimento personalizado
              </Button>
            </div>
          )}
        </ScrollArea>
      )}

      {/* Quick tip */}
      {!showResults && searchTerm.length === 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Digite pelo menos 2 letras para buscar
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomDialog(true)}
            className="text-xs gap-1.5 h-7"
          >
            <Plus className="h-3 w-3" />
            Criar alimento
          </Button>
        </div>
      )}

      {/* Custom Food Dialog */}
      <CustomFoodDialog
        open={showCustomDialog}
        onOpenChange={setShowCustomDialog}
        initialName={searchTerm}
        onFoodCreated={handleFoodCreated}
      />
    </div>
  );
}
