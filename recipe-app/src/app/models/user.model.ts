export interface ShoppingItem {
  text: string;
  checked: boolean;
  quantity?: number;
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

export interface UserData {
  uid: string;
  email: string;
  points: number;
  level: number;
  mealPlan: MealPlan;
  shoppingList: ShoppingItem[];
  createdAt: Date;
}
