import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingService } from '../../services/onboarding.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    @if (onboardingService.showOnboarding()) {
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
          
          @if (currentSlide() > 0) {
            <button 
              (click)="skip()"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {{ 'onboarding_skip' | translate }}
            </button>
          }

          <div class="transition-all duration-300">
            @switch (currentSlide()) {
              @case (0) {
                <div class="text-center">
                  <div class="text-6xl mb-6">🌍</div>
                  <h2 class="text-3xl font-bold text-gray-800 mb-3">
                    {{ 'onboarding_language_title' | translate }}
                  </h2>
                  <p class="text-gray-600 mb-8">
                    {{ 'onboarding_language_subtitle' | translate }}
                  </p>
                  
                  <div class="grid gap-3">
                    <button
                      (click)="selectLanguage('en')"
                      class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <span class="text-3xl">🇬🇧</span>
                      <span class="text-lg font-semibold text-gray-700 group-hover:text-blue-700">English</span>
                    </button>
                    
                    <button
                      (click)="selectLanguage('es')"
                      class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <span class="text-3xl">🇪🇸</span>
                      <span class="text-lg font-semibold text-gray-700 group-hover:text-blue-700">Español</span>
                    </button>
                    
                    <button
                      (click)="selectLanguage('fr')"
                      class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <span class="text-3xl">🇫🇷</span>
                      <span class="text-lg font-semibold text-gray-700 group-hover:text-blue-700">Français</span>
                    </button>
                    
                    <button
                      (click)="selectLanguage('de')"
                      class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <span class="text-3xl">🇩🇪</span>
                      <span class="text-lg font-semibold text-gray-700 group-hover:text-blue-700">Deutsch</span>
                    </button>
                    
                    <button
                      (click)="selectLanguage('it')"
                      class="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <span class="text-3xl">🇮🇹</span>
                      <span class="text-lg font-semibold text-gray-700 group-hover:text-blue-700">Italiano</span>
                    </button>
                  </div>
                </div>
              }
              @case (1) {
                <div class="text-center">
                  <div class="text-6xl mb-4">👨‍🍳</div>
                  <h2 class="text-3xl font-bold text-gray-800 mb-4">
                    {{ 'onboarding_welcome_title' | translate }}
                  </h2>
                  <p class="text-gray-600 text-lg">
                    {{ 'onboarding_welcome_desc' | translate }}
                  </p>
                </div>
              }
              @case (2) {
                <div class="text-center">
                  <div class="text-6xl mb-4">🧊</div>
                  <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    {{ 'onboarding_fridge_title' | translate }}
                  </h2>
                  <p class="text-gray-600">
                    {{ 'onboarding_fridge_desc' | translate }}
                  </p>
                  <div class="mt-6 bg-blue-50 p-4 rounded-lg">
                    <div class="flex items-center justify-center gap-2 text-sm text-blue-700">
                      <span>🥔 🍅 🧅</span>
                      <span>→</span>
                      <span class="font-semibold">🤖 AI</span>
                      <span>→</span>
                      <span>🍲 10 {{ 'onboarding_recipes' | translate }}</span>
                    </div>
                  </div>
                </div>
              }
              @case (3) {
                <div class="text-center">
                  <div class="text-6xl mb-4">📅</div>
                  <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    {{ 'onboarding_plan_title' | translate }}
                  </h2>
                  <p class="text-gray-600 mb-4">
                    {{ 'onboarding_plan_desc' | translate }}
                  </p>
                  <div class="flex gap-4 justify-center items-center text-sm">
                    <div class="bg-purple-50 p-3 rounded-lg">
                      <div class="text-2xl mb-1">📋</div>
                      <div class="text-purple-700 font-semibold">{{ 'onboarding_meal_plan' | translate }}</div>
                    </div>
                    <div class="text-2xl">+</div>
                    <div class="bg-green-50 p-3 rounded-lg">
                      <div class="text-2xl mb-1">🛒</div>
                      <div class="text-green-700 font-semibold">{{ 'onboarding_shopping' | translate }}</div>
                    </div>
                  </div>
                </div>
              }
              @case (4) {
                <div class="text-center">
                  <div class="text-6xl mb-4">🏆</div>
                  <h2 class="text-2xl font-bold text-gray-800 mb-4">
                    {{ 'onboarding_gamification_title' | translate }}
                  </h2>
                  <p class="text-gray-600 mb-4">
                    {{ 'onboarding_gamification_desc' | translate }}
                  </p>
                  <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                    <div class="flex justify-center gap-3 text-2xl">
                      <span>⭐</span>
                      <span>🎯</span>
                      <span>📈</span>
                      <span>🔥</span>
                    </div>
                    <p class="text-sm text-orange-700 font-semibold mt-2">
                      {{ 'onboarding_gamification_features' | translate }}
                    </p>
                  </div>
                </div>
              }
            }
          </div>

          @if (currentSlide() > 0) {
            <div class="flex justify-center gap-2 my-6">
              @for (i of [1, 2, 3, 4]; track i) {
                <div 
                  class="w-2 h-2 rounded-full transition-all duration-300"
                  [class.bg-blue-600]="i === currentSlide()"
                  [class.w-6]="i === currentSlide()"
                  [class.bg-gray-300]="i !== currentSlide()"
                ></div>
              }
            </div>

            <div class="flex justify-between items-center">
              @if (currentSlide() > 1) {
                <button
                  (click)="previousSlide()"
                  class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← {{ 'onboarding_back' | translate }}
                </button>
              } @else {
                <div></div>
              }

              @if (currentSlide() < 4) {
                <button
                  (click)="nextSlide()"
                  class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  {{ 'onboarding_next' | translate }} →
                </button>
              } @else {
                <button
                  (click)="complete()"
                  class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors font-semibold"
                >
                  {{ 'onboarding_start' | translate }} 🚀
                </button>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
  `]
})
export class OnboardingComponent {
  onboardingService = inject(OnboardingService);
  translationService = inject(TranslationService);
  currentSlide = signal(0);

  selectLanguage(lang: 'en' | 'es' | 'fr' | 'de' | 'it'): void {
    this.translationService.setLanguage(lang);
    // Auto-advance to next slide after selecting language
    setTimeout(() => {
      this.nextSlide();
    }, 200);
  }

  nextSlide(): void {
    if (this.currentSlide() < 4) {
      this.currentSlide.update(val => val + 1);
    }
  }

  previousSlide(): void {
    if (this.currentSlide() > 0) {
      this.currentSlide.update(val => val - 1);
    }
  }

  skip(): void {
    this.onboardingService.completeOnboarding();
  }

  complete(): void {
    this.onboardingService.completeOnboarding();
  }
}
