import { UserAchievements, WeeklyChallenge } from './gamification.model';

export interface ShoppingItem {
  text: string;
  checked: boolean;
  quantity?: number;
  unit?: string;
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
