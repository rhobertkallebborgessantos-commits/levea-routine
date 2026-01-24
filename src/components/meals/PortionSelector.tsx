import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';
import { Food, calculateNutrition } from '@/hooks/useMeals';

interface PortionSelectorProps {
  food: Food;
  portion: number;
  onPortionChange: (portion: number) => void;
}

const COMMON_PORTIONS = [
  { label: 'Colher sopa', grams: 15 },
  { label: 'Xícara', grams: 200 },
  { label: 'Unidade P', grams: 50 },
  { label: 'Unidade M', grams: 100 },
  { label: 'Unidade G', grams: 150 },
  { label: 'Fatia', grams: 30 },
  { label: 'Porção', grams: 100 },
];

export function PortionSelector({ food, portion, onPortionChange }: PortionSelectorProps) {
  const nutrition = calculateNutrition(food, portion);

  return (
    <div className="space-y-4">
      {/* Portion input */}
      <div className="space-y-2">
        <Label htmlFor="portion">Quantidade (gramas)</Label>
        <div className="flex items-center gap-3">
          <Slider
            value={[portion]}
            onValueChange={([value]) => onPortionChange(value)}
            min={10}
            max={500}
            step={10}
            className="flex-1"
          />
          <Input
            id="portion"
            type="number"
            value={portion}
            onChange={(e) => onPortionChange(parseInt(e.target.value) || 0)}
            className="w-20 text-center"
          />
        </div>
      </div>

      {/* Quick portions */}
      <div className="flex gap-2 flex-wrap">
        {COMMON_PORTIONS.slice(0, 5).map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onPortionChange(p.grams)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              portion === p.grams
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted/50 border-border hover:border-primary/50'
            }`}
          >
            {p.label} ({p.grams}g)
          </button>
        ))}
      </div>

      {/* Nutrition preview */}
      <Card className="p-4 bg-muted/30 border-border/50">
        <p className="text-xs text-muted-foreground mb-3">
          Valores para {portion}g de {food.name}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-destructive/10">
              <Flame className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Calorias</p>
              <p className="font-semibold text-foreground">{nutrition.calories} kcal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Beef className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Proteína</p>
              <p className="font-semibold text-foreground">{nutrition.protein}g</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <Wheat className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Carboidratos</p>
              <p className="font-semibold text-foreground">{nutrition.carbs}g</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-green-500/10">
              <Droplet className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gordura</p>
              <p className="font-semibold text-foreground">{nutrition.fat}g</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
