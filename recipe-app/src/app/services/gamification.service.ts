import { Injectable, signal } from '@angular/core';
import { Achievement, ACHIEVEMENTS, UserAchievements, WeeklyChallenge, WEEKLY_CHALLENGES, LEVEL_TIERS, LevelInfo } from '../models/gamification.model';

export interface AchievementUnlocked {
  achievement: Achievement;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private recentlyUnlocked = signal<AchievementUnlocked[]>([]);
  
  getRecentlyUnlocked() {
    return this.recentlyUnlocked();
  }
  
  clearRecentlyUnlocked() {
    this.recentlyUnlocked.set([]);
  }

  calculateLevel(points: number): number {
    const tier = LEVEL_TIERS.find(t => points >= t.minPoints && points <= t.maxPoints);
    return tier ? tier.level : 31;
  }

  getLevelInfo(points: number): LevelInfo {
    const tier = LEVEL_TIERS.find(t => points >= t.minPoints && points <= t.maxPoints);
    return tier || LEVEL_TIERS[LEVEL_TIERS.length - 1];
  }

  getProgressToNextLevel(points: number): number {
    const currentLevel = this.getLevelInfo(points);
    const progress = points - currentLevel.minPoints;
    const total = currentLevel.maxPoints - currentLevel.minPoints;
    return Math.min(100, (progress / total) * 100);
  }

  checkAchievements(userAchievements: UserAchievements): Achievement[] {
    const newAchievements: Achievement[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      if (userAchievements.unlockedAchievements.includes(achievement.id)) {
        continue;
      }
      
      let currentValue = 0;
      
      switch (achievement.type) {
        case 'recipes_cooked':
          currentValue = userAchievements.recipesCooked;
          break;
        case 'recipes_generated':
          currentValue = userAchievements.recipesGenerated;
          break;
        case 'meal_plans':
          currentValue = userAchievements.mealPlansCreated;
          break;
        case 'shopping_items':
          currentValue = userAchievements.shoppingItemsAdded;
          break;
        case 'streak_days':
          currentValue = userAchievements.currentStreak;
          break;
        case 'languages_used':
          currentValue = userAchievements.languagesUsed.length;
          break;
        case 'portions_adjusted':
          currentValue = userAchievements.portionsAdjusted;
          break;
        case 'premium_subscription':
          currentValue = 0;
          break;
      }
      
      if (currentValue >= achievement.requirement) {
        newAchievements.push(achievement);
      }
    }
    
    if (newAchievements.length > 0) {
      const current = this.recentlyUnlocked();
      this.recentlyUnlocked.set([
        ...current,
        ...newAchievements.map(a => ({ achievement: a, timestamp: new Date() }))
      ]);
    }
    
    return newAchievements;
  }

  updateStreak(lastActiveDate: Date, currentStreak: number): { 
    newStreak: number; 
    streakBonus: number 
  } {
    const now = new Date();
    const lastActive = new Date(lastActiveDate);
    
    const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    let newStreak = currentStreak;
    let streakBonus = 0;
    
    if (daysDiff === 0) {
      newStreak = currentStreak;
    } else if (daysDiff === 1) {
      newStreak = currentStreak + 1;
      
      if (newStreak === 7) {
        streakBonus = 100;
      } else if (newStreak === 30) {
        streakBonus = 500;
      } else if (newStreak % 7 === 0) {
        streakBonus = 50;
      }
    } else {
      newStreak = 1;
    }
    
    return { newStreak, streakBonus };
  }

  generateWeeklyChallenge(): WeeklyChallenge {
    const challenges = WEEKLY_CHALLENGES;
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    return {
      ...randomChallenge,
      progress: 0,
      completed: false,
      weekStartDate: new Date()
    };
  }

  shouldResetWeeklyChallenge(challengeStartDate: Date): boolean {
    const now = new Date();
    const start = new Date(challengeStartDate);
    const daysDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 7;
  }

  getAchievementById(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
  }

  getUnlockedAchievements(achievementIds: string[]): Achievement[] {
    return achievementIds
      .map(id => this.getAchievementById(id))
      .filter((a): a is Achievement => a !== undefined);
  }

  getLockedAchievements(achievementIds: string[]): Achievement[] {
    return ACHIEVEMENTS.filter(a => !achievementIds.includes(a.id));
  }

  getAchievementProgress(achievement: Achievement, userAchievements: UserAchievements): number {
    let currentValue = 0;
    
    switch (achievement.type) {
      case 'recipes_cooked':
        currentValue = userAchievements.recipesCooked;
        break;
      case 'recipes_generated':
        currentValue = userAchievements.recipesGenerated;
        break;
      case 'meal_plans':
        currentValue = userAchievements.mealPlansCreated;
        break;
      case 'shopping_items':
        currentValue = userAchievements.shoppingItemsAdded;
        break;
      case 'streak_days':
        currentValue = userAchievements.currentStreak;
        break;
      case 'languages_used':
        currentValue = userAchievements.languagesUsed.length;
        break;
      case 'portions_adjusted':
        currentValue = userAchievements.portionsAdjusted;
        break;
    }
    
    return Math.min(100, (currentValue / achievement.requirement) * 100);
  }
}
