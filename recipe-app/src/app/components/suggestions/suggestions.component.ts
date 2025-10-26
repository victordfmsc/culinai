import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../services/gemini.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ 'suggestions_title' | translate }}</h2>
        
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
                      <span [class]="getTagClass(tag)" class="px-2 py-1 text-xs font-semibold rounded-full">
                        {{ tag }}
                      </span>
                    }
                  </div>
                }
                
                <div class="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <div class="flex gap-3">
                    <span>⏱️ {{ recipe.prepTime }}</span>
                    @if (recipe.nutrition?.calories) {
                      <span class="font-semibold text-orange-600">🔥 {{ recipe.nutrition.calories }} {{ 'nutrition_calories' | translate }}</span>
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
                  <button
                    (click)="addToShoppingList.emit(getScaledIngredients(recipe))"
                    class="w-full py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {{ 'suggestions_add_shopping' | translate }}
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class SuggestionsComponent {
  @Input() recipes: Recipe[] = [];
  @Input() isLoading: boolean = false;
  @Output() cookRecipe = new EventEmitter<Recipe>();
  @Output() planRecipeRequest = new EventEmitter<Recipe>();
  @Output() addToShoppingList = new EventEmitter<string[]>();
  
  Math = Math;
  
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
  
  getTagClass(tag: string): string {
    const tagLower = tag.toLowerCase();
    
    if (tagLower.includes('protein') || tagLower.includes('proteín') || tagLower.includes('protéin') || tagLower.includes('eiwei')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (tagLower.includes('low cal') || tagLower.includes('hipocal') || tagLower.includes('kalorienarm') || tagLower.includes('ipocal')) {
      return 'bg-green-100 text-green-800';
    }
    if (tagLower.includes('vegetar') || tagLower.includes('vegan')) {
      return 'bg-emerald-100 text-emerald-800';
    }
    if (tagLower.includes('low carb') || tagLower.includes('bajo en carb') || tagLower.includes('keto') || tagLower.includes('kohlenhydrat')) {
      return 'bg-purple-100 text-purple-800';
    }
    if (tagLower.includes('gluten') || tagLower.includes('sin gluten') || tagLower.includes('sans gluten') || tagLower.includes('senza glutine')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (tagLower.includes('spicy') || tagLower.includes('picante') || tagLower.includes('épic') || tagLower.includes('scharf')) {
      return 'bg-red-100 text-red-800';
    }
    if (tagLower.includes('quick') || tagLower.includes('rápid') || tagLower.includes('rapide') || tagLower.includes('schnell') || tagLower.includes('veloce')) {
      return 'bg-orange-100 text-orange-800';
    }
    if (tagLower.includes('healthy') || tagLower.includes('saludable') || tagLower.includes('sain') || tagLower.includes('gesund') || tagLower.includes('salutare')) {
      return 'bg-teal-100 text-teal-800';
    }
    if (tagLower.includes('no salt') || tagLower.includes('sin sal') || tagLower.includes('sans sel') || tagLower.includes('ohne salz') || tagLower.includes('senza sale')) {
      return 'bg-cyan-100 text-cyan-800';
    }
    if (tagLower.includes('dairy') || tagLower.includes('lácteo') || tagLower.includes('lait') || tagLower.includes('milch') || tagLower.includes('lattiero')) {
      return 'bg-pink-100 text-pink-800';
    }
    
    return 'bg-gray-100 text-gray-800';
  }
}
