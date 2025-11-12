import { Injectable, inject } from '@angular/core';
import { Purchases, PurchasesOfferings, CustomerInfo, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';
import { FirestoreService } from './firestore.service';
import { SubscriptionData } from '../models/user.model';

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
  private logger = inject(LoggerService);
  private firestoreService = inject(FirestoreService);
  private currentUserId: string | null = null;

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
      // In web mode, return demo offerings
      if (Capacitor.getPlatform() === 'web') {
        console.log('🌐 Web mode: Returning demo offerings');
        return this.createDemoOfferings(offeringId);
      }

      if (!this.isConfigured) {
        await this.configure();
      }

      console.log('📡 Fetching offerings from RevenueCat...');
      const offerings = await Purchases.getOfferings();
      this.currentOfferings = offerings;
      
      console.log('📦 Raw offerings response:', offerings);
      console.log('📦 All offerings:', offerings.all);
      console.log('📦 Current offering:', offerings.current);
      console.log('📦 Current offering packages:', offerings.current?.availablePackages);
      
      // List all available offering IDs
      if (offerings.all) {
        const allOfferingIds = Object.keys(offerings.all);
        console.log('📋 Available offering IDs:', allOfferingIds);
      }
      
      // If specific offering ID is requested, verify it exists
      if (offeringId && offerings.all) {
        const specificOffering = offerings.all[offeringId];
        if (specificOffering) {
          console.log(`✅ Found specific offering: ${offeringId}`);
          console.log(`✅ Packages in offering:`, specificOffering.availablePackages);
          // Return offerings with the specific one as current
          return {
            ...offerings,
            current: specificOffering
          };
        } else {
          console.warn(`⚠️ Offering ${offeringId} not found in available offerings`);
          console.warn(`⚠️ Using default current offering instead`);
        }
      }
      
      return offerings;
    } catch (error) {
      console.error('❌ Error fetching offerings:', error);
      return null;
    }
  }

  private createDemoOfferings(offeringId?: string): PurchasesOfferings {
    // Create demo packages for web testing with real product IDs and prices
    const demoPackages: any[] = [
      {
        identifier: 'prod639e144080',
        packageType: 'MONTHLY',
        product: {
          identifier: 'prod639e144080',
          description: 'Premium Chef Mensual - Recetas ilimitadas',
          title: 'Premium Chef Mensual',
          price: 0.99,
          priceString: '0,99 €',
          currencyCode: 'EUR',
          introPrice: null,
          subscriptionPeriod: 'P1M'
        },
        offeringIdentifier: offeringId || 'default'
      },
      {
        identifier: 'prod952e6667f9',
        packageType: 'ANNUAL',
        product: {
          identifier: 'prod952e6667f9',
          description: 'Premium Chef Anual - Recetas ilimitadas (Ahorra 67%)',
          title: 'Premium Chef Anual',
          price: 3.99,
          priceString: '3,99 €',
          currencyCode: 'EUR',
          introPrice: null,
          subscriptionPeriod: 'P1Y'
        },
        offeringIdentifier: offeringId || 'default'
      }
    ];

    const currentOffering: any = {
      identifier: offeringId || 'default',
      serverDescription: 'Demo offering for web testing',
      metadata: {},
      availablePackages: demoPackages,
      lifetime: null,
      annual: demoPackages[1],
      sixMonth: null,
      threeMonth: null,
      twoMonth: null,
      monthly: demoPackages[0],
      weekly: null
    };

    return {
      all: {},
      current: currentOffering
    };
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
      // In web mode, simulate successful purchase
      if (Capacitor.getPlatform() === 'web') {
        console.log('🌐 Web mode: Simulating purchase for', packageToPurchase.product.title);
        // Simulate a delay like a real purchase
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('✅ Demo purchase successful - Premium unlocked (web demo mode)');
        return true;
      }

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
      // In web mode, simulate restore
      if (Capacitor.getPlatform() === 'web') {
        console.log('🌐 Web mode: Simulating restore purchases');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('No active subscriptions found (web demo mode)');
        return false;
      }

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
      this.currentUserId = userID;
      
      this.logger.info('RevenueCatService', 'User ID set', { uid: userID });
      
      this.setupCustomerInfoListener(userID);
    } catch (error) {
      this.logger.error('RevenueCatService', 'Error setting user ID', error as Error, { uid: userID });
    }
  }

  private setupCustomerInfoListener(uid: string): void {
    if (Capacitor.getPlatform() === 'web') {
      this.logger.info('RevenueCatService', 'Skipping listener setup in web mode');
      return;
    }

    Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
      this.logger.info('RevenueCatService', 'Customer info updated', {
        uid,
        hasPremium: customerInfo.entitlements.active['premium'] !== undefined
      });

      const subscriptionData = this.mapCustomerInfoToSubscription(customerInfo);
      
      try {
        await this.firestoreService.updateUserSubscription(uid, subscriptionData);
      } catch (error) {
        this.logger.error('RevenueCatService', 'Failed to sync subscription to Firestore', error as Error, {
          uid,
          isPremium: subscriptionData.isPremium
        });
      }
    });

    this.logger.info('RevenueCatService', 'Customer info listener attached', { uid });
  }

  private mapCustomerInfoToSubscription(customerInfo: CustomerInfo): SubscriptionData {
    const premiumEntitlement = customerInfo.entitlements.active['premium'];
    
    return {
      isPremium: premiumEntitlement !== undefined,
      expirationDate: premiumEntitlement?.expirationDate 
        ? new Date(premiumEntitlement.expirationDate) 
        : null,
      productIdentifier: premiumEntitlement?.productIdentifier || null,
      lastUpdated: new Date()
    };
  }

  async logout(): Promise<void> {
    try {
      if (!this.isConfigured) {
        return;
      }

      await Purchases.logOut();
      this.currentUserId = null;
      
      this.logger.info('RevenueCatService', 'User logged out');
    } catch (error) {
      this.logger.error('RevenueCatService', 'Error logging out', error as Error);
    }
  }
}
