import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { FOOD_CATEGORIES } from '@/lib/constants';
import { useAddCustomFood, Food } from '@/hooks/useMeals';
import { Plus } from 'lucide-react';

interface CustomFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName?: string;
  onFoodCreated: (food: Food) => void;
}

export function CustomFoodDialog({
  open,
  onOpenChange,
  initialName = '',
  onFoodCreated,
}: CustomFoodDialogProps) {
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState('proteins');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const addCustomFood = useAddCustomFood();

  const resetForm = () => {
    setName('');
    setCategory('proteins');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  const handleSubmit = async () => {
    if (!name.trim() || !calories) return;

    try {
      const food = await addCustomFood.mutateAsync({
        name: name.trim(),
        category,
        caloriesPer100g: parseInt(calories) || 0,
        proteinPer100g: parseFloat(protein) || 0,
        carbsPer100g: parseFloat(carbs) || 0,
        fatPer100g: parseFloat(fat) || 0,
      });
      
      onFoodCreated(food);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Update name when initialName changes
  useState(() => {
    if (initialName) setName(initialName);
  });

  const isValid = name.trim().length > 0 && calories && parseInt(calories) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Adicionar Alimento Personalizado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="food-name">Nome do alimento *</Label>
            <Input
              id="food-name"
              placeholder="Ex: Bolo de chocolate caseiro"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOOD_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Macros per 100g */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">
              Valores nutricionais por 100g
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="calories" className="text-xs">
                  Calorias (kcal) *
                </Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  min={0}
                  max={9999}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="protein" className="text-xs">
                  Proteína (g)
                </Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  min={0}
                  max={999}
                  step={0.1}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="carbs" className="text-xs">
                  Carboidratos (g)
                </Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  min={0}
                  max={999}
                  step={0.1}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fat" className="text-xs">
                  Gordura (g)
                </Label>
                <Input
                  id="fat"
                  type="number"
                  placeholder="0"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  min={0}
                  max={999}
                  step={0.1}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            * Campos obrigatórios. Você pode encontrar valores nutricionais na embalagem do produto.
          </p>

          <Button
            onClick={handleSubmit}
            disabled={!isValid || addCustomFood.isPending}
            className="w-full"
          >
            {addCustomFood.isPending ? 'Salvando...' : 'Adicionar Alimento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
