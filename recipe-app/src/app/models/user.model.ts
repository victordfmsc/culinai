import { UserAchievements, WeeklyChallenge } from './gamification.model';

export interface ShoppingItem {
  text: string;
  checked: boolean;
  quantity?: number;
  unit?: string;
}

export interface PlannedMeal {
  recipeName: string;
  servings: number;
  recipeData?: any;
}

export interface DayMeals {
  breakfast: PlannedMeal | null;
  lunch: PlannedMeal | null;
  dinner: PlannedMeal | null;
}

export interface MealPlanV2 {
  monday: DayMeals;
  tuesday: DayMeals;
  wednesday: DayMeals;
  thursday: DayMeals;
  friday: DayMeals;
  saturday: DayMeals;
  sunday: DayMeals;
}

export interface MealPlan {
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
  sunday: string[];
}

export const DAYS_OF_WEEK_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;
export type MealType = typeof MEAL_TYPES[number];

export const EMPTY_DAY_MEALS: DayMeals = {
  breakfast: null,
  lunch: null,
  dinner: null
};

export const EMPTY_MEAL_PLAN_V2: MealPlanV2 = {
  monday: { ...EMPTY_DAY_MEALS },
  tuesday: { ...EMPTY_DAY_MEALS },
  wednesday: { ...EMPTY_DAY_MEALS },
  thursday: { ...EMPTY_DAY_MEALS },
  friday: { ...EMPTY_DAY_MEALS },
  saturday: { ...EMPTY_DAY_MEALS },
  sunday: { ...EMPTY_DAY_MEALS }
};

export const EMPTY_MEAL_PLAN: MealPlan = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: []
};

export interface SubscriptionData {
  isPremium: boolean;
  expirationDate?: Date | null;
  productIdentifier?: string | null;
  lastUpdated: Date;
}

export interface UserData {
  uid: string;
  email: string;
  points: number;
  level: number;
  mealPlan: MealPlan;
  mealPlanV2?: MealPlanV2;
  shoppingList: ShoppingItem[];
  createdAt: Date;
  achievements?: UserAchievements;
  subscription?: SubscriptionData;
}

export const EMPTY_ACHIEVEMENTS: UserAchievements = {
  unlockedAchievements: [],
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: new Date(),
  recipesCooked: 0,
  recipesGenerated: 0,
  mealPlansCreated: 0,
  shoppingItemsAdded: 0,
  languagesUsed: [],
  portionsAdjusted: 0,
  premiumSubscribed: 0,
  weeklyChallenge: undefined
};
