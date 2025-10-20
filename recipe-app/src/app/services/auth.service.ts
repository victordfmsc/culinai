import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { FirestoreService } from './firestore.service';

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
export class AuthService {
  private app = initializeApp(firebaseConfig);
  private auth = getAuth(this.app);
  
  currentUser = signal<User | null>(null);

  constructor(private firestoreService: FirestoreService) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      if (user) {
        this.firestoreService.loadUserData(user.uid);
      } else {
        this.firestoreService.clearUserData();
      }
    });
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      console.log('Logged in with Google:', result.user.email);
    } catch (error) {
      console.error('Google login failed:', error);
    }
  }

  async loginWithEmail(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Logged in with email:', result.user.email);
    } catch (error) {
      console.error('Email login failed:', error);
    }
  }

  async signUpWithEmail(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      await this.firestoreService.createUser(result.user.uid, result.user.email || '');
      console.log('Signed up with email:', result.user.email);
    } catch (error) {
      console.error('Email signup failed:', error);
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
}
