import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserData, EMPTY_ACHIEVEMENTS } from '../../models/user.model';
import { GamificationService } from '../../services/gamification.service';
import { Achievement } from '../../models/gamification.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="space-y-6 max-w-6xl mx-auto">
      <!-- Header with Level and Progress -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div class="flex items-center gap-6">
          <!-- Avatar -->
          <div class="relative">
            <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl">
              {{ getChefHat() }}
            </div>
            <div class="absolute -bottom-2 -right-2 bg-yellow-400 text-gray-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm border-4 border-white">
              {{ currentLevel }}
            </div>
          </div>
          
          <!-- Level Info -->
          <div class="flex-1">
            <h2 class="text-3xl font-bold mb-2">{{ getUserName() }}</h2>
            <div class="text-lg opacity-90 mb-3">
              {{ getLevelTitle() | translate }}
            </div>
            
            <!-- Progress Bar -->
            <div class="bg-white bg-opacity-20 rounded-full h-4 overflow-hidden">
              <div 
                class="bg-yellow-400 h-full transition-all duration-500 rounded-full"
                [style.width.%]="progressToNextLevel">
              </div>
            </div>
            <div class="text-sm mt-1 opacity-80">
              {{ currentPoints }} / {{ nextLevelPoints }} {{ 'profile_points' | translate }}
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <div class="text-3xl mb-2">🔥</div>
          <div class="text-2xl font-bold text-gray-800">{{ currentStreak }}</div>
          <div class="text-sm text-gray-600">{{ 'profile_current_streak' | translate }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <div class="text-3xl mb-2">👨‍🍳</div>
          <div class="text-2xl font-bold text-gray-800">{{ recipesCooked }}</div>
          <div class="text-sm text-gray-600">{{ 'profile_recipes_cooked' | translate }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <div class="text-3xl mb-2">🏆</div>
          <div class="text-2xl font-bold text-gray-800">{{ unlockedCount }}</div>
          <div class="text-sm text-gray-600">{{ 'profile_achievements' | translate }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 text-center">
          <div class="text-3xl mb-2">📅</div>
          <div class="text-2xl font-bold text-gray-800">{{ mealPlansCreated }}</div>
          <div class="text-sm text-gray-600">{{ 'profile_meal_plans' | translate }}</div>
        </div>
      </div>

      <!-- Weekly Challenge -->
      @if (weeklyChallenge) {
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>{{ weeklyChallenge.icon }}</span>
            {{ 'profile_weekly_challenge' | translate }}
          </h3>
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-2">
              <span class="font-semibold">{{ weeklyChallenge.titleKey | translate }}</span>
              <span class="text-gray-600">{{ weeklyChallenge.progress }} / {{ weeklyChallenge.target }}</span>
            </div>
            <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                class="bg-green-500 h-full transition-all duration-500"
                [style.width.%]="getChallengeProgress()">
              </div>
            </div>
          </div>
          <p class="text-sm text-gray-600">{{ weeklyChallenge.descriptionKey | translate }}</p>
          @if (weeklyChallenge.completed) {
            <div class="mt-4 bg-green-100 text-green-800 p-3 rounded-lg font-semibold text-center">
              ✅ {{ 'profile_challenge_completed' | translate }}
            </div>
          }
        </div>
      }

      <!-- Achievements Section -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">{{ 'profile_achievements_title' | translate }}</h3>
        
        <!-- Unlocked Achievements -->
        @if (unlockedAchievements.length > 0) {
          <div class="mb-8">
            <h4 class="text-lg font-semibold text-gray-700 mb-4">{{ 'profile_unlocked' | translate }}</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (achievement of unlockedAchievements; track achievement.id) {
                <div class="border-2 border-green-500 bg-green-50 rounded-lg p-4 relative">
                  <div class="absolute top-2 right-2 text-green-600">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="text-4xl mb-2">{{ achievement.icon }}</div>
                  <h5 class="font-bold text-gray-800 mb-1">{{ achievement.titleKey | translate }}</h5>
                  <p class="text-sm text-gray-600 mb-2">{{ achievement.descriptionKey | translate }}</p>
                  <div class="text-xs font-semibold text-green-600">+{{ achievement.points }} {{ 'profile_points' | translate }}</div>
                </div>
              }
            </div>
          </div>
        }
        
        <!-- Locked Achievements -->
        @if (lockedAchievements.length > 0) {
          <div>
            <h4 class="text-lg font-semibold text-gray-700 mb-4">{{ 'profile_locked' | translate }}</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (achievement of lockedAchievements; track achievement.id) {
                <div class="border-2 border-gray-300 bg-gray-50 rounded-lg p-4 opacity-75 relative">
                  <div class="absolute top-2 right-2 text-gray-400">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="text-4xl mb-2 grayscale">{{ achievement.icon }}</div>
                  <h5 class="font-bold text-gray-600 mb-1">{{ achievement.titleKey | translate }}</h5>
                  <p class="text-sm text-gray-500 mb-2">{{ achievement.descriptionKey | translate }}</p>
                  
                  <!-- Progress Bar -->
                  <div class="mb-2">
                    <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        class="bg-indigo-500 h-full transition-all duration-500"
                        [style.width.%]="getAchievementProgress(achievement)">
                      </div>
                    </div>
                  </div>
                  
                  <div class="text-xs font-semibold text-gray-500">+{{ achievement.points }} {{ 'profile_points' | translate }}</div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Privacy Policy Link -->
      <div class="bg-white rounded-xl shadow-lg p-6 text-center">
        <button 
          (click)="viewPrivacyPolicy.emit()" 
          class="text-indigo-600 hover:text-indigo-800 underline transition-colors font-medium">
          Política de Privacidad
        </button>
      </div>
    </div>
  `
})
export class ProfileComponent {
  @Input() userData: UserData | null = null;
  @Output() viewPrivacyPolicy = new EventEmitter<void>();
  
  private gamificationService = inject(GamificationService);
  
  get achievements() {
    return this.userData?.achievements || EMPTY_ACHIEVEMENTS;
  }
  
  get currentLevel() {
    return this.userData?.level || 1;
  }
  
  get currentPoints() {
    return this.userData?.points || 0;
  }
  
  get currentStreak() {
    return this.achievements.currentStreak;
  }
  
  get recipesCooked() {
    return this.achievements.recipesCooked;
  }
  
  get mealPlansCreated() {
    return this.achievements.mealPlansCreated;
  }
  
  get weeklyChallenge() {
    return this.achievements.weeklyChallenge;
  }
  
  get unlockedAchievements(): Achievement[] {
    return this.gamificationService.getUnlockedAchievements(this.achievements.unlockedAchievements);
  }
  
  get lockedAchievements(): Achievement[] {
    return this.gamificationService.getLockedAchievements(this.achievements.unlockedAchievements);
  }
  
  get unlockedCount() {
    return this.achievements.unlockedAchievements.length;
  }
  
  get progressToNextLevel() {
    return this.gamificationService.getProgressToNextLevel(this.currentPoints);
  }
  
  get nextLevelPoints() {
    const levelInfo = this.gamificationService.getLevelInfo(this.currentPoints);
    return levelInfo.maxPoints;
  }
  
  getUserName() {
    return this.userData?.email?.split('@')[0] || 'Guest Chef';
  }
  
  getLevelTitle(): string {
    const levelInfo = this.gamificationService.getLevelInfo(this.currentPoints);
    return levelInfo.titleKey;
  }
  
  getChefHat(): string {
    if (this.currentLevel >= 31) return '👑';
    if (this.currentLevel >= 21) return '⭐';
    if (this.currentLevel >= 11) return '👨‍🍳';
    if (this.currentLevel >= 6) return '🧑‍🍳';
    return '👶';
  }
  
  getChallengeProgress(): number {
    if (!this.weeklyChallenge) return 0;
    return Math.min(100, (this.weeklyChallenge.progress / this.weeklyChallenge.target) * 100);
  }
  
  getAchievementProgress(achievement: Achievement): number {
    return this.gamificationService.getAchievementProgress(achievement, this.achievements);
  }
}
