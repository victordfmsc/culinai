import { Injectable, signal } from '@angular/core';

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
      title: `+${points} puntos`,
      message: reason,
      icon: '⭐',
      points
    });
  }

  showAchievementUnlocked(achievementTitle: string, achievementIcon: string, points: number) {
    this.showNotification({
      type: 'achievement',
      title: '¡Logro desbloqueado!',
      message: `${achievementIcon} ${achievementTitle} (+${points} pts)`,
      icon: '🏆',
      points,
      duration: 4000
    });
  }

  showLevelUp(newLevel: number, levelTitle: string) {
    this.showNotification({
      type: 'level',
      title: '¡Subiste de nivel!',
      message: `Nivel ${newLevel}: ${levelTitle}`,
      icon: '🎉',
      duration: 4000
    });
  }

  showStreakBonus(streak: number, points: number) {
    this.showNotification({
      type: 'streak',
      title: '¡Racha activa!',
      message: `${streak} días consecutivos (+${points} pts)`,
      icon: '🔥',
      points,
      duration: 3500
    });
  }
}
