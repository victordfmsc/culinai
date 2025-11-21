import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../services/gemini.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { RecipeImportComponent } from '../recipe-import/recipe-import.component';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RecipeImportComponent],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-md p-6 relative">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ 'suggestions_title' | translate }}</h2>
        
        <button
          (click)="showImportModal.set(true)"
          class="absolute top-6 right-6 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <span class="text-lg">📥</span>
          <span class="hidden sm:inline">{{ 'import_recipe_title' | translate }}</span>
          <span class="sm:hidden">{{ 'import_manual' | translate }}</span>
        </button>
        
        @if (isLoading) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        } @else if (recipes.length === 0) {
          <div class="text-center py-12 text-gray-500">
            <p>{{ 'suggestions_empty' | translate }}</p>
          </div>
        } @else {
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            @for (recipe of recipes; track recipe.title) {
              <div class="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <h3 class="text-lg font-bold text-gray-800 mb-2">{{ recipe.title }}</h3>
                <p class="text-sm text-gray-600 mb-3">{{ recipe.description }}</p>
                
                @if (recipe.tags && recipe.tags.length > 0) {
                  <div class="flex flex-wrap gap-2 mb-3">
                    @for (tag of recipe.tags; track tag) {
                      <span [class]="getTagClass(tag)" class="px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1">
                        <span>{{ getTagIcon(tag) }}</span>
                        <span>{{ translateTag(tag) }}</span>
                      </span>
                    }
                  </div>
                }
                
                <div class="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <div class="flex gap-3">
                    <span>⏱️ {{ recipe.prepTime }}</span>
                    @if (recipe.nutrition && recipe.nutrition.calories) {
                      <span class="font-semibold text-orange-600">🔥 {{ recipe.nutrition!.calories }} {{ 'nutrition_calories' | translate }}</span>
                    }
                  </div>
                  <span>🍽️ {{ getAdjustedServings(recipe) }} {{ 'suggestions_servings' | translate }}</span>
                </div>

                <div class="bg-gray-50 p-3 rounded-lg mb-4">
                  <label class="block text-xs font-semibold text-gray-700 mb-2">
                    {{ 'adjust_servings' | translate }}
                  </label>
                  <div class="flex items-center gap-2">
                    <button 
                      (click)="adjustServings(recipe, Math.max(1, getAdjustedServings(recipe) - 1))"
                      class="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors text-sm">
                      −
                    </button>
                    <input 
                      type="range" 
                      min="1" 
                      max="12" 
                      [value]="getAdjustedServings(recipe)"
                      (input)="adjustServings(recipe, +$any($event.target).value)"
                      class="flex-1 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer">
                    <button 
                      (click)="adjustServings(recipe, Math.min(12, getAdjustedServings(recipe) + 1))"
                      class="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors text-sm">
                      +
                    </button>
                    <span class="text-lg font-bold text-indigo-600 min-w-[2rem] text-center">{{ getAdjustedServings(recipe) }}</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <button
                    (click)="cookRecipe.emit(recipe)"
                    class="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {{ 'suggestions_cook' | translate }}
                  </button>
                  <button
                    (click)="planRecipeRequest.emit(recipe)"
                    class="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {{ 'suggestions_plan' | translate }}
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
      
      @if (showImportModal()) {
        <app-recipe-import 
          (recipeImported)="onRecipeImported($event)"
          (close)="showImportModal.set(false)"
        />
      }
    </div>
  `
})
export class SuggestionsComponent {
  @Input() recipes: Recipe[] = [];
  @Input() isLoading: boolean = false;
  @Output() cookRecipe = new EventEmitter<Recipe>();
  @Output() planRecipeRequest = new EventEmitter<Recipe>();
  @Output() addToShoppingList = new EventEmitter<string[]>();
  @Output() recipeImported = new EventEmitter<Recipe>();
  
  Math = Math;
  showImportModal = signal(false);
  private translationService = inject(TranslationService);

  onRecipeImported(recipe: Recipe) {
    this.recipeImported.emit(recipe);
    this.showImportModal.set(false);
  }
  
  adjustServings(recipe: Recipe, newServings: number) {
    recipe.adjustedServings = newServings;
  }
  
  getAdjustedServings(recipe: Recipe): number {
    return recipe.adjustedServings || recipe.servings;
  }
  
  scaleIngredient(ingredient: string, originalServings: number, newServings: number): string {
    const scaleFactor = newServings / originalServings;
    
    const numberMatch = ingredient.match(/^(\d+(?:[.,]\d+)?)\s+(.+)/);
    if (numberMatch) {
      const quantity = parseFloat(numberMatch[1].replace(',', '.'));
      const rest = numberMatch[2];
      const scaledQuantity = Math.round(quantity * scaleFactor * 10) / 10;
      return `${scaledQuantity} ${rest}`;
    }
    
    return ingredient;
  }
  
  getScaledIngredients(recipe: Recipe): string[] {
    const newServings = this.getAdjustedServings(recipe);
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
}
