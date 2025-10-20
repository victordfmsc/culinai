import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-paywall',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
        <div class="text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Premium Feature</h2>
          <p class="text-gray-600 mb-6">Unlock unlimited recipe generation with our premium plan!</p>
          
          <div class="bg-indigo-50 rounded-lg p-6 mb-6">
            <div class="text-3xl font-bold text-indigo-600 mb-2">$9.99/month</div>
            <ul class="text-left text-sm text-gray-700 space-y-2">
              <li>✓ Unlimited recipe generation</li>
              <li>✓ Advanced meal planning</li>
              <li>✓ Shopping list export</li>
              <li>✓ Priority support</li>
            </ul>
          </div>

          <button
            (click)="startTrial.emit()"
            class="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors mb-3"
          >
            Start Free Trial
          </button>

          <button
            (click)="restorePurchases.emit()"
            class="w-full py-2 text-indigo-600 font-semibold hover:text-indigo-700 mb-3"
          >
            Restore Purchases
          </button>

          <button
            (click)="close.emit()"
            class="w-full py-2 text-gray-500 font-semibold hover:text-gray-700"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  `
})
export class PaywallComponent {
  @Output() startTrial = new EventEmitter<void>();
  @Output() restorePurchases = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
