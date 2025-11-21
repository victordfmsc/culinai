import { Injectable, inject } from '@angular/core';
import { PantryItem, PantryCategory, ExpiryAlert, PantryStats, PANTRY_CATEGORIES } from '../models/user.model';
import { Recipe } from './gemini.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class PantryService {
  private logger = inject(LoggerService);

  /**
   * Check if an ingredient is available in pantry
   */
  checkIngredientAvailability(
    ingredientName: string,
    requiredQuantity: number,
    requiredUnit: string,
    pantryItems: PantryItem[]
  ): { available: boolean; hasEnough: boolean; currentQuantity: number; needsMore: number } {
    const normalizedName = this.normalizeIngredientName(ingredientName);
    
    const matchingItems = pantryItems.filter(item => 
      this.normalizeIngredientName(item.name) === normalizedName
    );

    if (matchingItems.length === 0) {
      return { available: false, hasEnough: false, currentQuantity: 0, needsMore: requiredQuantity };
    }

    const totalQuantity = matchingItems.reduce((sum, item) => {
      const convertedQty = this.convertUnits(item.quantity, item.unit, requiredUnit);
      return sum + convertedQty;
    }, 0);

    const hasEnough = totalQuantity >= requiredQuantity;
    const needsMore = hasEnough ? 0 : requiredQuantity - totalQuantity;

    return {
      available: true,
      hasEnough,
      currentQuantity: totalQuantity,
      needsMore
    };
  }

  /**
   * Get expiry alerts for items expiring soon
   */
  getExpiryAlerts(pantryItems: PantryItem[]): ExpiryAlert[] {
    const now = new Date();
    const alerts: ExpiryAlert[] = [];

    pantryItems.forEach(item => {
      if (item.expiryDate) {
        const expiryDate = new Date(item.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 7) {
          alerts.push({
            itemId: item.id,
            itemName: item.name,
            daysUntilExpiry,
            urgency: daysUntilExpiry <= 2 ? 'critical' : daysUntilExpiry <= 4 ? 'warning' : 'normal'
          });
        }
      }
    });

    return alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  /**
   * Get count of critical expiry alerts
   */
  getCriticalAlertsCount(pantryItems: PantryItem[]): number {
    const alerts = this.getExpiryAlerts(pantryItems);
    return alerts.filter(a => a.urgency === 'critical').length;
  }

  /**
   * Find recipes that can be made with available ingredients
   */
  findRecipesWithAvailableIngredients(
    recipes: Recipe[],
    pantryItems: PantryItem[],
    minMatchPercentage: number = 0.6
  ): Array<{ recipe: Recipe; matchPercentage: number; missingIngredients: string[] }> {
    const results: Array<{ recipe: Recipe; matchPercentage: number; missingIngredients: string[] }> = [];

    recipes.forEach(recipe => {
      let matchCount = 0;
      const missingIngredients: string[] = [];

      recipe.ingredients.forEach(ingredient => {
        const parsed = this.parseIngredient(ingredient);
        const availability = this.checkIngredientAvailability(
          parsed.name,
          parsed.quantity,
          parsed.unit,
          pantryItems
        );

        if (availability.available && availability.hasEnough) {
          matchCount++;
        } else {
          missingIngredients.push(ingredient);
        }
      });

      const matchPercentage = recipe.ingredients.length > 0 
        ? matchCount / recipe.ingredients.length 
        : 0;

      if (matchPercentage >= minMatchPercentage) {
        results.push({ recipe, matchPercentage, missingIngredients });
      }
    });

    return results.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  /**
   * Update pantry after completing shopping
   */
  updatePantryFromShoppingList(
    pantryItems: PantryItem[],
    completedItems: Array<{ name: string; quantity: number; unit: string; category: string }>
  ): PantryItem[] {
    const now = new Date();
    const updatedPantry = [...pantryItems];

    completedItems.forEach(item => {
      const existingIndex = updatedPantry.findIndex(p => 
        this.normalizeIngredientName(p.name) === this.normalizeIngredientName(item.name)
      );

      if (existingIndex >= 0) {
        const existing = updatedPantry[existingIndex];
        const convertedQty = this.convertUnits(item.quantity, item.unit, existing.unit);
        updatedPantry[existingIndex] = {
          ...existing,
          quantity: existing.quantity + convertedQty,
          purchaseDate: now
        };
      } else {
        const newItem: PantryItem = {
          id: this.generateId(),
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: this.mapToPantryCategory(item.category),
          purchaseDate: now,
          addedAt: now,
          timesUsed: 0
        };

        const estimatedExpiry = this.estimateExpiryDate(item.name, newItem.category);
        if (estimatedExpiry) {
          newItem.expiryDate = estimatedExpiry;
        }

        updatedPantry.push(newItem);
      }
    });

    return updatedPantry;
  }

  /**
   * Get pantry statistics
   */
  getPantryStats(pantryItems: PantryItem[]): PantryStats {
    const expiryAlerts = this.getExpiryAlerts(pantryItems);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const unusedItems = pantryItems.filter(item => 
      item.timesUsed === 0 && 
      new Date(item.addedAt).getTime() < thirtyDaysAgo.getTime()
    ).length;

    const averageShelfLife = new Map<string, number>();
    const productLifetimes: { [key: string]: number[] } = {};

    pantryItems.forEach(item => {
      if (item.expiryDate && item.purchaseDate) {
        const lifetime = Math.ceil(
          (new Date(item.expiryDate).getTime() - new Date(item.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const normalizedName = this.normalizeIngredientName(item.name);
        if (!productLifetimes[normalizedName]) {
          productLifetimes[normalizedName] = [];
        }
        productLifetimes[normalizedName].push(lifetime);
      }
    });

    Object.keys(productLifetimes).forEach(name => {
      const lifetimes = productLifetimes[name];
      const average = lifetimes.reduce((sum, val) => sum + val, 0) / lifetimes.length;
      averageShelfLife.set(name, average);
    });

    const estimatedSavings = expiryAlerts.filter(a => a.urgency !== 'critical').length * 5;

    return {
      totalItems: pantryItems.length,
      expiringItems: expiryAlerts.length,
      unusedItems,
      estimatedSavings,
      averageShelfLife
    };
  }

  /**
   * Consume ingredients from pantry when cooking
   */
  consumeIngredients(
    pantryItems: PantryItem[],
    ingredients: string[],
    servingsMultiplier: number = 1
  ): PantryItem[] {
    const updatedPantry = [...pantryItems];

    ingredients.forEach(ingredient => {
      const parsed = this.parseIngredient(ingredient);
      const normalizedName = this.normalizeIngredientName(parsed.name);
      const requiredQty = parsed.quantity * servingsMultiplier;

      const matchingIndices = updatedPantry
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => this.normalizeIngredientName(item.name) === normalizedName)
        .map(({ index }) => index);

      if (matchingIndices.length > 0) {
        let remainingToConsume = requiredQty;

        matchingIndices.forEach(index => {
          if (remainingToConsume <= 0) return;

          const item = updatedPantry[index];
          const convertedQty = this.convertUnits(remainingToConsume, parsed.unit, item.unit);

          if (item.quantity >= convertedQty) {
            updatedPantry[index] = {
              ...item,
              quantity: item.quantity - convertedQty,
              lastUsed: new Date(),
              timesUsed: item.timesUsed + 1
            };
            remainingToConsume = 0;
          } else {
            remainingToConsume -= this.convertUnits(item.quantity, item.unit, parsed.unit);
            updatedPantry[index] = {
              ...item,
              quantity: 0,
              lastUsed: new Date(),
              timesUsed: item.timesUsed + 1
            };
          }
        });
      }
    });

    return updatedPantry.filter(item => item.quantity > 0);
  }

  /**
   * Categorize ingredient into pantry category
   */
  private mapToPantryCategory(shoppingCategory: string): PantryCategory {
    const mapping: { [key: string]: PantryCategory } = {
      'dairy': 'dairy',
      'fruits_vegetables': 'fresh',
      'meat_fish': 'fresh',
      'pantry': 'pantry',
      'spices': 'spices',
      'frozen': 'frozen',
      'bakery': 'pantry',
      'other': 'other'
    };

    return mapping[shoppingCategory] || 'other';
  }

  /**
   * Estimate expiry date based on product type
   */
  private estimateExpiryDate(itemName: string, category: PantryCategory): Date | undefined {
    const now = new Date();
    const normalizedName = itemName.toLowerCase();

    const expiryDays: { [key: string]: number } = {
      'fresh': 7,
      'dairy': 14,
      'frozen': 90,
      'pantry': 180,
      'spices': 365,
      'beverages': 60,
      'other': 30
    };

    if (normalizedName.includes('milk') || normalizedName.includes('cream')) {
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    if (normalizedName.includes('meat') || normalizedName.includes('fish') || normalizedName.includes('chicken')) {
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    }
    if (normalizedName.includes('vegetable') || normalizedName.includes('fruit') || normalizedName.includes('lettuce')) {
      return new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    }

    const days = expiryDays[category] || 30;
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Parse ingredient string
   */
  private parseIngredient(ingredient: string): { quantity: number; unit: string; name: string } {
    const patterns = [
      /^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|L|l|tbsp|tsp|cup|cups|oz|lb|lbs|unidades?|piezas?|dientes?|rama|hojas?|pizca|c\/s|c\/n)?\s+(.+)$/i,
      /^(\d+)\s+(.+)$/
    ];

    for (const pattern of patterns) {
      const match = ingredient.match(pattern);
      if (match) {
        const quantity = parseFloat(match[1].replace(',', '.'));
        const unit = match[2]?.toLowerCase() || 'unit';
        const name = match[3] || match[2] || ingredient;
        return { quantity, unit, name: name.trim() };
      }
    }

    return { quantity: 1, unit: 'unit', name: ingredient.trim() };
  }

  /**
   * Normalize ingredient name
   */
  private normalizeIngredientName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Convert units
   */
  private convertUnits(quantity: number, fromUnit: string, toUnit: string): number {
    const from = fromUnit.toLowerCase();
    const to = toUnit.toLowerCase();

    if (from === to) return quantity;

    const conversions: { [key: string]: number } = {
      'kg_g': 1000,
      'g_kg': 0.001,
      'l_ml': 1000,
      'ml_l': 0.001,
      'tbsp_tsp': 3,
      'tsp_tbsp': 0.333,
      'cup_ml': 240,
      'ml_cup': 0.00417
    };

    const conversionKey = `${from}_${to}`;
    return conversions[conversionKey] ? quantity * conversions[conversionKey] : quantity;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `pantry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
