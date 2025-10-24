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
    const apiKey = this.getApiKey();
    if (apiKey && apiKey !== 'demo-key') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  private getApiKey(): string {
    return environment.googleApiKey || 'demo-key';
  }

  async generateRecipes(ingredients: string): Promise<Recipe[]> {
    if (!this.model) {
      console.log('Using mock recipes (no API key configured)');
      return this.getMockRecipes(ingredients);
    }

    try {
      const prompt = `You are a professional chef. Create 3 delicious and practical recipes using PRIMARILY these ingredients: ${ingredients}. 
      You can add common pantry items (oil, salt, pepper, spices, etc.) but the main ingredients should be the ones provided.
      
      Each recipe should be:
      - Different in style (e.g., one quick dish, one comfort food, one healthy option)
      - Realistic and easy to follow
      - Using mostly the provided ingredients
      
      Return ONLY a valid JSON array with EXACTLY this structure, no text before or after:
      [
        {
          "title": "Recipe Name",
          "description": "Brief appetizing description in 1-2 sentences",
          "ingredients": ["2 cups of ingredient 1", "1 lb ingredient 2", "specific measurements"],
          "instructions": ["Detailed step 1", "Detailed step 2", "Clear cooking instructions"],
          "prepTime": "X mins",
          "servings": 4
        }
      ]
      
      Make sure to include proper measurements and cooking temperatures where relevant.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const recipes = JSON.parse(jsonMatch[0]);
          // Validate that we have the expected structure
          if (Array.isArray(recipes) && recipes.length > 0 && recipes[0].title) {
            console.log('Successfully generated recipes with AI');
            return recipes.slice(0, 3); // Ensure we only return 3 recipes
          }
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
        }
      }
      
      console.log('AI response invalid, using fallback recipes');
      return this.getMockRecipes(ingredients);
    } catch (error) {
      console.error('Failed to generate recipes:', error);
      return this.getMockRecipes(ingredients);
    }
  }

  private getMockRecipes(ingredients: string): Recipe[] {
    return [
      {
        title: 'Quick Stir Fry',
        description: `A delicious stir fry using ${ingredients}`,
        ingredients: ingredients.split(',').map(i => i.trim()),
        instructions: [
          'Heat oil in a wok or large pan',
          'Add ingredients and stir fry for 5-7 minutes',
          'Season with soy sauce and serve hot'
        ],
        prepTime: '20 mins',
        servings: 2
      },
      {
        title: 'Simple Salad',
        description: `Fresh salad with ${ingredients}`,
        ingredients: ingredients.split(',').map(i => i.trim()),
        instructions: [
          'Wash and chop all ingredients',
          'Mix in a large bowl',
          'Drizzle with olive oil and lemon juice'
        ],
        prepTime: '10 mins',
        servings: 2
      },
      {
        title: 'Hearty Soup',
        description: `Warming soup featuring ${ingredients}`,
        ingredients: ingredients.split(',').map(i => i.trim()).concat(['vegetable broth', 'salt', 'pepper']),
        instructions: [
          'Chop all ingredients',
          'Add to pot with broth',
          'Simmer for 30 minutes',
          'Season and serve'
        ],
        prepTime: '45 mins',
        servings: 4
      }
    ];
  }
}
