import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-fridge',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ 'nav_fridge' | translate }}</h2>
        <p class="text-gray-600 mb-6">What ingredients do you have?</p>
        
        <textarea
          [(ngModel)]="ingredients"
          placeholder="e.g., chicken, tomatoes, onions, garlic..."
          class="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        ></textarea>

        <button
          (click)="handleFindRecipes()"
          [disabled]="!ingredients().trim()"
          class="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          Find Recipes
        </button>

        <div class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-lg font-semibold text-gray-700 mb-3">Common Ingredients</h3>
          <div class="flex flex-wrap gap-2">
            @for (ingredient of commonIngredients; track ingredient) {
              <button
                (click)="addIngredient(ingredient)"
                class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
              >
                {{ ingredient }}
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class FridgeComponent {
  @Output() findRecipes = new EventEmitter<string>();
  
  ingredients = signal('');
  
  commonIngredients = [
    'chicken', 'beef', 'pork', 'fish', 'eggs', 'milk', 'cheese',
    'tomatoes', 'onions', 'garlic', 'potatoes', 'carrots', 'broccoli',
    'rice', 'pasta', 'bread', 'olive oil', 'butter'
  ];

  addIngredient(ingredient: string) {
    const current = this.ingredients();
    if (current) {
      this.ingredients.set(current + ', ' + ingredient);
    } else {
      this.ingredients.set(ingredient);
    }
  }

  handleFindRecipes() {
    if (this.ingredients().trim()) {
      this.findRecipes.emit(this.ingredients());
    }
  }
}
