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
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        console.log('✅ Gemini model ready!');
      } catch (error) {
        console.error('Failed to init Gemini:', error);
      }
    } else {
      console.log('No valid Gemini API key found');
    }
  }

  async generateRecipes(ingredients: string): Promise<Recipe[]> {
    console.log('Generating 10 recipes for:', ingredients);
    
    // Always try Gemini first if available
    if (this.model) {
      try {
        const prompt = `You are a professional chef. Create exactly 10 unique and diverse recipes using these ingredients: ${ingredients}.
        
Important rules:
- Use the provided ingredients as main components
- Each recipe MUST be completely different (vary cuisine style, cooking method, difficulty)
- Include cuisines like: Italian, Asian, Mexican, American, Mediterranean, Indian, etc.
- Include cooking methods like: stir-fry, baked, grilled, soup, salad, pasta, rice bowl, curry, etc.
- Include real measurements and cooking times
- Be very specific with instructions

Return ONLY a JSON array with 10 recipes, no other text, in this exact format:
[
  {
    "title": "Very Specific Recipe Name with Cuisine Style",
    "description": "One appetizing sentence description",
    "ingredients": ["2 lbs chicken breast", "3 cups basmati rice", "exact amounts with units"],
    "instructions": ["Step 1 with specific details", "Step 2 with temperature in °F", "Step 3 with exact timing"],
    "prepTime": "25 mins",
    "servings": 4
  }
]

Make sure all 10 recipes are VERY different from each other!`;

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
              console.log('✅ Generated', recipes.length, 'unique recipes with AI!');
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
    
    // Enhanced fallback with 10 ingredient-based recipes
    console.log('Using enhanced fallback with 10 recipes');
    const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
    const mainIngredient = ingredientList[0] || 'Mixed';
    
    const recipes: Recipe[] = [
      // Recipe 1: Stir-Fry
      {
        title: `Quick ${mainIngredient} Stir-Fry`,
        description: `A fast Asian-style stir-fry with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `1 cup ${i}`), '2 tbsp soy sauce', '1 tbsp sesame oil', 'Garlic, ginger'],
        instructions: ['Heat wok to high heat', `Stir-fry ${mainIngredient} 3-4 minutes`, 'Add vegetables and sauce', 'Toss 2 minutes and serve'],
        prepTime: '15 mins',
        servings: 2
      },
      
      // Recipe 2: Baked
      {
        title: `Baked ${mainIngredient} Casserole`,
        description: `Comfort food casserole with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 cups ${i}`), '1 cup cheese', '1/2 cup cream', 'Herbs'],
        instructions: ['Preheat oven to 375°F', 'Layer ingredients in dish', 'Add cream and cheese', 'Bake 35 minutes'],
        prepTime: '45 mins',
        servings: 4
      },
      
      // Recipe 3: Soup
      {
        title: `Hearty ${mainIngredient} Soup`,
        description: `Warming soup with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `1 cup ${i}`), '4 cups broth', '1 onion', 'Seasonings'],
        instructions: ['Sauté onion', 'Add ingredients and broth', 'Simmer 20 minutes', 'Season and serve'],
        prepTime: '30 mins',
        servings: 4
      },
      
      // Recipe 4: Grilled
      {
        title: `Grilled ${mainIngredient} Skewers`,
        description: `BBQ-style grilled ${ingredients}`,
        ingredients: [...ingredientList.map(i => `1.5 lbs ${i}`), 'BBQ marinade', 'Skewers', 'Olive oil'],
        instructions: ['Marinate 1 hour', 'Thread onto skewers', 'Grill 6-8 minutes', 'Turn and cook until done'],
        prepTime: '20 mins',
        servings: 4
      },
      
      // Recipe 5: Salad
      {
        title: `Mediterranean ${mainIngredient} Salad`,
        description: `Fresh salad featuring ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 cups ${i}`), 'Lettuce', 'Feta cheese', 'Olives', 'Lemon dressing'],
        instructions: ['Chop all ingredients', 'Toss in large bowl', 'Add dressing', 'Top with feta and serve'],
        prepTime: '15 mins',
        servings: 3
      },
      
      // Recipe 6: Pasta
      {
        title: `${mainIngredient} Pasta Primavera`,
        description: `Italian pasta with ${ingredients}`,
        ingredients: ['1 lb pasta', ...ingredientList.map(i => `1 cup ${i}`), 'Parmesan', 'Olive oil', 'Garlic'],
        instructions: ['Boil pasta al dente', 'Sauté vegetables', 'Combine with pasta', 'Top with parmesan'],
        prepTime: '25 mins',
        servings: 4
      },
      
      // Recipe 7: Curry
      {
        title: `Indian ${mainIngredient} Curry`,
        description: `Spicy curry with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 cups ${i}`), 'Curry paste', 'Coconut milk', 'Rice', 'Spices'],
        instructions: ['Toast spices', 'Add curry paste and coconut milk', 'Simmer ingredients 20 mins', 'Serve over rice'],
        prepTime: '40 mins',
        servings: 4
      },
      
      // Recipe 8: Tacos
      {
        title: `Mexican ${mainIngredient} Tacos`,
        description: `Street-style tacos with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `1 lb ${i}`), 'Tortillas', 'Salsa', 'Cilantro', 'Lime'],
        instructions: ['Season and cook filling', 'Warm tortillas', 'Assemble tacos', 'Top with salsa and cilantro'],
        prepTime: '20 mins',
        servings: 4
      },
      
      // Recipe 9: Rice Bowl
      {
        title: `Asian ${mainIngredient} Rice Bowl`,
        description: `Healthy bowl with ${ingredients}`,
        ingredients: ['2 cups rice', ...ingredientList.map(i => `1 cup ${i}`), 'Soy sauce', 'Sesame seeds', 'Vegetables'],
        instructions: ['Cook rice', 'Prepare toppings', 'Layer in bowl', 'Drizzle with sauce and seeds'],
        prepTime: '30 mins',
        servings: 2
      },
      
      // Recipe 10: Pizza/Flatbread
      {
        title: `${mainIngredient} Flatbread Pizza`,
        description: `Gourmet flatbread with ${ingredients}`,
        ingredients: ['2 flatbreads', ...ingredientList.map(i => `1/2 cup ${i}`), 'Mozzarella', 'Olive oil', 'Herbs'],
        instructions: ['Preheat oven to 425°F', 'Top flatbreads', 'Bake 12-15 minutes', 'Slice and serve hot'],
        prepTime: '25 mins',
        servings: 2
      }
    ];
    
    return recipes;
  }
}