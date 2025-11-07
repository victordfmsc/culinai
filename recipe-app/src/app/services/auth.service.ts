import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInWithCredential,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { FirestoreService } from './firestore.service';

const firebaseConfig = {
  apiKey: "AIzaSyAmuCpF-38om69YwJeQhjt_JNWXeVa1Abw",
  authDomain: "chef-ai-b08d8.firebaseapp.com",
  projectId: "chef-ai-b08d8",
  storageBucket: "chef-ai-b08d8.firebasestorage.app",
  messagingSenderId: "204589480105",
  appId: "1:204589480105:web:6652f0f7ced50ce2e211b8",
  measurementId: "G-RQM9Y3KHS9"
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
      const platform = Capacitor.getPlatform();
      
      if (platform === 'android' || platform === 'ios') {
        // Native authentication with Firebase Authentication plugin
        // Web Client ID is automatically read from google-services.json
        const result = await FirebaseAuthentication.signInWithGoogle();
        
        console.log('Native Google sign-in successful:', result.user?.email);
        
        // Sync native auth with Firebase Auth SDK using credential
        if (result.credential?.idToken) {
          const credential = GoogleAuthProvider.credential(
            result.credential.idToken,
            result.credential.accessToken
          );
          
          const userCredential = await signInWithCredential(this.auth, credential);
          console.log('Firebase Auth synchronized with native auth:', userCredential.user.email);
        } else {
          console.warn('No idToken received from native authentication');
        }
      } else {
        // Web authentication with popup
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(this.auth, provider);
        console.log('Logged in with Google (web):', result.user.email);
      }
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
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
