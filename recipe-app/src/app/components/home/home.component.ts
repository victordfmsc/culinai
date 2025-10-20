import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealPlan, DAYS_OF_WEEK_KEYS } from '../../models/user.model';
import { Recipe } from '../../services/gemini.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ 'nav_home' | translate }}</h2>
        
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold text-gray-700">{{ 'level' | translate }} {{ level }}</span>
            <span class="text-sm text-gray-600">{{ points }} / {{ nextLevelPoints }} {{ 'points' | translate }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-green-500 h-3 rounded-full transition-all duration-300" [style.width.%]="levelProgress"></div>
          </div>
        </div>

        <h3 class="text-lg font-semibold text-gray-700 mb-3">Weekly Meal Plan</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          @for (day of daysOfWeek; track day) {
            <div class="border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors cursor-pointer" (click)="dayClicked.emit(day)">
              <div class="font-semibold text-sm text-gray-700 mb-2">{{ 'day_' + day | translate }}</div>
              @if (mealPlan[day] && mealPlan[day].length > 0) {
                <div class="space-y-1">
                  @for (recipeName of mealPlan[day]; track recipeName) {
                    <div class="text-xs bg-indigo-50 text-indigo-700 rounded px-2 py-1 flex justify-between items-center">
                      <span class="truncate flex-1">{{ recipeName }}</span>
                      <button (click)="removeRecipe($event, day, recipeName)" class="ml-1 text-red-500 hover:text-red-700">×</button>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-xs text-gray-400">No meals planned</div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  @Input() points: number = 0;
  @Input() level: number = 1;
  @Input() levelProgress: number = 0;
  @Input() nextLevelPoints: number = 500;
  @Input() mealPlan: MealPlan = {
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
  };
  
  @Output() dayClicked = new EventEmitter<string>();
  @Output() recipeRemoved = new EventEmitter<{ day: string; recipeName: string }>();

  daysOfWeek = DAYS_OF_WEEK_KEYS;

  removeRecipe(event: Event, day: string, recipeName: string) {
    event.stopPropagation();
    this.recipeRemoved.emit({ day, recipeName });
  }
}
