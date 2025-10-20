import { Injectable, signal } from '@angular/core';
import { Purchases, LOG_LEVEL, CustomerInfo, PurchasesOfferings } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  isSubscribed = signal(false);
  isInitialized = signal(false);
  offerings = signal<PurchasesOfferings | null>(null);
  
  private readonly ENTITLEMENT_ID = 'premium';

  constructor() {
    this.initializeRevenueCat();
  }

  private async initializeRevenueCat() {
    try {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      
      const platform = Capacitor.getPlatform();
      const apiKey = this.getApiKey(platform);
      
      if (!apiKey || apiKey.includes('your_')) {
        console.warn('RevenueCat API key not configured, using demo mode');
        this.isSubscribed.set(true);
        this.isInitialized.set(true);
        return;
      }

      await Purchases.configure({ apiKey });
      
      await this.checkSubscriptionStatus();
      await this.loadOfferings();
      
      this.isInitialized.set(true);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      this.isSubscribed.set(true);
      this.isInitialized.set(true);
    }
  }

  private getApiKey(platform: string): string {
    if (platform === 'android') {
      return environment.revenuecatAndroidKey || 'your_android_api_key';
    } else if (platform === 'ios') {
      return environment.revenuecatIosKey || 'your_ios_api_key';
    } else {
      return environment.revenuecatWebKey || 'your_web_api_key';
    }
  }

  async checkSubscriptionStatus(): Promise<void> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      this.updateSubscriptionStatus(customerInfo.customerInfo);
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      this.isSubscribed.set(false);
    }
  }

  private updateSubscriptionStatus(customerInfo: CustomerInfo) {
    const hasEntitlement = customerInfo.entitlements.active[this.ENTITLEMENT_ID] !== undefined;
    this.isSubscribed.set(hasEntitlement);
  }

  async loadOfferings(): Promise<void> {
    try {
      const offerings = await Purchases.getOfferings();
      this.offerings.set(offerings);
    } catch (error) {
      console.error('Failed to load offerings:', error);
      this.offerings.set(null);
    }
  }

  async purchasePackage(packageId: string): Promise<boolean> {
    try {
      const offerings = this.offerings();
      if (!offerings || !offerings.current) {
        console.error('No offerings available');
        return false;
      }

      const selectedPackage = offerings.current.availablePackages.find(
        pkg => pkg.identifier === packageId
      );

      if (!selectedPackage) {
        console.error('Package not found:', packageId);
        return false;
      }

      const purchaseResult = await Purchases.purchaseStoreProduct({
        product: selectedPackage.product
      });

      this.updateSubscriptionStatus(purchaseResult.customerInfo);
      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      this.updateSubscriptionStatus(customerInfo.customerInfo);
      return this.isSubscribed();
    } catch (error) {
      console.error('Restore purchases failed:', error);
      return false;
    }
  }

  async startTrial(): Promise<void> {
    try {
      const offerings = this.offerings();
      if (!offerings || !offerings.current || offerings.current.availablePackages.length === 0) {
        console.error('No trial package available');
        return;
      }

      const trialPackage = offerings.current.availablePackages[0];
      
      const purchaseResult = await Purchases.purchaseStoreProduct({
        product: trialPackage.product
      });

      this.updateSubscriptionStatus(purchaseResult.customerInfo);
    } catch (error) {
      console.error('Start trial failed:', error);
    }
  }

  async identifyUser(userId: string): Promise<void> {
    try {
      await Purchases.logIn({ appUserID: userId });
      await this.checkSubscriptionStatus();
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  async logoutUser(): Promise<void> {
    try {
      await Purchases.logOut();
      this.isSubscribed.set(false);
    } catch (error) {
      console.error('Failed to logout user:', error);
    }
  }
}
