import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingItem } from '../../models/user.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Shopping List</h2>
        
        @if (listItems.length === 0) {
          <div class="text-center py-12 text-gray-500">
            <p>Your shopping list is empty</p>
          </div>
        } @else {
          <div class="space-y-2">
            @for (item of listItems; track $index; let i = $index) {
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  [checked]="item.checked"
                  (change)="toggleItem(i)"
                  class="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span [class.line-through]="item.checked" [class.text-gray-400]="item.checked" class="flex-1">
                  {{ item.text }}
                </span>
                <button
                  (click)="removeItem(i)"
                  class="text-red-500 hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </div>
            }
          </div>

          <button
            (click)="clearChecked()"
            class="w-full mt-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear Checked Items
          </button>
        }
      </div>
    </div>
  `
})
export class ShoppingListComponent {
  @Input() listItems: ShoppingItem[] = [];
  @Output() listChanged = new EventEmitter<ShoppingItem[]>();

  toggleItem(index: number) {
    const updated = [...this.listItems];
    updated[index] = { ...updated[index], checked: !updated[index].checked };
    this.listChanged.emit(updated);
  }

  removeItem(index: number) {
    const updated = this.listItems.filter((_, i) => i !== index);
    this.listChanged.emit(updated);
  }

  clearChecked() {
    const updated = this.listItems.filter(item => !item.checked);
    this.listChanged.emit(updated);
  }
}
