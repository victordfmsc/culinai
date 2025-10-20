import { Component, Input, Output, EventEmitter } from '@angular/core';
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
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Recipe Suggestions</h2>
        
        @if (isLoading) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        } @else if (recipes.length === 0) {
          <div class="text-center py-12 text-gray-500">
            <p>No recipes yet. Go to your Fridge to find recipes!</p>
          </div>
        } @else {
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            @for (recipe of recipes; track recipe.title) {
              <div class="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <h3 class="text-lg font-bold text-gray-800 mb-2">{{ recipe.title }}</h3>
                <p class="text-sm text-gray-600 mb-4">{{ recipe.description }}</p>
                
                <div class="flex justify-between text-xs text-gray-500 mb-4">
                  <span>⏱️ {{ recipe.prepTime }}</span>
                  <span>🍽️ {{ recipe.servings }} servings</span>
                </div>

                <div class="space-y-2">
                  <button
                    (click)="cookRecipe.emit(recipe)"
                    class="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Cook Now
                  </button>
                  <button
                    (click)="planRecipeRequest.emit(recipe)"
                    class="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Plan for Later
                  </button>
                  <button
                    (click)="addToShoppingList.emit(recipe.ingredients)"
                    class="w-full py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Add to Shopping List
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
}
