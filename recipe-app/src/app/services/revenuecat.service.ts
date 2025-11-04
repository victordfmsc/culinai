import { Injectable } from '@angular/core';
import { Purchases, PurchasesOfferings, CustomerInfo, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';

export interface SubscriptionStatus {
  isPremium: boolean;
  expirationDate?: Date;
  productIdentifier?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RevenueCatService {
  private isConfigured = false;
  private currentOfferings: PurchasesOfferings | null = null;

  constructor() {}

  async configure(): Promise<void> {
    if (this.isConfigured) {
      return;
    }

    try {
      const isAndroid = Capacitor.getPlatform() === 'android';
      const apiKey = isAndroid 
        ? environment.revenuecatAndroidKey 
        : environment.revenuecatWebKey;

      if (!apiKey) {
        console.warn('RevenueCat API key not configured');
        return;
      }

      await Purchases.configure({ apiKey });
      this.isConfigured = true;
      console.log('✅ RevenueCat configured successfully');
    } catch (error) {
      console.error('❌ RevenueCat configuration error:', error);
      throw error;
    }
  }

  async getOfferings(offeringId?: string): Promise<PurchasesOfferings | null> {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      const offerings = await Purchases.getOfferings();
      this.currentOfferings = offerings;
      
      // If specific offering ID is requested, verify it exists
      if (offeringId && offerings.all) {
        const specificOffering = offerings.all[offeringId];
        if (specificOffering) {
          console.log(`✅ Found specific offering: ${offeringId}`);
          // Return offerings with the specific one as current
          return {
            ...offerings,
            current: specificOffering
          };
        } else {
          console.warn(`⚠️ Offering ${offeringId} not found, using default current offering`);
        }
      }
      
      return offerings;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.customerInfo;
    } catch (error) {
      console.error('Error fetching customer info:', error);
      return null;
    }
  }

  async checkSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const customerInfo = await this.getCustomerInfo();
      
      if (!customerInfo || !customerInfo.entitlements.active) {
        return { isPremium: false };
      }

      const premiumEntitlement = customerInfo.entitlements.active['premium'];
      
      if (premiumEntitlement) {
        return {
          isPremium: true,
          expirationDate: premiumEntitlement.expirationDate 
            ? new Date(premiumEntitlement.expirationDate) 
            : undefined,
          productIdentifier: premiumEntitlement.productIdentifier
        };
      }

      return { isPremium: false };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return { isPremium: false };
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      const purchaseResult = await Purchases.purchasePackage({
        aPackage: packageToPurchase
      });

      const isPremium = purchaseResult.customerInfo.entitlements.active['premium'] !== undefined;
      
      if (isPremium) {
        console.log('✅ Purchase successful - Premium unlocked');
      }
      
      return isPremium;
    } catch (error: any) {
      if (error.code === 'PURCHASE_CANCELLED') {
        console.log('Purchase cancelled by user');
      } else {
        console.error('Purchase error:', error);
      }
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      const customerInfo = await Purchases.restorePurchases();
      const isPremium = customerInfo.customerInfo.entitlements.active['premium'] !== undefined;
      
      if (isPremium) {
        console.log('✅ Purchases restored - Premium unlocked');
      } else {
        console.log('No active subscriptions found');
      }
      
      return isPremium;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  }

  async setUserID(userID: string): Promise<void> {
    try {
      if (!this.isConfigured) {
        await this.configure();
      }

      await Purchases.logIn({ appUserID: userID });
      console.log('✅ RevenueCat user ID set:', userID);
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }

  async logout(): Promise<void> {
    try {
      if (!this.isConfigured) {
        return;
      }

      await Purchases.logOut();
      console.log('✅ RevenueCat user logged out');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
}
