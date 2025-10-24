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
    console.log('Generating recipes for:', ingredients);
    
    // Always try Gemini first if available
    if (this.model) {
      try {
        const prompt = `You are a chef. Create exactly 3 different recipes using these ingredients: ${ingredients}.
        
Important rules:
- Use the provided ingredients as main components
- Each recipe must be different (vary cuisine, cooking method, style)
- Include real measurements and cooking times
- Be specific with instructions

Return ONLY a JSON array, no other text, in this exact format:
[
  {
    "title": "Specific Recipe Name",
    "description": "One sentence description",
    "ingredients": ["2 lbs chicken", "3 cups rice", "exact amounts"],
    "instructions": ["Step 1 details", "Step 2 with temperature", "Step 3 timing"],
    "prepTime": "25 mins",
    "servings": 4
  }
]`;

        console.log('Calling Gemini API...');
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
              console.log('✅ Generated', recipes.length, 'unique recipes!');
              return recipes.slice(0, 3);
            }
          } catch (e) {
            console.error('JSON parse error:', e);
          }
        }
      } catch (error: any) {
        console.error('Gemini API error:', error.message);
      }
    }
    
    // Enhanced fallback with ingredient-based recipes
    console.log('Using enhanced fallback recipes');
    const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
    
    // Create varied recipes based on ingredients
    const recipes: Recipe[] = [];
    
    // Recipe 1: Quick version
    recipes.push({
      title: `Quick ${ingredientList[0] || 'Mixed'} Stir-Fry`,
      description: `A fast and delicious stir-fry featuring ${ingredients}`,
      ingredients: [
        ...ingredientList.map(i => `1 cup ${i}`),
        '2 tbsp olive oil',
        'Salt and pepper to taste',
        '1 tsp garlic powder'
      ],
      instructions: [
        'Heat oil in a large pan over medium-high heat',
        `Add ${ingredientList[0] || 'ingredients'} and cook for 3-4 minutes`,
        'Add remaining ingredients and stir-fry for 5-7 minutes',
        'Season with salt, pepper, and garlic powder',
        'Serve hot immediately'
      ],
      prepTime: '15 mins',
      servings: 2
    });
    
    // Recipe 2: Baked version
    recipes.push({
      title: `Baked ${ingredientList[0] || 'Mixed'} Casserole`,
      description: `A hearty baked dish with ${ingredients}`,
      ingredients: [
        ...ingredientList.map(i => `2 cups ${i}`),
        '1 cup cheese',
        '1/2 cup cream',
        'Salt, pepper, herbs'
      ],
      instructions: [
        'Preheat oven to 375°F (190°C)',
        `Layer ${ingredientList.join(', ')} in a baking dish`,
        'Mix cream with seasonings and pour over',
        'Top with cheese',
        'Bake for 30-35 minutes until golden',
        'Let rest 5 minutes before serving'
      ],
      prepTime: '45 mins',
      servings: 4
    });
    
    // Recipe 3: Soup version
    recipes.push({
      title: `${ingredientList[0] || 'Hearty'} Soup`,
      description: `A warming soup made with ${ingredients}`,
      ingredients: [
        ...ingredientList.map(i => `1 cup chopped ${i}`),
        '4 cups vegetable broth',
        '1 onion, diced',
        'Seasonings to taste'
      ],
      instructions: [
        'Sauté onion in pot until soft',
        `Add ${ingredientList[0] || 'main ingredients'} and cook 5 minutes`,
        'Pour in broth and bring to boil',
        'Reduce heat and simmer 20 minutes',
        'Season to taste and serve with bread'
      ],
      prepTime: '35 mins',
      servings: 4
    });
    
    return recipes;
  }
}