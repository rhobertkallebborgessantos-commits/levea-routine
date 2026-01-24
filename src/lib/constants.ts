// LEVEA Constants and Configuration

export const APP_NAME = "LEVEA";
export const APP_TAGLINE = "Rotina inteligente para emagrecer sem sofrimento";

// Gender options
export const GENDERS = [
  { value: 'female', label: 'Feminino', icon: '👩' },
  { value: 'male', label: 'Masculino', icon: '👨' },
  { value: 'other', label: 'Outro', icon: '🧑' },
] as const;

// Primary goals - expanded
export const GOALS = [
  { value: 'fat_loss', label: 'Perder gordura', icon: '🔥', description: 'Emagrecimento focado em queima de gordura' },
  { value: 'belly_reduction', label: 'Reduzir barriga', icon: '🎯', description: 'Foco na região abdominal' },
  { value: 'health', label: 'Melhorar saúde', icon: '💚', description: 'Bem-estar geral e qualidade de vida' },
  { value: 'routine', label: 'Criar rotina', icon: '📋', description: 'Estabelecer hábitos saudáveis' },
] as const;

// Activity levels - values must match database enum
export const ACTIVITY_LEVELS = [
  { value: 'low', label: 'Sedentário', icon: '🪑', description: 'Trabalho sentado, pouco movimento' },
  { value: 'medium', label: 'Moderado', icon: '🚶', description: 'Caminhadas e atividades leves' },
  { value: 'high', label: 'Ativo', icon: '🏃', description: 'Exercícios regulares, vida ativa' },
] as const;

// Dietary restrictions - expanded
export const DIETARY_RESTRICTIONS = [
  { value: 'none', label: 'Nenhuma', icon: '✅', description: 'Como de tudo' },
  { value: 'low_carb', label: 'Low Carb', icon: '🥑', description: 'Redução de carboidratos' },
  { value: 'lactose_free', label: 'Sem Lactose', icon: '🥛', description: 'Evito laticínios' },
  { value: 'gluten_free', label: 'Sem Glúten', icon: '🌾', description: 'Evito glúten' },
  { value: 'vegetarian', label: 'Vegetariano', icon: '🥬', description: 'Sem carnes' },
  { value: 'vegan', label: 'Vegano', icon: '🌱', description: 'Sem produtos animais' },
] as const;

// Previous dieting experience
export const DIETING_EXPERIENCE = [
  { value: 'never', label: 'Nunca fiz dieta', icon: '🆕', description: 'Primeira vez' },
  { value: 'few_attempts', label: 'Algumas tentativas', icon: '🔄', description: 'Tentei algumas vezes' },
  { value: 'many_attempts', label: 'Muitas tentativas', icon: '😔', description: 'Já tentei muito, sem sucesso duradouro' },
  { value: 'successful_past', label: 'Sucesso no passado', icon: '⭐', description: 'Já consegui, quero voltar' },
] as const;

// Struggles
export const STRUGGLES = [
  { value: 'anxiety', label: 'Ansiedade', icon: '😰', description: 'Comer quando estressado' },
  { value: 'snacking', label: 'Beliscar', icon: '🍪', description: 'Lanches frequentes' },
  { value: 'lack_of_routine', label: 'Falta de rotina', icon: '📅', description: 'Horários irregulares' },
  { value: 'water_retention', label: 'Retenção', icon: '💧', description: 'Sensação de inchaço' },
  { value: 'night_eating', label: 'Comer à noite', icon: '🌙', description: 'Fome noturna' },
  { value: 'sweet_craving', label: 'Vontade de doce', icon: '🍫', description: 'Difícil resistir' },
  { value: 'emotional_eating', label: 'Comer emocional', icon: '💔', description: 'Como por emoção' },
  { value: 'portions', label: 'Controle de porção', icon: '🍽️', description: 'Como demais' },
] as const;

// Time slots for reminders
export const TIME_SLOTS = [
  { value: 'morning', label: 'Manhã', icon: '🌅', time: '6:00 - 12:00' },
  { value: 'lunch', label: 'Almoço', icon: '☀️', time: '12:00 - 14:00' },
  { value: 'afternoon', label: 'Tarde', icon: '🌤️', time: '14:00 - 18:00' },
  { value: 'evening', label: 'Noite', icon: '🌙', time: '18:00 - 22:00' },
] as const;

// Meal types
export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Café da manhã', icon: '🌅', time: '07:00' },
  { value: 'morning_snack', label: 'Lanche da manhã', icon: '🍎', time: '10:00' },
  { value: 'lunch', label: 'Almoço', icon: '🍽️', time: '12:30' },
  { value: 'afternoon_snack', label: 'Lanche da tarde', icon: '🥤', time: '16:00' },
  { value: 'dinner', label: 'Jantar', icon: '🥗', time: '19:30' },
  { value: 'supper', label: 'Ceia', icon: '🌙', time: '21:00' },
] as const;

// Food categories
export const FOOD_CATEGORIES = [
  { value: 'proteins', label: 'Proteínas', icon: '🥩', color: 'text-red-500' },
  { value: 'carbs', label: 'Carboidratos', icon: '🍚', color: 'text-amber-500' },
  { value: 'fats', label: 'Gorduras', icon: '🥑', color: 'text-green-600' },
  { value: 'vegetables', label: 'Vegetais', icon: '🥬', color: 'text-green-500' },
  { value: 'fruits', label: 'Frutas', icon: '🍎', color: 'text-pink-500' },
  { value: 'drinks', label: 'Bebidas', icon: '🥤', color: 'text-blue-500' },
] as const;

// Tea purposes
export const TEA_PURPOSES = [
  { value: 'metabolism', label: 'Metabolismo', icon: '🔥', description: 'Acelerar queima' },
  { value: 'digestion', label: 'Digestão', icon: '🫃', description: 'Melhorar digestão' },
  { value: 'anxiety', label: 'Ansiedade', icon: '🧘', description: 'Acalmar' },
  { value: 'bloating', label: 'Inchaço', icon: '💧', description: 'Reduzir retenção' },
  { value: 'sleep', label: 'Sono', icon: '😴', description: 'Dormir melhor' },
] as const;

// Tea intensities
export const TEA_INTENSITIES = [
  { value: 'mild', label: 'Suave', icon: '🌱', description: 'Uso diário' },
  { value: 'moderate', label: 'Moderado', icon: '🌿', description: 'Uso regular' },
  { value: 'occasional', label: 'Ocasional', icon: '⚡', description: 'Uso limitado' },
] as const;

// Tea time of day
export const TEA_TIMES = [
  { value: 'morning', label: 'Manhã', icon: '🌅' },
  { value: 'afternoon', label: 'Tarde', icon: '☀️' },
  { value: 'evening', label: 'Noite', icon: '🌙' },
  { value: 'any', label: 'Qualquer', icon: '⏰' },
] as const;

// Default routine actions per time block
export const DEFAULT_ROUTINE_ACTIONS = {
  morning: [
    { title: 'Beber água', description: 'Comece o dia com um copo de água para hidratar seu corpo', icon: '💧' },
    { title: 'Café da manhã equilibrado', description: 'Inclua proteína para se manter saciado por mais tempo', icon: '🍳' },
  ],
  lunch: [
    { title: 'Refeição consciente', description: 'Coma devagar e aproveite sua comida sem distrações', icon: '🥗' },
    { title: 'Check de hidratação', description: 'Você já bebeu água suficiente esta manhã?', icon: '💧' },
  ],
  afternoon: [
    { title: 'Lanche saudável', description: 'Escolha algo nutritivo se estiver com fome', icon: '🍎' },
    { title: 'Chá relaxante', description: 'Um chá quente pode ajudar com a vontade de comer', icon: '🍵' },
  ],
  evening: [
    { title: 'Jantar leve', description: 'Mantenha equilibrado e evite comidas pesadas tarde da noite', icon: '🥙' },
    { title: 'Relaxar', description: 'Evite comer 2-3 horas antes de dormir', icon: '🌙' },
  ],
} as const;

// Time block styles for consistent UI
export const TIME_BLOCK_STYLES = {
  morning: {
    bg: 'bg-morning',
    text: 'text-morning-foreground',
    icon: '🌅',
    label: 'Manhã',
  },
  lunch: {
    bg: 'bg-lunch',
    text: 'text-lunch-foreground',
    icon: '☀️',
    label: 'Almoço',
  },
  afternoon: {
    bg: 'bg-afternoon',
    text: 'text-afternoon-foreground',
    icon: '🌤️',
    label: 'Tarde',
  },
  evening: {
    bg: 'bg-evening',
    text: 'text-evening-foreground',
    icon: '🌙',
    label: 'Noite',
  },
} as const;

// Diagnosis helpers
export function generateDiagnosis(data: {
  gender: string | null;
  age: number | null;
  currentWeight: number | null;
  targetWeight: number | null;
  height: number | null;
  primaryGoal: string | null;
  activityLevel: string | null;
  dietaryRestrictions: string[];
  struggles: string[];
}): { summary: string; weeklyFocus: string; dailyCalories: number; proteinTarget: number } {
  const weightToLose = data.currentWeight && data.targetWeight 
    ? data.currentWeight - data.targetWeight 
    : 0;
  
  // Basic BMR calculation (simplified)
  let bmr = 1500; // default
  if (data.currentWeight && data.height && data.age && data.gender) {
    if (data.gender === 'female') {
      bmr = 655 + (9.6 * data.currentWeight) + (1.8 * data.height) - (4.7 * (data.age || 30));
    } else {
      bmr = 66 + (13.7 * data.currentWeight) + (5 * data.height) - (6.8 * (data.age || 30));
    }
  }
  
  // Activity multiplier
  const activityMultiplier = data.activityLevel === 'high' ? 1.55 : 
                              data.activityLevel === 'medium' ? 1.375 : 1.2;
  
  const maintenanceCalories = Math.round(bmr * activityMultiplier);
  const dailyCalories = Math.round(maintenanceCalories - 400); // Moderate deficit
  
  // Protein target (1.6g per kg of target weight)
  const proteinTarget = Math.round((data.targetWeight || data.currentWeight || 70) * 1.6);
  
  // Generate summary based on struggles
  let focusAreas: string[] = [];
  if (data.struggles.includes('anxiety')) focusAreas.push('gerenciar ansiedade com chás calmantes');
  if (data.struggles.includes('snacking')) focusAreas.push('substituir beliscos por lanches estruturados');
  if (data.struggles.includes('night_eating')) focusAreas.push('criar rotina noturna relaxante');
  if (data.struggles.includes('sweet_craving')) focusAreas.push('usar canela e chás doces naturalmente');
  if (data.struggles.includes('water_retention')) focusAreas.push('chás diuréticos pela manhã');
  
  const summary = `Seu ponto de partida: ${data.currentWeight || '--'}kg com objetivo de ${data.targetWeight || '--'}kg. ` +
    `${weightToLose > 0 ? `São ${weightToLose.toFixed(1)}kg para perder de forma saudável. ` : ''}` +
    `Com seu nível de atividade ${data.activityLevel === 'high' ? 'ativo' : data.activityLevel === 'medium' ? 'moderado' : 'sedentário'}, ` +
    `vamos focar em uma alimentação equilibrada com prioridade em proteínas.`;
  
  const weeklyFocus = focusAreas.length > 0 
    ? `Foco da primeira semana: ${focusAreas.slice(0, 2).join(' e ')}.`
    : 'Foco da primeira semana: estabelecer rotina alimentar consistente e hidratação adequada.';
  
  return {
    summary,
    weeklyFocus,
    dailyCalories,
    proteinTarget,
  };
}

export type Goal = typeof GOALS[number]['value'];
export type ActivityLevel = typeof ACTIVITY_LEVELS[number]['value'];
export type DietaryRestriction = typeof DIETARY_RESTRICTIONS[number]['value'];
export type Struggle = typeof STRUGGLES[number]['value'];
export type TimeBlock = typeof TIME_SLOTS[number]['value'];
export type MealType = typeof MEAL_TYPES[number]['value'];
export type FoodCategory = typeof FOOD_CATEGORIES[number]['value'];
export type TeaPurpose = typeof TEA_PURPOSES[number]['value'];
export type Gender = typeof GENDERS[number]['value'];
export type DietingExperience = typeof DIETING_EXPERIENCE[number]['value'];
