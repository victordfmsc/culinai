import {
  Component,
  Output,
  EventEmitter,
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

export interface RecipeSearchParams {
  ingredients: string;
  dietaryGoals: string[];
}

@Component({
  selector: "app-fridge",
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
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
    </div>
  `,
})
export class FridgeComponent implements OnInit {
  @Output() findRecipes = new EventEmitter<RecipeSearchParams>();

  private translationService = inject(TranslationService);

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
}
