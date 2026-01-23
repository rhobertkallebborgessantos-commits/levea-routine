// LEVEA Constants and Configuration

export const APP_NAME = "LEVEA";
export const APP_TAGLINE = "Smart routine for effortless weight loss";

// Onboarding options
export const GOALS = [
  { value: 'lose_weight', label: 'Lose weight', icon: '🎯', description: 'Sustainable weight loss with healthy habits' },
  { value: 'maintain_weight', label: 'Maintain weight', icon: '⚖️', description: 'Keep your current weight stable' },
  { value: 'build_habits', label: 'Build habits', icon: '🌱', description: 'Develop consistent healthy routines' },
] as const;

export const ACTIVITY_LEVELS = [
  { value: 'low', label: 'Low', icon: '🧘', description: 'Mostly sedentary, light daily activities' },
  { value: 'medium', label: 'Medium', icon: '🚶', description: 'Regular walks, some exercise' },
  { value: 'high', label: 'High', icon: '🏃', description: 'Regular intense workouts' },
] as const;

export const FOOD_PREFERENCES = [
  { value: 'balanced', label: 'Balanced', icon: '🥗', description: 'Variety of foods, moderate portions' },
  { value: 'low_carb', label: 'Low Carb', icon: '🥑', description: 'Focus on proteins and healthy fats' },
] as const;

export const STRUGGLES = [
  { value: 'anxiety', label: 'Anxiety eating', icon: '😰', description: 'Eating when stressed or anxious' },
  { value: 'snacking', label: 'Snacking', icon: '🍪', description: 'Frequent snacking between meals' },
  { value: 'lack_of_routine', label: 'Lack of routine', icon: '📅', description: 'Irregular eating schedule' },
  { value: 'water_retention', label: 'Water retention', icon: '💧', description: 'Feeling bloated often' },
] as const;

export const TIME_SLOTS = [
  { value: 'morning', label: 'Morning', icon: '🌅', time: '6:00 - 12:00' },
  { value: 'lunch', label: 'Lunch', icon: '☀️', time: '12:00 - 14:00' },
  { value: 'afternoon', label: 'Afternoon', icon: '🌤️', time: '14:00 - 18:00' },
  { value: 'evening', label: 'Evening', icon: '🌙', time: '18:00 - 22:00' },
] as const;

// Default routine actions per time block
export const DEFAULT_ROUTINE_ACTIONS = {
  morning: [
    { title: 'Drink water', description: 'Start your day with a glass of water to hydrate your body', icon: '💧' },
    { title: 'Balanced breakfast', description: 'Include protein to stay full longer', icon: '🍳' },
  ],
  lunch: [
    { title: 'Mindful meal', description: 'Eat slowly and enjoy your food without distractions', icon: '🥗' },
    { title: 'Hydration check', description: 'Have you had enough water this morning?', icon: '💧' },
  ],
  afternoon: [
    { title: 'Healthy snack', description: 'Choose something nutritious if you\'re hungry', icon: '🍎' },
    { title: 'Calming tea', description: 'A warm tea can help with afternoon cravings', icon: '🍵' },
  ],
  evening: [
    { title: 'Light dinner', description: 'Keep it balanced and avoid heavy foods late', icon: '🥙' },
    { title: 'Wind down', description: 'Avoid eating 2-3 hours before bed', icon: '🌙' },
  ],
} as const;

// Tea recommendations based on goals/struggles
export const TEA_RECOMMENDATIONS = {
  anxiety: [
    { name: 'Chamomile', benefit: 'Calms the mind and reduces stress', timing: 'Afternoon or evening' },
    { name: 'Lavender', benefit: 'Promotes relaxation and better sleep', timing: 'Evening, before bed' },
    { name: 'Passionflower', benefit: 'Natural anxiety relief', timing: 'When feeling anxious' },
  ],
  water_retention: [
    { name: 'Dandelion', benefit: 'Natural diuretic, reduces bloating', timing: 'Morning or afternoon' },
    { name: 'Green tea', benefit: 'Supports metabolism and reduces water weight', timing: 'Morning' },
    { name: 'Hibiscus', benefit: 'Helps flush excess fluids', timing: 'Afternoon' },
  ],
  digestion: [
    { name: 'Peppermint', benefit: 'Soothes digestive discomfort', timing: 'After meals' },
    { name: 'Ginger', benefit: 'Aids digestion and reduces bloating', timing: 'Before or after meals' },
    { name: 'Fennel', benefit: 'Relieves gas and bloating', timing: 'After dinner' },
  ],
  metabolism: [
    { name: 'Green tea', benefit: 'Boosts metabolism naturally', timing: 'Morning or early afternoon' },
    { name: 'Oolong', benefit: 'Supports fat burning', timing: 'Before exercise' },
    { name: 'Cinnamon', benefit: 'Helps regulate blood sugar', timing: 'After meals' },
  ],
} as const;

// Reminder message templates
export const REMINDER_TEMPLATES = {
  meal: [
    "Time for your {meal}! Remember to include some protein. 🍽️",
    "It's {meal} time! Eat slowly and enjoy every bite.",
    "Gentle reminder: {meal} is calling! Make it balanced.",
  ],
  tea: [
    "Time for your calming tea 🍵",
    "A warm cup awaits you. Take a mindful break.",
    "Tea time! Let's pause and reset.",
  ],
  hydration: [
    "💧 Stay hydrated! Have you had water recently?",
    "Water break! Your body will thank you.",
    "Hydration check-in. How's your water intake today?",
  ],
  snacking: [
    "Late snacking urge? A warm tea can help.",
    "Feeling hungry? Try water first, then decide.",
    "Kitchen closed! Tomorrow is a fresh start. 🌙",
  ],
} as const;

// Time block styles for consistent UI
export const TIME_BLOCK_STYLES = {
  morning: {
    bg: 'bg-morning',
    text: 'text-morning-foreground',
    icon: '🌅',
    label: 'Morning',
  },
  lunch: {
    bg: 'bg-lunch',
    text: 'text-lunch-foreground',
    icon: '☀️',
    label: 'Lunch',
  },
  afternoon: {
    bg: 'bg-afternoon',
    text: 'text-afternoon-foreground',
    icon: '🌤️',
    label: 'Afternoon',
  },
  evening: {
    bg: 'bg-evening',
    text: 'text-evening-foreground',
    icon: '🌙',
    label: 'Evening',
  },
} as const;

export type Goal = typeof GOALS[number]['value'];
export type ActivityLevel = typeof ACTIVITY_LEVELS[number]['value'];
export type FoodPreference = typeof FOOD_PREFERENCES[number]['value'];
export type Struggle = typeof STRUGGLES[number]['value'];
export type TimeBlock = typeof TIME_SLOTS[number]['value'];