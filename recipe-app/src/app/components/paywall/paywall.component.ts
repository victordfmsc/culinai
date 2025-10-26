import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenueCatService } from '../../services/revenuecat.service';
import { PurchasesPackage } from '@revenuecat/purchases-capacitor';

@Component({
  selector: 'app-paywall',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-8">
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">👨‍🍳✨</div>
            <h2 class="text-3xl font-bold text-gray-800 mb-2">Unlock Premium Chef</h2>
            <p class="text-gray-600">You've used all 3 free recipes. Upgrade to continue!</p>
          </div>

          @if (loading) {
            <div class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
              <p class="text-gray-600 mt-4">Loading plans...</p>
            </div>
          } @else if (error) {
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p class="text-red-600 text-sm">⚠️ {{error}}</p>
            </div>
          }

          @if (packages.length > 0) {
            <div class="space-y-3 mb-6">
              @for (pkg of packages; track pkg.identifier) {
                <button
                  (click)="selectPackage(pkg)"
                  [class.ring-2]="selectedPackage?.identifier === pkg.identifier"
                  [class.ring-indigo-600]="selectedPackage?.identifier === pkg.identifier"
                  class="w-full bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 text-left hover:shadow-md transition-all border-2 border-transparent hover:border-indigo-200"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="font-bold text-gray-800">{{pkg.product.title}}</div>
                      <div class="text-sm text-gray-600 mt-1">{{pkg.product.description}}</div>
                    </div>
                    <div class="text-right ml-4">
                      <div class="text-2xl font-bold text-indigo-600">{{pkg.product.priceString}}</div>
                      @if (pkg.packageType === 'ANNUAL') {
                        <div class="text-xs text-green-600 font-semibold">💰 Best Value</div>
                      }
                    </div>
                  </div>
                </button>
              }
            </div>

            <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
              <div class="font-semibold text-gray-800 mb-2">🏆 Premium Benefits:</div>
              <ul class="text-sm text-gray-700 space-y-1.5">
                <li>✓ Unlimited AI recipe generation</li>
                <li>✓ +200 bonus points & "Premium Chef" achievement</li>
                <li>✓ Advanced meal planning features</li>
                <li>✓ Exclusive premium badge in profile</li>
                <li>✓ Priority customer support</li>
              </ul>
            </div>

            <button
              (click)="purchase()"
              [disabled]="!selectedPackage || purchasing"
              class="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mb-3"
            >
              @if (purchasing) {
                <span class="flex items-center justify-center">
                  <span class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></span>
                  Processing...
                </span>
              } @else {
                Subscribe Now
              }
            </button>
          } @else {
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p class="text-yellow-700 text-sm">No subscription plans available at the moment.</p>
            </div>
          }

          <button
            (click)="restore()"
            [disabled]="restoring"
            class="w-full py-2 text-indigo-600 font-semibold hover:text-indigo-700 mb-3 disabled:opacity-50"
          >
            {{restoring ? 'Restoring...' : 'Restore Purchases'}}
          </button>

          <button
            (click)="close.emit()"
            class="w-full py-2 text-gray-500 font-semibold hover:text-gray-700"
          >
            Maybe Later
          </button>

          <p class="text-xs text-gray-400 text-center mt-4">
            Subscriptions auto-renew. Cancel anytime from your account settings.
          </p>
        </div>
      </div>
    </div>
  `
})
export class PaywallComponent implements OnInit {
  @Output() purchaseSuccess = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  packages: PurchasesPackage[] = [];
  selectedPackage: PurchasesPackage | null = null;
  loading = true;
  error = '';
  purchasing = false;
  restoring = false;

  constructor(private revenueCatService: RevenueCatService) {}

  async ngOnInit() {
    await this.loadOfferings();
  }

  async loadOfferings() {
    try {
      this.loading = true;
      this.error = '';

      const offerings = await this.revenueCatService.getOfferings();
      
      if (offerings?.current?.availablePackages) {
        this.packages = offerings.current.availablePackages;
        
        const annual = this.packages.find(p => p.packageType === 'ANNUAL');
        this.selectedPackage = annual || this.packages[0] || null;
      } else {
        this.error = 'No subscription plans available. Please try again later.';
      }
    } catch (err: any) {
      console.error('Error loading offerings:', err);
      this.error = 'Failed to load subscription plans. Please check your connection.';
    } finally {
      this.loading = false;
    }
  }

  selectPackage(pkg: PurchasesPackage) {
    this.selectedPackage = pkg;
  }

  async purchase() {
    if (!this.selectedPackage || this.purchasing) {
      return;
    }

    try {
      this.purchasing = true;
      this.error = '';

      const success = await this.revenueCatService.purchasePackage(this.selectedPackage);
      
      if (success) {
        this.purchaseSuccess.emit();
      } else {
        this.error = 'Purchase was not completed. Please try again.';
      }
    } catch (err: any) {
      console.error('Purchase error:', err);
      this.error = err.message || 'An error occurred during purchase.';
    } finally {
      this.purchasing = false;
    }
  }

  async restore() {
    try {
      this.restoring = true;
      this.error = '';

      const success = await this.revenueCatService.restorePurchases();
      
      if (success) {
        this.purchaseSuccess.emit();
      } else {
        this.error = 'No active subscriptions found.';
      }
    } catch (err: any) {
      console.error('Restore error:', err);
      this.error = 'Failed to restore purchases.';
    } finally {
      this.restoring = false;
    }
  }
}
