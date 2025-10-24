import { Component, Output, EventEmitter, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-fridge',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ 'nav_fridge' | translate }}</h2>
        <p class="text-gray-600 mb-6">{{ 'fridge_question' | translate }}</p>
        
        <textarea
          [(ngModel)]="ingredients"
          [placeholder]="'fridge_placeholder' | translate"
          class="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        ></textarea>

        <button
          (click)="handleFindRecipes()"
          [disabled]="!ingredients().trim()"
          class="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {{ 'fridge_find' | translate }}
        </button>

        <div class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-lg font-semibold text-gray-700 mb-3">{{ 'fridge_common' | translate }}</h3>
          <div class="flex flex-wrap gap-2">
            @for (ingredient of translatedIngredients(); track $index) {
              <button
                (click)="addIngredient(commonIngredients[$index])"
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
  
  private translationService = inject(TranslationService);
  
  ingredients = signal('');
  
  // Expanded list of common ingredients
  commonIngredients = [
    'chicken', 'beef', 'pork', 'fish', 'shrimp', 'salmon', 'tuna',
    'eggs', 'milk', 'cheese', 'yogurt', 'butter', 'cream',
    'tomatoes', 'onions', 'garlic', 'potatoes', 'carrots', 'broccoli', 'spinach',
    'bell peppers', 'mushrooms', 'zucchini', 'eggplant', 'cucumber', 'lettuce',
    'rice', 'pasta', 'bread', 'flour', 'oats', 'quinoa',
    'olive oil', 'soy sauce', 'salt', 'pepper', 'cumin', 'paprika',
    'lemon', 'lime', 'avocado', 'corn', 'beans', 'chickpeas',
    'parmesan', 'mozzarella', 'bacon', 'sausage', 'ground beef',
    'ginger', 'cilantro', 'basil', 'oregano', 'thyme'
  ];

  translatedIngredients = signal<string[]>([...this.commonIngredients]);

  constructor() {
    // Auto-translate ingredients when language changes
    effect(() => {
      const currentLang = this.translationService.currentLanguage();
      
      // If English, use original names
      if (currentLang === 'en') {
        this.translatedIngredients.set([...this.commonIngredients]);
        return;
      }
      
      // Translate all ingredients
      this.translateIngredients();
    });
  }

  private async translateIngredients() {
    try {
      const translated = await this.translationService.translateBatch(this.commonIngredients);
      this.translatedIngredients.set(translated);
    } catch (error) {
      console.error('Failed to translate ingredients:', error);
      // Fallback to original names on error
      this.translatedIngredients.set([...this.commonIngredients]);
    }
  }

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
