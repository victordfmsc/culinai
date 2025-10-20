import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  isSubscribed = signal(true);

  startTrial() {
    this.isSubscribed.set(true);
    console.log('Trial started');
  }

  restorePurchases() {
    console.log('Restore purchases attempted');
  }
}
