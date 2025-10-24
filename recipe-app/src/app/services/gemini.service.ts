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

  async generateRecipes(ingredients: string, language: string = 'en'): Promise<Recipe[]> {
    console.log('Generating 10 recipes for:', ingredients, 'in language:', language);
    
    // Language name mapping for better prompts
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian'
    };
    
    const languageName = languageNames[language] || 'English';
    
    // Always try Gemini first if available
    if (this.model) {
      try {
        const prompt = `You are a professional chef teaching beginners. Create exactly 10 unique and diverse recipes using these ingredients: ${ingredients}.
        
Important rules:
- WRITE EVERYTHING IN ${languageName.toUpperCase()} (recipe titles, descriptions, ingredients, instructions - ALL TEXT)
- Use the provided ingredients as main components
- Each recipe MUST be completely different (vary cuisine style, cooking method, difficulty)
- Include cuisines like: Italian, Asian, Mexican, American, Mediterranean, Indian, etc.
- Include cooking methods like: stir-fry, baked, grilled, soup, salad, pasta, rice bowl, curry, etc.
- Include real measurements and cooking times

CRITICAL - DETAILED INSTRUCTIONS FOR BEGINNERS:
- Each instruction step must be VERY detailed and explain HOW to do it
- Include exact temperatures, timing, and visual cues
- Explain cooking techniques (e.g., "heat oil until it shimmers", "sauté until golden brown and fragrant")
- Add tips for knowing when food is ready (e.g., "chicken is done when internal temp is 165°F and juices run clear")
- Guide them through the entire process as if they've never cooked before
- Each recipe should have 6-10 detailed instruction steps minimum

Return ONLY a JSON array with 10 recipes, no other text, in this exact format:
[
  {
    "title": "Very Specific Recipe Name with Cuisine Style",
    "description": "One appetizing sentence description",
    "ingredients": ["2 lbs chicken breast, cut into 1-inch cubes", "3 cups basmati rice", "exact amounts with units and prep notes"],
    "instructions": [
      "Preheat your oven to 375°F (190°C). Place the rack in the middle position. This ensures even cooking throughout the dish.",
      "In a large skillet, heat 2 tablespoons of olive oil over medium-high heat for about 2 minutes until the oil shimmers but doesn't smoke. This is the right temperature for searing.",
      "Add the chicken pieces in a single layer, making sure not to overcrowd the pan. Sear for 3-4 minutes without moving them - you'll know they're ready to flip when they release easily from the pan and have a golden-brown crust.",
      "Very detailed step with exact measurements, temperatures, visual cues, and timing",
      "Continue with specific instructions explaining WHY and HOW to do each step"
    ],
    "prepTime": "25 mins",
    "servings": 4
  }
]

Make sure all 10 recipes are VERY different from each other and instructions are beginner-friendly with lots of detail!`;

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
        ingredients: [...ingredientList.map(i => `1 cup ${i}, cut into bite-sized pieces`), '2 tbsp soy sauce', '1 tbsp sesame oil', '2 cloves garlic, minced', '1 inch fresh ginger, minced'],
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
        servings: 2
      },
      {
        title: `Baked ${mainIngredient} Casserole`,
        description: `Comfort food casserole with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 cups ${i}, chopped`), '1 cup shredded cheese (cheddar or mozzarella)', '1/2 cup heavy cream', '1 tsp dried herbs (thyme or rosemary)', 'Salt and pepper to taste', 'Cooking spray'],
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
        servings: 4
      },
      {
        title: `Hearty ${mainIngredient} Soup`,
        description: `Warming soup with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `1 cup ${i}, diced`), '4 cups chicken or vegetable broth', '1 large onion, finely chopped', '2 cloves garlic, minced', '2 tbsp olive oil', '1 bay leaf', '1 tsp dried thyme', 'Salt and pepper to taste', 'Fresh parsley for garnish'],
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
        servings: 4
      },
      {
        title: `Grilled ${mainIngredient} Skewers`,
        description: `BBQ-style grilled ${ingredients}`,
        ingredients: [...ingredientList.map(i => `1.5 lbs ${i}`), 'BBQ marinade', 'Skewers', 'Olive oil'],
        instructions: ['Marinate 1 hour', 'Thread onto skewers', 'Grill 6-8 minutes', 'Turn and cook until done'],
        prepTime: '20 mins',
        servings: 4
      },
      {
        title: `Mediterranean ${mainIngredient} Salad`,
        description: `Fresh salad featuring ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 cups ${i}`), 'Lettuce', 'Feta cheese', 'Olives', 'Lemon dressing'],
        instructions: ['Chop all ingredients', 'Toss in large bowl', 'Add dressing', 'Top with feta and serve'],
        prepTime: '15 mins',
        servings: 3
      },
      {
        title: `${mainIngredient} Pasta Primavera`,
        description: `Italian pasta with ${ingredients}`,
        ingredients: ['1 lb pasta', ...ingredientList.map(i => `1 cup ${i}`), 'Parmesan', 'Olive oil', 'Garlic'],
        instructions: ['Boil pasta al dente', 'Sauté vegetables', 'Combine with pasta', 'Top with parmesan'],
        prepTime: '25 mins',
        servings: 4
      },
      {
        title: `Indian ${mainIngredient} Curry`,
        description: `Spicy curry with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 cups ${i}`), 'Curry paste', 'Coconut milk', 'Rice', 'Spices'],
        instructions: ['Toast spices', 'Add curry paste and coconut milk', 'Simmer ingredients 20 mins', 'Serve over rice'],
        prepTime: '40 mins',
        servings: 4
      },
      {
        title: `Mexican ${mainIngredient} Tacos`,
        description: `Street-style tacos with ${ingredients}`,
        ingredients: [...ingredientList.map(i => `1 lb ${i}`), 'Tortillas', 'Salsa', 'Cilantro', 'Lime'],
        instructions: ['Season and cook filling', 'Warm tortillas', 'Assemble tacos', 'Top with salsa and cilantro'],
        prepTime: '20 mins',
        servings: 4
      },
      {
        title: `Asian ${mainIngredient} Rice Bowl`,
        description: `Healthy bowl with ${ingredients}`,
        ingredients: ['2 cups rice', ...ingredientList.map(i => `1 cup ${i}`), 'Soy sauce', 'Sesame seeds', 'Vegetables'],
        instructions: ['Cook rice', 'Prepare toppings', 'Layer in bowl', 'Drizzle with sauce and seeds'],
        prepTime: '30 mins',
        servings: 2
      },
      {
        title: `${mainIngredient} Flatbread Pizza`,
        description: `Gourmet flatbread with ${ingredients}`,
        ingredients: ['2 flatbreads', ...ingredientList.map(i => `1/2 cup ${i}`), 'Mozzarella', 'Olive oil', 'Herbs'],
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
        ingredients: [...ingredientList.map(i => `1 taza de ${i}`), '2 cdas salsa de soya', '1 cda aceite de sésamo', 'Ajo, jengibre'],
        instructions: ['Calentar wok a fuego alto', `Saltear ${mainIngredient} 3-4 minutos`, 'Agregar vegetales y salsa', 'Revolver 2 minutos y servir'],
        prepTime: '15 min',
        servings: 2
      },
      {
        title: `Cazuela de ${mainIngredient} al Horno`,
        description: `Cazuela reconfortante con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 tazas de ${i}`), '1 taza de queso', '1/2 taza de crema', 'Hierbas'],
        instructions: ['Precalentar horno a 190°C', 'Capas de ingredientes en molde', 'Añadir crema y queso', 'Hornear 35 minutos'],
        prepTime: '45 min',
        servings: 4
      },
      {
        title: `Sopa Abundante de ${mainIngredient}`,
        description: `Sopa reconfortante con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `1 taza de ${i}`), '4 tazas de caldo', '1 cebolla', 'Condimentos'],
        instructions: ['Sofreír cebolla', 'Añadir ingredientes y caldo', 'Cocinar a fuego lento 20 minutos', 'Condimentar y servir'],
        prepTime: '30 min',
        servings: 4
      },
      {
        title: `Brochetas de ${mainIngredient} a la Parrilla`,
        description: `Brochetas estilo BBQ con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `700g de ${i}`), 'Marinada BBQ', 'Palitos', 'Aceite de oliva'],
        instructions: ['Marinar 1 hora', 'Ensartar en palitos', 'Asar 6-8 minutos', 'Voltear y cocinar hasta listo'],
        prepTime: '20 min',
        servings: 4
      },
      {
        title: `Ensalada Mediterránea de ${mainIngredient}`,
        description: `Ensalada fresca con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 tazas de ${i}`), 'Lechuga', 'Queso feta', 'Aceitunas', 'Aderezo de limón'],
        instructions: ['Picar todos los ingredientes', 'Mezclar en tazón grande', 'Añadir aderezo', 'Cubrir con feta y servir'],
        prepTime: '15 min',
        servings: 3
      },
      {
        title: `Pasta Primavera con ${mainIngredient}`,
        description: `Pasta italiana con ${ingredients}`,
        ingredients: ['500g de pasta', ...ingredientList.map(i => `1 taza de ${i}`), 'Parmesano', 'Aceite de oliva', 'Ajo'],
        instructions: ['Hervir pasta al dente', 'Saltear vegetales', 'Combinar con pasta', 'Cubrir con parmesano'],
        prepTime: '25 min',
        servings: 4
      },
      {
        title: `Curry Indio de ${mainIngredient}`,
        description: `Curry picante con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 tazas de ${i}`), 'Pasta de curry', 'Leche de coco', 'Arroz', 'Especias'],
        instructions: ['Tostar especias', 'Añadir pasta de curry y leche de coco', 'Cocinar ingredientes 20 min', 'Servir sobre arroz'],
        prepTime: '40 min',
        servings: 4
      },
      {
        title: `Tacos Mexicanos de ${mainIngredient}`,
        description: `Tacos estilo callejero con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `500g de ${i}`), 'Tortillas', 'Salsa', 'Cilantro', 'Limón'],
        instructions: ['Condimentar y cocinar el relleno', 'Calentar tortillas', 'Armar tacos', 'Cubrir con salsa y cilantro'],
        prepTime: '20 min',
        servings: 4
      },
      {
        title: `Bowl Asiático de ${mainIngredient} con Arroz`,
        description: `Bowl saludable con ${ingredients}`,
        ingredients: ['2 tazas de arroz', ...ingredientList.map(i => `1 taza de ${i}`), 'Salsa de soya', 'Semillas de sésamo', 'Vegetales'],
        instructions: ['Cocinar arroz', 'Preparar ingredientes', 'Colocar en capas en bowl', 'Rociar con salsa y semillas'],
        prepTime: '30 min',
        servings: 2
      },
      {
        title: `Pizza Flatbread de ${mainIngredient}`,
        description: `Flatbread gourmet con ${ingredients}`,
        ingredients: ['2 flatbreads', ...ingredientList.map(i => `1/2 taza de ${i}`), 'Mozzarella', 'Aceite de oliva', 'Hierbas'],
        instructions: ['Precalentar horno a 220°C', 'Cubrir flatbreads', 'Hornear 12-15 minutos', 'Cortar y servir caliente'],
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
        ingredients: [...ingredientList.map(i => `1 tasse de ${i}`), '2 c. à soupe de sauce soja', '1 c. à soupe d\'huile de sésame', 'Ail, gingembre'],
        instructions: ['Chauffer le wok à feu vif', `Faire sauter ${mainIngredient} 3-4 minutes`, 'Ajouter légumes et sauce', 'Mélanger 2 minutes et servir'],
        prepTime: '15 min',
        servings: 2
      },
      {
        title: `Casserole de ${mainIngredient} au Four`,
        description: `Casserole réconfortante avec ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 tasses de ${i}`), '1 tasse de fromage', '1/2 tasse de crème', 'Herbes'],
        instructions: ['Préchauffer le four à 190°C', 'Disposer les ingrédients en couches', 'Ajouter crème et fromage', 'Cuire 35 minutes'],
        prepTime: '45 min',
        servings: 4
      },
      {
        title: `Soupe Copieuse de ${mainIngredient}`,
        description: `Soupe réconfortante avec ${ingredients}`,
        ingredients: [...ingredientList.map(i => `1 tasse de ${i}`), '4 tasses de bouillon', '1 oignon', 'Assaisonnements'],
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
        ingredients: [...ingredientList.map(i => `2 tasses de ${i}`), 'Laitue', 'Fromage feta', 'Olives', 'Vinaigrette au citron'],
        instructions: ['Hacher tous les ingrédients', 'Mélanger dans un grand bol', 'Ajouter la vinaigrette', 'Garnir de feta et servir'],
        prepTime: '15 min',
        servings: 3
      },
      {
        title: `Pâtes Primavera au ${mainIngredient}`,
        description: `Pâtes italiennes avec ${ingredients}`,
        ingredients: ['500g de pâtes', ...ingredientList.map(i => `1 tasse de ${i}`), 'Parmesan', 'Huile d\'olive', 'Ail'],
        instructions: ['Cuire les pâtes al dente', 'Faire revenir les légumes', 'Mélanger avec les pâtes', 'Garnir de parmesan'],
        prepTime: '25 min',
        servings: 4
      },
      {
        title: `Curry Indien au ${mainIngredient}`,
        description: `Curry épicé avec ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 tasses de ${i}`), 'Pâte de curry', 'Lait de coco', 'Riz', 'Épices'],
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
        ingredients: ['2 tasses de riz', ...ingredientList.map(i => `1 tasse de ${i}`), 'Sauce soja', 'Graines de sésame', 'Légumes'],
        instructions: ['Cuire le riz', 'Préparer les garnitures', 'Disposer en couches', 'Arroser de sauce et graines'],
        prepTime: '30 min',
        servings: 2
      },
      {
        title: `Pizza Flatbread au ${mainIngredient}`,
        description: `Flatbread gourmet avec ${ingredients}`,
        ingredients: ['2 flatbreads', ...ingredientList.map(i => `1/2 tasse de ${i}`), 'Mozzarella', 'Huile d\'olive', 'Herbes'],
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
        ingredients: [...ingredientList.map(i => `1 Tasse ${i}`), '2 EL Sojasoße', '1 EL Sesamöl', 'Knoblauch, Ingwer'],
        instructions: ['Wok stark erhitzen', `${mainIngredient} 3-4 Minuten anbraten`, 'Gemüse und Soße hinzufügen', '2 Minuten schwenken und servieren'],
        prepTime: '15 Min',
        servings: 2
      },
      {
        title: `${mainIngredient} Auflauf`,
        description: `Herzhafter Auflauf mit ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 Tassen ${i}`), '1 Tasse Käse', '1/2 Tasse Sahne', 'Kräuter'],
        instructions: ['Ofen auf 190°C vorheizen', 'Zutaten schichten', 'Sahne und Käse hinzufügen', '35 Minuten backen'],
        prepTime: '45 Min',
        servings: 4
      },
      {
        title: `Herzhafte ${mainIngredient} Suppe`,
        description: `Wärmende Suppe mit ${ingredients}`,
        ingredients: [...ingredientList.map(i => `1 Tasse ${i}`), '4 Tassen Brühe', '1 Zwiebel', 'Gewürze'],
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
        ingredients: [...ingredientList.map(i => `2 Tassen ${i}`), 'Salat', 'Feta-Käse', 'Oliven', 'Zitronen-Dressing'],
        instructions: ['Alle Zutaten hacken', 'In großer Schüssel mischen', 'Dressing hinzufügen', 'Mit Feta garnieren'],
        prepTime: '15 Min',
        servings: 3
      },
      {
        title: `${mainIngredient} Pasta Primavera`,
        description: `Italienische Pasta mit ${ingredients}`,
        ingredients: ['500g Pasta', ...ingredientList.map(i => `1 Tasse ${i}`), 'Parmesan', 'Olivenöl', 'Knoblauch'],
        instructions: ['Pasta al dente kochen', 'Gemüse anbraten', 'Mit Pasta vermengen', 'Mit Parmesan bestreuen'],
        prepTime: '25 Min',
        servings: 4
      },
      {
        title: `Indisches ${mainIngredient} Curry`,
        description: `Würziges Curry mit ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 Tassen ${i}`), 'Currypaste', 'Kokosmilch', 'Reis', 'Gewürze'],
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
        ingredients: ['2 Tassen Reis', ...ingredientList.map(i => `1 Tasse ${i}`), 'Sojasoße', 'Sesam', 'Gemüse'],
        instructions: ['Reis kochen', 'Toppings vorbereiten', 'In Schale schichten', 'Mit Soße und Sesam beträufeln'],
        prepTime: '30 Min',
        servings: 2
      },
      {
        title: `${mainIngredient} Flatbread Pizza`,
        description: `Gourmet-Flatbread mit ${ingredients}`,
        ingredients: ['2 Flatbreads', ...ingredientList.map(i => `1/2 Tasse ${i}`), 'Mozzarella', 'Olivenöl', 'Kräuter'],
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
        ingredients: [...ingredientList.map(i => `1 tazza di ${i}`), '2 cucchiai di salsa di soia', '1 cucchiaio di olio di sesamo', 'Aglio, zenzero'],
        instructions: ['Scaldare il wok a fuoco alto', `Saltare ${mainIngredient} 3-4 minuti`, 'Aggiungere verdure e salsa', 'Mescolare 2 minuti e servire'],
        prepTime: '15 min',
        servings: 2
      },
      {
        title: `Casseruola di ${mainIngredient} al Forno`,
        description: `Casseruola confortante con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 tazze di ${i}`), '1 tazza di formaggio', '1/2 tazza di panna', 'Erbe'],
        instructions: ['Preriscaldare il forno a 190°C', 'Disporre gli ingredienti a strati', 'Aggiungere panna e formaggio', 'Cuocere 35 minuti'],
        prepTime: '45 min',
        servings: 4
      },
      {
        title: `Zuppa Abbondante di ${mainIngredient}`,
        description: `Zuppa calda con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `1 tazza di ${i}`), '4 tazze di brodo', '1 cipolla', 'Condimenti'],
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
        ingredients: [...ingredientList.map(i => `2 tazze di ${i}`), 'Lattuga', 'Formaggio feta', 'Olive', 'Condimento al limone'],
        instructions: ['Tritare tutti gli ingredienti', 'Mescolare in una ciotola grande', 'Aggiungere il condimento', 'Guarnire con feta e servire'],
        prepTime: '15 min',
        servings: 3
      },
      {
        title: `Pasta Primavera con ${mainIngredient}`,
        description: `Pasta italiana con ${ingredients}`,
        ingredients: ['500g di pasta', ...ingredientList.map(i => `1 tazza di ${i}`), 'Parmigiano', 'Olio d\'oliva', 'Aglio'],
        instructions: ['Cuocere la pasta al dente', 'Saltare le verdure', 'Unire alla pasta', 'Guarnire con parmigiano'],
        prepTime: '25 min',
        servings: 4
      },
      {
        title: `Curry Indiano di ${mainIngredient}`,
        description: `Curry piccante con ${ingredients}`,
        ingredients: [...ingredientList.map(i => `2 tazze di ${i}`), 'Pasta di curry', 'Latte di cocco', 'Riso', 'Spezie'],
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
        ingredients: ['2 tazze di riso', ...ingredientList.map(i => `1 tazza di ${i}`), 'Salsa di soia', 'Semi di sesamo', 'Verdure'],
        instructions: ['Cuocere il riso', 'Preparare i condimenti', 'Disporre a strati nella bowl', 'Condire con salsa e semi'],
        prepTime: '30 min',
        servings: 2
      },
      {
        title: `Pizza Flatbread con ${mainIngredient}`,
        description: `Flatbread gourmet con ${ingredients}`,
        ingredients: ['2 flatbreads', ...ingredientList.map(i => `1/2 tazza di ${i}`), 'Mozzarella', 'Olio d\'oliva', 'Erbe'],
        instructions: ['Preriscaldare il forno a 220°C', 'Condire i flatbreads', 'Cuocere 12-15 minuti', 'Tagliare e servire caldo'],
        prepTime: '25 min',
        servings: 2
      }
    ];
  }
}
