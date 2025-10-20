import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <select
      [value]="translationService.currentLanguage()"
      (change)="onLanguageChange($event)"
      class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="en">🇬🇧 EN</option>
      <option value="es">🇪🇸 ES</option>
      <option value="fr">🇫🇷 FR</option>
      <option value="de">🇩🇪 DE</option>
      <option value="it">🇮🇹 IT</option>
    </select>
  `
})
export class LanguageSelectorComponent {
  translationService = inject(TranslationService);

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.translationService.setLanguage(select.value as any);
  }
}
