import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MealPlanV2, DAYS_OF_WEEK_KEYS, MEAL_TYPES, MealType, PlannedMeal, EMPTY_MEAL_PLAN_V2 } from '../../models/user.model';
import { Recipe } from '../../services/gemini.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  @Input() points: number = 0;
  @Input() level: number = 1;
  @Input() levelProgress: number = 0;
  @Input() nextLevelPoints: number = 500;
  @Input() mealPlanV2: MealPlanV2 = { ...EMPTY_MEAL_PLAN_V2 };
  @Input() availableRecipes: Recipe[] = [];
  
  @Output() mealPlanChanged = new EventEmitter<MealPlanV2>();
  @Output() mealRemoved = new EventEmitter<{ day: string; mealType: MealType }>();

  daysOfWeek = DAYS_OF_WEEK_KEYS;
  mealTypes = MEAL_TYPES;
  
  showModal = signal(false);
  selectedCell = signal<{ day: string; mealType: MealType } | null>(null);
  searchQuery = signal('');
  draggedRecipe = signal<Recipe | null>(null);

  get filteredRecipes(): Recipe[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.availableRecipes;
    
    return this.availableRecipes.filter(recipe => 
      recipe.title.toLowerCase().includes(query) ||
      recipe.description?.toLowerCase().includes(query)
    );
  }

  onDragStart(event: DragEvent, recipe: Recipe) {
    this.draggedRecipe.set(recipe);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('text/plain', recipe.title);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onDragEnter(event: DragEvent, element: HTMLElement) {
    event.preventDefault();
    element.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent, element: HTMLElement) {
    element.classList.remove('drag-over');
  }

  onDrop(event: DragEvent, day: string, mealType: MealType, element: HTMLElement) {
    event.preventDefault();
    element.classList.remove('drag-over');
    
    const recipe = this.draggedRecipe();
    if (recipe) {
      this.addMealToSlot(day, mealType, recipe);
      this.draggedRecipe.set(null);
    }
  }

  openAddModal(day: string, mealType: MealType) {
    this.selectedCell.set({ day, mealType });
    this.searchQuery.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedCell.set(null);
    this.searchQuery.set('');
  }

  selectRecipeFromModal(recipe: Recipe) {
    const cell = this.selectedCell();
    if (cell) {
      this.addMealToSlot(cell.day, cell.mealType, recipe);
      this.closeModal();
    }
  }

  addMealToSlot(day: string, mealType: MealType, recipe: Recipe) {
    const updatedPlan = { ...this.mealPlanV2 };
    const dayKey = day as keyof MealPlanV2;
    
    updatedPlan[dayKey] = {
      ...updatedPlan[dayKey],
      [mealType]: {
        recipeName: recipe.title,
        servings: recipe.servings || 4,
        recipeData: recipe
      }
    };
    
    this.mealPlanV2 = updatedPlan;
    this.mealPlanChanged.emit(updatedPlan);
  }

  removeMeal(event: Event, day: string, mealType: MealType) {
    event.stopPropagation();
    
    const updatedPlan = { ...this.mealPlanV2 };
    const dayKey = day as keyof MealPlanV2;
    
    updatedPlan[dayKey] = {
      ...updatedPlan[dayKey],
      [mealType]: null
    };
    
    this.mealPlanV2 = updatedPlan;
    this.mealPlanChanged.emit(updatedPlan);
    this.mealRemoved.emit({ day, mealType });
  }

  incrementServings(event: Event, day: string, mealType: MealType) {
    event.stopPropagation();
    this.updateServings(day, mealType, 1);
  }

  decrementServings(event: Event, day: string, mealType: MealType) {
    event.stopPropagation();
    this.updateServings(day, mealType, -1);
  }

  private updateServings(day: string, mealType: MealType, delta: number) {
    const dayKey = day as keyof MealPlanV2;
    const meal = this.mealPlanV2[dayKey][mealType];
    
    if (!meal) return;
    
    const newServings = Math.max(1, Math.min(12, meal.servings + delta));
    
    const updatedPlan = { ...this.mealPlanV2 };
    updatedPlan[dayKey] = {
      ...updatedPlan[dayKey],
      [mealType]: {
        ...meal,
        servings: newServings
      }
    };
    
    this.mealPlanV2 = updatedPlan;
    this.mealPlanChanged.emit(updatedPlan);
  }

  getMeal(day: string, mealType: MealType): PlannedMeal | null {
    const dayKey = day as keyof MealPlanV2;
    return this.mealPlanV2[dayKey][mealType];
  }
}
