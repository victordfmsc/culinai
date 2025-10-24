import { Component, ChangeDetectionStrategy, signal, inject, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeComponent } from './components/home/home.component';
import { FridgeComponent } from './components/fridge/fridge.component';
import { SuggestionsComponent } from './components/suggestions/suggestions.component';
import { ShoppingListComponent } from './components/shopping-list/shopping-list.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PaywallComponent } from './components/paywall/paywall.component';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';

import { GeminiService, Recipe } from './services/gemini.service';
import { SubscriptionService } from './services/subscription.service';
import { FirestoreService } from './services/firestore.service';
import { AuthService } from './services/auth.service';
import { TranslationService } from './services/translation.service';
import { MealPlan, ShoppingItem, EMPTY_MEAL_PLAN, DAYS_OF_WEEK_KEYS } from './models/user.model';
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
    PaywallComponent,
    LanguageSelectorComponent,
    TranslatePipe,
  ],
  template: `
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
                [points]="points()"
                [level]="level()" />
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
            (startTrial)="onStartTrial()"
            (restorePurchases)="onRestorePurchases()"
            (close)="showPaywall.set(false)" />
        }

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
                              <div>{{ recipe.servings }}</div>
                          </div>
                      </div>
                  </div>

                  <div>
                      <h4 class="text-lg font-semibold text-gray-700 mb-2">{{ 'suggestions_ingredients_title' | translate }}</h4>
                      <ul class="list-disc list-inside bg-gray-50 p-4 rounded-lg space-y-1 text-gray-600">
                          @for (ingredient of recipe.ingredients; track ingredient) {
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
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);

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
      } else if (!isGuest) {
        // Only reset if not in guest mode
        this.mealPlan.set(EMPTY_MEAL_PLAN);
        this.shoppingList.set([]);
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
    if (this.isSubscribed()) {
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
      const generatedRecipes = await this.geminiService.generateRecipes(ingredients);
      this.recipes.set(generatedRecipes);
    } catch (error) {
      console.error('Failed to generate recipes', error);
    } finally {
      this.isLoadingRecipes.set(false);
    }
  }

  onAddToShoppingList(missingIngredients: string[]) {
    this.mergeShoppingItems(missingIngredients);
    this.changeView('shopping');
  }

  onConfirmCooked(recipe: Recipe) {
    const earnedPoints = 100;
    
    if (this.guestMode()) {
      const newPoints = this.guestPoints() + earnedPoints;
      const newLevel = Math.floor(newPoints / 500) + 1;
      this.guestPoints.set(newPoints);
      this.guestLevel.set(newLevel);
    } else {
      const user = this.userData();
      if (!user) return;

      const newPoints = user.points + earnedPoints;
      const newLevel = Math.floor(newPoints / 500) + 1;

      this.firestoreService.updateUser(user.uid, {
        points: newPoints,
        level: newLevel
      });
    }

    this.cookingRecipe.set(null);
  }

  onStartCooking(recipe: Recipe) {
    this.cookingRecipe.set(recipe);
  }

  onCancelCooking() {
    this.cookingRecipe.set(null);
  }

  onPlanRecipeRequest(recipe: Recipe) {
    this.planningRecipe.set(recipe);
  }

  assignRecipeToDay(day: string) {
    const recipe = this.planningRecipe();
    if (!recipe) return;

    const plan = this.mealPlan();
    const dayKey = day as keyof MealPlan;
    
    this.mealPlan.set({
      ...plan,
      [dayKey]: [...plan[dayKey], recipe.title]
    });

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

  async onStartTrial() {
    await this.subscriptionService.startTrial();
    
    if (this.subscriptionService.isSubscribed()) {
      this.showPaywall.set(false);
      
      const pending = this.pendingIngredients();
      if (pending) {
        this.onFindRecipes(pending);
        this.pendingIngredients.set(null);
      }
    }
  }

  async onRestorePurchases() {
    const restored = await this.subscriptionService.restorePurchases();
    
    if (restored) {
      this.showPaywall.set(false);
      
      const pending = this.pendingIngredients();
      if (pending) {
        this.onFindRecipes(pending);
        this.pendingIngredients.set(null);
      }
    }
  }

  private mergeShoppingItems(newItems: string[]) {
    const currentList = this.shoppingList();
    const existingTexts = new Set(currentList.map(item => item.text.toLowerCase()));
    
    const itemsToAdd = newItems
      .filter(text => !existingTexts.has(text.toLowerCase()))
      .map(text => ({ text, checked: false }));
    
    this.shoppingList.set([...currentList, ...itemsToAdd]);
  }
}
