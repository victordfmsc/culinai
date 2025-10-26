import { Injectable, signal, inject } from '@angular/core';
import { TranslationService } from './translation.service';

export interface Notification {
  id: string;
  type: 'points' | 'achievement' | 'level' | 'streak';
  title: string;
  message: string;
  icon: string;
  points?: number;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private translationService = inject(TranslationService);
  notifications = signal<Notification[]>([]);

  showNotification(notification: Omit<Notification, 'id'>) {
    const id = `notif-${Date.now()}-${Math.random()}`;
    const duration = notification.duration || 3000;
    
    const fullNotification: Notification = { ...notification, id };
    
    this.notifications.update(notifs => [...notifs, fullNotification]);
    
    setTimeout(() => {
      this.removeNotification(id);
    }, duration);
  }

  removeNotification(id: string) {
    this.notifications.update(notifs => notifs.filter(n => n.id !== id));
  }

  showPointsGained(points: number, reason: string) {
    this.showNotification({
      type: 'points',
      title: `+${points} ${this.translationService.translate('points').toLowerCase()}`,
      message: reason,
      icon: '⭐',
      points
    });
  }

  showAchievementUnlocked(achievementTitle: string, achievementIcon: string, points: number) {
    const ptsLabel = this.translationService.translate('points_short');
    this.showNotification({
      type: 'achievement',
      title: this.translationService.translate('notif_achievement_unlocked'),
      message: `${achievementIcon} ${achievementTitle} (+${points} ${ptsLabel})`,
      icon: '🏆',
      points,
      duration: 4000
    });
  }

  showLevelUp(newLevel: number, levelTitle: string) {
    this.showNotification({
      type: 'level',
      title: this.translationService.translate('notif_level_up'),
      message: `${this.translationService.translate('level')} ${newLevel}: ${levelTitle}`,
      icon: '🎉',
      duration: 4000
    });
  }

  showStreakBonus(streak: number, points: number) {
    const daysWord = this.translationService.translate('notif_days');
    const ptsLabel = this.translationService.translate('points_short');
    this.showNotification({
      type: 'streak',
      title: this.translationService.translate('notif_streak_active'),
      message: `${streak} ${daysWord} (+${points} ${ptsLabel})`,
      icon: '🔥',
      points,
      duration: 3500
    });
  }
}
