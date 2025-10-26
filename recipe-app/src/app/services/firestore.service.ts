import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Firestore
} from 'firebase/firestore';
import { UserData, EMPTY_MEAL_PLAN, EMPTY_ACHIEVEMENTS } from '../models/user.model';

const firebaseConfig = {
  apiKey: "AIzaSyBYcruBDN5mbfnqJ2HnAyH4MSosKRODwRg",
  authDomain: "chef-ai-b08d8.firebaseapp.com",
  projectId: "chef-ai-b08d8",
  storageBucket: "chef-ai-b08d8.firebasestorage.app",
  messagingSenderId: "204589480105",
  appId: "1:204589480105:web:c4772a58aa9b2a30e211b8"
};

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private app = initializeApp(firebaseConfig, 'firestore-app');
  private db: Firestore = getFirestore(this.app);
  
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
        
        this.currentUserData.set(data as UserData);
      } else {
        console.log('User document not found, might be a new user');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
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

  clearUserData() {
    this.currentUserData.set(null);
  }
}
