import { Component, Input, Output, EventEmitter, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingItem, ItemCategory, ITEM_CATEGORIES } from '../../models/user.model';
import { ShoppingListService } from '../../services/shopping-list.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { NotificationService } from '../../services/notification.service';
import { TranslationService } from '../../services/translation.service';

type ViewMode = 'list' | 'category';
type SortMode = 'category' | 'checked';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent {
  @Input() listItems: ShoppingItem[] = [];
  @Output() listChanged = new EventEmitter<ShoppingItem[]>();

  private shoppingService = inject(ShoppingListService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);

  viewMode = signal<ViewMode>('category');
  sortMode = signal<SortMode>('category');
  showAddModal = signal(false);
  showMultiplierModal = signal(false);
  hideChecked = signal(false);
  darkMode = signal(false);

  globalMultiplier = signal(1);
  newItemText = signal('');
  newItemCategory = signal<ItemCategory>('other');

  progress = computed(() => this.shoppingService.getProgress(this.listItems));
  
  groupedItems = computed(() => {
    const filtered = this.hideChecked() 
      ? this.listItems.filter(item => !item.checked)
      : this.listItems;
    
    if (this.sortMode() === 'checked') {
      return this.sortByCheckedStatus(filtered);
    }
    
    return this.shoppingService.groupByCategory(filtered);
  });

  allCategories = ITEM_CATEGORIES;

  private sortByCheckedStatus(items: ShoppingItem[]): Map<ItemCategory, ShoppingItem[]> {
    const unchecked = items.filter(item => !item.checked);
    const checked = items.filter(item => item.checked);
    return this.shoppingService.groupByCategory([...unchecked, ...checked]);
  }

  toggleItem(itemId: string) {
    const updated = this.shoppingService.toggleItem(this.listItems, itemId);
    this.listChanged.emit(updated);
  }

  removeItem(itemId: string) {
    const updated = this.shoppingService.removeItem(this.listItems, itemId);
    this.listChanged.emit(updated);
  }

  updateItemQuantity(itemId: string, quantity: number) {
    const updated = this.shoppingService.updateItem(this.listItems, itemId, { quantity });
    this.listChanged.emit(updated);
  }

  updateItemNote(itemId: string, note: string) {
    const updated = this.shoppingService.updateItem(this.listItems, itemId, { note });
    this.listChanged.emit(updated);
  }

  addManualItem() {
    const text = this.newItemText().trim();
    if (!text) return;

    const updated = this.shoppingService.addManualItem(
      this.listItems,
      text,
      this.newItemCategory()
    );
    this.listChanged.emit(updated);
    
    this.newItemText.set('');
    this.newItemCategory.set('other');
    this.showAddModal.set(false);
  }

  clearCheckedItems() {
    const updated = this.shoppingService.clearCheckedItems(this.listItems);
    this.listChanged.emit(updated);
  }

  applyGlobalMultiplier() {
    const multiplier = this.globalMultiplier();
    if (multiplier <= 0 || multiplier > 10) return;

    const updated = this.shoppingService.applyGlobalMultiplier(this.listItems, multiplier);
    this.listChanged.emit(updated);
    this.showMultiplierModal.set(false);
  }

  copyToClipboard() {
    const success = this.shoppingService.copyToClipboard(this.listItems);
    
    if (success) {
      this.notificationService.showNotification({
        type: 'points',
        title: this.translationService.translate('copied_to_clipboard'),
        message: '',
        icon: '📋',
        duration: 2000
      });
    }
  }

  shareViaWhatsApp() {
    this.shoppingService.shareViaWhatsApp(this.listItems);
  }

  shareViaEmail() {
    this.shoppingService.shareViaEmail(this.listItems);
  }

  printList() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = this.shoppingService.exportToText(this.listItems);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lista de Compra</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          pre {
            white-space: pre-wrap;
            font-size: 14px;
            line-height: 1.6;
          }
          @media print {
            body { margin: 0; padding: 10mm; }
          }
        </style>
      </head>
      <body>
        <pre>${content}</pre>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  getCategoryIcon(category: ItemCategory): string {
    const icons: { [key in ItemCategory]: string } = {
      dairy: '🥛',
      fruits_vegetables: '🥬',
      meat_fish: '🥩',
      pantry: '🌾',
      spices: '🧂',
      frozen: '❄️',
      bakery: '🍞',
      other: '📦'
    };
    return icons[category];
  }

  getCategoryName(category: ItemCategory): string {
    const translationKeys: { [key in ItemCategory]: string } = {
      dairy: 'category_dairy',
      fruits_vegetables: 'category_fruits_vegetables',
      meat_fish: 'category_meat_fish',
      pantry: 'category_pantry',
      spices: 'category_spices',
      frozen: 'category_frozen',
      bakery: 'category_bakery',
      other: 'category_other'
    };
    
    return this.translationService.translate(translationKeys[category]);
  }

  toggleDarkMode() {
    this.darkMode.set(!this.darkMode());
  }

  getItemsByCategory(category: ItemCategory): ShoppingItem[] {
    return this.groupedItems().get(category) || [];
  }
}
