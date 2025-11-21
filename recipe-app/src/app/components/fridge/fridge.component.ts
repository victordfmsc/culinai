import {
  Component,
  Output,
  EventEmitter,
  Input,
  signal,
  computed,
  effect,
  inject,
  OnInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslatePipe } from "../../pipes/translate.pipe";
import { TranslationService } from "../../services/translation.service";
import { PantryItem, PantryCategory, PANTRY_CATEGORIES, ExpiryAlert } from "../../models/user.model";
import { PantryService } from "../../services/pantry.service";

export interface RecipeSearchParams {
  ingredients: string;
  dietaryGoals: string[];
}

export interface PantryItemUpdate {
  pantryItems: PantryItem[];
  pointsAwarded?: number;
}

@Component({
  selector: "app-fridge",
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Tab Navigation -->
      <div class="bg-white rounded-xl shadow-md p-2 flex gap-2">
        <button
          (click)="activeTab.set('search')"
          [class]="getTabClass('search')"
        >
          🔍 {{ "fridge_tab_search" | translate }}
        </button>
        <button
          (click)="activeTab.set('pantry')"
          [class]="getTabClass('pantry')"
        >
          🏪 {{ "fridge_tab_pantry" | translate }}
          @if (expiryAlertCount() > 0) {
            <span class="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              {{ expiryAlertCount() }}
            </span>
          }
        </button>
      </div>

      <!-- Search Tab -->
      @if (activeTab() === 'search') {
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">
            {{ "nav_fridge" | translate }}
          </h2>
          <p class="text-gray-600 mb-6">{{ "fridge_question" | translate }}</p>

        <!-- Dietary Goals Section -->
        <div class="mb-6 pb-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-700 mb-3">
            <span class="mr-2">🎯</span>{{ "fridge_dietary_goals" | translate }}
          </h3>
          <p class="text-sm text-gray-600 mb-3">
            {{ "fridge_dietary_goals_desc" | translate }}
          </p>
          <div class="flex flex-wrap gap-2">
            @for (goal of dietaryGoals; track goal.key) {
              <button
                (click)="toggleDietaryGoal(goal.key)"
                [class]="getDietaryGoalClass(goal.key)"
              >
                <span class="mr-1">{{ goal.icon }}</span>
                {{ goal.key | translate }}
              </button>
            }
          </div>
          @if (selectedGoals().length > 0) {
            <div class="mt-3 flex items-center gap-2">
              <span class="text-sm font-medium text-indigo-600">
                {{ "fridge_selected_goals" | translate }}:
              </span>
              <div class="flex flex-wrap gap-1">
                @for (goal of selectedGoals(); track goal) {
                  <span
                    class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                  >
                    {{ goal | translate }}
                  </span>
                }
              </div>
            </div>
          }
        </div>

        <textarea
          [(ngModel)]="ingredients"
          [placeholder]="'fridge_placeholder' | translate"
          class="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        ></textarea>

        <button
          (click)="handleFindRecipes()"
          [disabled]="!canSearch()"
          class="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {{ "fridge_find" | translate }}
        </button>

        <div class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-lg font-semibold text-gray-700 mb-3">
            {{ "fridge_common" | translate }}
          </h3>
          <div class="flex flex-wrap gap-2">
            @for (ingredient of translatedIngredients(); track $index) {
              <button
                (click)="addIngredient(ingredient)"
                class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
              >
                {{ ingredient }}
              </button>
            }
          </div>
        </div>
      </div>
      }

      <!-- Pantry Tab -->
      @if (activeTab() === 'pantry') {
        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">
              {{ "pantry_title" | translate }}
            </h2>
            <button
              (click)="showAddItemForm.set(!showAddItemForm())"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {{ showAddItemForm() ? ('cancel' | translate) : ('pantry_add_item' | translate) }}
            </button>
          </div>

          <!-- Expiry Alerts -->
          @if (expiryAlerts().length > 0) {
            <div class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-red-800 mb-3 flex items-center">
                <span class="mr-2">⚠️</span>{{ "pantry_expiry_alerts" | translate }}
              </h3>
              <div class="space-y-2">
                @for (alert of expiryAlerts(); track alert.itemId) {
                  <div [class]="getExpiryAlertClass(alert.urgency)">
                    <span class="font-medium">{{ alert.itemName }}</span>
                    <span class="text-sm ml-2">
                      @if (alert.daysUntilExpiry === 0) {
                        {{ "pantry_expires_today" | translate }}
                      } @else if (alert.daysUntilExpiry === 1) {
                        {{ "pantry_expires_tomorrow" | translate }}
                      } @else {
                        {{ "pantry_expires_in" | translate }} {{ alert.daysUntilExpiry }} {{ "days" | translate }}
                      }
                    </span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Add Item Form -->
          @if (showAddItemForm()) {
            <div class="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ "pantry_add_new_item" | translate }}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ "pantry_item_name" | translate }}</label>
                  <input
                    type="text"
                    [(ngModel)]="newItemName"
                    [placeholder]="'pantry_item_name_placeholder' | translate"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ "pantry_quantity" | translate }}</label>
                  <div class="flex gap-2">
                    <input
                      type="number"
                      [(ngModel)]="newItemQuantity"
                      placeholder="1"
                      class="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      [(ngModel)]="newItemUnit"
                      [placeholder]="'pantry_unit' | translate"
                      class="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ "category" | translate }}</label>
                  <select
                    [(ngModel)]="newItemCategory"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    @for (cat of pantryCategories; track cat) {
                      <option [value]="cat">{{ ('pantry_category_' + cat) | translate }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ "pantry_expiry_date" | translate }}</label>
                  <input
                    type="date"
                    [(ngModel)]="newItemExpiryDate"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <button
                (click)="addPantryItem()"
                [disabled]="!canAddItem()"
                class="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {{ "add" | translate }}
              </button>
            </div>
          }

          <!-- Pantry Items List -->
          @if (pantryItemsInput().length === 0 && !showAddItemForm()) {
            <div class="text-center py-12 text-gray-500">
              <div class="text-6xl mb-4">🏪</div>
              <p class="text-lg mb-2">{{ "pantry_empty" | translate }}</p>
              <p class="text-sm">{{ "pantry_empty_hint" | translate }}</p>
            </div>
          } @else {
            <div class="space-y-4">
              @for (item of pantryItemsInput(); track item.id) {
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <h4 class="text-lg font-semibold text-gray-800">{{ item.name }}</h4>
                        <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {{ ('pantry_category_' + item.category) | translate }}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>📦 {{ item.quantity }} {{ item.unit }}</span>
                        @if (item.expiryDate) {
                          <span [class]="getExpiryDateClass(item.expiryDate)">
                            🗓️ {{ formatDate(item.expiryDate) }}
                          </span>
                        }
                        @if (item.timesUsed > 0) {
                          <span>✓ {{ "pantry_used" | translate }} {{ item.timesUsed }}x</span>
                        }
                      </div>
                    </div>
                    <button
                      (click)="removePantryItem(item.id)"
                      class="ml-4 text-red-600 hover:text-red-800 transition-colors"
                      [title]="'remove' | translate"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class FridgeComponent implements OnInit {
  @Output() findRecipes = new EventEmitter<RecipeSearchParams>();
  @Output() pantryUpdated = new EventEmitter<PantryItemUpdate>();
  @Input() pantryItemsInput = signal<PantryItem[]>([]);

  private translationService = inject(TranslationService);
  private pantryService = inject(PantryService);

  // Tab state
  activeTab = signal<'search' | 'pantry'>('search');
  
  // Pantry state
  showAddItemForm = signal(false);
  newItemName = signal('');
  newItemQuantity = signal(1);
  newItemUnit = signal('g');
  newItemCategory = signal<PantryCategory>('pantry');
  newItemExpiryDate = signal('');
  
  pantryCategories = PANTRY_CATEGORIES;
  
  // Computed alerts
  expiryAlerts = computed(() => {
    return this.pantryService.getExpiryAlerts(this.pantryItemsInput());
  });
  
  expiryAlertCount = computed(() => {
    return this.expiryAlerts().filter(a => a.urgency === 'critical' || a.urgency === 'warning').length;
  });

  ingredients = signal("");
  selectedGoals = signal<string[]>([]);

  // Dietary goals with icons and keys for translation
  dietaryGoals = [
    { key: "goal_low_fat", icon: "🥗" },
    { key: "goal_low_carb", icon: "🥑" },
    { key: "goal_low_sugar", icon: "🍃" },
    { key: "goal_high_protein", icon: "💪" },
    { key: "goal_vegetarian", icon: "🌱" },
    { key: "goal_vegan", icon: "🌿" },
    { key: "goal_gluten_free", icon: "🌾" },
    { key: "goal_dairy_free", icon: "🥛" },
    { key: "goal_keto", icon: "🥓" },
    { key: "goal_paleo", icon: "🦴" },
    { key: "goal_low_calorie", icon: "⚖️" },
    { key: "goal_mediterranean", icon: "🫒" },
    { key: "goal_heart_healthy", icon: "❤️" },
    { key: "goal_diabetic_friendly", icon: "🩺" },
    { key: "goal_quick", icon: "⚡" },
  ];

  // Expanded list of common ingredients
  commonIngredients = [
    "chicken",
    "beef",
    "pork",
    "fish",
    "shrimp",
    "salmon",
    "tuna",
    "eggs",
    "milk",
    "cheese",
    "yogurt",
    "butter",
    "cream",
    "tomatoes",
    "onions",
    "garlic",
    "potatoes",
    "carrots",
    "broccoli",
    "spinach",
    "bell peppers",
    "mushrooms",
    "zucchini",
    "eggplant",
    "cucumber",
    "lettuce",
    "rice",
    "pasta",
    "bread",
    "flour",
    "oats",
    "quinoa",
    "olive oil",
    "soy sauce",
    "salt",
    "pepper",
    "cumin",
    "paprika",
    "lemon",
    "lime",
    "avocado",
    "corn",
    "beans",
    "chickpeas",
    "parmesan",
    "mozzarella",
    "bacon",
    "sausage",
    "ground beef",
    "ginger",
    "cilantro",
    "basil",
    "oregano",
    "thyme",
  ];

  // Manual translations for common ingredients
  private ingredientTranslations: { [lang: string]: string[] } = {
    es: [
      "pollo",
      "carne de res",
      "cerdo",
      "pescado",
      "camarones",
      "salmón",
      "atún",
      "huevos",
      "leche",
      "queso",
      "yogur",
      "mantequilla",
      "crema",
      "tomates",
      "cebollas",
      "ajo",
      "papas",
      "zanahorias",
      "brócoli",
      "espinacas",
      "pimientos",
      "champiñones",
      "calabacín",
      "berenjena",
      "pepino",
      "lechuga",
      "arroz",
      "pasta",
      "pan",
      "harina",
      "avena",
      "quinoa",
      "aceite de oliva",
      "salsa de soya",
      "sal",
      "pimienta",
      "comino",
      "pimentón",
      "limón",
      "lima",
      "aguacate",
      "maíz",
      "frijoles",
      "garbanzos",
      "parmesano",
      "mozzarella",
      "tocino",
      "salchicha",
      "carne molida",
      "jengibre",
      "cilantro",
      "albahaca",
      "orégano",
      "tomillo",
    ],
    fr: [
      "poulet",
      "bœuf",
      "porc",
      "poisson",
      "crevettes",
      "saumon",
      "thon",
      "œufs",
      "lait",
      "fromage",
      "yaourt",
      "beurre",
      "crème",
      "tomates",
      "oignons",
      "ail",
      "pommes de terre",
      "carottes",
      "brocoli",
      "épinards",
      "poivrons",
      "champignons",
      "courgette",
      "aubergine",
      "concombre",
      "laitue",
      "riz",
      "pâtes",
      "pain",
      "farine",
      "avoine",
      "quinoa",
      "huile d'olive",
      "sauce soja",
      "sel",
      "poivre",
      "cumin",
      "paprika",
      "citron",
      "citron vert",
      "avocat",
      "maïs",
      "haricots",
      "pois chiches",
      "parmesan",
      "mozzarella",
      "bacon",
      "saucisse",
      "bœuf haché",
      "gingembre",
      "coriandre",
      "basilic",
      "origan",
      "thym",
    ],
    de: [
      "Hühnchen",
      "Rindfleisch",
      "Schweinefleisch",
      "Fisch",
      "Garnelen",
      "Lachs",
      "Thunfisch",
      "Eier",
      "Milch",
      "Käse",
      "Joghurt",
      "Butter",
      "Sahne",
      "Tomaten",
      "Zwiebeln",
      "Knoblauch",
      "Kartoffeln",
      "Karotten",
      "Brokkoli",
      "Spinat",
      "Paprika",
      "Pilze",
      "Zucchini",
      "Aubergine",
      "Gurke",
      "Kopfsalat",
      "Reis",
      "Nudeln",
      "Brot",
      "Mehl",
      "Hafer",
      "Quinoa",
      "Olivenöl",
      "Sojasoße",
      "Salz",
      "Pfeffer",
      "Kreuzkümmel",
      "Paprikapulver",
      "Zitrone",
      "Limette",
      "Avocado",
      "Mais",
      "Bohnen",
      "Kichererbsen",
      "Parmesan",
      "Mozzarella",
      "Speck",
      "Wurst",
      "Hackfleisch",
      "Ingwer",
      "Koriander",
      "Basilikum",
      "Oregano",
      "Thymian",
    ],
    it: [
      "pollo",
      "manzo",
      "maiale",
      "pesce",
      "gamberi",
      "salmone",
      "tonno",
      "uova",
      "latte",
      "formaggio",
      "yogurt",
      "burro",
      "panna",
      "pomodori",
      "cipolle",
      "aglio",
      "patate",
      "carote",
      "broccoli",
      "spinaci",
      "peperoni",
      "funghi",
      "zucchine",
      "melanzane",
      "cetriolo",
      "lattuga",
      "riso",
      "pasta",
      "pane",
      "farina",
      "avena",
      "quinoa",
      "olio d'oliva",
      "salsa di soia",
      "sale",
      "pepe",
      "cumino",
      "paprika",
      "limone",
      "lime",
      "avocado",
      "mais",
      "fagioli",
      "ceci",
      "parmigiano",
      "mozzarella",
      "bacon",
      "salsiccia",
      "carne macinata",
      "zenzero",
      "coriandolo",
      "basilico",
      "origano",
      "timo",
    ],
  };

  translatedIngredients = signal<string[]>([...this.commonIngredients]);

  constructor() {
    // Auto-translate ingredients when language changes
    effect(() => {
      const currentLang = this.translationService.currentLanguage();
      console.log("🌍 Language changed to:", currentLang);
      this.updateTranslatedIngredients();
    });
  }

  ngOnInit() {
    // Translate on initial load
    this.updateTranslatedIngredients();
  }

  private updateTranslatedIngredients() {
    const currentLang = this.translationService.currentLanguage();

    // Use manual translations if available
    if (this.ingredientTranslations[currentLang]) {
      console.log("✅ Using manual translations for:", currentLang);
      this.translatedIngredients.set(this.ingredientTranslations[currentLang]);
    } else {
      // Fallback to English for unsupported languages
      console.log("ℹ️ No translations for", currentLang, "- using English");
      this.translatedIngredients.set([...this.commonIngredients]);
    }
  }

  addIngredient(ingredient: string) {
    const current = this.ingredients();
    if (current) {
      this.ingredients.set(current + ", " + ingredient);
    } else {
      this.ingredients.set(ingredient);
    }
  }

  toggleDietaryGoal(goalKey: string) {
    const currentGoals = this.selectedGoals();
    if (currentGoals.includes(goalKey)) {
      this.selectedGoals.set(currentGoals.filter((g) => g !== goalKey));
    } else {
      this.selectedGoals.set([...currentGoals, goalKey]);
    }
  }

  getDietaryGoalClass(goalKey: string): string {
    const isSelected = this.selectedGoals().includes(goalKey);
    const baseClasses =
      "px-3 py-2 rounded-full text-sm font-medium transition-all duration-200";

    if (isSelected) {
      return `${baseClasses} bg-indigo-600 text-white shadow-md transform scale-105`;
    }
    return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 hover:shadow-sm`;
  }

  canSearch(): boolean {
    return (
      this.ingredients().trim().length > 0 || this.selectedGoals().length > 0
    );
  }

  handleFindRecipes() {
    if (this.canSearch()) {
      const ingredientsText = this.ingredients().trim() || "any ingredients";
      this.findRecipes.emit({
        ingredients: ingredientsText,
        dietaryGoals: this.selectedGoals(),
      });
    }
  }

  // Pantry management methods
  getTabClass(tab: 'search' | 'pantry'): string {
    const isActive = this.activeTab() === tab;
    const baseClasses = 'flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200';
    
    if (isActive) {
      return `${baseClasses} bg-green-600 text-white shadow-md`;
    }
    return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  }

  canAddItem(): boolean {
    return this.newItemName().trim().length > 0 && 
           this.newItemQuantity() > 0 && 
           this.newItemUnit().trim().length > 0;
  }

  addPantryItem() {
    if (!this.canAddItem()) return;

    const newItem: PantryItem = {
      id: `pantry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: this.newItemName(),
      quantity: this.newItemQuantity(),
      unit: this.newItemUnit(),
      category: this.newItemCategory(),
      purchaseDate: new Date(),
      expiryDate: this.newItemExpiryDate() ? new Date(this.newItemExpiryDate()) : undefined,
      addedAt: new Date(),
      timesUsed: 0
    };

    const updatedPantry = [...this.pantryItemsInput(), newItem];
    this.pantryUpdated.emit({ pantryItems: updatedPantry, pointsAwarded: 5 });

    // Reset form
    this.newItemName.set('');
    this.newItemQuantity.set(1);
    this.newItemUnit.set('g');
    this.newItemCategory.set('pantry');
    this.newItemExpiryDate.set('');
    this.showAddItemForm.set(false);
  }

  removePantryItem(itemId: string) {
    const updatedPantry = this.pantryItemsInput().filter(item => item.id !== itemId);
    this.pantryUpdated.emit({ pantryItems: updatedPantry });
  }

  getExpiryAlertClass(urgency: 'critical' | 'warning' | 'normal'): string {
    const baseClasses = 'px-3 py-2 rounded-lg';
    
    switch (urgency) {
      case 'critical':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-300`;
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-300`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-300`;
    }
  }

  getExpiryDateClass(expiryDate: Date): string {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 2) {
      return 'text-red-600 font-semibold';
    } else if (daysUntilExpiry <= 5) {
      return 'text-yellow-600 font-semibold';
    }
    return '';
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
