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
import { UserData, EMPTY_MEAL_PLAN } from '../models/user.model';

const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
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
        this.currentUserData.set(snapshot.data() as UserData);
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
        createdAt: new Date()
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
