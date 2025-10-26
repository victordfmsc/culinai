export interface Achievement {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  tier: 'beginner' | 'experienced' | 'master';
  points: number;
  requirement: number;
  type: 'recipes_cooked' | 'recipes_generated' | 'meal_plans' | 'shopping_items' | 
        'streak_days' | 'languages_used' | 'portions_adjusted' | 'premium_subscription';
}

export interface WeeklyChallenge {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  points: number;
  progress: number;
  target: number;
  completed: boolean;
  weekStartDate: Date;
}

export interface UserAchievements {
  unlockedAchievements: string[];
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  recipesCooked: number;
  recipesGenerated: number;
  mealPlansCreated: number;
  shoppingItemsAdded: number;
  languagesUsed: string[];
  portionsAdjusted: number;
  weeklyChallenge?: WeeklyChallenge;
}

export interface LevelInfo {
  level: number;
  titleKey: string;
  minPoints: number;
  maxPoints: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Beginner Tier
  {
    id: 'first_meal_plan',
    titleKey: 'achievement_first_step_title',
    descriptionKey: 'achievement_first_step_desc',
    icon: '📋',
    tier: 'beginner',
    points: 50,
    requirement: 1,
    type: 'meal_plans'
  },
  {
    id: 'smart_shopper',
    titleKey: 'achievement_smart_shopper_title',
    descriptionKey: 'achievement_smart_shopper_desc',
    icon: '🛒',
    tier: 'beginner',
    points: 50,
    requirement: 5,
    type: 'shopping_items'
  },
  {
    id: 'explorer',
    titleKey: 'achievement_explorer_title',
    descriptionKey: 'achievement_explorer_desc',
    icon: '🔍',
    tier: 'beginner',
    points: 50,
    requirement: 10,
    type: 'recipes_generated'
  },
  
  // Experienced Tier
  {
    id: 'planner_pro',
    titleKey: 'achievement_planner_pro_title',
    descriptionKey: 'achievement_planner_pro_desc',
    icon: '📅',
    tier: 'experienced',
    points: 100,
    requirement: 7,
    type: 'meal_plans'
  },
  {
    id: 'multilingual',
    titleKey: 'achievement_multilingual_title',
    descriptionKey: 'achievement_multilingual_desc',
    icon: '🌍',
    tier: 'experienced',
    points: 100,
    requirement: 3,
    type: 'languages_used'
  },
  {
    id: 'portion_master',
    titleKey: 'achievement_portion_master_title',
    descriptionKey: 'achievement_portion_master_desc',
    icon: '⚖️',
    tier: 'experienced',
    points: 100,
    requirement: 20,
    type: 'portions_adjusted'
  },
  {
    id: 'active_cook',
    titleKey: 'achievement_active_cook_title',
    descriptionKey: 'achievement_active_cook_desc',
    icon: '👨‍🍳',
    tier: 'experienced',
    points: 150,
    requirement: 25,
    type: 'recipes_cooked'
  },
  
  // Master Tier
  {
    id: 'streak_master',
    titleKey: 'achievement_streak_master_title',
    descriptionKey: 'achievement_streak_master_desc',
    icon: '🔥',
    tier: 'master',
    points: 500,
    requirement: 30,
    type: 'streak_days'
  },
  {
    id: 'collector',
    titleKey: 'achievement_collector_title',
    descriptionKey: 'achievement_collector_desc',
    icon: '⭐',
    tier: 'master',
    points: 500,
    requirement: 100,
    type: 'recipes_cooked'
  },
  {
    id: 'premium_chef',
    titleKey: 'achievement_premium_chef_title',
    descriptionKey: 'achievement_premium_chef_desc',
    icon: '👑',
    tier: 'master',
    points: 200,
    requirement: 1,
    type: 'premium_subscription'
  }
];

export const LEVEL_TIERS: LevelInfo[] = [
  { level: 1, titleKey: 'level_apprentice', minPoints: 0, maxPoints: 100 },
  { level: 2, titleKey: 'level_apprentice', minPoints: 100, maxPoints: 200 },
  { level: 3, titleKey: 'level_apprentice', minPoints: 200, maxPoints: 300 },
  { level: 4, titleKey: 'level_apprentice', minPoints: 300, maxPoints: 400 },
  { level: 5, titleKey: 'level_apprentice', minPoints: 400, maxPoints: 500 },
  { level: 6, titleKey: 'level_home_cook', minPoints: 500, maxPoints: 700 },
  { level: 7, titleKey: 'level_home_cook', minPoints: 700, maxPoints: 900 },
  { level: 8, titleKey: 'level_home_cook', minPoints: 900, maxPoints: 1100 },
  { level: 9, titleKey: 'level_home_cook', minPoints: 1100, maxPoints: 1300 },
  { level: 10, titleKey: 'level_home_cook', minPoints: 1300, maxPoints: 1500 },
  { level: 11, titleKey: 'level_professional', minPoints: 1500, maxPoints: 2000 },
  { level: 12, titleKey: 'level_professional', minPoints: 2000, maxPoints: 2500 },
  { level: 13, titleKey: 'level_professional', minPoints: 2500, maxPoints: 3000 },
  { level: 14, titleKey: 'level_professional', minPoints: 3000, maxPoints: 3500 },
  { level: 15, titleKey: 'level_professional', minPoints: 3500, maxPoints: 4000 },
  { level: 16, titleKey: 'level_professional', minPoints: 4000, maxPoints: 4250 },
  { level: 17, titleKey: 'level_professional', minPoints: 4250, maxPoints: 4500 },
  { level: 18, titleKey: 'level_professional', minPoints: 4500, maxPoints: 4750 },
  { level: 19, titleKey: 'level_professional', minPoints: 4750, maxPoints: 5000 },
  { level: 20, titleKey: 'level_professional', minPoints: 5000, maxPoints: 5500 },
  { level: 21, titleKey: 'level_master', minPoints: 5500, maxPoints: 6500 },
  { level: 22, titleKey: 'level_master', minPoints: 6500, maxPoints: 7500 },
  { level: 23, titleKey: 'level_master', minPoints: 7500, maxPoints: 8500 },
  { level: 24, titleKey: 'level_master', minPoints: 8500, maxPoints: 9500 },
  { level: 25, titleKey: 'level_master', minPoints: 9500, maxPoints: 10500 },
  { level: 26, titleKey: 'level_master', minPoints: 10500, maxPoints: 11500 },
  { level: 27, titleKey: 'level_master', minPoints: 11500, maxPoints: 12500 },
  { level: 28, titleKey: 'level_master', minPoints: 12500, maxPoints: 13500 },
  { level: 29, titleKey: 'level_master', minPoints: 13500, maxPoints: 14500 },
  { level: 30, titleKey: 'level_master', minPoints: 14500, maxPoints: 15000 },
  { level: 31, titleKey: 'level_legend', minPoints: 15000, maxPoints: 999999 }
];

export const WEEKLY_CHALLENGES = [
  {
    id: 'quick_cook',
    titleKey: 'challenge_quick_cook_title',
    descriptionKey: 'challenge_quick_cook_desc',
    icon: '⚡',
    points: 30,
    target: 3
  },
  {
    id: 'meal_planner',
    titleKey: 'challenge_meal_planner_title',
    descriptionKey: 'challenge_meal_planner_desc',
    icon: '📋',
    points: 30,
    target: 7
  },
  {
    id: 'shopping_efficient',
    titleKey: 'challenge_shopping_efficient_title',
    descriptionKey: 'challenge_shopping_efficient_desc',
    icon: '✅',
    points: 30,
    target: 10
  }
];
