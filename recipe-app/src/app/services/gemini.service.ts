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
    console.log('Gemini Service initializing with API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'none');
    if (apiKey && apiKey !== 'demo-key') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        console.log('Gemini AI model initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Gemini AI:', error);
        this.model = null;
      }
    } else {
      console.log('No valid API key found, will use mock recipes');
    }
  }

  private getApiKey(): string {
    return environment.googleApiKey || 'demo-key';
  }

  async generateRecipes(ingredients: string): Promise<Recipe[]> {
    console.log('generateRecipes called with ingredients:', ingredients);
    
    if (!this.model) {
      console.log('Model not initialized, using mock recipes');
      return this.getMockRecipes(ingredients);
    }

    try {
      console.log('Attempting to generate recipes with Gemini AI...');
      
      const prompt = `You are a professional chef. Create 3 unique, delicious recipes using PRIMARILY these ingredients: ${ingredients}. 
      
      IMPORTANT: Make each recipe DIFFERENT - vary the cooking methods, cuisines, and styles.
      You can add common pantry items (oil, salt, pepper, spices, etc.) but the main ingredients should be from: ${ingredients}
      
      For variety, include:
      1. One quick and easy recipe (under 20 minutes)
      2. One comfort/hearty dish (30-45 minutes)
      3. One healthy or creative option
      
      Return ONLY a valid JSON array with EXACTLY this structure, no markdown, no extra text:
      [
        {
          "title": "Specific Recipe Name (not generic)",
          "description": "Appetizing 1-2 sentence description",
          "ingredients": ["1 lb chicken", "2 cups rice", "exact measurements"],
          "instructions": ["Step 1 with details", "Step 2 with temperature/time", "Step 3 clear instructions"],
          "prepTime": "15 mins",
          "servings": 4
        }
      ]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini AI raw response:', text.substring(0, 200) + '...');
      
      // Try to extract JSON from the response
      // Remove any markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        try {
          const recipes = JSON.parse(jsonMatch[0]);
          // Validate that we have the expected structure
          if (Array.isArray(recipes) && recipes.length > 0 && recipes[0].title) {
            console.log('✅ Successfully generated', recipes.length, 'recipes with AI');
            console.log('Recipe titles:', recipes.map((r: any) => r.title).join(', '));
            return recipes.slice(0, 3); // Ensure we only return 3 recipes
          } else {
            console.error('Invalid recipe structure:', recipes);
          }
        } catch (parseError) {
          console.error('Failed to parse AI response as JSON:', parseError);
          console.log('Attempted to parse:', jsonMatch[0].substring(0, 100) + '...');
        }
      } else {
        console.error('No JSON array found in response');
      }
      
      console.log('⚠️ AI response invalid, using fallback recipes');
      return this.getMockRecipes(ingredients);
    } catch (error: any) {
      console.error('❌ Failed to generate recipes with Gemini:', error);
      console.error('Error details:', error.message || error);
      if (error.response) {
        console.error('API Response error:', error.response);
      }
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
