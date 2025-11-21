import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MealPlan, DAYS_OF_WEEK_KEYS, EMPTY_MEAL_PLAN } from '../../models/user.model';
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
  @Input() mealPlan: MealPlan = { ...EMPTY_MEAL_PLAN };
  @Input() availableRecipes: Recipe[] = [];
  
  @Output() mealPlanChanged = new EventEmitter<MealPlan>();
  @Output() mealRemoved = new EventEmitter<{ day: string; recipeName: string }>();
  @Output() generateShoppingListRequest = new EventEmitter<void>();

  daysOfWeek = DAYS_OF_WEEK_KEYS;
  currentDate = new Date();
  
  showModal = signal(false);
  selectedDay = signal<string | null>(null);
  searchQuery = signal('');

  get filteredRecipes(): Recipe[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.availableRecipes;
    
    return this.availableRecipes.filter(recipe => 
      recipe.title.toLowerCase().includes(query) ||
      recipe.description?.toLowerCase().includes(query)
    );
  }

  openAddModal(day: string) {
    this.selectedDay.set(day);
    this.searchQuery.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedDay.set(null);
    this.searchQuery.set('');
  }

  selectRecipeFromModal(recipe: Recipe) {
    const day = this.selectedDay();
    if (day) {
      this.addMealToDay(day, recipe.title);
      this.closeModal();
    }
  }

  addMealToDay(day: string, recipeName: string) {
    const updatedPlan = { ...this.mealPlan };
    const dayKey = day as keyof MealPlan;
    
    if (!updatedPlan[dayKey].includes(recipeName)) {
      updatedPlan[dayKey] = [...updatedPlan[dayKey], recipeName];
    }
    
    this.mealPlan = updatedPlan;
    this.mealPlanChanged.emit(updatedPlan);
  }

  removeMeal(event: Event, day: string, recipeName: string) {
    event.stopPropagation();
    
    const updatedPlan = { ...this.mealPlan };
    const dayKey = day as keyof MealPlan;
    
    updatedPlan[dayKey] = updatedPlan[dayKey].filter(meal => meal !== recipeName);
    
    this.mealPlan = updatedPlan;
    this.mealPlanChanged.emit(updatedPlan);
    this.mealRemoved.emit({ day, recipeName });
  }

  getMealsForDay(day: string): string[] {
    return this.mealPlan[day as keyof MealPlan] || [];
  }

  hasMealsInPlan(): boolean {
    return DAYS_OF_WEEK_KEYS.some(day => {
      const dayMeals = this.mealPlan[day as keyof MealPlan];
      return dayMeals.length > 0;
    });
  }

  requestGenerateShoppingList() {
    this.generateShoppingListRequest.emit();
  }

  getCurrentMonth(): string {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const year = this.currentDate.getFullYear();
    const month = monthNames[this.currentDate.getMonth()];
    return `${month} ${year}`;
  }

  getCalendarDays(): Array<{ date: number; isCurrentMonth: boolean; isToday: boolean }> {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days: Array<{ date: number; isCurrentMonth: boolean; isToday: boolean }> = [];
    
    // Previous month days
    const startDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ date: daysInPrevMonth - i, isCurrentMonth: false, isToday: false });
    }
    
    // Current month days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === today.getDate() && 
                     month === today.getMonth() && 
                     year === today.getFullYear();
      days.push({ date: i, isCurrentMonth: true, isToday });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: i, isCurrentMonth: false, isToday: false });
    }
    
    return days;
  }

  hasMealsOnDate(date: number): boolean {
    // Simple check: if any day has meals, mark the date
    // This is a placeholder - in production you'd track specific dates
    return Math.random() < 0.3; // 30% chance for demo
  }
}
