// Meal Suggestions - Budget-friendly and Low-carb combinations
// All foods reference items available in the foods database

export interface MealSuggestionItem {
  foodName: string;
  portionGrams: number;
  category: 'proteins' | 'carbs' | 'fats' | 'vegetables' | 'drinks' | 'fruits';
}

export interface MealSuggestion {
  id: string;
  name: string;
  description: string;
  items: MealSuggestionItem[];
  totalCalories: number;
  totalProtein: number;
  tags: ('budget' | 'low-carb' | 'quick' | 'filling')[];
  mealTypes: string[];
}

// Breakfast suggestions
export const BREAKFAST_SUGGESTIONS: MealSuggestion[] = [
  {
    id: 'breakfast-budget-1',
    name: 'Café Clássico Brasileiro',
    description: 'Tapioca com ovo e café - simples e nutritivo',
    items: [
      { foodName: 'Ovo cozido', portionGrams: 100, category: 'proteins' },
      { foodName: 'Tapioca', portionGrams: 50, category: 'carbs' },
      { foodName: 'Café sem açúcar', portionGrams: 200, category: 'drinks' },
    ],
    totalCalories: 338,
    totalProtein: 14,
    tags: ['budget', 'quick'],
    mealTypes: ['breakfast'],
  },
  {
    id: 'breakfast-budget-2',
    name: 'Pão Integral com Queijo',
    description: 'Opção prática e acessível',
    items: [
      { foodName: 'Pão integral', portionGrams: 50, category: 'carbs' },
      { foodName: 'Queijo minas frescal', portionGrams: 40, category: 'proteins' },
      { foodName: 'Café com leite', portionGrams: 200, category: 'drinks' },
    ],
    totalCalories: 294,
    totalProtein: 16,
    tags: ['budget', 'quick'],
    mealTypes: ['breakfast'],
  },
  {
    id: 'breakfast-lowcarb-1',
    name: 'Café Low Carb',
    description: 'Ovos mexidos com abacate - proteína e gordura boa',
    items: [
      { foodName: 'Ovo cozido', portionGrams: 150, category: 'proteins' },
      { foodName: 'Abacate', portionGrams: 80, category: 'fats' },
      { foodName: 'Café sem açúcar', portionGrams: 200, category: 'drinks' },
    ],
    totalCalories: 365,
    totalProtein: 20,
    tags: ['low-carb', 'filling'],
    mealTypes: ['breakfast'],
  },
  {
    id: 'breakfast-lowcarb-2',
    name: 'Omelete Fit',
    description: 'Omelete com queijo e espinafre',
    items: [
      { foodName: 'Ovo cozido', portionGrams: 150, category: 'proteins' },
      { foodName: 'Queijo minas frescal', portionGrams: 30, category: 'proteins' },
      { foodName: 'Espinafre', portionGrams: 50, category: 'vegetables' },
    ],
    totalCalories: 290,
    totalProtein: 24,
    tags: ['low-carb', 'filling'],
    mealTypes: ['breakfast'],
  },
  {
    id: 'breakfast-aveia',
    name: 'Mingau de Aveia',
    description: 'Aveia com banana - energia para o dia',
    items: [
      { foodName: 'Aveia', portionGrams: 40, category: 'carbs' },
      { foodName: 'Leite desnatado', portionGrams: 200, category: 'drinks' },
      { foodName: 'Banana', portionGrams: 100, category: 'fruits' },
    ],
    totalCalories: 315,
    totalProtein: 14,
    tags: ['budget', 'filling'],
    mealTypes: ['breakfast'],
  },
];

// Lunch suggestions
export const LUNCH_SUGGESTIONS: MealSuggestion[] = [
  {
    id: 'lunch-budget-1',
    name: 'Prato Feito Leve',
    description: 'Arroz, feijão, frango e salada - o clássico equilibrado',
    items: [
      { foodName: 'Arroz branco', portionGrams: 100, category: 'carbs' },
      { foodName: 'Feijão carioca', portionGrams: 80, category: 'carbs' },
      { foodName: 'Frango (peito)', portionGrams: 120, category: 'proteins' },
      { foodName: 'Alface', portionGrams: 50, category: 'vegetables' },
      { foodName: 'Tomate', portionGrams: 50, category: 'vegetables' },
    ],
    totalCalories: 430,
    totalProtein: 42,
    tags: ['budget', 'filling'],
    mealTypes: ['lunch'],
  },
  {
    id: 'lunch-budget-2',
    name: 'Macarrão com Sardinha',
    description: 'Opção econômica e rica em ômega-3',
    items: [
      { foodName: 'Macarrão integral', portionGrams: 100, category: 'carbs' },
      { foodName: 'Sardinha em lata', portionGrams: 100, category: 'proteins' },
      { foodName: 'Tomate', portionGrams: 80, category: 'vegetables' },
    ],
    totalCalories: 370,
    totalProtein: 28,
    tags: ['budget', 'quick'],
    mealTypes: ['lunch'],
  },
  {
    id: 'lunch-lowcarb-1',
    name: 'Salada de Frango',
    description: 'Salada completa com proteína - leve e saciante',
    items: [
      { foodName: 'Frango (peito)', portionGrams: 150, category: 'proteins' },
      { foodName: 'Alface', portionGrams: 100, category: 'vegetables' },
      { foodName: 'Tomate', portionGrams: 80, category: 'vegetables' },
      { foodName: 'Pepino', portionGrams: 80, category: 'vegetables' },
      { foodName: 'Azeite de oliva', portionGrams: 10, category: 'fats' },
    ],
    totalCalories: 305,
    totalProtein: 40,
    tags: ['low-carb', 'filling'],
    mealTypes: ['lunch'],
  },
  {
    id: 'lunch-lowcarb-2',
    name: 'Bife com Legumes',
    description: 'Carne grelhada com vegetais refogados',
    items: [
      { foodName: 'Carne bovina (patinho)', portionGrams: 150, category: 'proteins' },
      { foodName: 'Abobrinha', portionGrams: 100, category: 'vegetables' },
      { foodName: 'Brócolis', portionGrams: 100, category: 'vegetables' },
      { foodName: 'Azeite de oliva', portionGrams: 10, category: 'fats' },
    ],
    totalCalories: 340,
    totalProtein: 42,
    tags: ['low-carb', 'filling'],
    mealTypes: ['lunch'],
  },
  {
    id: 'lunch-budget-3',
    name: 'Ovo com Batata Doce',
    description: 'Simples, barato e nutritivo',
    items: [
      { foodName: 'Ovo cozido', portionGrams: 150, category: 'proteins' },
      { foodName: 'Batata doce', portionGrams: 150, category: 'carbs' },
      { foodName: 'Couve', portionGrams: 80, category: 'vegetables' },
    ],
    totalCalories: 381,
    totalProtein: 22,
    tags: ['budget', 'filling'],
    mealTypes: ['lunch'],
  },
];

// Snack suggestions (for morning_snack and afternoon_snack)
export const SNACK_SUGGESTIONS: MealSuggestion[] = [
  {
    id: 'snack-budget-1',
    name: 'Fruta com Aveia',
    description: 'Banana com aveia - energia rápida',
    items: [
      { foodName: 'Banana', portionGrams: 100, category: 'fruits' },
      { foodName: 'Aveia', portionGrams: 20, category: 'carbs' },
    ],
    totalCalories: 167,
    totalProtein: 5,
    tags: ['budget', 'quick'],
    mealTypes: ['morning_snack', 'afternoon_snack'],
  },
  {
    id: 'snack-budget-2',
    name: 'Iogurte Natural',
    description: 'Probióticos para o intestino',
    items: [
      { foodName: 'Iogurte natural', portionGrams: 170, category: 'proteins' },
    ],
    totalCalories: 102,
    totalProtein: 7,
    tags: ['budget', 'quick'],
    mealTypes: ['morning_snack', 'afternoon_snack'],
  },
  {
    id: 'snack-lowcarb-1',
    name: 'Queijo com Castanhas',
    description: 'Gorduras boas e proteína',
    items: [
      { foodName: 'Queijo minas frescal', portionGrams: 50, category: 'proteins' },
      { foodName: 'Castanha do Pará', portionGrams: 20, category: 'fats' },
    ],
    totalCalories: 253,
    totalProtein: 12,
    tags: ['low-carb', 'filling'],
    mealTypes: ['morning_snack', 'afternoon_snack'],
  },
  {
    id: 'snack-lowcarb-2',
    name: 'Ovo Cozido',
    description: 'Simples e muito proteico',
    items: [
      { foodName: 'Ovo cozido', portionGrams: 100, category: 'proteins' },
    ],
    totalCalories: 155,
    totalProtein: 13,
    tags: ['low-carb', 'quick', 'budget'],
    mealTypes: ['morning_snack', 'afternoon_snack'],
  },
  {
    id: 'snack-abacate',
    name: 'Abacate Cremoso',
    description: 'Gordura boa que sacia',
    items: [
      { foodName: 'Abacate', portionGrams: 100, category: 'fats' },
    ],
    totalCalories: 160,
    totalProtein: 2,
    tags: ['low-carb', 'quick'],
    mealTypes: ['morning_snack', 'afternoon_snack'],
  },
  {
    id: 'snack-amendoim',
    name: 'Amendoim Torrado',
    description: 'Rico em proteínas e fibras',
    items: [
      { foodName: 'Amendoim', portionGrams: 30, category: 'fats' },
    ],
    totalCalories: 170,
    totalProtein: 8,
    tags: ['low-carb', 'quick', 'budget'],
    mealTypes: ['morning_snack', 'afternoon_snack'],
  },
];

// Dinner suggestions
export const DINNER_SUGGESTIONS: MealSuggestion[] = [
  {
    id: 'dinner-budget-1',
    name: 'Sopa de Legumes',
    description: 'Reconfortante e leve',
    items: [
      { foodName: 'Cenoura', portionGrams: 80, category: 'vegetables' },
      { foodName: 'Chuchu', portionGrams: 100, category: 'vegetables' },
      { foodName: 'Frango (peito)', portionGrams: 80, category: 'proteins' },
    ],
    totalCalories: 175,
    totalProtein: 22,
    tags: ['budget', 'filling'],
    mealTypes: ['dinner'],
  },
  {
    id: 'dinner-budget-2',
    name: 'Omelete com Salada',
    description: 'Rápido e nutritivo',
    items: [
      { foodName: 'Ovo cozido', portionGrams: 150, category: 'proteins' },
      { foodName: 'Alface', portionGrams: 80, category: 'vegetables' },
      { foodName: 'Tomate', portionGrams: 80, category: 'vegetables' },
    ],
    totalCalories: 260,
    totalProtein: 20,
    tags: ['budget', 'quick'],
    mealTypes: ['dinner'],
  },
  {
    id: 'dinner-lowcarb-1',
    name: 'Peixe Grelhado',
    description: 'Leve, saboroso e proteico',
    items: [
      { foodName: 'Tilápia', portionGrams: 150, category: 'proteins' },
      { foodName: 'Brócolis', portionGrams: 100, category: 'vegetables' },
      { foodName: 'Azeite de oliva', portionGrams: 10, category: 'fats' },
    ],
    totalCalories: 270,
    totalProtein: 34,
    tags: ['low-carb', 'filling'],
    mealTypes: ['dinner'],
  },
  {
    id: 'dinner-lowcarb-2',
    name: 'Frango com Couve',
    description: 'Clássico low carb brasileiro',
    items: [
      { foodName: 'Frango (peito)', portionGrams: 120, category: 'proteins' },
      { foodName: 'Couve', portionGrams: 100, category: 'vegetables' },
      { foodName: 'Azeite de oliva', portionGrams: 10, category: 'fats' },
    ],
    totalCalories: 280,
    totalProtein: 35,
    tags: ['low-carb', 'filling'],
    mealTypes: ['dinner'],
  },
  {
    id: 'dinner-budget-3',
    name: 'Cuscuz com Ovo',
    description: 'Nordestino e econômico',
    items: [
      { foodName: 'Cuscuz de milho', portionGrams: 100, category: 'carbs' },
      { foodName: 'Ovo cozido', portionGrams: 100, category: 'proteins' },
    ],
    totalCalories: 267,
    totalProtein: 15,
    tags: ['budget', 'quick'],
    mealTypes: ['dinner'],
  },
];

// Supper (ceia) suggestions - light options
export const SUPPER_SUGGESTIONS: MealSuggestion[] = [
  {
    id: 'supper-1',
    name: 'Chá com Biscoito',
    description: 'Leve antes de dormir',
    items: [
      { foodName: 'Chá verde', portionGrams: 200, category: 'drinks' },
      { foodName: 'Torrada integral', portionGrams: 20, category: 'carbs' },
    ],
    totalCalories: 60,
    totalProtein: 2,
    tags: ['budget', 'quick'],
    mealTypes: ['supper'],
  },
  {
    id: 'supper-lowcarb',
    name: 'Queijo com Chá',
    description: 'Proteína leve para a noite',
    items: [
      { foodName: 'Queijo minas frescal', portionGrams: 30, category: 'proteins' },
      { foodName: 'Chá verde', portionGrams: 200, category: 'drinks' },
    ],
    totalCalories: 90,
    totalProtein: 6,
    tags: ['low-carb', 'quick'],
    mealTypes: ['supper'],
  },
];

// Helper function to get suggestions for a meal type
export function getSuggestionsForMealType(mealType: string): MealSuggestion[] {
  const allSuggestions = [
    ...BREAKFAST_SUGGESTIONS,
    ...LUNCH_SUGGESTIONS,
    ...SNACK_SUGGESTIONS,
    ...DINNER_SUGGESTIONS,
    ...SUPPER_SUGGESTIONS,
  ];
  
  return allSuggestions.filter(s => s.mealTypes.includes(mealType));
}

// Helper to filter by tag
export function filterSuggestionsByTag(
  suggestions: MealSuggestion[], 
  tag: 'budget' | 'low-carb' | 'quick' | 'filling' | null
): MealSuggestion[] {
  if (!tag) return suggestions;
  return suggestions.filter(s => s.tags.includes(tag));
}
