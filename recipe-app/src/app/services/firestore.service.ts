import { Injectable, signal, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { UserData, EMPTY_MEAL_PLAN, EMPTY_ACHIEVEMENTS, SubscriptionData } from '../models/user.model';
import { LoggerService } from './logger.service';

const firebaseConfig = {
  apiKey: "AIzaSyCKkzsv9lVnk2JBxnIOxS50hBbhLM6_PnA",
  authDomain: "chef-ai-64400.firebaseapp.com",
  projectId: "chef-ai-64400",
  storageBucket: "chef-ai-64400.firebasestorage.app",
  messagingSenderId: "63707537027",
  appId: "1:63707537027:web:94c61cffe03283800745b6"
};

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private app = initializeApp(firebaseConfig, 'firestore-app');
  private db: Firestore = getFirestore(this.app);
  private logger = inject(LoggerService);
  
  currentUserData = signal<UserData | null>(null);

  async loadUserData(uid: string) {
    try {
      const userDoc = doc(this.db, 'users', uid);
      const snapshot = await getDoc(userDoc);
      
      if (snapshot.exists()) {
        const data = snapshot.data() as any;
        
        if (data.achievements) {
          if (data.achievements.lastActiveDate?.toDate) {
            data.achievements.lastActiveDate = data.achievements.lastActiveDate.toDate();
          }
          if (data.achievements.weeklyChallenge?.weekStartDate?.toDate) {
            data.achievements.weeklyChallenge.weekStartDate = data.achievements.weeklyChallenge.weekStartDate.toDate();
          }
        }
        
        if (data.createdAt?.toDate) {
          data.createdAt = data.createdAt.toDate();
        }
        
        if (data.subscription) {
          if (data.subscription.expirationDate?.toDate) {
            data.subscription.expirationDate = data.subscription.expirationDate.toDate();
          }
          if (data.subscription.lastUpdated?.toDate) {
            data.subscription.lastUpdated = data.subscription.lastUpdated.toDate();
          }
        }
        
        this.currentUserData.set(data as UserData);
        
        this.logger.info('FirestoreService', 'User data loaded', {
          uid,
          hasPremium: data.subscription?.isPremium || false,
          expiresAt: data.subscription?.expirationDate?.toISOString()
        });
      } else {
        this.logger.info('FirestoreService', 'User document not found', { uid });
      }
    } catch (error) {
      this.logger.error('FirestoreService', 'Failed to load user data', error as Error, { uid });
    }
  }

  async createUser(uid: string, email: string) {
    try {
      const userData: UserData = {
        uid,
        email,
        points: 0,
        level: 1,
        mealPlan: EMPTY_MEAL_PLAN,
        shoppingList: [],
        createdAt: new Date(),
        achievements: EMPTY_ACHIEVEMENTS
      };
      
      const userDoc = doc(this.db, 'users', uid);
      await setDoc(userDoc, userData);
      this.currentUserData.set(userData);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  }

  async updateUser(uid: string, updates: Partial<UserData>) {
    try {
      const userDoc = doc(this.db, 'users', uid);
      await updateDoc(userDoc, updates as any);
      
      const current = this.currentUserData();
      if (current) {
        this.currentUserData.set({ ...current, ...updates });
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }

  async updateUserSubscription(uid: string, subscription: SubscriptionData): Promise<void> {
    try {
      const userDoc = doc(this.db, 'users', uid);
      
      const subscriptionForFirestore = {
        isPremium: subscription.isPremium,
        expirationDate: subscription.expirationDate ? Timestamp.fromDate(subscription.expirationDate) : null,
        productIdentifier: subscription.productIdentifier || null,
        lastUpdated: Timestamp.fromDate(subscription.lastUpdated)
      };
      
      await updateDoc(userDoc, {
        subscription: subscriptionForFirestore
      });
      
      const current = this.currentUserData();
      if (current) {
        this.currentUserData.set({ ...current, subscription });
      }
      
      this.logger.info('FirestoreService', 'Subscription updated in Firestore', {
        uid,
        isPremium: subscription.isPremium,
        productId: subscription.productIdentifier,
        expiresAt: subscription.expirationDate?.toISOString()
      });
    } catch (error) {
      this.logger.error('FirestoreService', 'Failed to update subscription', error as Error, {
        uid,
        isPremium: subscription.isPremium
      });
      throw error;
    }
  }

  clearUserData() {
    this.currentUserData.set(null);
  }
}
