import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private readonly STORAGE_KEY = 'chef_ai_onboarding_completed';
  
  showOnboarding = signal<boolean>(!this.hasCompletedOnboarding());

  hasCompletedOnboarding(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    return localStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  completeOnboarding(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.STORAGE_KEY, 'true');
      this.showOnboarding.set(false);
    }
  }

  resetOnboarding(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.STORAGE_KEY);
      this.showOnboarding.set(true);
    }
  }
}
