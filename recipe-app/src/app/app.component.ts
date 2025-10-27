import { Component, ChangeDetectionStrategy, signal, inject, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeComponent } from './components/home/home.component';
import { FridgeComponent } from './components/fridge/fridge.component';
import { SuggestionsComponent } from './components/suggestions/suggestions.component';
import { ShoppingListComponent } from './components/shopping-list/shopping-list.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NotificationComponent } from './components/notification/notification.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { NotificationService } from './services/notification.service';
import { PaywallComponent } from './components/paywall/paywall.component';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';

import { GeminiService, Recipe } from './services/gemini.service';
import { SubscriptionService } from './services/subscription.service';
import { FirestoreService } from './services/firestore.service';
import { AuthService } from './services/auth.service';
import { TranslationService } from './services/translation.service';
import { GamificationService } from './services/gamification.service';
import { MealPlan, ShoppingItem, EMPTY_MEAL_PLAN, DAYS_OF_WEEK_KEYS, EMPTY_ACHIEVEMENTS } from './models/user.model';
import { TranslatePipe } from './pipes/translate.pipe';


type View = 'home' | 'fridge' | 'suggestions' | 'shopping' | 'profile';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HomeComponent,
    FridgeComponent,
    SuggestionsComponent,
    ShoppingListComponent,
    ProfileComponent,
    NotificationComponent,
    OnboardingComponent,
    PaywallComponent,
    LanguageSelectorComponent,
    TranslatePipe,
  ],
  template: `
    <app-onboarding />
    
    @if (isAuthenticated()) {
      <div class="min-h-screen bg-gray-100 font-sans flex flex-col">
        <header class="bg-white shadow-md sticky top-0 z-10">
          <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <svg class="h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
              <h1 class="text-2xl font-bold text-gray-800">{{ 'app_title' | translate }}</h1>
            </div>
            <div class="flex items-center space-x-2">
              <div class="text-sm text-gray-600 text-right hidden sm:block">
                <span class="font-semibold">{{ points() }} {{ 'points' | translate }}</span> | {{ 'level' | translate }} {{ level() }}
              </div>
              <app-language-selector />
              <button (click)="logout()" class="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700" [title]="'logout' | translate">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main class="flex-grow container mx-auto p-4 md:p-6">
          @switch (currentView()) {
            @case ('home') {
              <app-home 
                [points]="points()" 
                [level]="level()" 
                [levelProgress]="levelProgress()" 
                [nextLevelPoints]="pointsForNextLevel()"
                [mealPlan]="mealPlan()"
                (dayClicked)="onCalendarDaySelected($event)"
                (recipeRemoved)="onRemoveRecipeFromPlan($event)" />
            }
            @case ('fridge') {
              <app-fridge (findRecipes)="handleFindRecipesRequest($event)" />
            }
            @case ('suggestions') {
              <app-suggestions 
                [recipes]="recipes()"
                [isLoading]="isLoadingRecipes()"
                (cookRecipe)="onStartCooking($event)"
                (planRecipeRequest)="onPlanRecipeRequest($event)"
                (addToShoppingList)="onAddToShoppingList($event)" />
            }
            @case ('shopping') {
              <app-shopping-list 
                [listItems]="shoppingList()"
                (listChanged)="shoppingList.set($event)" />
            }
            @case ('profile') {
              <app-profile 
                [userData]="userData()" />
            }
          }
        </main>

        <nav class="sticky bottom-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
          <div class="container mx-auto flex justify-around">
            <button [class]="navButtonClass('home')" (click)="changeView('home')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span class="text-xs">{{ 'nav_home' | translate }}</span>
            </button>
            <button [class]="navButtonClass('fridge')" (click)="changeView('fridge')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="2" ry="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span class="text-xs">{{ 'nav_fridge' | translate }}</span>
            </button>
            <button [class]="navButtonClass('suggestions')" (click)="changeView('suggestions')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              <span class="text-xs">{{ 'nav_recipes' | translate }}</span>
            </button>
            <button [class]="navButtonClass('shopping')" (click)="changeView('shopping')">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <span class="text-xs">{{ 'nav_shopping' | translate }}</span>
            </button>
            <button [class]="navButtonClass('profile')" (click)="changeView('profile')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span class="text-xs">{{ 'nav_profile' | translate }}</span>
            </button>
          </div>
        </nav>

        @if (showPaywall()) {
          <app-paywall 
            (purchaseSuccess)="onPurchaseSuccess()"
            (close)="showPaywall.set(false)" />
        }

        <app-notifications />

        @if (planningRecipe(); as recipe) {
          <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
            <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
              <h3 class="text-xl font-semibold mb-2">{{ 'modal_plan_recipe_title' | translate }}</h3>
              <p class="text-gray-600 mb-6">{{ 'modal_plan_recipe_prompt' | translate: { title: recipe.title } }}</p>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                @for (day of daysOfWeek; track day) {
                  <button (click)="assignRecipeToDay(day)" class="p-3 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {{ 'day_' + day | translate }}
                  </button>
                }
              </div>
              <div class="mt-6 text-right">
                <button (click)="cancelPlanning()" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">
                  {{ 'cancel' | translate }}
                </button>
              </div>
            </div>
          </div>
        }

        @if (isSelectingForDay(); as selection) {
          <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
            <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4 transform transition-all duration-300 scale-100 flex flex-col">
              <h3 class="text-xl font-semibold mb-2">{{ 'modal_select_recipe_title' | translate: { day: ('day_' + selection.day | translate) } }}</h3>
              
              @if (recipes().length > 0) {
                <p class="text-gray-600 mb-4">{{ 'modal_select_recipe_prompt' | translate }}</p>
                <div class="space-y-3 max-h-80 overflow-y-auto pr-2 -mr-2">
                  @for (recipe of recipes(); track recipe.title) {
                    <button (click)="selectRecipeForDay(recipe)" class="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <span class="font-semibold">{{ recipe.title }}</span>
                      <p class="text-xs text-gray-500">{{ recipe.description }}</p>
                    </button>
                  }
                </div>
              } @else {
                <div class="text-center py-6">
                  <p class="text-gray-600">{{ 'modal_select_recipe_empty' | translate }}</p>
                  <p class="text-sm text-gray-400 mt-1">{{ 'modal_select_recipe_empty_cta' | translate }}</p>
                </div>
              }

              <div class="mt-6 text-right">
                <button (click)="isSelectingForDay.set(null)" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">
                  {{ 'cancel' | translate }}
                </button>
              </div>
            </div>
          </div>
        }

        @if (cookingRecipe(); as recipe) {
          <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
            <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl mx-4 transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]">
              <div class="flex justify-between items-center border-b pb-3 mb-4">
                  <h3 class="text-2xl font-bold text-gray-800">{{ recipe.title }}</h3>
                  <button (click)="onCancelCooking()" class="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>
              
              <div class="overflow-y-auto pr-2 -mr-2 space-y-6">
                  <p class="text-gray-600">{{ recipe.description }}</p>
                  
                  @if (recipe.tags && recipe.tags.length > 0) {
                    <div class="flex flex-wrap gap-2">
                      @for (tag of recipe.tags; track tag) {
                        <span [class]="getTagClass(tag)" class="px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-1.5">
                          <span>{{ getTagIcon(tag) }}</span>
                          <span>{{ translateTag(tag) }}</span>
                        </span>
                      }
                    </div>
                  }

                  <div class="flex justify-around text-center text-sm text-gray-700">
                      <div class="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <div>
                              <div class="font-semibold">{{ 'recipe_time' | translate }}</div>
                              <div>{{ recipe.prepTime }}</div>
                          </div>
                      </div>
                      <div class="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          <div>
                              <div class="font-semibold">{{ 'recipe_servings' | translate }}</div>
                              <div>{{ adjustedServings() }}</div>
                          </div>
                      </div>
                  </div>
                  
                  @if (recipe.nutrition) {
                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 class="text-sm font-semibold text-orange-900 mb-3">{{ 'nutrition_per_serving' | translate }}</h4>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        @if (recipe.nutrition.calories) {
                          <div class="text-center">
                            <div class="text-2xl font-bold text-orange-600">{{ recipe.nutrition.calories }}</div>
                            <div class="text-xs text-gray-600">{{ 'nutrition_calories' | translate }}</div>
                          </div>
                        }
                        @if (recipe.nutrition.protein) {
                          <div class="text-center">
                            <div class="text-2xl font-bold text-blue-600">{{ recipe.nutrition.protein }}g</div>
                            <div class="text-xs text-gray-600">{{ 'nutrition_protein' | translate }}</div>
                          </div>
                        }
                        @if (recipe.nutrition.carbs) {
                          <div class="text-center">
                            <div class="text-2xl font-bold text-purple-600">{{ recipe.nutrition.carbs }}g</div>
                            <div class="text-xs text-gray-600">{{ 'nutrition_carbs' | translate }}</div>
                          </div>
                        }
                        @if (recipe.nutrition.fat) {
                          <div class="text-center">
                            <div class="text-2xl font-bold text-yellow-600">{{ recipe.nutrition.fat }}g</div>
                            <div class="text-xs text-gray-600">{{ 'nutrition_fat' | translate }}</div>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <div class="bg-indigo-50 p-4 rounded-lg">
                      <label class="block text-sm font-semibold text-gray-700 mb-2">
                          {{ 'adjust_servings' | translate }}
                      </label>
                      <div class="flex items-center gap-4">
                          <button 
                              (click)="adjustedServings.set(Math.max(1, adjustedServings() - 1))"
                              class="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors">
                              −
                          </button>
                          <input 
                              type="range" 
                              min="1" 
                              max="12" 
                              [value]="adjustedServings()"
                              (input)="adjustedServings.set(+$any($event.target).value)"
                              class="flex-1 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer slider">
                          <button 
                              (click)="adjustedServings.set(Math.min(12, adjustedServings() + 1))"
                              class="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors">
                              +
                          </button>
                          <span class="text-2xl font-bold text-indigo-600 min-w-[3rem] text-center">{{ adjustedServings() }}</span>
                      </div>
                  </div>

                  <div>
                      <h4 class="text-lg font-semibold text-gray-700 mb-2">{{ 'suggestions_ingredients_title' | translate }}</h4>
                      <ul class="list-disc list-inside bg-gray-50 p-4 rounded-lg space-y-1 text-gray-600">
                          @for (ingredient of getScaledIngredients(recipe); track ingredient) {
                              <li>{{ ingredient }}</li>
                          }
                      </ul>
                  </div>
                  <div>
                      <h4 class="text-lg font-semibold text-gray-700 mb-2">{{ 'suggestions_instructions_title' | translate }}</h4>
                      <ol class="list-decimal list-inside space-y-2 text-gray-600">
                          @for (instruction of recipe.instructions; track instruction) {
                              <li class="pl-2">{{ instruction }}</li>
                          }
                      </ol>
                  </div>
              </div>

              <div class="mt-6 pt-4 border-t text-right space-x-3">
                <button (click)="onCancelCooking()" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">
                  {{ 'cancel' | translate }}
                </button>
                <button (click)="onConfirmCooked(recipe)" class="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                  {{ 'cooked_button' | translate }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="min-h-screen bg-gray-100 font-sans flex items-center justify-center p-4">
        <div class="w-full max-w-md mx-auto">
          <div class="bg-white rounded-2xl shadow-xl p-8 relative">
            <button 
              (click)="continueAsGuest()" 
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              [title]="'login_skip' | translate">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div class="flex justify-end mb-4 -mr-4 -mt-4 pr-12">
              <app-language-selector />
            </div>
            <div class="text-center mb-8">
              <h1 class="text-3xl font-bold text-gray-800">{{ 'login_welcome' | translate }}</h1>
              <p class="text-gray-500 mt-2">{{ 'login_prompt' | translate }}</p>
            </div>
            
            <div class="space-y-4">
              <button (click)="loginWithGoogle()" class="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                <svg class="w-6 h-6 mr-3" viewBox="0 0 48 48"><defs><path id="a" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></defs><clipPath id="b"><use xlink:href="#a" overflow="visible"/></clipPath><path clip-path="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z"/><path clip-path="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z"/><path clip-path="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z"/><path clip-path="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z"/></svg>
                <span class="font-medium text-gray-700">{{ 'login_with_google' | translate }}</span>
              </button>

              <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">{{ 'login_email_continue' | translate }}</span>
                </div>
              </div>

              <form (submit)="$event.preventDefault()" class="space-y-4">
                <input 
                  type="email" 
                  name="email" 
                  [(ngModel)]="loginEmail"
                  [placeholder]="'login_email_placeholder' | translate"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input 
                  type="password" 
                  name="password"
                  [(ngModel)]="loginPassword"
                  [placeholder]="'login_password_placeholder' | translate"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div class="flex space-x-2">
                   <button 
                    type="button"
                    (click)="loginWithEmail()"
                    [disabled]="!loginEmail().trim() || !loginPassword().trim()"
                    class="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors">
                    {{ 'login_signin_button' | translate }}
                  </button>
                  <button 
                    type="button"
                    (click)="signUpWithEmail()"
                    [disabled]="!loginEmail().trim() || !loginPassword().trim()"
                    class="w-full py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors">
                    {{ 'login_signup_button' | translate }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private geminiService = inject(GeminiService);
  private subscriptionService = inject(SubscriptionService);
  firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private gamificationService = inject(GamificationService);
  private notificationService = inject(NotificationService);
  
  // Expose Math to template
  Math = Math;

  guestMode = signal(false);
  guestPoints = signal(0);
  guestLevel = signal(1);
  isAuthenticated = computed(() => !!this.authService.currentUser() || this.guestMode());
  loginEmail = signal('');
  loginPassword = signal('');

  currentView = signal<View>('home');
  ownedIngredients = signal('');
  recipes = signal<Recipe[]>([]);
  isLoadingRecipes = signal(false);
  cookingRecipe = signal<Recipe | null>(null);
  adjustedServings = signal<number>(4);

  userData = this.firestoreService.currentUserData;
  points = computed(() => {
    if (this.guestMode()) return this.guestPoints();
    return this.userData()?.points ?? 0;
  });
  level = computed(() => {
    if (this.guestMode()) return this.guestLevel();
    return this.userData()?.level ?? 1;
  });
  pointsForNextLevel = computed(() => this.level() * 500);
  levelProgress = computed(() => (this.points() % 500) / 5);

  mealPlan = signal<MealPlan>(EMPTY_MEAL_PLAN);
  shoppingList = signal<ShoppingItem[]>([]);
  
  planningRecipe = signal<Recipe | null>(null);
  isSelectingForDay = signal<{ day: string; slotIndex: number } | null>(null);
  daysOfWeek = DAYS_OF_WEEK_KEYS;

  isSubscribed = this.subscriptionService.isSubscribed;
  showPaywall = signal(false);
  pendingIngredients = signal<string | null>(null);

  constructor() {
    this.setupStateSynchronization();
    this.setupSubscriptionCheck();
  }

  private setupStateSynchronization() {
    effect(() => {
      const remoteUser = this.firestoreService.currentUserData();
      const isGuest = this.guestMode();
      
      if (remoteUser) {
        if (JSON.stringify(this.mealPlan()) !== JSON.stringify(remoteUser.mealPlan)) {
          this.mealPlan.set(remoteUser.mealPlan);
        }
        if (JSON.stringify(this.shoppingList()) !== JSON.stringify(remoteUser.shoppingList)) {
          this.shoppingList.set(remoteUser.shoppingList);
        }
        if (remoteUser.achievements) {
          this.subscriptionService.setRecipesGenerated(remoteUser.achievements.recipesGenerated);
        }
      } else if (!isGuest) {
        // Only reset if not in guest mode
        this.mealPlan.set(EMPTY_MEAL_PLAN);
        this.shoppingList.set([]);
        this.subscriptionService.setRecipesGenerated(0);
      }
    });

    effect(() => {
      const localPlan = this.mealPlan();
      const remoteUser = untracked(this.firestoreService.currentUserData);
      if (remoteUser && JSON.stringify(localPlan) !== JSON.stringify(remoteUser.mealPlan)) {
        this.firestoreService.updateUser(remoteUser.uid, { mealPlan: localPlan });
      }
    });

    effect(() => {
      const localList = this.shoppingList();
      const remoteUser = untracked(this.firestoreService.currentUserData);
      if (remoteUser && JSON.stringify(localList) !== JSON.stringify(remoteUser.shoppingList)) {
        this.firestoreService.updateUser(remoteUser.uid, { shoppingList: localList });
      }
    });
  }

  private setupSubscriptionCheck() {
    effect(() => {
      const user = this.authService.currentUser();
      const isInitialized = this.subscriptionService.isInitialized();
      const isSubscribed = this.subscriptionService.isSubscribed();
      
      if (user && isInitialized && !isSubscribed) {
        this.subscriptionService.identifyUser(user.uid);
        setTimeout(() => {
          if (!this.subscriptionService.isSubscribed()) {
            this.showPaywall.set(true);
          }
        }, 1000);
      }
    });
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  loginWithEmail() {
    this.authService.loginWithEmail(this.loginEmail(), this.loginPassword());
  }

  signUpWithEmail() {
    this.authService.signUpWithEmail(this.loginEmail(), this.loginPassword());
  }

  continueAsGuest() {
    this.guestMode.set(true);
  }

  async logout() {
    await this.subscriptionService.logoutUser();
    this.authService.logout();
    this.guestMode.set(false);
    this.currentView.set('home');
  }

  changeView(view: View) {
    this.currentView.set(view);
  }

  navButtonClass(view: View): string {
    const baseClasses = 'flex flex-col items-center justify-center p-3 text-gray-500 transition-colors w-1/5 hover:bg-gray-100 focus:outline-none';
    const activeClasses = 'text-green-600';
    
    return this.currentView() === view ? `${baseClasses} ${activeClasses}` : baseClasses;
  }

  handleFindRecipesRequest(ingredients: string) {
    if (this.subscriptionService.canGenerateRecipes) {
      this.onFindRecipes(ingredients);
    } else {
      this.pendingIngredients.set(ingredients);
      this.showPaywall.set(true);
    }
  }

  async onFindRecipes(ingredients: string) {
    this.ownedIngredients.set(ingredients);
    this.isLoadingRecipes.set(true);
    this.recipes.set([]);
    this.changeView('suggestions');
    
    try {
      const currentLanguage = this.translationService.currentLanguage();
      const generatedRecipes = await this.geminiService.generateRecipes(ingredients, currentLanguage);
      this.recipes.set(generatedRecipes);
      
      this.subscriptionService.incrementRecipesGenerated();
      
      await this.awardPoints(15, 'recipes_generated', 1);
      
      if (!this.guestMode() && this.firestoreService.currentUserData()) {
        const userData = this.firestoreService.currentUserData()!;
        await this.firestoreService.updateUser(userData.uid, { 
          achievements: userData.achievements 
        });
      }
    } catch (error) {
      console.error('Failed to generate recipes', error);
    } finally {
      this.isLoadingRecipes.set(false);
    }
  }

  async onAddToShoppingList(missingIngredients: string[]) {
    this.mergeShoppingItems(missingIngredients);
    
    await this.awardPoints(10 * missingIngredients.length, 'shopping_items', missingIngredients.length);
    
    this.changeView('shopping');
  }

  async onConfirmCooked(recipe: Recipe) {
    await this.awardPoints(25, 'recipes_cooked', 1);
    this.cookingRecipe.set(null);
  }

  onStartCooking(recipe: Recipe) {
    this.cookingRecipe.set(recipe);
    this.adjustedServings.set(recipe.servings);
  }

  onCancelCooking() {
    this.cookingRecipe.set(null);
    this.adjustedServings.set(4);
  }
  
  scaleIngredient(ingredient: string, originalServings: number, newServings: number): string {
    const scaleFactor = newServings / originalServings;
    
    // Extract number from beginning of ingredient
    const numberMatch = ingredient.match(/^(\d+(?:[.,]\d+)?)\s+(.+)/);
    if (numberMatch) {
      const quantity = parseFloat(numberMatch[1].replace(',', '.'));
      const rest = numberMatch[2];
      const scaledQuantity = Math.round(quantity * scaleFactor * 10) / 10; // Round to 1 decimal
      return `${scaledQuantity} ${rest}`;
    }
    
    return ingredient; // Return unchanged if no number found
  }
  
  getScaledIngredients(recipe: Recipe): string[] {
    const newServings = this.adjustedServings();
    if (newServings === recipe.servings) {
      return recipe.ingredients;
    }
    
    return recipe.ingredients.map(ingredient => 
      this.scaleIngredient(ingredient, recipe.servings, newServings)
    );
  }
  
  translateTag(tag: string): string {
    const tagMap: { [key: string]: string } = {
      'High Protein': 'tag_high_protein',
      'Low Calorie': 'tag_low_calorie',
      'Low Carb': 'tag_low_carb',
      'Vegetarian': 'tag_vegetarian',
      'Vegan': 'tag_vegan',
      'Gluten Free': 'tag_gluten_free',
      'Dairy Free': 'tag_dairy_free',
      'Spicy': 'tag_spicy',
      'Quick': 'tag_quick',
      'Healthy': 'tag_healthy',
      'No Salt': 'tag_no_salt',
      'Keto': 'tag_keto'
    };
    
    const translationKey = tagMap[tag];
    if (translationKey) {
      return this.translationService.translate(translationKey);
    }
    return tag;
  }
  
  getTagIcon(tag: string): string {
    const tagLower = tag.toLowerCase();
    
    if (tagLower.includes('protein')) {
      return '💪';
    }
    if (tagLower.includes('low cal')) {
      return '🔥';
    }
    if (tagLower.includes('vegan')) {
      return '🌱';
    }
    if (tagLower.includes('vegetarian')) {
      return '🥬';
    }
    if (tagLower.includes('low carb') || tagLower.includes('keto')) {
      return '🥑';
    }
    if (tagLower.includes('gluten')) {
      return '🌾';
    }
    if (tagLower.includes('spicy')) {
      return '🌶️';
    }
    if (tagLower.includes('quick')) {
      return '⚡';
    }
    if (tagLower.includes('healthy')) {
      return '❤️';
    }
    if (tagLower.includes('no salt')) {
      return '⭕';
    }
    if (tagLower.includes('dairy')) {
      return '🌿';
    }
    
    return '🏷️';
  }
  
  getTagClass(tag: string): string {
    const tagLower = tag.toLowerCase();
    
    if (tagLower.includes('protein')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (tagLower.includes('low cal')) {
      return 'bg-green-100 text-green-800';
    }
    if (tagLower.includes('vegetarian') || tagLower.includes('vegan')) {
      return 'bg-emerald-100 text-emerald-800';
    }
    if (tagLower.includes('low carb') || tagLower.includes('keto')) {
      return 'bg-purple-100 text-purple-800';
    }
    if (tagLower.includes('gluten')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (tagLower.includes('spicy')) {
      return 'bg-red-100 text-red-800';
    }
    if (tagLower.includes('quick')) {
      return 'bg-orange-100 text-orange-800';
    }
    if (tagLower.includes('healthy')) {
      return 'bg-teal-100 text-teal-800';
    }
    if (tagLower.includes('no salt') || tagLower.includes('salt')) {
      return 'bg-cyan-100 text-cyan-800';
    }
    if (tagLower.includes('dairy')) {
      return 'bg-pink-100 text-pink-800';
    }
    
    return 'bg-gray-100 text-gray-800';
  }

  onPlanRecipeRequest(recipe: Recipe) {
    this.planningRecipe.set(recipe);
  }

  async assignRecipeToDay(day: string) {
    const recipe = this.planningRecipe();
    if (!recipe) return;

    const plan = this.mealPlan();
    const dayKey = day as keyof MealPlan;
    
    this.mealPlan.set({
      ...plan,
      [dayKey]: [...plan[dayKey], recipe.title]
    });

    await this.awardPoints(20, 'meal_plans', 1);

    this.planningRecipe.set(null);
  }

  cancelPlanning() {
    this.planningRecipe.set(null);
  }

  onCalendarDaySelected(day: string) {
    this.isSelectingForDay.set({ day, slotIndex: 0 });
  }

  selectRecipeForDay(recipe: Recipe) {
    const selection = this.isSelectingForDay();
    if (!selection) return;

    const plan = this.mealPlan();
    const dayKey = selection.day as keyof MealPlan;
    
    this.mealPlan.set({
      ...plan,
      [dayKey]: [...plan[dayKey], recipe.title]
    });

    this.isSelectingForDay.set(null);
  }

  onRemoveRecipeFromPlan(event: { day: string; recipeName: string }) {
    const plan = this.mealPlan();
    const dayKey = event.day as keyof MealPlan;
    
    this.mealPlan.set({
      ...plan,
      [dayKey]: plan[dayKey].filter(name => name !== event.recipeName)
    });
  }

  async onPurchaseSuccess() {
    this.showPaywall.set(false);
    
    await this.awardPremiumAchievement();
    
    const pending = this.pendingIngredients();
    if (pending) {
      this.onFindRecipes(pending);
      this.pendingIngredients.set(null);
    }
  }

  private async awardPremiumAchievement() {
    if (this.guestMode()) {
      this.guestPoints.update(p => p + 200);
      this.notificationService.showAchievementUnlocked('Premium Chef', '👑', 200);
      console.log('✅ Premium Chef achievement awarded in guest mode! +200 points');
      return;
    }

    const userData = this.firestoreService.currentUserData();
    if (!userData || !userData.achievements) {
      return;
    }

    if (userData.achievements.premiumSubscribed === 1) {
      return;
    }

    userData.achievements.premiumSubscribed = 1;

    const newAchievements = this.gamificationService.checkAchievements(userData.achievements);
    
    let bonusPoints = 0;
    for (const achievement of newAchievements) {
      userData.achievements.unlockedAchievements.push(achievement.id);
      bonusPoints += achievement.points;
      
      this.notificationService.showAchievementUnlocked(
        this.translationService.translate(achievement.titleKey),
        achievement.icon,
        achievement.points
      );
    }

    const oldLevel = userData.level;
    userData.points += bonusPoints;
    userData.level = this.gamificationService.calculateLevel(userData.points);

    await this.firestoreService.updateUser(userData.uid, {
      points: userData.points,
      level: userData.level,
      achievements: userData.achievements
    });

    if (userData.level > oldLevel) {
      const levelInfo = this.gamificationService.getLevelInfo(userData.points);
      this.notificationService.showLevelUp(
        userData.level,
        this.translationService.translate(levelInfo.titleKey)
      );
    }

    console.log(`✅ Premium Chef achievement awarded! +${bonusPoints} points`);
  }

  private async awardPoints(points: number, statType: string, amount: number) {
    if (this.guestMode()) {
      const oldPoints = this.guestPoints();
      const oldLevel = this.guestLevel();
      const newPoints = oldPoints + points;
      const newLevel = this.gamificationService.calculateLevel(newPoints);
      
      this.guestPoints.set(newPoints);
      this.guestLevel.set(newLevel);
      
      const reasonMap: { [key: string]: string } = {
        'ingredients': 'Ingredient added',
        'recipes_generated': 'Recipe generated',
        'recipes_cooked': 'Recipe cooked',
        'meal_plans': 'Meal plan added',
        'shopping_items': 'Shopping item added',
        'portions_adjusted': 'Portions adjusted'
      };
      
      this.notificationService.showPointsGained(points, reasonMap[statType] || 'Action completed');
      
      if (newLevel > oldLevel) {
        const levelInfo = this.gamificationService.getLevelInfo(newPoints);
        this.notificationService.showLevelUp(newLevel, levelInfo.titleKey);
      }
      
      return;
    }

    const user = this.userData();
    if (!user) return;

    const achievements = user.achievements || EMPTY_ACHIEVEMENTS;
    
    const streakResult = this.gamificationService.updateStreak(
      achievements.lastActiveDate,
      achievements.currentStreak
    );
    
    const isPremiumSubscribed = this.subscriptionService.isSubscribed();
    
    const updatedAchievements = {
      ...achievements,
      currentStreak: streakResult.newStreak,
      longestStreak: Math.max(achievements.longestStreak, streakResult.newStreak),
      lastActiveDate: new Date(),
      recipesCooked: statType === 'recipes_cooked' ? achievements.recipesCooked + amount : achievements.recipesCooked,
      recipesGenerated: statType === 'recipes_generated' ? achievements.recipesGenerated + amount : achievements.recipesGenerated,
      shoppingItemsAdded: statType === 'shopping_items' ? achievements.shoppingItemsAdded + amount : achievements.shoppingItemsAdded,
      mealPlansCreated: statType === 'meal_plans' ? achievements.mealPlansCreated + amount : achievements.mealPlansCreated,
      portionsAdjusted: statType === 'portions_adjusted' ? achievements.portionsAdjusted + amount : achievements.portionsAdjusted,
      languagesUsed: [...new Set([...achievements.languagesUsed, this.translationService.currentLanguage()])],
      premiumSubscribed: isPremiumSubscribed ? 1 : 0
    };
    
    const newAchievements = this.gamificationService.checkAchievements(updatedAchievements);
    
    if (newAchievements.length > 0) {
      updatedAchievements.unlockedAchievements = [
        ...updatedAchievements.unlockedAchievements,
        ...newAchievements.map(a => a.id)
      ];
      
      const achievementPoints = newAchievements.reduce((sum, a) => sum + a.points, 0);
      points += achievementPoints;
      
      for (const achievement of newAchievements) {
        this.notificationService.showAchievementUnlocked(
          this.translationService.translate(achievement.titleKey),
          achievement.icon,
          achievement.points
        );
      }
    }
    
    const reasonMap: { [key: string]: string } = {
      'ingredients': this.translationService.translate('notif_ingredient_added'),
      'recipes_generated': this.translationService.translate('notif_recipe_generated'),
      'recipes_cooked': this.translationService.translate('notif_recipe_cooked'),
      'meal_plans': this.translationService.translate('notif_meal_plan'),
      'shopping_items': this.translationService.translate('notif_shopping_item'),
      'portions_adjusted': this.translationService.translate('notif_portions')
    };
    
    this.notificationService.showPointsGained(points, reasonMap[statType] || 'Action completed');
    
    if (streakResult.streakBonus > 0) {
      this.notificationService.showStreakBonus(streakResult.newStreak, streakResult.streakBonus);
    }
    
    const totalPoints = user.points + points + streakResult.streakBonus;
    const oldLevel = user.level;
    const newLevel = this.gamificationService.calculateLevel(totalPoints);

    await this.firestoreService.updateUser(user.uid, {
      points: totalPoints,
      level: newLevel,
      achievements: updatedAchievements
    });
    
    if (newLevel > oldLevel) {
      const levelInfo = this.gamificationService.getLevelInfo(totalPoints);
      this.notificationService.showLevelUp(
        newLevel,
        this.translationService.translate(levelInfo.titleKey)
      );
    }
  }

  private mergeShoppingItems(newItems: string[]) {
    const currentList = [...this.shoppingList()];
    
    for (const newItemText of newItems) {
      const parsed = this.parseIngredient(newItemText);
      
      // Use base ingredient only if we have a numeric quantity, otherwise use full text
      const displayText = parsed.hasNumericQuantity ? parsed.baseIngredient : parsed.ingredient;
      
      // Try to find existing item with same ingredient name
      const existingIndex = currentList.findIndex(item => {
        return item.text.toLowerCase() === displayText.toLowerCase();
      });
      
      if (existingIndex >= 0 && parsed.hasNumericQuantity) {
        // Item exists and has numeric quantity - sum quantities
        const existingItem = currentList[existingIndex];
        const newTotal = (existingItem.quantity || 1) + (parsed.quantity || 1);
        
        // Update with combined quantity, keep the unit
        currentList[existingIndex] = {
          ...existingItem,
          quantity: newTotal,
          unit: parsed.unit || existingItem.unit
        };
      } else if (existingIndex >= 0) {
        // Item exists but no numeric quantity - just skip to avoid duplicates
        continue;
      } else {
        // New item - add to list
        currentList.push({
          text: displayText,
          checked: false,
          quantity: parsed.hasNumericQuantity ? (parsed.quantity || 1) : undefined,
          unit: parsed.unit || undefined
        });
      }
    }
    
    this.shoppingList.set(currentList);
  }
  
  private parseIngredient(text: string): { quantity: number | null, unit: string | null, ingredient: string, baseIngredient: string, hasNumericQuantity: boolean } {
    // Ingredient categories (multilingual)
    const proteinKeywords = [
      // English
      'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'lamb', 'shrimp', 'meat', 'steak', 'bacon', 'ham',
      // Spanish
      'pollo', 'carne', 'cerdo', 'pescado', 'salmón', 'atún', 'pavo', 'cordero', 'camarón', 'bistec', 'res', 'tocino', 'jamón',
      // French
      'poulet', 'bœuf', 'porc', 'poisson', 'saumon', 'thon', 'dinde', 'agneau', 'crevette', 'viande', 'bacon', 'jambon',
      // German
      'Hähnchen', 'Rindfleisch', 'Schweinefleisch', 'Fisch', 'Lachs', 'Thunfisch', 'Pute', 'Lamm', 'Garnele', 'Fleisch', 'Speck', 'Schinken',
      // Italian
      'pollo', 'manzo', 'maiale', 'pesce', 'salmone', 'tonno', 'tacchino', 'agnello', 'gamberetto', 'carne', 'pancetta', 'prosciutto'
    ];
    
    const vegetableKeywords = [
      // English
      'tomato', 'tomatoes', 'onion', 'onions', 'carrot', 'carrots', 'potato', 'potatoes', 'pepper', 'peppers',
      'broccoli', 'spinach', 'lettuce', 'cabbage', 'celery', 'cucumber', 'zucchini', 'eggplant', 'mushroom', 'mushrooms',
      'garlic', 'corn', 'peas', 'beans', 'cauliflower', 'asparagus', 'kale', 'squash',
      // Spanish
      'tomate', 'tomates', 'cebolla', 'cebollas', 'zanahoria', 'zanahorias', 'papa', 'papas', 'patata', 'patatas',
      'pimiento', 'pimientos', 'brócoli', 'espinaca', 'lechuga', 'repollo', 'apio', 'pepino', 'calabacín', 'berenjena',
      'champiñón', 'champiñones', 'ajo', 'maíz', 'guisantes', 'frijoles', 'coliflor', 'espárrago', 'calabaza',
      // French
      'tomate', 'tomates', 'oignon', 'oignons', 'carotte', 'carottes', 'pomme de terre', 'poivron', 'poivrons',
      'brocoli', 'épinard', 'laitue', 'chou', 'céleri', 'concombre', 'courgette', 'aubergine', 'champignon', 'champignons',
      'ail', 'maïs', 'pois', 'haricots', 'chou-fleur', 'asperge', 'courge',
      // German
      'Tomate', 'Tomaten', 'Zwiebel', 'Zwiebeln', 'Karotte', 'Karotten', 'Kartoffel', 'Kartoffeln', 'Paprika',
      'Brokkoli', 'Spinat', 'Salat', 'Kohl', 'Sellerie', 'Gurke', 'Zucchini', 'Aubergine', 'Pilz', 'Pilze',
      'Knoblauch', 'Mais', 'Erbsen', 'Bohnen', 'Blumenkohl', 'Spargel', 'Kürbis',
      // Italian
      'pomodoro', 'pomodori', 'cipolla', 'cipolle', 'carota', 'carote', 'patata', 'patate', 'peperone', 'peperoni',
      'broccoli', 'spinaci', 'lattuga', 'cavolo', 'sedano', 'cetriolo', 'zucchina', 'melanzana', 'fungo', 'funghi',
      'aglio', 'mais', 'piselli', 'fagioli', 'cavolfiore', 'asparagi', 'zucca'
    ];
    
    const liquidKeywords = [
      // English
      'water', 'milk', 'broth', 'stock', 'juice', 'oil', 'wine', 'cream', 'sauce', 'vinegar', 'soy sauce',
      // Spanish
      'agua', 'leche', 'caldo', 'jugo', 'aceite', 'vino', 'crema', 'salsa', 'vinagre', 'salsa de soja',
      // French
      'eau', 'lait', 'bouillon', 'jus', 'huile', 'vin', 'crème', 'sauce', 'vinaigre', 'sauce soja',
      // German
      'Wasser', 'Milch', 'Brühe', 'Saft', 'Öl', 'Wein', 'Sahne', 'Soße', 'Essig', 'Sojasoße',
      // Italian
      'acqua', 'latte', 'brodo', 'succo', 'olio', 'vino', 'panna', 'salsa', 'aceto', 'salsa di soia'
    ];
    
    // Common units in multiple languages
    const units = [
      // English
      'cup', 'cups', 'tbsp', 'tsp', 'oz', 'lb', 'lbs', 'g', 'kg', 'ml', 'l',
      'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons', 'ounce', 'ounces', 'pound', 'pounds',
      'gram', 'grams', 'kilogram', 'kilograms', 'liter', 'liters', 'milliliter', 'milliliters',
      'clove', 'cloves', 'piece', 'pieces', 'slice', 'slices', 'can', 'cans', 'jar', 'jars',
      // Spanish
      'taza', 'tazas', 'cda', 'cdas', 'cdta', 'cdtas', 'gramo', 'gramos', 'kilo', 'kilos',
      'litro', 'litros', 'diente', 'dientes', 'lata', 'latas', 'pizca', 'rebanada', 'rebanadas',
      'unidad', 'unidades',
      // French
      'tasse', 'tasses', 'cuillère', 'cuillères', 'gramme', 'grammes', 'litre', 'litres',
      'gousse', 'gousses', 'tranche', 'tranches', 'boîte', 'boîtes', 'unité', 'unités',
      // German
      'Tasse', 'Tassen', 'Esslöffel', 'Teelöffel', 'Gramm', 'Kilogramm', 'Liter',
      'Zehe', 'Zehen', 'Scheibe', 'Scheiben', 'Dose', 'Dosen', 'Stück',
      // Italian
      'tazza', 'tazze', 'cucchiaio', 'cucchiai', 'cucchiaino', 'cucchiaini', 'grammo', 'grammi',
      'litro', 'litri', 'spicchio', 'spicchi', 'fetta', 'fette', 'scatola', 'scatole', 'unità'
    ];
    
    // Weight units (for proteins, solid foods)
    const weightUnits = ['g', 'kg', 'gram', 'grams', 'gramo', 'gramos', 'kilo', 'kilos', 'kilogram', 'kilograms',
      'gramme', 'grammes', 'Gramm', 'Kilogramm', 'grammo', 'grammi', 'oz', 'lb', 'lbs', 'ounce', 'ounces', 'pound', 'pounds'];
    
    // Volume units (for liquids)
    const volumeUnits = ['ml', 'l', 'cup', 'cups', 'taza', 'tazas', 'tasse', 'tasses', 'Tasse', 'Tassen', 'tazza', 'tazze',
      'liter', 'liters', 'litro', 'litros', 'litre', 'litres', 'Liter', 'milliliter', 'milliliters'];
    
    // Spoon units (small volume measures)
    const spoonUnits = ['tbsp', 'tsp', 'cda', 'cdas', 'cdta', 'cdtas', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons',
      'cuillère', 'cuillères', 'Esslöffel', 'Teelöffel', 'cucchiaio', 'cucchiai', 'cucchiaino', 'cucchiaini'];
    
    // Descriptive phrases to remove (in multiple languages)
    const descriptors = [
      // English
      'cut into', 'chopped', 'diced', 'sliced', 'minced', 'grated', 'shredded', 'peeled',
      'bite-sized', 'cubed', 'julienned', 'finely chopped', 'roughly chopped', 'thinly sliced',
      'to taste', 'optional', 'for garnish', 'fresh', 'dried', 'frozen',
      // Spanish
      'cortado en', 'cortado a', 'picado', 'en cubos', 'en rodajas', 'rallado', 'pelado',
      'tamaño de un bocado', 'finamente picado', 'al gusto', 'opcional', 'para decorar',
      'fresco', 'seco', 'congelado',
      // French
      'coupé en', 'haché', 'en dés', 'en tranches', 'râpé', 'pelé', 'émincé',
      'au goût', 'facultatif', 'pour garnir', 'frais', 'séché', 'surgelé',
      // German
      'geschnitten in', 'gehackt', 'gewürfelt', 'in Scheiben', 'gerieben', 'geschält',
      'nach Geschmack', 'optional', 'zum Garnieren', 'frisch', 'getrocknet', 'gefroren',
      // Italian
      'tagliato a', 'tritato', 'a cubetti', 'a fette', 'grattugiato', 'sbucciato',
      'a pezzetti', 'a piacere', 'opzionale', 'per guarnire', 'fresco', 'secco', 'surgelato'
    ];
    
    let remaining = text;
    let quantity: number | null = null;
    let unit: string | null = null;
    
    // Try to match: "number unit ingredient" or "number ingredient"
    const regex = /^(\d+(?:[.,]\d+)?)\s*([a-zA-Zéàèùâêîôûäöüß]+)?\s+(.+)$/i;
    const match = remaining.match(regex);
    
    if (match) {
      quantity = parseFloat(match[1].replace(',', '.'));
      const possibleUnit = match[2]?.toLowerCase();
      const rest = match[3];
      
      // Check if the second group is a unit
      if (possibleUnit && units.some(u => u.toLowerCase() === possibleUnit)) {
        unit = possibleUnit;
        remaining = rest;
      } else {
        // No unit, just quantity and ingredient
        remaining = match[2] ? `${match[2]} ${rest}` : rest;
      }
    }
    
    // Remove descriptive phrases to extract base ingredient
    let baseIngredient = remaining.trim();
    
    // Remove anything after commas (usually descriptors)
    baseIngredient = baseIngredient.split(',')[0].trim();
    
    // Remove descriptive phrases
    for (const descriptor of descriptors) {
      const regex = new RegExp(`\\s+${descriptor}\\s+.*`, 'i');
      baseIngredient = baseIngredient.replace(regex, '');
    }
    
    // Remove parenthetical descriptions
    baseIngredient = baseIngredient.replace(/\s*\([^)]*\)/g, '').trim();
    
    // Get first 1-3 words (usually the ingredient name)
    const words = baseIngredient.split(/\s+/);
    if (words.length > 3) {
      baseIngredient = words.slice(0, 2).join(' ');
    }
    
    // Validate unit against ingredient type
    if (unit) {
      const ingredientLower = baseIngredient.toLowerCase();
      const unitLower = unit.toLowerCase();
      
      // Check ingredient category
      const isProtein = proteinKeywords.some(keyword => ingredientLower.includes(keyword));
      const isVegetable = vegetableKeywords.some(keyword => ingredientLower.includes(keyword));
      const isLiquid = liquidKeywords.some(keyword => ingredientLower.includes(keyword));
      
      const isVolumeUnit = volumeUnits.some(v => v.toLowerCase() === unitLower);
      const isWeightUnit = weightUnits.some(w => w.toLowerCase() === unitLower);
      const isSpoonUnit = spoonUnits.some(s => s.toLowerCase() === unitLower);
      
      // Discard invalid unit combinations
      if ((isProtein || isVegetable) && isVolumeUnit) {
        // Protein/vegetables measured in cups/tazas/liters - discard unit, keep only quantity
        unit = null;
      } else if (isLiquid && isWeightUnit) {
        // Liquid measured in grams - discard unit, keep only quantity
        unit = null;
      } else if (isLiquid && isSpoonUnit && quantity !== null && quantity > 10) {
        // Liquid measured in spoons with quantity > 10 - too much, discard unit
        unit = null;
      }
    }
    
    // Determine if we have a meaningful numeric quantity
    const hasNumericQuantity = quantity !== null && quantity >= 1;
    
    return { 
      quantity, 
      unit, 
      ingredient: remaining,
      baseIngredient: baseIngredient,
      hasNumericQuantity: hasNumericQuantity
    };
  }
}
