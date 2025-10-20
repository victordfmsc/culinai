import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ 'nav_profile' | translate }}</h2>
        
        <div class="space-y-4">
          <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span class="font-semibold text-gray-700">{{ 'level' | translate }}</span>
            <span class="text-2xl font-bold text-indigo-600">{{ level }}</span>
          </div>

          <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span class="font-semibold text-gray-700">{{ 'points' | translate }}</span>
            <span class="text-2xl font-bold text-green-600">{{ points }}</span>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-semibold text-gray-700 mb-3">Achievements</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-4 bg-yellow-50 rounded-lg text-center">
                <div class="text-3xl mb-2">🏆</div>
                <div class="text-sm font-semibold text-gray-700">Recipe Explorer</div>
              </div>
              <div class="p-4 bg-blue-50 rounded-lg text-center">
                <div class="text-3xl mb-2">👨‍🍳</div>
                <div class="text-sm font-semibold text-gray-700">Master Chef</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  @Input() points: number = 0;
  @Input() level: number = 1;
}
