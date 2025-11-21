import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  servings: number;
  adjustedServings?: number;
  tags?: string[];
  nutrition?: {
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  imageUrl?: string;
  sourceUrl?: string;
  sourceType?: 'ai-generated' | 'web-scraped' | 'manual' | 'ocr' | 'social-media';
  category?: 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack';
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = environment.googleApiKey;
    console.log('Initializing Gemini Service...');
    
    if (apiKey && apiKey.startsWith('AIza')) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-1.5-flash with correct v1 API version
        this.model = this.genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
        });
        console.log('✅ Gemini model ready!');
      } catch (error) {
        console.error('Failed to init Gemini:', error);
      }
    } else {
      console.log('No valid Gemini API key found');
    }
  }

  /**
   * POST-PROCESSING: Force correct ingredient format
   * Eliminates invalid formats and converts units to metric standard
   * Supports both English and Spanish
   */
  private cleanIngredient(ingredient: string): string {
    let clean = ingredient.trim();
    
    // STEP 1: Remove the "×" character that Gemini adds (e.g., "2× cup" → "2 cup")
    clean = clean.replace(/×/g, '');
    
    // STEP 2: Handle truncated ingredients (e.g., "1 taza de" → "1 taza")
    clean = clean.replace(/\s+de\s*$/i, '');
    clean = clean.replace(/\s+of\s*$/i, '');
    
    // STEP 3: Remove forbidden adjectives and descriptions (English & Spanish)
    const forbiddenWords = [
      // English
      'fresh', 'ripe', 'chopped', 'diced', 'minced', 'sliced', 
      'cut', 'peeled', 'boneless', 'skinless', 'trimmed',
      'medium', 'large', 'small', 'finely', 'coarsely', 
      'into', 'pieces', 'inch', 'inches',
      // Spanish
      'fresco', 'fresca', 'maduro', 'madura', 'picado', 'picada',
      'cortado', 'cortada', 'pelado', 'pelada', 'troceado', 'troceada',
      'mediano', 'mediana', 'grande', 'pequeño', 'pequeña',
      'finamente', 'en', 'trozos', 'pedazos', 'pulgada', 'pulgadas'
    ];
    
    forbiddenWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b,?\\s*`, 'gi');
      clean = clean.replace(regex, ' ');
    });
    
    // STEP 4: Detect if ingredient is liquid (for cup/taza conversions)
    const liquidKeywords = [
      // English
      'water', 'milk', 'broth', 'stock', 'juice', 'oil', 'cream', 'wine', 'vinegar', 'sauce',
      // Spanish
      'agua', 'leche', 'caldo', 'jugo', 'zumo', 'aceite', 'crema', 'nata', 'vino', 'vinagre', 'salsa'
    ];
    const isLiquid = liquidKeywords.some(keyword => clean.toLowerCase().includes(keyword));
    
    // STEP 5: Convert SPANISH units to metric
    
    // Taza/Tazas → ml or g
    clean = clean.replace(/(\d+(?:\/\d+)?)\s*tazas?\b/gi, (match, num) => {
      const quantity = this.parseFraction(num);
      if (isLiquid) {
        return `${Math.round(quantity * 250)}ml`;
      } else {
        return `${Math.round(quantity * 200)}g`;
      }
    });
    
    // Cucharada/Cucharadas → ml (1 tbsp = 15ml)
    clean = clean.replace(/(\d+(?:\/\d+)?)\s*cucharadas?\b/gi, (match, num) => {
      const quantity = this.parseFraction(num);
      return `${Math.round(quantity * 15)}ml`;
    });
    
    // Cucharadita/Cucharaditas → ml (1 tsp = 5ml)
    clean = clean.replace(/(\d+(?:\/\d+)?)\s*cucharaditas?\b/gi, (match, num) => {
      const quantity = this.parseFraction(num);
      return `${Math.round(quantity * 5)}ml`;
    });
    
    // Libra/Libras → g
    clean = clean.replace(/(\d+(?:\.\d+)?)\s*libras?\b/gi, (match, num) => {
      return `${Math.round(parseFloat(num) * 450)}g`;
    });
    
    // Onza/Onzas → g
    clean = clean.replace(/(\d+(?:\.\d+)?)\s*onzas?\b/gi, (match, num) => {
      return `${Math.round(parseFloat(num) * 30)}g`;
    });
    
    // STEP 6: Convert ENGLISH units to metric
    
    // Cups → ml or g
    clean = clean.replace(/(\d+(?:\/\d+)?)\s*cups?\b/gi, (match, num) => {
      const quantity = this.parseFraction(num);
      if (isLiquid) {
        return `${Math.round(quantity * 250)}ml`;
      } else {
        return `${Math.round(quantity * 200)}g`;
      }
    });
    
    // Pounds (lbs) → g
    clean = clean.replace(/(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)\b/gi, (match, num) => {
      return `${Math.round(parseFloat(num) * 450)}g`;
    });
    
    // Ounces (oz) → g
    clean = clean.replace(/(\d+(?:\.\d+)?)\s*oz\b/gi, (match, num) => {
      return `${Math.round(parseFloat(num) * 30)}g`;
    });
    
    // STEP 7: Normalize spaces and remove extra commas
    clean = clean.replace(/\s+/g, ' ').replace(/,+/g, ',').trim();
    clean = clean.replace(/,\s*$/, ''); // Remove trailing comma
    
    // STEP 8: Simplify to maximum 2-3 words for ingredient name
    const parts = clean.split(' ');
    if (parts.length > 4) {
      // Keep first 2-3 parts (quantity + unit or quantity + unit + word)
      const hasUnit = parts[1] && /\d+(?:g|kg|ml|L|tsp|tbsp)$/.test(parts[1]);
      
      if (hasUnit) {
        // Format: "200g pollo troceado sin piel" → "200g pollo"
        clean = `${parts[0]} ${parts[1]} ${parts[2] || ''}`.trim();
      } else {
        // Format: "2 cebollas grandes rojas" → "2 cebollas"
        clean = `${parts[0]} ${parts[parts.length - 1]}`;
      }
    }
    
    return clean;
  }

  /**
   * Parse fractions like "1/2" to decimal
   */
  private parseFraction(str: string): number {
    if (str.includes('/')) {
      const [num, den] = str.split('/').map(Number);
      return num / den;
    }
    return parseFloat(str);
  }

  async generateRecipes(ingredients: string, language: string = 'en', dietaryGoals: string[] = []): Promise<Recipe[]> {
    console.log('Generating 10 recipes for:', ingredients, 'in language:', language, 'with dietary goals:', dietaryGoals);
    
    // Language name mapping for better prompts
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian'
    };
    
    const languageName = languageNames[language] || 'English';
    
    // Map dietary goal keys to English descriptions for the AI prompt
    const goalDescriptions: { [key: string]: string } = {
      'goal_low_fat': 'Low in fats and oils',
      'goal_low_carb': 'Low in carbohydrates',
      'goal_low_sugar': 'Low in added sugars',
      'goal_high_protein': 'High in protein',
      'goal_vegetarian': 'Vegetarian (no meat or fish)',
      'goal_vegan': 'Vegan (no animal products)',
      'goal_gluten_free': 'Gluten-free',
      'goal_dairy_free': 'Dairy-free (no milk products)',
      'goal_keto': 'Keto-friendly (very low carb, high fat)',
      'goal_paleo': 'Paleo (whole foods, no grains/legumes/dairy)',
      'goal_low_calorie': 'Low in calories (under 400 per serving)',
      'goal_mediterranean': 'Mediterranean diet style',
      'goal_heart_healthy': 'Heart-healthy (low sodium, healthy fats)',
      'goal_diabetic_friendly': 'Diabetic-friendly (low glycemic index)',
      'goal_quick': 'Quick to prepare (under 30 minutes)'
    };
    
    // Build dietary requirements string
    let dietaryRequirements = '';
    if (dietaryGoals.length > 0) {
      const requirements = dietaryGoals.map(goal => goalDescriptions[goal] || goal).join(', ');
      dietaryRequirements = `\n\nDIETARY REQUIREMENTS (ALL RECIPES MUST MEET THESE):
- ${requirements}
- Make sure EVERY recipe strictly follows these dietary restrictions
- Adjust ingredients and cooking methods to meet these requirements
- If a requirement conflicts with ingredients, substitute appropriately`;
    }
    
    // Always try Gemini first if available
    if (this.model) {
      try {
        const prompt = `You are a professional chef teaching someone who has NEVER cooked this dish before. Create exactly 10 unique and diverse recipes using these ingredients: ${ingredients}.${dietaryRequirements}
        
Important rules:
- WRITE EVERYTHING IN ${languageName.toUpperCase()} (recipe titles, descriptions, ingredients, instructions, tags - ALL TEXT)
- Use the provided ingredients as main components
- Each recipe MUST be completely different (vary cuisine style, cooking method, difficulty)
- Include cuisines like: Italian, Asian, Mexican, American, Mediterranean, Indian, etc.
- Include cooking methods like: stir-fry, baked, grilled, soup, salad, pasta, rice bowl, curry, etc.
- Include real measurements and cooking times

⚠️ CRITICAL INGREDIENT FORMATTING RULES - MANDATORY - NO EXCEPTIONS ⚠️
YOU MUST USE ONLY THESE UNITS - NO OTHER UNITS ARE ALLOWED:
- Grams: g, kg (for meats, vegetables, pasta, rice)
- Milliliters: ml, L (for liquids only)  
- Spoons: tsp, tbsp (for spices, oil, small amounts)
- Pieces: just the number (for eggs, onions, garlic cloves, etc.)

🚫 NEVER EVER USE GENERIC NAMES 🚫
- NEVER write "any ingredients" - ALWAYS specify EXACT ingredient name
- NEVER write "2 cups any ingredients" - write "2 cups rice" or "2 cups flour"
- NEVER write "1 lb any protein" - write "1 lb chicken" or "1 lb beef"
- BE SPECIFIC: If you don't know what ingredient to use, pick a common one (chicken, rice, tomato, etc.)

MANDATORY FORMAT: "quantity unit name" or "quantity name" (for pieces)
✅ CORRECT EXAMPLES:
  - "200g chicken" (NOT "200g boneless chicken breast" or "200g any meat")
  - "2 onions" (NOT "2 medium onions, diced" or "2 any vegetables")
  - "3 garlic cloves" (NOT "3 cloves fresh garlic, minced")
  - "1 tsp salt" (NOT "1 teaspoon sea salt")
  - "250ml water" (NOT "1 cup water" or "1 cup any liquid")
  - "500g rice" (NOT "2 cups basmati rice" or "2 cups any grain")

❌ ABSOLUTELY FORBIDDEN - NEVER USE THESE:
  - "any ingredients", "any vegetables", "any protein", "any liquid", "any grain"
  - cups, tablespoons written out, teaspoons written out
  - inches, lbs, oz, pounds, ounces
  - "fresh", "ripe", "chopped", "diced", "minced" in ingredient names
  - Long descriptions like "cut into 1-inch pieces"
  - ANY measurement in cups or inches

Keep ingredient names SHORT and SPECIFIC: maximum 2 words (e.g., "chicken", "olive oil", "brown rice")

NUTRITIONAL INFORMATION REQUIREMENTS:
- Add "tags" array with 2-4 classification tags ALWAYS IN ENGLISH based on the recipe characteristics
- Possible tag categories (use these exact English terms): High Protein, Low Calorie, Low Carb, Vegetarian, Vegan, Gluten Free, Dairy Free, Spicy, Quick, Healthy, No Salt, Keto
- IMPORTANT: Tags must be in English even if the recipe is in another language (this ensures consistent color coding in the UI)
- Add "nutrition" object with approximate values per serving:
  * calories: approximate number (e.g., 350)
  * protein: grams of protein (e.g., 25)
  * carbs: grams of carbohydrates (e.g., 40)
  * fat: grams of fat (e.g., 12)

CRITICAL - ULTRA DETAILED INSTRUCTIONS FOR COMPLETE BEGINNERS WHO HAVE NEVER COOKED THIS DISH:
- Assume the person has NEVER made this recipe before
- Each step must be EXTREMELY detailed with exact HOW-TO explanations
- Include EXACT temperatures in both Fahrenheit and Celsius (e.g., "375°F/190°C")
- Include EXACT timing (e.g., "cook for 3-4 minutes", "simmer for 20 minutes")
- Include VISUAL CUES so they know when it's ready (e.g., "golden brown", "bubbling vigorously", "fork-tender", "translucent")
- Explain COOKING TECHNIQUES step-by-step (e.g., "To sauté: heat oil over medium-high heat until it shimmers but doesn't smoke, then add ingredients and stir constantly")
- Add SAFETY WARNINGS (e.g., "Be careful - oil may splatter", "Use oven mitts - pan is very hot")
- Explain WHY each step matters (e.g., "This step seals in the juices", "Covering prevents drying out")
- Include TIPS for success (e.g., "Don't overcrowd the pan or it will steam instead of sear")
- Tell them HOW to know when it's done (e.g., "Chicken is fully cooked when it reaches 165°F/74°C internally and juices run clear, not pink")
- Each recipe MUST have 8-12 detailed instruction steps minimum
- Write as if you're standing next to them in the kitchen, guiding their every move

Return ONLY a JSON array with 10 recipes, no other text, in this exact format:
[
  {
    "title": "Very Specific Recipe Name with Cuisine Style",
    "description": "One appetizing sentence description",
    "ingredients": ["200g chicken", "1 onion", "2 garlic cloves", "100ml olive oil", "250g rice", "500ml water", "1 tsp salt"],
    "instructions": [
      "Preheat your oven to 375°F (190°C). Place the rack in the middle position. This ensures even cooking throughout the dish.",
      "In a large skillet, heat 2 tablespoons of olive oil over medium-high heat for about 2 minutes until the oil shimmers but doesn't smoke. This is the right temperature for searing.",
      "Add the chicken pieces in a single layer, making sure not to overcrowd the pan. Sear for 3-4 minutes without moving them - you'll know they're ready to flip when they release easily from the pan and have a golden-brown crust.",
      "Very detailed step with exact measurements, temperatures, visual cues, and timing",
      "Continue with specific instructions explaining WHY and HOW to do each step"
    ],
    "prepTime": "25 mins",
    "servings": 4,
    "tags": ["High Protein", "Healthy", "Quick"],
    "nutrition": {
      "calories": 380,
      "protein": 35,
      "carbs": 42,
      "fat": 8
    }
  }
]

Make sure all 10 recipes are VERY different from each other, instructions are beginner-friendly with lots of detail, and nutritional information is realistic!`;

        console.log('Calling Gemini API for 10 recipes...');
        const result = await this.model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        console.log('Gemini response received, length:', text.length);
        
        // Clean the response
        let cleanText = text.trim();
        // Remove markdown if present
        cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        // Find JSON array
        const jsonStart = cleanText.indexOf('[');
        const jsonEnd = cleanText.lastIndexOf(']') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonString = cleanText.substring(jsonStart, jsonEnd);
          try {
            const recipes = JSON.parse(jsonString);
            if (Array.isArray(recipes) && recipes.length > 0) {
              // POST-PROCESSING: Clean ALL ingredients to force correct format
              recipes.forEach(recipe => {
                if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                  recipe.ingredients = recipe.ingredients.map((ing: string) => this.cleanIngredient(ing));
                }
              });
              console.log('✅ Generated', recipes.length, 'unique recipes with AI (ingredients cleaned)!');
              return recipes.slice(0, 10);
            }
          } catch (e) {
            console.error('JSON parse error:', e);
          }
        }
      } catch (error: any) {
        console.error('Gemini API error:', error.message);
      }
    }
    
    // Fallback recipes in the selected language
    console.log('Using fallback recipes in', languageName);
    return this.getFallbackRecipes(ingredients, language);
  }

  private getFallbackRecipes(ingredients: string, language: string): Recipe[] {
    const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
    const mainIngredient = ingredientList[0] || 'Mixed';
    
    // Define fallback recipes per language
    const fallbackRecipes: { [key: string]: Recipe[] } = {
      'en': this.getEnglishFallbackRecipes(mainIngredient, ingredientList, ingredients),
      'es': this.getSpanishFallbackRecipes(mainIngredient, ingredientList, ingredients),
      'fr': this.getFrenchFallbackRecipes(mainIngredient, ingredientList, ingredients),
      'de': this.getGermanFallbackRecipes(mainIngredient, ingredientList, ingredients),
      'it': this.getItalianFallbackRecipes(mainIngredient, ingredientList, ingredients)
    };
    
    return fallbackRecipes[language] || fallbackRecipes['en'];
  }

  private getEnglishFallbackRecipes(mainIngredient: string, ingredientList: string[], ingredients: string): Recipe[] {
    return [
      {
        title: `Quick ${mainIngredient} Stir-Fry`,
        description: `A fast Asian-style stir-fry with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `200g ${i}`), '30ml soy sauce', '15ml sesame oil', '2 garlic cloves', '10g ginger'],
        instructions: [
          'Prepare all ingredients first (mise en place). Cut all vegetables and proteins into uniform, bite-sized pieces so they cook evenly. Mince the garlic and ginger finely.',
          'Heat a large wok or heavy skillet over high heat for 2-3 minutes until very hot. You\'ll know it\'s ready when a drop of water sizzles and evaporates immediately.',
          'Add 2 tablespoons of cooking oil (vegetable or peanut oil work best) and swirl it around the wok to coat the bottom and sides. The oil should shimmer but not smoke.',
          `Add the ${mainIngredient} in a single layer, making sure pieces don't overlap. Let it cook undisturbed for 2 minutes to get a nice sear, then flip and cook another 2 minutes until golden brown and cooked through.`,
          'Push the cooked protein to the sides of the wok. Add the minced garlic and ginger to the center and stir for 30 seconds until fragrant (be careful not to burn them).',
          'Add all the vegetables, starting with the harder ones first. Stir-fry constantly, tossing everything together with a spatula, for 2-3 minutes until vegetables are crisp-tender.',
          'Pour the soy sauce and sesame oil over everything. Toss vigorously for 1 minute to coat all ingredients evenly. The sauce should coat everything with a glossy finish.',
          'Taste and adjust seasoning if needed. Serve immediately over steamed rice while hot and crispy.'
        ],
        prepTime: '15 mins',
        servings: 2,
        tags: ['Quick', 'Healthy'],
        nutrition: {
          calories: 280,
          protein: 22,
          carbs: 18,
          fat: 12
        }
      },
      {
        title: `Baked ${mainIngredient} Casserole`,
        description: `Comfort food casserole with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), '200g cheese', '125ml cream', '5ml herbs', 'Salt', 'Pepper'],
        instructions: [
          'Preheat your oven to 375°F (190°C). Position the oven rack in the middle. This temperature ensures the casserole cooks through without burning the top.',
          'While the oven heats, prepare all your ingredients. Chop all vegetables and proteins into uniform pieces, about 1-inch cubes, so everything cooks evenly.',
          'Spray a 9x13 inch baking dish with cooking spray or brush with butter to prevent sticking. This makes cleanup much easier later.',
          `Create the first layer: spread half of your ${mainIngredient} evenly across the bottom of the baking dish. Season this layer lightly with salt, pepper, and half the dried herbs.`,
          'Add the remaining ingredients in an even layer on top. Try to distribute everything uniformly so each serving has a good mix of ingredients.',
          'In a small bowl, whisk together the heavy cream with a pinch of salt and pepper. Pour this evenly over the entire casserole - it will create a creamy sauce as it bakes.',
          'Sprinkle the shredded cheese evenly over the top. The cheese will melt and create a golden, bubbly crust.',
          'Cover the dish tightly with aluminum foil. This traps steam and helps everything cook through without drying out. Bake for 25 minutes covered.',
          'Remove the foil carefully (watch out for hot steam!) and bake for an additional 10-15 minutes until the cheese is golden brown and bubbly, and the edges are slightly crispy.',
          'Let the casserole rest for 5 minutes before serving. This allows the sauce to thicken slightly and makes it easier to portion. Serve hot.'
        ],
        prepTime: '45 mins',
        servings: 4,
        tags: ['High Protein'],
        nutrition: {
          calories: 420,
          protein: 28,
          carbs: 22,
          fat: 24
        }
      },
      {
        title: `Hearty ${mainIngredient} Soup`,
        description: `Warming soup with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `200g ${i}`), '1L broth', '1 onion', '2 garlic cloves', '30ml olive oil', '1 bay leaf', '5ml thyme', 'Salt', 'Pepper'],
        instructions: [
          'Prepare all your ingredients before you start cooking (this is called mise en place). Dice all vegetables into similar-sized pieces (about 1/2 inch) so they cook evenly.',
          'In a large pot or Dutch oven, heat 2 tablespoons of olive oil over medium heat for about 1 minute. The oil should flow easily but not smoke.',
          'Add the chopped onion to the pot. Sauté for 5-7 minutes, stirring occasionally with a wooden spoon, until the onion becomes soft and translucent (slightly see-through) and smells sweet. Don\'t let it brown.',
          'Add the minced garlic and stir constantly for 30-60 seconds until you can smell it. Be careful not to burn the garlic or it will taste bitter.',
          `Add the ${mainIngredient} to the pot and stir to combine with the onions and garlic. Cook for 2-3 minutes, stirring occasionally, to let the flavors blend.`,
          'Pour in the broth slowly to avoid splashing. Add the bay leaf and dried thyme. Stir everything together and turn the heat up to high.',
          'Once the soup starts to bubble vigorously, reduce the heat to low so it just simmers gently (small bubbles occasionally breaking the surface). Cover the pot partially with a lid.',
          'Let the soup simmer for 20-25 minutes, stirring every 5-10 minutes to prevent sticking. The vegetables should be tender when pierced with a fork.',
          'Taste the soup carefully (blow on the spoon first - it\'s hot!). Add salt and pepper gradually, tasting as you go. Remove and discard the bay leaf.',
          'Ladle the hot soup into bowls and garnish with fresh chopped parsley. Serve with crusty bread for dipping.'
        ],
        prepTime: '30 mins',
        servings: 4,
        tags: ['Low Calorie', 'Healthy'],
        nutrition: {
          calories: 180,
          protein: 14,
          carbs: 20,
          fat: 5
        }
      },
      {
        title: `Grilled ${mainIngredient} Skewers`,
        description: `BBQ-style grilled ${ingredients}`,
        ingredients: [...ingredientList.map(i => `675g ${i}`), 'BBQ marinade', 'Skewers', '30ml olive oil'],
        instructions: ['Marinate 1 hour', 'Thread onto skewers', 'Grill 6-8 minutes', 'Turn and cook until done'],
        prepTime: '20 mins',
        servings: 4,
        tags: ['Quick', 'High Protein'],
        nutrition: {
          calories: 320,
          protein: 30,
          carbs: 8,
          fat: 18
        }
      },
      {
        title: `Mediterranean ${mainIngredient} Salad`,
        description: `Fresh salad featuring ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), 'Lettuce', '100g feta cheese', 'Olives', 'Lemon dressing'],
        instructions: ['Chop all ingredients', 'Toss in large bowl', 'Add dressing', 'Top with feta and serve'],
        prepTime: '15 mins',
        servings: 3,
        tags: ['Quick', 'Low Calorie', 'Healthy'],
        nutrition: {
          calories: 240,
          protein: 12,
          carbs: 15,
          fat: 14
        }
      },
      {
        title: `${mainIngredient} Pasta Primavera`,
        description: `Italian pasta with ${ingredients}`,
        ingredients: ['450g pasta', ...ingredientList.map(i => `200g ${i}`), '50g Parmesan', '30ml olive oil', '2 garlic cloves'],
        instructions: ['Boil pasta al dente', 'Sauté vegetables', 'Combine with pasta', 'Top with parmesan'],
        prepTime: '25 mins',
        servings: 4
      },
      {
        title: `Indian ${mainIngredient} Curry`,
        description: `Spicy curry with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), 'Curry paste', '400ml coconut milk', '300g rice', 'Spices'],
        instructions: ['Toast spices', 'Add curry paste and coconut milk', 'Simmer ingredients 20 mins', 'Serve over rice'],
        prepTime: '40 mins',
        servings: 4
      },
      {
        title: `Mexican ${mainIngredient} Tacos`,
        description: `Street-style tacos with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `450g ${i}`), 'Tortillas', 'Salsa', 'Cilantro', 'Lime'],
        instructions: ['Season and cook filling', 'Warm tortillas', 'Assemble tacos', 'Top with salsa and cilantro'],
        prepTime: '20 mins',
        servings: 4
      },
      {
        title: `Asian ${mainIngredient} Rice Bowl`,
        description: `Healthy bowl with ${ingredients}`,
        ingredients: ['400g rice', ...ingredientList.map(i => `200g ${i}`), '30ml soy sauce', 'Sesame seeds', 'Vegetables'],
        instructions: ['Cook rice', 'Prepare toppings', 'Layer in bowl', 'Drizzle with sauce and seeds'],
        prepTime: '30 mins',
        servings: 2
      },
      {
        title: `${mainIngredient} Flatbread Pizza`,
        description: `Gourmet flatbread with ${ingredients}`,
        ingredients: ['2 flatbreads', ...ingredientList.map(i => `100g ${i}`), '150g mozzarella', '15ml olive oil', 'Herbs'],
        instructions: ['Preheat oven to 425°F', 'Top flatbreads', 'Bake 12-15 minutes', 'Slice and serve hot'],
        prepTime: '25 mins',
        servings: 2
      }
    ];
  }

  private getSpanishFallbackRecipes(mainIngredient: string, ingredientList: string[], ingredients: string): Recipe[] {
    return [
      {
        title: `Salteado Rápido de ${mainIngredient}`,
        description: `Un salteado asiático rápido con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `200g ${i}`), '30ml salsa de soya', '15ml aceite de sésamo', '2 dientes ajo', '10g jengibre'],
        instructions: [
          'Prepara todos los ingredientes primero (esto se llama "mise en place"). Corta todos los vegetales y proteínas en trozos uniformes del tamaño de un bocado para que se cocinen de manera pareja. Pica el ajo y jengibre finamente.',
          'Calienta un wok grande o sartén pesada a fuego alto durante 2-3 minutos hasta que esté muy caliente. Sabrás que está listo cuando una gota de agua chisporrotee y se evapore inmediatamente.',
          'Añade 2 cucharadas de aceite de cocina (aceite vegetal o de maní funcionan mejor) y gíralo alrededor del wok para cubrir el fondo y los lados. El aceite debe brillar pero no humear.',
          `Añade el ${mainIngredient} en una sola capa, asegurándote de que las piezas no se superpongan. Deja que se cocine sin mover durante 2 minutos para obtener un buen sellado, luego voltea y cocina otros 2 minutos hasta que esté dorado y completamente cocido.`,
          'Empuja la proteína cocida hacia los lados del wok. Añade el ajo y jengibre picados al centro y revuelve durante 30 segundos hasta que estén fragantes (ten cuidado de no quemarlos o sabrán amargos).',
          'Añade todos los vegetales, empezando con los más duros primero. Saltea constantemente, mezclando todo con una espátula, durante 2-3 minutos hasta que los vegetales estén tiernos pero crujientes.',
          'Vierte la salsa de soya y aceite de sésamo sobre todo. Mezcla vigorosamente durante 1 minuto para cubrir todos los ingredientes uniformemente. La salsa debe cubrir todo con un acabado brillante.',
          'Prueba y ajusta el sazón si es necesario. Sirve inmediatamente sobre arroz al vapor mientras esté caliente y crujiente. ¡El salteado pierde su textura si se deja reposar!'
        ],
        prepTime: '15 min',
        servings: 2,
        tags: ['Quick', 'Healthy'],
        nutrition: {
          calories: 280,
          protein: 22,
          carbs: 18,
          fat: 12
        }
      },
      {
        title: `Cazuela de ${mainIngredient} al Horno`,
        description: `Cazuela reconfortante con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), '200g queso rallado', '125ml crema', '5ml hierbas', 'Sal', 'Pimienta'],
        instructions: [
          'Precalienta tu horno a 375°F (190°C). Coloca la rejilla del horno en la posición central. Esta temperatura asegura que la cazuela se cocine por completo sin quemar la parte superior.',
          'Mientras el horno se calienta, prepara todos tus ingredientes. Pica todos los vegetales y proteínas en cubos uniformes de aproximadamente 1 pulgada para que todo se cocine de manera pareja.',
          'Rocía un molde para hornear de 9x13 pulgadas con aceite en aerosol o unta con mantequilla para evitar que se pegue. Esto hace que la limpieza sea mucho más fácil después.',
          `Crea la primera capa: extiende la mitad de tu ${mainIngredient} uniformemente por el fondo del molde. Sazona esta capa ligeramente con sal, pimienta y la mitad de las hierbas secas.`,
          'Añade los ingredientes restantes en una capa uniforme encima. Trata de distribuir todo uniformemente para que cada porción tenga una buena mezcla de ingredientes.',
          'En un tazón pequeño, bate la crema espesa con una pizca de sal y pimienta. Vierte esto uniformemente sobre toda la cazuela - creará una salsa cremosa mientras se hornea.',
          'Espolvorea el queso rallado uniformemente sobre la parte superior. El queso se derretirá y creará una corteza dorada y burbujeante.',
          'Cubre el molde firmemente con papel aluminio. Esto atrapa el vapor y ayuda a que todo se cocine sin secarse. Hornea durante 25 minutos cubierto.',
          'Retira el papel aluminio con cuidado (¡cuidado con el vapor caliente!) y hornea durante 10-15 minutos adicionales hasta que el queso esté dorado y burbujeante, y los bordes estén ligeramente crujientes.',
          'Deja reposar la cazuela durante 5 minutos antes de servir. Esto permite que la salsa se espese ligeramente y hace más fácil porcionar. Sirve caliente.'
        ],
        prepTime: '45 min',
        servings: 4,
        tags: ['High Protein'],
        nutrition: {
          calories: 420,
          protein: 28,
          carbs: 22,
          fat: 24
        }
      },
      {
        title: `Sopa Abundante de ${mainIngredient}`,
        description: `Sopa reconfortante con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `200g ${i}`), '1L caldo', '1 cebolla', '2 dientes ajo', '30ml aceite oliva', '1 hoja laurel', '5ml tomillo', 'Sal', 'Pimienta'],
        instructions: [
          'Prepara todos tus ingredientes antes de comenzar a cocinar (esto se llama mise en place). Corta todos los vegetales en cubos de tamaño similar (aproximadamente 1/2 pulgada) para que se cocinen de manera uniforme.',
          'En una olla grande u olla holandesa, calienta 2 cucharadas de aceite de oliva a fuego medio durante aproximadamente 1 minuto. El aceite debe fluir fácilmente pero no humear.',
          'Añade la cebolla picada a la olla. Saltea durante 5-7 minutos, revolviendo ocasionalmente con una cuchara de madera, hasta que la cebolla se vuelva suave y translúcida (ligeramente transparente) y huela dulce. No dejes que se dore.',
          'Añade el ajo picado y revuelve constantemente durante 30-60 segundos hasta que puedas olerlo. Ten cuidado de no quemar el ajo o sabrá amargo.',
          `Añade el ${mainIngredient} a la olla y revuelve para combinar con las cebollas y ajo. Cocina durante 2-3 minutos, revolviendo ocasionalmente, para que los sabores se mezclen.`,
          'Vierte el caldo lentamente para evitar salpicaduras. Añade la hoja de laurel y el tomillo seco. Revuelve todo y sube el fuego a alto.',
          'Una vez que la sopa comience a burbujear vigorosamente, reduce el fuego a bajo para que hierva a fuego lento suavemente (pequeñas burbujas que ocasionalmente rompen la superficie). Cubre la olla parcialmente con una tapa.',
          'Deja que la sopa hierva a fuego lento durante 20-25 minutos, revolviendo cada 5-10 minutos para evitar que se pegue. Los vegetales deben estar tiernos cuando los pinches con un tenedor.',
          'Prueba la sopa con cuidado (sopla la cuchara primero - ¡está caliente!). Añade sal y pimienta gradualmente, probando mientras agregas. Retira y desecha la hoja de laurel.',
          'Sirve la sopa caliente en tazones y decora con perejil fresco picado. Sirve con pan crujiente para mojar.'
        ],
        prepTime: '30 min',
        servings: 4,
        tags: ['Low Calorie', 'Healthy'],
        nutrition: {
          calories: 180,
          protein: 14,
          carbs: 20,
          fat: 5
        }
      },
      {
        title: `Brochetas de ${mainIngredient} a la Parrilla`,
        description: `Brochetas estilo BBQ con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `675g ${i}`), 'Marinada BBQ', 'Palitos brochetas', '30ml aceite oliva', 'Sal', 'Pimienta'],
        instructions: [
          'Si usas palitos de bambú, sumérgelos en agua fría durante al menos 30 minutos antes de usar. Esto evita que se quemen en la parrilla.',
          `En un tazón grande, coloca los cubos de ${mainIngredient}. Añade la marinada BBQ, sal y pimienta. Mezcla bien para cubrir todas las piezas uniformemente. Cubre y refrigera durante al menos 1 hora (o hasta 4 horas para más sabor).`,
          'Mientras marinas la carne, prepara la parrilla. Si usas carbón, enciende el carbón 20 minutos antes de cocinar hasta que las brasas estén grises y calientes. Si usas gas, precalienta a fuego medio-alto (alrededor de 400°F/200°C).',
          'Ensarta los ingredientes marinados en los palitos, alternando con piezas de pimiento morrón. Deja un pequeño espacio entre cada pieza para que el calor circule y se cocinen uniformemente. No aprietes demasiado o no se cocinarán bien por dentro.',
          'Engrasa ligeramente las rejillas de la parrilla con aceite usando una toalla de papel sostenida con pinzas (cuidado - la parrilla está caliente). Esto evita que las brochetas se peguen.',
          'Coloca las brochetas en la parrilla caliente. Deberías escuchar un chisporroteo inmediato - esto significa que la parrilla está lo suficientemente caliente.',
          'Cocina durante 3-4 minutos sin mover. Verás marcas de parrilla oscuras en la parte inferior - esto es bueno. Gira las brochetas 90 grados para crear un patrón entrecruzado.',
          'Cocina otros 3-4 minutos, luego voltea las brochetas completamente. Repite el proceso en el otro lado. El tiempo total de cocción es de 12-16 minutos, dependiendo del grosor.',
          `El ${mainIngredient} está listo cuando alcanza una temperatura interna segura (165°F/74°C para pollo, 145°F/63°C para cerdo). Los jugos deben salir claros, no rosados.`,
          'Retira las brochetas de la parrilla con cuidado usando pinzas. Deja reposar 3-5 minutos antes de servir - esto permite que los jugos se redistribuyan. Sirve caliente.'
        ],
        prepTime: '20 min + 1 hora de marinado',
        servings: 4,
        tags: ['Quick', 'High Protein'],
        nutrition: {
          calories: 320,
          protein: 30,
          carbs: 8,
          fat: 18
        }
      },
      {
        title: `Ensalada Mediterránea de ${mainIngredient}`,
        description: `Ensalada fresca con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), 'Lechuga', '100g queso feta', 'Aceitunas', '1 pepino', '1 tomate', '45ml aceite oliva', '30ml jugo limón', '5ml orégano', 'Sal', 'Pimienta'],
        instructions: [
          'Comienza lavando toda la verdura fresca. Lava la lechuga hoja por hoja bajo agua fría, luego sécala completamente con un centrifugador de ensaladas o toallas de papel. La lechuga mojada diluirá el aderezo.',
          `Si tu ${mainIngredient} necesita cocinarse, hazlo primero y déjalo enfriar completamente. Puedes asar, hervir o saltear - solo asegúrate de que esté a temperatura ambiente antes de añadirlo a la ensalada.`,
          'Corta el pepino en rodajas finas de aproximadamente 1/4 de pulgada. Corta el tomate en cubos medianos. Estos ingredientes frescos añaden textura crujiente.',
          'En un tazón pequeño, prepara el aderezo: mezcla el aceite de oliva, jugo de limón recién exprimido, orégano seco, sal y pimienta. Bate vigorosamente con un tenedor durante 30 segundos hasta que esté bien combinado y emulsionado (espeso y cremoso).',
          'En un tazón grande para ensaladas, coloca la lechuga como base. Extiéndela uniformemente para crear una cama para los otros ingredientes.',
          `Distribuye uniformemente encima: el ${mainIngredient} cocido y enfriado, pepino en rodajas, tomate en cubos y aceitunas kalamata. Trata de esparcir todo de manera atractiva.`,
          'Justo antes de servir (no antes o la ensalada se pondrá aguada), rocía el aderezo sobre toda la ensalada. Comienza con 3/4 del aderezo - siempre puedes añadir más.',
          'Mezcla suavemente la ensalada con dos cucharas grandes, levantando desde el fondo para asegurar que todo se cubra con aderezo. Sé gentil para no aplastar los ingredientes.',
          'Prueba y ajusta el sazón si es necesario. Espolvorea el queso feta desmenuzado encima como toque final. El feta se desmoronará más si lo mezclas, así que déjalo arriba como decoración.',
          'Sirve inmediatamente mientras esté fresca y crujiente. Esta ensalada es mejor cuando se consume dentro de los 30 minutos de mezclar.'
        ],
        prepTime: '15 min',
        servings: 3,
        tags: ['Quick', 'Low Calorie', 'Healthy'],
        nutrition: {
          calories: 240,
          protein: 12,
          carbs: 15,
          fat: 14
        }
      },
      {
        title: `Pasta Primavera con ${mainIngredient}`,
        description: `Pasta italiana con ${ingredients}`,
        ingredients: ['500g pasta', ...ingredientList.map(i => `200g ${i}`), '50g parmesano', '45ml aceite oliva', '4 dientes ajo', 'Hojuelas chile', 'Sal', 'Pimienta', 'Albahaca'],
        instructions: [
          'Llena una olla grande (al menos 6 cuartos) con agua hasta 3/4 de su capacidad. Añade 2 cucharadas de sal - el agua debe saber como el mar. Esto sazona la pasta desde adentro.',
          'Tapa la olla y lleva a ebullición completa a fuego alto. Sabrás que está lista cuando veas grandes burbujas rodantes en toda la superficie. Esto puede tomar 10-15 minutos.',
          'Una vez que hierva, añade la pasta. Revuelve inmediatamente con una cuchara de madera para evitar que se pegue. Deja que el agua vuelva a hervir.',
          'Cocina la pasta según las instrucciones del paquete MENOS 1 minuto (esto se llama "al dente"). Revuelve ocasionalmente para evitar que se pegue. La pasta debe estar firme al morderla, no blanda.',
          'Antes de escurrir, saca 1 taza del agua de cocción de la pasta con un tazón medidor y resérvala. Esta agua con almidón ayudará a crear una salsa cremosa después.',
          'Escurre la pasta en un colador en el fregadero. No enjuagues - el almidón ayuda a que la salsa se adhiera. Sacude suavemente para eliminar el exceso de agua.',
          'Mientras la pasta se cocina, calienta el aceite de oliva en una sartén grande a fuego medio durante 1 minuto. Añade el ajo picado y hojuelas de chile. Cocina durante 30-45 segundos, revolviendo constantemente, hasta que esté fragante pero no dorado.',
          `Añade todos los vegetales a la sartén. Saltea durante 4-5 minutos, revolviendo frecuentemente, hasta que estén tiernos pero aún crujientes. Sazona con sal y pimienta mientras cocinas.`,
          'Añade la pasta escurrida a la sartén con los vegetales. Mezcla bien. Si parece seca, añade el agua de pasta reservada, 1/4 taza a la vez, hasta que se forme una salsa ligera que cubra la pasta.',
          'Retira del fuego. Añade el parmesano rallado y mezcla vigorosamente - el calor derretirá el queso y creará una salsa cremosa. Prueba y ajusta sal y pimienta.',
          'Sirve inmediatamente en platos calientes. Decora con albahaca fresca picada y más parmesano rallado si lo deseas. ¡La pasta es mejor cuando está caliente!'
        ],
        prepTime: '25 min',
        servings: 4
      },
      {
        title: `Curry Indio de ${mainIngredient}`,
        description: `Curry picante con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), 'Pasta curry', '400ml leche coco', '400g arroz', '30ml aceite', '1 cebolla', '2 dientes ajo', '5g jengibre', '250ml caldo', 'Cilantro', 'Sal'],
        instructions: [
          'Primero prepara el arroz: enjuaga 2 tazas de arroz basmati bajo agua fría hasta que el agua salga clara (esto elimina el exceso de almidón). Escurre bien.',
          'En una olla mediana, combina el arroz enjuagado con 3 tazas de agua y una pizca de sal. Lleva a ebullición a fuego alto, luego reduce a fuego lento, tapa y cocina durante 15-18 minutos sin destapar.',
          'Mientras el arroz cocina, prepara todos los ingredientes del curry: pica la cebolla, ajo y ralla el jengibre fresco. Ten todo listo antes de comenzar a cocinar.',
          'Calienta 2 cucharadas de aceite vegetal en una olla grande o sartén honda a fuego medio durante 1 minuto. El aceite debe fluir fácilmente cuando inclines la sartén.',
          'Añade la cebolla picada y cocina durante 5-6 minutos, revolviendo ocasionalmente, hasta que esté suave y ligeramente dorada en los bordes. La cebolla caramelizada añade dulzura al curry.',
          'Añade el ajo picado y jengibre rallado. Revuelve constantemente durante 30 segundos hasta que huelas el aroma - ten cuidado de no quemar o se volverá amargo.',
          'Añade la pasta de curry y cocina durante 1-2 minutos, revolviendo constantemente. Verás que el aceite se vuelve de color y huele muy aromático - esto se llama "despertar las especias".',
          `Añade el ${mainIngredient} a la olla y revuelve para cubrir con la mezcla de curry. Cocina durante 3-4 minutos para sellar y absorber los sabores.`,
          'Vierte la leche de coco (primero revuelve bien la lata) y el caldo de vegetales. Revuelve bien, luego lleva a ebullición suave. Reduce el fuego a medio-bajo.',
          'Deja que el curry hierva a fuego lento sin tapar durante 15-20 minutos, revolviendo ocasionalmente, hasta que la salsa se espese y los ingredientes estén tiernos. Debe reducirse aproximadamente 1/3.',
          'Prueba y ajusta el sazón con sal. El curry debe tener un equilibrio de picante, cremoso y salado. Retira del fuego y deja reposar 3-5 minutos.',
          'Sirve el curry caliente sobre el arroz basmati esponjoso. Decora generosamente con cilantro fresco picado. Puedes servir con naan o pan plano al lado.'
        ],
        prepTime: '40 min',
        servings: 4
      },
      {
        title: `Tacos Mexicanos de ${mainIngredient}`,
        description: `Tacos estilo callejero con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `500g ${i}`), '8-10 tortillas', 'Salsa', 'Cilantro', '1 cebolla', '2 limas', '10ml comino', '5ml pimentón', '30ml aceite', 'Sal', 'Pimienta'],
        instructions: [
          `En un tazón, sazona el ${mainIngredient} picado con comino molido, pimentón, sal y pimienta. Mezcla bien para cubrir uniformemente. Esta mezcla de especias le da el auténtico sabor mexicano.`,
          'Calienta 2 cucharadas de aceite en una sartén grande a fuego medio-alto durante 1-2 minutos hasta que el aceite brille. El aceite debe estar caliente pero no humeando.',
          `Añade el ${mainIngredient} sazonado a la sartén en una capa uniforme. Si usas carne molida, rómpela con una espátula de madera mientras cocinas.`,
          'Cocina durante 6-8 minutos sin revolver mucho al principio - esto permite que se dore y desarrolle sabor. Revuelve ocasionalmente para cocinar uniformemente por todos lados.',
          `El ${mainIngredient} está listo cuando esté completamente dorado y cocido (la temperatura interna debe ser de 165°F/74°C para pollo, 160°F/71°C para carne molida). Debe verse caramelizado en algunos lugares.`,
          'Mientras se cocina el relleno, calienta las tortillas. Puedes hacerlo directamente sobre la llama de la estufa de gas durante 15-20 segundos por lado hasta que se inflen ligeramente y tengan manchas negras.',
          'Si no tienes estufa de gas, calienta las tortillas en una sartén seca a fuego medio durante 20-30 segundos por lado. Envuélvelas en un paño de cocina limpio para mantenerlas calientes y suaves.',
          'Prepara tu estación de montaje de tacos: coloca tortillas calientes, el relleno cocido, cebolla picada, cilantro fresco, salsa y gajos de lima en tazones separados.',
          'Para armar: toma una tortilla caliente, añade 2-3 cucharadas del relleno en el centro. No sobrecargues o será difícil de comer.',
          'Cubre con un poco de cebolla picada, cilantro fresco generoso, una cucharada de salsa y exprime jugo de lima fresco encima. ¡La lima es esencial - despierta todos los sabores!',
          'Dobla y come inmediatamente mientras esté caliente. Los tacos son mejores recién hechos. Sirve 2-3 tacos por persona.'
        ],
        prepTime: '20 min',
        servings: 4
      },
      {
        title: `Bowl Asiático de ${mainIngredient} con Arroz`,
        description: `Bowl saludable con ${ingredients}`,
        ingredients: ['400g arroz', ...ingredientList.map(i => `200g ${i}`), '45ml salsa soya', '15ml aceite sésamo', 'Semillas sésamo', '2 cebollines', '1 aguacate', '1 huevo', 'Sriracha'],
        instructions: [
          'Cocina el arroz según las instrucciones del paquete. Para arroz blanco: 2 tazas de arroz + 3 tazas de agua, hierve, luego reduce a fuego lento durante 15-18 minutos tapado. No destapes mientras cocina.',
          'Cuando el arroz esté listo, quita del fuego y deja reposar tapado durante 5 minutos. Esto permite que el vapor termine la cocción y el arroz quede esponjoso. Luego destapa y esponja con un tenedor.',
          `Mientras el arroz cocina, prepara el ${mainIngredient}: córtalo en trozos pequeños del tamaño de un bocado para que sea fácil de comer con palillos o tenedor.`,
          'Calienta una sartén antiadherente a fuego medio-alto. Añade una cucharada de aceite y deja calentar durante 30 segundos hasta que brille.',
          `Añade el ${mainIngredient} a la sartén. Cocina durante 5-7 minutos, revolviendo ocasionalmente, hasta que esté completamente cocido y ligeramente dorado. Sazona con una pizca de sal.`,
          'Mientras todo se cocina, prepara tus vegetales: pica los cebollines en rodajas finas, corta el aguacate en rodajas, y ten listos todos los ingredientes adicionales.',
          'Para ensamblar el bowl, comienza con una generosa porción de arroz caliente en el fondo de un bowl hondo. Aplana ligeramente la parte superior con el reverso de una cuchara.',
          `Coloca el ${mainIngredient} cocido en una sección del bowl, sobre el arroz. Añade los vegetales en secciones separadas alrededor del bowl - esto se ve bonito y permite que comas cada ingrediente como quieras.`,
          'Añade rodajas de aguacate fresco en un lado. Si quieres más proteína, añade medio huevo cocido cortado por la mitad.',
          'Rocía salsa de soya sobre todo el bowl (empieza con 1-2 cucharadas y añade más al gusto). Luego rocía aceite de sésamo - solo un poco, es muy fuerte.',
          'Espolvorea semillas de sésamo tostadas y cebollines picados por encima como decoración final. Añade unas gotas de sriracha si te gusta picante.',
          'Mezcla todo junto con tu tenedor o palillos mientras comes. Cada bocado debe tener un poco de arroz, proteína, vegetales y salsa. ¡Disfruta!'
        ],
        prepTime: '30 min',
        servings: 2
      },
      {
        title: `Pizza Flatbread de ${mainIngredient}`,
        description: `Flatbread gourmet con ${ingredients}`,
        ingredients: ['2 flatbreads', ...ingredientList.map(i => `100g ${i}`), '200g mozzarella', '125ml salsa marinara', '30ml aceite oliva', '5ml hierbas italianas', 'Chile', 'Albahaca'],
        instructions: [
          'Precalienta tu horno a 425°F (220°C). Coloca una rejilla del horno en la posición más alta - esto asegura que la parte superior se dore bien. Deja que el horno se caliente completamente durante al menos 10 minutos.',
          'Prepara una bandeja para hornear grande cubriéndola con papel pergamino. Esto evita que los flatbreads se peguen y facilita la limpieza.',
          'Coloca los flatbreads sobre el papel pergamino. Cepilla ligeramente la parte superior de cada flatbread con 1 cucharada de aceite de oliva usando un pincel de cocina. Esto crea una base crujiente.',
          'Extiende la salsa marinara uniformemente sobre cada flatbread, dejando un borde de 1/2 pulgada alrededor como corteza. Usa el reverso de una cuchara en movimientos circulares para distribuir uniformemente.',
          `Distribuye el ${mainIngredient} preparado uniformemente sobre la salsa. No sobrecargues - demasiados ingredientes harán que el flatbread quede empapado. Menos es más.`,
          'Espolvorea el queso mozzarella rallado uniformemente sobre todo. El queso debe cubrir la mayoría de los ingredientes pero aún dejar algo visible para textura.',
          'Espolvorea las hierbas italianas secas sobre el queso. Si te gusta picante, añade unas hojuelas de chile rojo ahora.',
          'Coloca la bandeja en el horno precalentado en la rejilla superior. Hornea durante 12-15 minutos. Estará listo cuando el queso esté completamente derretido y burbujeante, con manchas doradas.',
          'Observa cuidadosamente durante los últimos minutos - los bordes deben estar dorados y crujientes, pero no quemados. Los hornos varían, así que confía en tus ojos más que en el reloj.',
          'Retira del horno con cuidado usando guantes de horno (¡la bandeja está EXTREMADAMENTE caliente!). Deja que los flatbreads reposen en la bandeja durante 2-3 minutos - esto permite que el queso se asiente y será más fácil de cortar.',
          'Transfiere a una tabla de cortar. Decora con hojas de albahaca fresca. Corta cada flatbread en 4-6 triángulos con un cortador de pizza o cuchillo afilado.',
          'Sirve inmediatamente mientras el queso esté fundido y la corteza crujiente. Perfecto para compartir o como comida rápida.'
        ],
        prepTime: '25 min',
        servings: 2
      }
    ];
  }

  private getFrenchFallbackRecipes(mainIngredient: string, ingredientList: string[], ingredients: string): Recipe[] {
    return [
      {
        title: `Sauté Rapide de ${mainIngredient}`,
        description: `Un sauté asiatique rapide avec ${ingredients}`,
        ingredients: [...ingredientList.map(i => `200g ${i}`), '30ml sauce soja', '15ml huile sésame', 'Ail', 'Gingembre'],
        instructions: ['Chauffer le wok à feu vif', `Faire sauter ${mainIngredient} 3-4 minutes`, 'Ajouter légumes et sauce', 'Mélanger 2 minutes et servir'],
        prepTime: '15 min',
        servings: 2
      },
      {
        title: `Casserole de ${mainIngredient} au Four`,
        description: `Casserole réconfortante avec ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), '200g fromage', '125ml crème', 'Herbes'],
        instructions: ['Préchauffer le four à 190°C', 'Disposer les ingrédients en couches', 'Ajouter crème et fromage', 'Cuire 35 minutes'],
        prepTime: '45 min',
        servings: 4
      },
      {
        title: `Soupe Copieuse de ${mainIngredient}`,
        description: `Soupe réconfortante avec ${ingredients}`,
        ingredients: [...ingredientList.map(i => `200g ${i}`), '1L bouillon', '1 oignon', 'Assaisonnements'],
        instructions: ['Faire revenir l\'oignon', 'Ajouter ingrédients et bouillon', 'Mijoter 20 minutes', 'Assaisonner et servir'],
        prepTime: '30 min',
        servings: 4
      },
      {
        title: `Brochettes de ${mainIngredient} Grillées`,
        description: `Brochettes style BBQ avec ${ingredients}`,
        ingredients: [...ingredientList.map(i => `700g de ${i}`), 'Marinade BBQ', 'Brochettes', 'Huile d\'olive'],
        instructions: ['Mariner 1 heure', 'Enfiler sur brochettes', 'Griller 6-8 minutes', 'Retourner et cuire'],
        prepTime: '20 min',
        servings: 4
      },
      {
        title: `Salade Méditerranéenne de ${mainIngredient}`,
        description: `Salade fraîche avec ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), 'Laitue', '100g fromage feta', 'Olives', 'Vinaigrette citron'],
        instructions: ['Hacher tous les ingrédients', 'Mélanger dans un grand bol', 'Ajouter la vinaigrette', 'Garnir de feta et servir'],
        prepTime: '15 min',
        servings: 3
      },
      {
        title: `Pâtes Primavera au ${mainIngredient}`,
        description: `Pâtes italiennes avec ${ingredients}`,
        ingredients: ['500g pâtes', ...ingredientList.map(i => `200g ${i}`), '50g Parmesan', '30ml huile olive', '2 gousses ail'],
        instructions: ['Cuire les pâtes al dente', 'Faire revenir les légumes', 'Mélanger avec les pâtes', 'Garnir de parmesan'],
        prepTime: '25 min',
        servings: 4
      },
      {
        title: `Curry Indien au ${mainIngredient}`,
        description: `Curry épicé avec ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), 'Pâte curry', '400ml lait coco', '300g riz', 'Épices'],
        instructions: ['Torréfier les épices', 'Ajouter pâte de curry et lait de coco', 'Mijoter 20 min', 'Servir avec du riz'],
        prepTime: '40 min',
        servings: 4
      },
      {
        title: `Tacos Mexicains au ${mainIngredient}`,
        description: `Tacos de rue avec ${ingredients}`,
        ingredients: [...ingredientList.map(i => `500g de ${i}`), 'Tortillas', 'Salsa', 'Coriandre', 'Citron vert'],
        instructions: ['Assaisonner et cuire la garniture', 'Réchauffer les tortillas', 'Assembler les tacos', 'Garnir de salsa et coriandre'],
        prepTime: '20 min',
        servings: 4
      },
      {
        title: `Bol de Riz Asiatique au ${mainIngredient}`,
        description: `Bol santé avec ${ingredients}`,
        ingredients: ['400g riz', ...ingredientList.map(i => `200g ${i}`), '30ml sauce soja', 'Graines sésame', 'Légumes'],
        instructions: ['Cuire le riz', 'Préparer les garnitures', 'Disposer en couches', 'Arroser de sauce et graines'],
        prepTime: '30 min',
        servings: 2
      },
      {
        title: `Pizza Flatbread au ${mainIngredient}`,
        description: `Flatbread gourmet avec ${ingredients}`,
        ingredients: ['2 flatbreads', ...ingredientList.map(i => `100g ${i}`), '200g Mozzarella', '30ml huile olive', 'Herbes'],
        instructions: ['Préchauffer le four à 220°C', 'Garnir les flatbreads', 'Cuire 12-15 minutes', 'Trancher et servir chaud'],
        prepTime: '25 min',
        servings: 2
      }
    ];
  }

  private getGermanFallbackRecipes(mainIngredient: string, ingredientList: string[], ingredients: string): Recipe[] {
    return [
      {
        title: `Schnelles ${mainIngredient} Pfannengericht`,
        description: `Ein schnelles asiatisches Pfannengericht mit ${ingredients}`,
        ingredients: [...ingredientList.map(i => `200g ${i}`), '30ml Sojasoße', '15ml Sesamöl', 'Knoblauch', 'Ingwer'],
        instructions: ['Wok stark erhitzen', `${mainIngredient} 3-4 Minuten anbraten`, 'Gemüse und Soße hinzufügen', '2 Minuten schwenken und servieren'],
        prepTime: '15 Min',
        servings: 2
      },
      {
        title: `${mainIngredient} Auflauf`,
        description: `Herzhafter Auflauf mit ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), '200g Käse', '125ml Sahne', 'Kräuter'],
        instructions: ['Ofen auf 190°C vorheizen', 'Zutaten schichten', 'Sahne und Käse hinzufügen', '35 Minuten backen'],
        prepTime: '45 Min',
        servings: 4
      },
      {
        title: `Herzhafte ${mainIngredient} Suppe`,
        description: `Wärmende Suppe mit ${ingredients}`,
        ingredients: [...ingredientList.map(i => `200g ${i}`), '1L Brühe', '1 Zwiebel', 'Gewürze'],
        instructions: ['Zwiebel anschwitzen', 'Zutaten und Brühe hinzufügen', '20 Minuten köcheln', 'Würzen und servieren'],
        prepTime: '30 Min',
        servings: 4
      },
      {
        title: `Gegrillte ${mainIngredient} Spieße`,
        description: `BBQ-Spieße mit ${ingredients}`,
        ingredients: [...ingredientList.map(i => `700g ${i}`), 'BBQ-Marinade', 'Spieße', 'Olivenöl'],
        instructions: ['1 Stunde marinieren', 'Auf Spieße stecken', '6-8 Minuten grillen', 'Wenden und fertig garen'],
        prepTime: '20 Min',
        servings: 4
      },
      {
        title: `Mediterraner ${mainIngredient} Salat`,
        description: `Frischer Salat mit ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), 'Salat', '100g Feta-Käse', 'Oliven', 'Zitronen-Dressing'],
        instructions: ['Alle Zutaten hacken', 'In großer Schüssel mischen', 'Dressing hinzufügen', 'Mit Feta garnieren'],
        prepTime: '15 Min',
        servings: 3
      },
      {
        title: `${mainIngredient} Pasta Primavera`,
        description: `Italienische Pasta mit ${ingredients}`,
        ingredients: ['500g Pasta', ...ingredientList.map(i => `200g ${i}`), '50g Parmesan', '30ml Olivenöl', '2 Knoblauch'],
        instructions: ['Pasta al dente kochen', 'Gemüse anbraten', 'Mit Pasta vermengen', 'Mit Parmesan bestreuen'],
        prepTime: '25 Min',
        servings: 4
      },
      {
        title: `Indisches ${mainIngredient} Curry`,
        description: `Würziges Curry mit ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), 'Currypaste', '400ml Kokosmilch', '300g Reis', 'Gewürze'],
        instructions: ['Gewürze rösten', 'Currypaste und Kokosmilch hinzufügen', '20 Min köcheln', 'Mit Reis servieren'],
        prepTime: '40 Min',
        servings: 4
      },
      {
        title: `Mexikanische ${mainIngredient} Tacos`,
        description: `Street-Style Tacos mit ${ingredients}`,
        ingredients: [...ingredientList.map(i => `500g ${i}`), 'Tortillas', 'Salsa', 'Koriander', 'Limette'],
        instructions: ['Füllung würzen und zubereiten', 'Tortillas erwärmen', 'Tacos zusammenstellen', 'Mit Salsa und Koriander garnieren'],
        prepTime: '20 Min',
        servings: 4
      },
      {
        title: `Asiatische ${mainIngredient} Reisschale`,
        description: `Gesunde Schale mit ${ingredients}`,
        ingredients: ['400g Reis', ...ingredientList.map(i => `200g ${i}`), '30ml Sojasoße', 'Sesam', 'Gemüse'],
        instructions: ['Reis kochen', 'Toppings vorbereiten', 'In Schale schichten', 'Mit Soße und Sesam beträufeln'],
        prepTime: '30 Min',
        servings: 2
      },
      {
        title: `${mainIngredient} Flatbread Pizza`,
        description: `Gourmet-Flatbread mit ${ingredients}`,
        ingredients: ['2 Flatbreads', ...ingredientList.map(i => `100g ${i}`), '200g Mozzarella', '30ml Olivenöl', 'Kräuter'],
        instructions: ['Ofen auf 220°C vorheizen', 'Flatbreads belegen', '12-15 Minuten backen', 'Schneiden und heiß servieren'],
        prepTime: '25 Min',
        servings: 2
      }
    ];
  }

  private getItalianFallbackRecipes(mainIngredient: string, ingredientList: string[], ingredients: string): Recipe[] {
    return [
      {
        title: `Saltato Veloce di ${mainIngredient}`,
        description: `Un saltato asiatico veloce con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `200g ${i}`), '30ml salsa soia', '15ml olio sesamo', 'Aglio', 'Zenzero'],
        instructions: ['Scaldare il wok a fuoco alto', `Saltare ${mainIngredient} 3-4 minuti`, 'Aggiungere verdure e salsa', 'Mescolare 2 minuti e servire'],
        prepTime: '15 min',
        servings: 2
      },
      {
        title: `Casseruola di ${mainIngredient} al Forno`,
        description: `Casseruola confortante con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), '200g formaggio', '125ml panna', 'Erbe'],
        instructions: ['Preriscaldare il forno a 190°C', 'Disporre gli ingredienti a strati', 'Aggiungere panna e formaggio', 'Cuocere 35 minuti'],
        prepTime: '45 min',
        servings: 4
      },
      {
        title: `Zuppa Abbondante di ${mainIngredient}`,
        description: `Zuppa calda con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `200g ${i}`), '1L brodo', '1 cipolla', 'Condimenti'],
        instructions: ['Rosolare la cipolla', 'Aggiungere ingredienti e brodo', 'Cuocere a fuoco lento 20 minuti', 'Condire e servire'],
        prepTime: '30 min',
        servings: 4
      },
      {
        title: `Spiedini di ${mainIngredient} alla Griglia`,
        description: `Spiedini stile BBQ con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `700g di ${i}`), 'Marinata BBQ', 'Spiedini', 'Olio d\'oliva'],
        instructions: ['Marinare 1 ora', 'Infilare sugli spiedini', 'Grigliare 6-8 minuti', 'Girare e cuocere'],
        prepTime: '20 min',
        servings: 4
      },
      {
        title: `Insalata Mediterranea di ${mainIngredient}`,
        description: `Insalata fresca con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), 'Lattuga', '100g formaggio feta', 'Olive', 'Condimento limone'],
        instructions: ['Tritare tutti gli ingredienti', 'Mescolare in una ciotola grande', 'Aggiungere il condimento', 'Guarnire con feta e servire'],
        prepTime: '15 min',
        servings: 3
      },
      {
        title: `Pasta Primavera con ${mainIngredient}`,
        description: `Pasta italiana con ${ingredients}`,
        ingredients: ['500g pasta', ...ingredientList.map(i => `200g ${i}`), '50g Parmigiano', '30ml olio oliva', '2 spicchi aglio'],
        instructions: ['Cuocere la pasta al dente', 'Saltare le verdure', 'Unire alla pasta', 'Guarnire con parmigiano'],
        prepTime: '25 min',
        servings: 4
      },
      {
        title: `Curry Indiano di ${mainIngredient}`,
        description: `Curry piccante con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `400g ${i}`), 'Pasta curry', '400ml latte cocco', '300g riso', 'Spezie'],
        instructions: ['Tostare le spezie', 'Aggiungere pasta di curry e latte di cocco', 'Cuocere 20 min', 'Servire con riso'],
        prepTime: '40 min',
        servings: 4
      },
      {
        title: `Tacos Messicani di ${mainIngredient}`,
        description: `Tacos in stile street food con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `500g di ${i}`), 'Tortillas', 'Salsa', 'Coriandolo', 'Lime'],
        instructions: ['Condire e cuocere il ripieno', 'Scaldare le tortillas', 'Assemblare i tacos', 'Guarnire con salsa e coriandolo'],
        prepTime: '20 min',
        servings: 4
      },
      {
        title: `Bowl di Riso Asiatico con ${mainIngredient}`,
        description: `Bowl salutare con ${ingredients}`,
        ingredients: ['400g riso', ...ingredientList.map(i => `200g ${i}`), '30ml salsa soia', 'Semi sesamo', 'Verdure'],
        instructions: ['Cuocere il riso', 'Preparare i condimenti', 'Disporre a strati nella bowl', 'Condire con salsa e semi'],
        prepTime: '30 min',
        servings: 2
      },
      {
        title: `Pizza Flatbread con ${mainIngredient}`,
        description: `Flatbread gourmet con ${ingredients}`,
        ingredients: ['2 flatbreads', ...ingredientList.map(i => `100g ${i}`), '200g Mozzarella', '30ml olio oliva', 'Erbe'],
        instructions: ['Preriscaldare il forno a 220°C', 'Condire i flatbreads', 'Cuocere 12-15 minuti', 'Tagliare e servire caldo'],
        prepTime: '25 min',
        servings: 2
      }
    ];
  }

  async analyzeWithAI(prompt: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini model not initialized');
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error in analyzeWithAI:', error);
      throw new Error('Failed to analyze with AI');
    }
  }

  async analyzeImageWithAI(imageDataUrl: string, prompt: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini model not initialized');
    }

    try {
      const base64Data = imageDataUrl.split(',')[1];
      
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error in analyzeImageWithAI:', error);
      throw new Error('Failed to analyze image with AI');
    }
  }
}
