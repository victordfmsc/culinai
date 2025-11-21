import { Injectable } from '@angular/core';
import { ShoppingItem, ItemCategory, MealPlan, DAYS_OF_WEEK_KEYS } from '../models/user.model';
import { Recipe } from './gemini.service';

interface IngredientData {
  quantity: number;
  unit: string;
  category: ItemCategory;
  originalText: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  
  generateFromMealPlan(mealPlan: MealPlan, globalMultiplier: number = 1, allRecipes: Recipe[] = []): ShoppingItem[] {
    const ingredientsMap = new Map<string, IngredientData>();

    DAYS_OF_WEEK_KEYS.forEach(day => {
      const dayRecipes = mealPlan[day as keyof MealPlan];
      
      dayRecipes.forEach(recipeName => {
        const recipe = allRecipes.find(r => r.title === recipeName);
        
        if (recipe) {
          recipe.ingredients.forEach(ingredient => {
            this.processIngredient(ingredient, globalMultiplier, ingredientsMap);
          });
        }
      });
    });

    return this.convertMapToShoppingItems(ingredientsMap);
  }

  private processIngredient(
    ingredient: string,
    multiplier: number,
    ingredientsMap: Map<string, IngredientData>
  ): void {
    const parsed = this.parseIngredient(ingredient);
    const normalizedName = this.normalizeIngredientName(parsed.name);
    
    if (ingredientsMap.has(normalizedName)) {
      const existing = ingredientsMap.get(normalizedName)!;
      
      if (existing.unit === parsed.unit || this.areUnitsCompatible(existing.unit, parsed.unit)) {
        const convertedQuantity = this.convertUnits(parsed.quantity * multiplier, parsed.unit, existing.unit);
        existing.quantity += convertedQuantity;
      } else {
        const uniqueKey = `${normalizedName}_${parsed.unit}`;
        ingredientsMap.set(uniqueKey, {
          quantity: parsed.quantity * multiplier,
          unit: parsed.unit,
          category: this.categorizeIngredient(normalizedName),
          originalText: parsed.name
        });
      }
    } else {
      ingredientsMap.set(normalizedName, {
        quantity: parsed.quantity * multiplier,
        unit: parsed.unit,
        category: this.categorizeIngredient(normalizedName),
        originalText: parsed.name
      });
    }
  }

  private parseIngredient(ingredient: string): { quantity: number; unit: string; name: string } {
    const patterns = [
      /^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|L|l|tbsp|tsp|cup|cups|oz|lb|lbs|unidades?|piezas?|dientes?|rama|hojas?|pizca|c\/s|c\/n)?\s+(.+)$/i,
      /^(\d+)\s+(.+)$/,
      /^(.+)$/
    ];

    for (const pattern of patterns) {
      const match = ingredient.trim().match(pattern);
      if (match) {
        if (match.length === 4) {
          return {
            quantity: parseFloat(match[1].replace(',', '.')),
            unit: this.normalizeUnit(match[2] || 'unidad'),
            name: match[3]
          };
        } else if (match.length === 3) {
          return {
            quantity: parseFloat(match[1]),
            unit: 'unidad',
            name: match[2]
          };
        } else {
          return {
            quantity: 1,
            unit: 'unidad',
            name: match[1]
          };
        }
      }
    }

    return { quantity: 1, unit: 'unidad', name: ingredient };
  }

  private normalizeUnit(unit: string): string {
    const unitMap: { [key: string]: string } = {
      'g': 'g',
      'gr': 'g',
      'gramo': 'g',
      'gramos': 'g',
      'kg': 'kg',
      'kilo': 'kg',
      'kilos': 'kg',
      'ml': 'ml',
      'l': 'L',
      'litro': 'L',
      'litros': 'L',
      'tbsp': 'tbsp',
      'tsp': 'tsp',
      'cup': 'cup',
      'cups': 'cup',
      'oz': 'oz',
      'lb': 'lb',
      'lbs': 'lb',
      'unidad': 'unidad',
      'unidades': 'unidad',
      'pieza': 'unidad',
      'piezas': 'unidad',
      'diente': 'diente',
      'dientes': 'diente',
      'rama': 'rama',
      'hoja': 'hoja',
      'hojas': 'hoja',
      'pizca': 'pizca',
      'c/s': 'c/s',
      'c/n': 'c/n'
    };

    return unitMap[unit.toLowerCase()] || unit.toLowerCase();
  }

  private normalizeIngredientName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/,.*$/, '')
      .replace(/\b(picado|picada|cortado|cortada|en|de|del|la|el|fresco|fresca|frescos|frescas)\b/g, '')
      .trim();
  }

  private areUnitsCompatible(unit1: string, unit2: string): boolean {
    const weightUnits = ['g', 'kg'];
    const volumeUnits = ['ml', 'L'];
    
    return (
      (weightUnits.includes(unit1) && weightUnits.includes(unit2)) ||
      (volumeUnits.includes(unit1) && volumeUnits.includes(unit2))
    );
  }

  private convertUnits(quantity: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return quantity;

    const conversions: { [key: string]: { [key: string]: number } } = {
      'g': { 'kg': 0.001 },
      'kg': { 'g': 1000 },
      'ml': { 'L': 0.001 },
      'L': { 'ml': 1000 }
    };

    if (conversions[fromUnit] && conversions[fromUnit][toUnit]) {
      return quantity * conversions[fromUnit][toUnit];
    }

    return quantity;
  }

  categorizeIngredient(ingredient: string): ItemCategory {
    const categoryKeywords: { [key in ItemCategory]: string[] } = {
      dairy: ['leche', 'queso', 'yogur', 'mantequilla', 'nata', 'crema', 'butter', 'milk', 'cheese', 'cream', 'yogurt', 'mozzarella', 'parmesano', 'feta'],
      fruits_vegetables: ['tomate', 'cebolla', 'ajo', 'zanahoria', 'lechuga', 'pimiento', 'patata', 'papa', 'manzana', 'plátano', 'naranja', 'limón', 'aguacate', 'tomato', 'onion', 'garlic', 'carrot', 'lettuce', 'pepper', 'potato', 'apple', 'banana', 'orange', 'lemon', 'avocado', 'espinaca', 'brócoli', 'calabacín', 'pepino', 'guisantes'],
      meat_fish: ['pollo', 'carne', 'ternera', 'cerdo', 'pescado', 'salmón', 'atún', 'gambas', 'camarones', 'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'cordero', 'pavo'],
      pantry: ['arroz', 'pasta', 'harina', 'azúcar', 'aceite', 'sal', 'legumbres', 'garbanzos', 'lentejas', 'rice', 'flour', 'sugar', 'oil', 'beans', 'lentils', 'chickpeas', 'quinoa', 'cous', 'caldo', 'broth'],
      spices: ['pimienta', 'pimentón', 'orégano', 'albahaca', 'perejil', 'cilantro', 'comino', 'curry', 'jengibre', 'canela', 'pepper', 'paprika', 'oregano', 'basil', 'parsley', 'cumin', 'ginger', 'cinnamon', 'especias', 'condimento'],
      frozen: ['congelado', 'helado', 'frozen', 'ice cream'],
      bakery: ['pan', 'tortilla', 'baguette', 'croissant', 'bread', 'baguette'],
      other: []
    };

    const lowerIngredient = ingredient.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerIngredient.includes(keyword))) {
        return category as ItemCategory;
      }
    }

    return 'other';
  }

  private convertMapToShoppingItems(ingredientsMap: Map<string, IngredientData>): ShoppingItem[] {
    const items: ShoppingItem[] = [];
    
    ingredientsMap.forEach((data, name) => {
      const roundedQuantity = this.roundToCommercialUnit(data.quantity, data.unit);
      
      items.push({
        id: this.generateId(),
        text: data.originalText,
        checked: false,
        quantity: roundedQuantity,
        unit: data.unit,
        category: data.category,
        fromRecipe: true
      });
    });

    return this.sortByCategory(items);
  }

  private roundToCommercialUnit(quantity: number, unit: string): number {
    if (unit === 'unidad' || unit === 'diente' || unit === 'rama' || unit === 'hoja') {
      return Math.ceil(quantity);
    }

    if (quantity < 10) {
      return Math.round(quantity * 10) / 10;
    } else if (quantity < 100) {
      return Math.round(quantity / 5) * 5;
    } else {
      return Math.round(quantity / 10) * 10;
    }
  }

  sortByCategory(items: ShoppingItem[]): ShoppingItem[] {
    const categoryOrder: ItemCategory[] = [
      'fruits_vegetables',
      'meat_fish',
      'dairy',
      'frozen',
      'pantry',
      'bakery',
      'spices',
      'other'
    ];

    return items.sort((a, b) => {
      const aCategoryIndex = categoryOrder.indexOf(a.category);
      const bCategoryIndex = categoryOrder.indexOf(b.category);
      
      if (aCategoryIndex !== bCategoryIndex) {
        return aCategoryIndex - bCategoryIndex;
      }
      
      return a.text.localeCompare(b.text);
    });
  }

  applyGlobalMultiplier(items: ShoppingItem[], multiplier: number): ShoppingItem[] {
    return items.map(item => ({
      ...item,
      quantity: item.quantity ? this.roundToCommercialUnit(item.quantity * multiplier, item.unit || 'unidad') : undefined
    }));
  }

  addManualItem(items: ShoppingItem[], text: string, category: ItemCategory = 'other'): ShoppingItem[] {
    const newItem: ShoppingItem = {
      id: this.generateId(),
      text,
      checked: false,
      category,
      fromRecipe: false
    };
    
    return this.sortByCategory([...items, newItem]);
  }

  removeItem(items: ShoppingItem[], itemId: string): ShoppingItem[] {
    return items.filter(item => item.id !== itemId);
  }

  updateItem(items: ShoppingItem[], itemId: string, updates: Partial<ShoppingItem>): ShoppingItem[] {
    return items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
  }

  toggleItem(items: ShoppingItem[], itemId: string): ShoppingItem[] {
    return items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
  }

  clearCheckedItems(items: ShoppingItem[]): ShoppingItem[] {
    return items.filter(item => !item.checked);
  }

  getProgress(items: ShoppingItem[]): { checked: number; total: number; percentage: number } {
    const checked = items.filter(item => item.checked).length;
    const total = items.length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
    
    return { checked, total, percentage };
  }

  groupByCategory(items: ShoppingItem[]): Map<ItemCategory, ShoppingItem[]> {
    const grouped = new Map<ItemCategory, ShoppingItem[]>();
    
    items.forEach(item => {
      if (!grouped.has(item.category)) {
        grouped.set(item.category, []);
      }
      grouped.get(item.category)!.push(item);
    });
    
    return grouped;
  }

  exportToText(items: ShoppingItem[]): string {
    const grouped = this.groupByCategory(items);
    let text = '🛒 LISTA DE COMPRA\n\n';
    
    grouped.forEach((categoryItems, category) => {
      text += `\n${this.getCategoryEmoji(category)} ${this.getCategoryName(category).toUpperCase()}\n`;
      text += '─'.repeat(30) + '\n';
      
      categoryItems.forEach(item => {
        const checkbox = item.checked ? '✓' : '☐';
        const quantity = item.quantity && item.unit ? `${item.quantity}${item.unit} ` : '';
        text += `${checkbox} ${quantity}${item.text}\n`;
        if (item.note) {
          text += `   └ ${item.note}\n`;
        }
      });
    });
    
    const progress = this.getProgress(items);
    text += `\n\n📊 Progreso: ${progress.checked}/${progress.total} (${progress.percentage}%)`;
    
    return text;
  }

  copyToClipboard(items: ShoppingItem[]): boolean {
    const text = this.exportToText(items);
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      return true;
    }
    
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }

  shareViaWhatsApp(items: ShoppingItem[]): void {
    const text = encodeURIComponent(this.exportToText(items));
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  }

  shareViaEmail(items: ShoppingItem[], email?: string): void {
    const subject = encodeURIComponent('Lista de Compra');
    const body = encodeURIComponent(this.exportToText(items));
    const mailto = email ? `mailto:${email}?subject=${subject}&body=${body}` : `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  }

  private getCategoryName(category: ItemCategory): string {
    const names: { [key in ItemCategory]: string } = {
      dairy: 'Lácteos',
      fruits_vegetables: 'Frutas y Verduras',
      meat_fish: 'Carnes y Pescados',
      pantry: 'Despensa',
      spices: 'Especias y Condimentos',
      frozen: 'Congelados',
      bakery: 'Panadería',
      other: 'Otros'
    };
    
    return names[category];
  }

  private getCategoryEmoji(category: ItemCategory): string {
    const emojis: { [key in ItemCategory]: string } = {
      dairy: '🥛',
      fruits_vegetables: '🥬',
      meat_fish: '🥩',
      pantry: '🌾',
      spices: '🧂',
      frozen: '❄️',
      bakery: '🍞',
      other: '📦'
    };
    
    return emojis[category];
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
