import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div 
          class="bg-white rounded-lg shadow-xl border-2 p-4 min-w-[320px] max-w-md pointer-events-auto transform transition-all duration-300 animate-slideIn"
          [ngClass]="{
            'border-yellow-400': notification.type === 'points',
            'border-purple-500': notification.type === 'achievement',
            'border-green-500': notification.type === 'level',
            'border-orange-500': notification.type === 'streak'
          }">
          <div class="flex items-start gap-3">
            <div class="text-4xl flex-shrink-0">{{ notification.icon }}</div>
            <div class="flex-1">
              <div class="font-bold text-gray-800 mb-1">{{ notification.title }}</div>
              <div class="text-sm text-gray-600">{{ notification.message }}</div>
            </div>
            <button 
              (click)="notificationService.removeNotification(notification.id)"
              class="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          @if (notification.points) {
            <div class="mt-2 text-right">
              <span class="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                +{{ notification.points }} {{ 'points_short' | translate }}
              </span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
  `]
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
}
