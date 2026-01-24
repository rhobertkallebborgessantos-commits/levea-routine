import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, DollarSign, Zap, ChevronRight, Check, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  MealSuggestion,
  getSuggestionsForMealType,
  filterSuggestionsByTag,
} from '@/lib/meal-suggestions';
import { cn } from '@/lib/utils';

interface MealSuggestionsProps {
  mealType: string;
  mealLabel: string;
  onSelectSuggestion: (suggestion: MealSuggestion) => void;
}

const TAG_CONFIG = {
  'budget': { label: 'Econômico', icon: DollarSign, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  'low-carb': { label: 'Low Carb', icon: Flame, className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  'quick': { label: 'Rápido', icon: Zap, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  'filling': { label: 'Saciante', icon: Check, className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
} as const;

type TagFilter = 'budget' | 'low-carb' | 'quick' | 'filling' | null;

export function MealSuggestions({ mealType, mealLabel, onSelectSuggestion }: MealSuggestionsProps) {
  const [activeFilter, setActiveFilter] = useState<TagFilter>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<MealSuggestion | null>(null);

  const allSuggestions = getSuggestionsForMealType(mealType);
  const filteredSuggestions = filterSuggestionsByTag(allSuggestions, activeFilter);

  const handleSelectSuggestion = (suggestion: MealSuggestion) => {
    setSelectedSuggestion(suggestion);
  };

  const handleConfirmSuggestion = () => {
    if (selectedSuggestion) {
      onSelectSuggestion(selectedSuggestion);
      setSelectedSuggestion(null);
    }
  };

  if (allSuggestions.length === 0) return null;

  return (
    <>
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Sugestões para {mealLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              variant={activeFilter === null ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={() => setActiveFilter(null)}
            >
              Todas
            </Button>
            <Button
              variant={activeFilter === 'budget' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={() => setActiveFilter(activeFilter === 'budget' ? null : 'budget')}
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Econômico
            </Button>
            <Button
              variant={activeFilter === 'low-carb' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={() => setActiveFilter(activeFilter === 'low-carb' ? null : 'low-carb')}
            >
              <Flame className="h-3 w-3 mr-1" />
              Low Carb
            </Button>
          </div>

          {/* Suggestions scroll area */}
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              <AnimatePresence mode="popLayout">
                {filteredSuggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SuggestionCard
                      suggestion={suggestion}
                      onSelect={() => handleSelectSuggestion(suggestion)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Suggestion detail sheet */}
      <Sheet open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
        <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-xl">
          {selectedSuggestion && (
            <div className="space-y-4">
              <SheetHeader>
                <SheetTitle className="text-left flex items-center gap-2">
                  {selectedSuggestion.name}
                </SheetTitle>
                <SheetDescription className="text-left">
                  {selectedSuggestion.description}
                </SheetDescription>
              </SheetHeader>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap">
                {selectedSuggestion.tags.map((tag) => {
                  const config = TAG_CONFIG[tag];
                  const Icon = config.icon;
                  return (
                    <Badge key={tag} variant="outline" className={cn('gap-1', config.className)}>
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  );
                })}
              </div>

              {/* Nutrition summary */}
              <div className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-primary">{selectedSuggestion.totalCalories}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-primary">{selectedSuggestion.totalProtein}g</p>
                  <p className="text-xs text-muted-foreground">proteína</p>
                </div>
              </div>

              {/* Items list */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Itens inclusos:</h4>
                <div className="space-y-2">
                  {selectedSuggestion.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.foodName}</p>
                        <p className="text-xs text-muted-foreground">{item.portionGrams}g</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action button */}
              <Button className="w-full" size="lg" onClick={handleConfirmSuggestion}>
                <Plus className="h-4 w-4 mr-2" />
                Usar esta combinação
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

interface SuggestionCardProps {
  suggestion: MealSuggestion;
  onSelect: () => void;
}

function SuggestionCard({ suggestion, onSelect }: SuggestionCardProps) {
  const hasBudget = suggestion.tags.includes('budget');
  const hasLowCarb = suggestion.tags.includes('low-carb');

  return (
    <button
      onClick={onSelect}
      className="w-[180px] shrink-0 text-left p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all group"
    >
      <div className="space-y-2">
        {/* Tags */}
        <div className="flex gap-1">
          {hasBudget && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-accent text-accent-foreground">
              <DollarSign className="h-2.5 w-2.5" />
            </span>
          )}
          {hasLowCarb && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-destructive/10 text-destructive">
              <Flame className="h-2.5 w-2.5" />
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
          {suggestion.name}
        </h4>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {suggestion.description}
        </p>

        {/* Nutrition */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">
            <strong className="text-foreground">{suggestion.totalCalories}</strong> kcal
          </span>
          <span className="text-muted-foreground">
            <strong className="text-foreground">{suggestion.totalProtein}g</strong> prot
          </span>
        </div>

        {/* Arrow */}
        <div className="flex justify-end">
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </button>
  );
}
