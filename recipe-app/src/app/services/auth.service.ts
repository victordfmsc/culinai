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
  onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { FirestoreService } from './firestore.service';
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
export class AuthService {
  private app = initializeApp(firebaseConfig);
  private auth = getAuth(this.app);
  
  currentUser = signal<FirebaseUser | null>(null);

  constructor(
    private firestoreService: FirestoreService,
    private logger: LoggerService
  ) {
    onAuthStateChanged(this.auth, (user: FirebaseUser | null) => {
      this.currentUser.set(user);
      if (user) {
        this.logger.info('AuthService', 'User authenticated', {
          uid: user.uid,
          email: user.email,
          provider: user.providerData[0]?.providerId
        });
        this.firestoreService.loadUserData(user.uid);
      } else {
        this.logger.debug('AuthService', 'User signed out');
        this.firestoreService.clearUserData();
      }
    });
  }

  async loginWithGoogle() {
    const platform = Capacitor.getPlatform();
    this.logger.info('AuthService', 'Starting Google authentication', { platform });
    
    try {
      if (platform === 'android' || platform === 'ios') {
        // Native authentication with Firebase Authentication plugin
        this.logger.debug('AuthService', 'Using native Google Sign-In');
        const result = await FirebaseAuthentication.signInWithGoogle();
        
        // Validate credential before proceeding
        if (!result?.credential?.idToken) {
          const errorMsg = 'Google authentication failed: Missing credential or idToken';
          this.logger.error('AuthService', errorMsg, new Error(errorMsg), { 
            hasResult: !!result,
            hasCredential: !!result?.credential,
            hasIdToken: !!result?.credential?.idToken
          });
          throw new Error(errorMsg);
        }
        
        this.logger.info('AuthService', 'Native Google sign-in successful', {
          email: result.user?.email,
          hasIdToken: true
        });
        
        // Sync native auth with Firebase Auth SDK using credential
        const credential = GoogleAuthProvider.credential(
          result.credential.idToken,
          result.credential.accessToken
        );
        
        const userCredential = await signInWithCredential(this.auth, credential);
        this.logger.info('AuthService', 'Firebase Auth synchronized with native auth', {
          uid: userCredential.user.uid,
          email: userCredential.user.email
        });
      } else {
        // Web authentication with popup
        this.logger.debug('AuthService', 'Using web popup authentication');
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(this.auth, provider);
        this.logger.info('AuthService', 'Web Google sign-in successful', {
          uid: result.user.uid,
          email: result.user.email
        });
      }
    } catch (error: any) {
      this.logger.error('AuthService', 'Google login failed', error, {
        errorCode: error.code,
        errorMessage: error.message,
        platform
      });
      
      // Provide user-friendly error messages
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Autenticación cancelada por el usuario');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Error de red. Verifica tu conexión a internet');
      } else if (error.message?.includes('Missing credential')) {
        throw new Error('Error de autenticación. Por favor, intenta de nuevo');
      } else {
        throw new Error(`Autenticación fallida: ${error.message || 'Error desconocido'}`);
      }
    }
  }

  async loginWithEmail(email: string, password: string) {
    this.logger.info('AuthService', 'Starting email authentication', { email });
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      this.logger.info('AuthService', 'Email authentication successful', {
        uid: result.user.uid,
        email: result.user.email
      });
    } catch (error: any) {
      this.logger.error('AuthService', 'Email login failed', error, {
        email,
        errorCode: error.code
      });
      throw error;
    }
  }

  async signUpWithEmail(email: string, password: string) {
    this.logger.info('AuthService', 'Starting email signup', { email });
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      this.logger.debug('AuthService', 'User created, initializing Firestore data', {
        uid: result.user.uid
      });
      await this.firestoreService.createUser(result.user.uid, result.user.email || '');
      this.logger.info('AuthService', 'Email signup successful', {
        uid: result.user.uid,
        email: result.user.email
      });
    } catch (error: any) {
      this.logger.error('AuthService', 'Email signup failed', error, {
        email,
        errorCode: error.code
      });
      throw error;
    }
  }

  async logout() {
    const currentEmail = this.currentUser()?.email;
    this.logger.info('AuthService', 'Starting logout', { email: currentEmail });
    try {
      await signOut(this.auth);
      this.logger.info('AuthService', 'Logout successful');
    } catch (error: any) {
      this.logger.error('AuthService', 'Logout failed', error);
      throw error;
    }
  }
}
