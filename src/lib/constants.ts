// LEVEA Constants and Configuration

export const APP_NAME = "LEVEA";
export const APP_TAGLINE = "Rotina inteligente para emagrecer sem sofrimento";

// Onboarding options
export const GOALS = [
  { value: 'lose_weight', label: 'Perder peso', icon: '🎯', description: 'Emagrecimento sustentável com hábitos saudáveis' },
  { value: 'maintain_weight', label: 'Manter peso', icon: '⚖️', description: 'Manter seu peso atual estável' },
  { value: 'build_habits', label: 'Criar hábitos', icon: '🌱', description: 'Desenvolver rotinas saudáveis consistentes' },
] as const;

export const ACTIVITY_LEVELS = [
  { value: 'low', label: 'Baixo', icon: '🧘', description: 'Maioria sedentário, atividades leves do dia a dia' },
  { value: 'medium', label: 'Médio', icon: '🚶', description: 'Caminhadas regulares, alguns exercícios' },
  { value: 'high', label: 'Alto', icon: '🏃', description: 'Treinos intensos regulares' },
] as const;

export const FOOD_PREFERENCES = [
  { value: 'balanced', label: 'Equilibrada', icon: '🥗', description: 'Variedade de alimentos, porções moderadas' },
  { value: 'low_carb', label: 'Low Carb', icon: '🥑', description: 'Foco em proteínas e gorduras saudáveis' },
] as const;

export const STRUGGLES = [
  { value: 'anxiety', label: 'Ansiedade', icon: '😰', description: 'Comer quando estressado ou ansioso' },
  { value: 'snacking', label: 'Beliscar', icon: '🍪', description: 'Lanches frequentes entre refeições' },
  { value: 'lack_of_routine', label: 'Falta de rotina', icon: '📅', description: 'Horários irregulares de alimentação' },
  { value: 'water_retention', label: 'Retenção de líquidos', icon: '💧', description: 'Sensação de inchaço frequente' },
] as const;

export const TIME_SLOTS = [
  { value: 'morning', label: 'Manhã', icon: '🌅', time: '6:00 - 12:00' },
  { value: 'lunch', label: 'Almoço', icon: '☀️', time: '12:00 - 14:00' },
  { value: 'afternoon', label: 'Tarde', icon: '🌤️', time: '14:00 - 18:00' },
  { value: 'evening', label: 'Noite', icon: '🌙', time: '18:00 - 22:00' },
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

// Tea recommendations based on goals/struggles
export const TEA_RECOMMENDATIONS = {
  anxiety: [
    { name: 'Camomila', benefit: 'Acalma a mente e reduz o estresse', timing: 'Tarde ou noite' },
    { name: 'Lavanda', benefit: 'Promove relaxamento e sono melhor', timing: 'Noite, antes de dormir' },
    { name: 'Maracujá', benefit: 'Alívio natural da ansiedade', timing: 'Quando sentir ansiedade' },
  ],
  water_retention: [
    { name: 'Dente-de-leão', benefit: 'Diurético natural, reduz inchaço', timing: 'Manhã ou tarde' },
    { name: 'Chá verde', benefit: 'Apoia o metabolismo e reduz retenção', timing: 'Manhã' },
    { name: 'Hibisco', benefit: 'Ajuda a eliminar líquidos em excesso', timing: 'Tarde' },
  ],
  digestion: [
    { name: 'Hortelã', benefit: 'Alivia desconforto digestivo', timing: 'Após refeições' },
    { name: 'Gengibre', benefit: 'Auxilia na digestão e reduz inchaço', timing: 'Antes ou após refeições' },
    { name: 'Funcho', benefit: 'Alivia gases e inchaço', timing: 'Após o jantar' },
  ],
  metabolism: [
    { name: 'Chá verde', benefit: 'Acelera o metabolismo naturalmente', timing: 'Manhã ou início da tarde' },
    { name: 'Oolong', benefit: 'Apoia a queima de gordura', timing: 'Antes do exercício' },
    { name: 'Canela', benefit: 'Ajuda a regular o açúcar no sangue', timing: 'Após refeições' },
  ],
} as const;

// Reminder message templates
export const REMINDER_TEMPLATES = {
  meal: [
    "Hora do seu {meal}! Lembre-se de incluir proteína. 🍽️",
    "É hora do {meal}! Coma devagar e aproveite cada mordida.",
    "Lembrete gentil: {meal} está chamando! Faça uma refeição equilibrada.",
  ],
  tea: [
    "Hora do seu chá relaxante 🍵",
    "Uma xícara quente te espera. Faça uma pausa consciente.",
    "Hora do chá! Vamos pausar e resetar.",
  ],
  hydration: [
    "💧 Mantenha-se hidratado! Você bebeu água recentemente?",
    "Pausa para água! Seu corpo vai agradecer.",
    "Check de hidratação. Como está sua ingestão de água hoje?",
  ],
  snacking: [
    "Vontade de beliscar tarde da noite? Um chá quente pode ajudar.",
    "Com fome? Tente água primeiro, depois decida.",
    "Cozinha fechada! Amanhã é um novo começo. 🌙",
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

export type Goal = typeof GOALS[number]['value'];
export type ActivityLevel = typeof ACTIVITY_LEVELS[number]['value'];
export type FoodPreference = typeof FOOD_PREFERENCES[number]['value'];
export type Struggle = typeof STRUGGLES[number]['value'];
export type TimeBlock = typeof TIME_SLOTS[number]['value'];