import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenueCatService } from '../../services/revenuecat.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { PurchasesPackage } from '@revenuecat/purchases-capacitor';

@Component({
  selector: 'app-paywall',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div class="bg-gradient-to-br from-white via-indigo-50 to-purple-50 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        <!-- Hero Section -->
        <div class="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 rounded-t-3xl text-white text-center overflow-hidden">
          <!-- Animated background decoration -->
          <div class="absolute inset-0 opacity-20">
            <div class="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
          </div>
          
          <div class="relative z-10">
            <div class="text-7xl mb-4 animate-bounce">👨‍🍳✨</div>
            <h2 class="text-3xl font-bold mb-2">{{ 'paywall_title' | translate }}</h2>
            <p class="text-indigo-100">{{ 'paywall_subtitle' | translate }}</p>
          </div>
        </div>

        <div class="p-6">
          @if (loading) {
            <div class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
              <p class="text-gray-600 mt-4 font-medium">{{ 'paywall_loading' | translate }}</p>
            </div>
          } @else if (error) {
            <div class="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <div class="flex items-start">
                <svg class="h-6 w-6 text-red-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-red-700 text-sm">{{error}}</p>
              </div>
            </div>
          }

          @if (packages.length > 0) {
            <!-- Subscription Plans -->
            <div class="space-y-3 mb-6">
              @for (pkg of packages; track pkg.identifier) {
                <button
                  (click)="selectPackage(pkg)"
                  [class.ring-4]="selectedPackage?.identifier === pkg.identifier"
                  [class.ring-indigo-600]="selectedPackage?.identifier === pkg.identifier"
                  [class.scale-105]="selectedPackage?.identifier === pkg.identifier"
                  [class.shadow-2xl]="selectedPackage?.identifier === pkg.identifier"
                  class="w-full bg-white rounded-2xl p-5 text-left hover:shadow-xl transition-all duration-300 border-2 transform hover:scale-102"
                  [class.border-indigo-600]="selectedPackage?.identifier === pkg.identifier"
                  [class.border-gray-200]="selectedPackage?.identifier !== pkg.identifier"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="font-bold text-gray-900 text-lg mb-1">{{pkg.product.title}}</div>
                      <div class="text-sm text-gray-600">{{pkg.product.description}}</div>
                    </div>
                    <div class="text-right ml-4">
                      <div class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {{pkg.product.priceString}}
                      </div>
                      @if (pkg.packageType === 'ANNUAL') {
                        <div class="text-xs font-bold text-green-600 mt-1 bg-green-100 px-2 py-1 rounded-full">
                          {{ 'paywall_best_value' | translate }}
                        </div>
                      }
                    </div>
                  </div>
                  
                  @if (selectedPackage?.identifier === pkg.identifier) {
                    <div class="mt-3 flex items-center text-indigo-600 text-sm font-semibold">
                      <svg class="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      Selected
                    </div>
                  }
                </button>
              }
            </div>

            <!-- Premium Benefits -->
            <div class="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-5 mb-6 border-2 border-green-200">
              <div class="font-bold text-gray-800 mb-3 text-lg">{{ 'paywall_benefits_title' | translate }}</div>
              <ul class="space-y-2.5">
                <li class="flex items-start text-gray-700">
                  <svg class="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ 'paywall_benefit_1' | translate }}</span>
                </li>
                <li class="flex items-start text-gray-700">
                  <svg class="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ 'paywall_benefit_2' | translate }}</span>
                </li>
                <li class="flex items-start text-gray-700">
                  <svg class="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ 'paywall_benefit_3' | translate }}</span>
                </li>
                <li class="flex items-start text-gray-700">
                  <svg class="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ 'paywall_benefit_4' | translate }}</span>
                </li>
                <li class="flex items-start text-gray-700">
                  <svg class="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ 'paywall_benefit_5' | translate }}</span>
                </li>
              </ul>
            </div>

            <!-- Subscribe Button -->
            <button
              (click)="purchase()"
              [disabled]="!selectedPackage || purchasing"
              class="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 mb-3"
            >
              @if (purchasing) {
                <span class="flex items-center justify-center">
                  <span class="inline-block animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mr-2"></span>
                  {{ 'paywall_processing' | translate }}
                </span>
              } @else {
                {{ 'paywall_subscribe_button' | translate }}
              }
            </button>
          } @else {
            <div class="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
              <p class="text-yellow-700 text-sm">{{ 'paywall_no_plans' | translate }}</p>
            </div>
          }

          <!-- Restore Button -->
          <button
            (click)="restore()"
            [disabled]="restoring"
            class="w-full py-3 text-indigo-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors mb-3 disabled:opacity-50"
          >
            {{restoring ? ('paywall_restoring' | translate) : ('paywall_restore_button' | translate)}}
          </button>

          <!-- Maybe Later Button -->
          <button
            (click)="close.emit()"
            class="w-full py-3 text-gray-500 font-semibold hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {{ 'paywall_maybe_later' | translate }}
          </button>

          <!-- Terms -->
          <p class="text-xs text-gray-400 text-center mt-4 px-2">
            {{ 'paywall_terms' | translate }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
    
    .animate-scaleIn {
      animation: scaleIn 0.3s ease-out;
    }
    
    .hover\:scale-102:hover {
      transform: scale(1.02);
    }
  `]
})
export class PaywallComponent implements OnInit {
  @Output() purchaseSuccess = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  private revenueCatService = inject(RevenueCatService);
  private translationService = inject(TranslationService);

  packages: PurchasesPackage[] = [];
  selectedPackage: PurchasesPackage | null = null;
  loading = true;
  error = '';
  purchasing = false;
  restoring = false;

  // Specific offering ID from RevenueCat
  private readonly OFFERING_ID = 'ofrng0c6cce3960';

  async ngOnInit() {
    await this.loadOfferings();
  }

  async loadOfferings() {
    try {
      this.loading = true;
      this.error = '';

      // Request specific offering by ID
      const offerings = await this.revenueCatService.getOfferings(this.OFFERING_ID);
      
      console.log('🔍 Offerings received:', offerings);
      console.log('🔍 Current offering:', offerings?.current);
      console.log('🔍 Available packages:', offerings?.current?.availablePackages);
      
      if (offerings?.current?.availablePackages && offerings.current.availablePackages.length > 0) {
        this.packages = offerings.current.availablePackages;
        console.log(`📦 Loaded ${this.packages.length} packages from offering ${this.OFFERING_ID}`);
        console.log('📦 Packages:', this.packages);
        
        // Select the annual package by default (best value), or first package
        const annual = this.packages.find(p => p.packageType === 'ANNUAL');
        this.selectedPackage = annual || this.packages[0] || null;
        console.log('✅ Selected package:', this.selectedPackage);
      } else {
        console.error('❌ No packages found in offerings');
        this.error = this.translationService.translate('paywall_no_plans');
      }
    } catch (err: any) {
      console.error('Error loading offerings:', err);
      this.error = this.translationService.translate('paywall_error');
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

      console.log('🛒 Attempting purchase:', this.selectedPackage.identifier);
      const success = await this.revenueCatService.purchasePackage(this.selectedPackage);
      
      if (success) {
        console.log('✅ Purchase successful!');
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
