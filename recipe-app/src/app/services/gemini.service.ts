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
      const prompt = `Create 3 recipes using these ingredients: ${ingredients}. 
      Return ONLY a valid JSON array with this exact structure:
      [{"title":"Recipe Name","description":"Brief description","ingredients":["ingredient 1","ingredient 2"],"instructions":["step 1","step 2"],"prepTime":"30 mins","servings":4}]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
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
