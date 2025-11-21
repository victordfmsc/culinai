import { Injectable, inject } from '@angular/core';
import { Recipe } from './gemini.service';
import { GeminiService } from './gemini.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ImportPreview {
  recipe: Recipe;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RecipeImportService {
  private geminiService = inject(GeminiService);
  private http = inject(HttpClient);

  async importFromUrl(url: string): Promise<ImportPreview> {
    try {
      const htmlContent = await this.fetchUrlContent(url);
      return await this.parseHtmlToRecipe(htmlContent, url);
    } catch (error) {
      console.error('Error importing from URL:', error);
      throw new Error('No se pudo importar la receta desde esta URL');
    }
  }

  async importFromSocialMedia(url: string): Promise<ImportPreview> {
    const platform = this.detectSocialMediaPlatform(url);
    
    try {
      const content = await this.fetchSocialMediaContent(url, platform);
      return await this.parseSocialMediaToRecipe(content, url, platform);
    } catch (error) {
      console.error('Error importing from social media:', error);
      throw new Error(`No se pudo importar desde ${platform}`);
    }
  }

  async importFromOCR(imageDataUrl: string): Promise<ImportPreview> {
    try {
      const extractedText = await this.performOCR(imageDataUrl);
      return await this.parseOCRToRecipe(extractedText, imageDataUrl);
    } catch (error) {
      console.error('Error performing OCR:', error);
      throw new Error('No se pudo leer el texto de la imagen');
    }
  }

  createManualRecipe(title: string, ingredients: string, instructions: string): Recipe {
    const parsedIngredients = this.parseIngredients(ingredients);
    const parsedInstructions = this.parseInstructions(instructions);
    
    return {
      title: title.trim(),
      description: '',
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      prepTime: '30 min',
      servings: 4,
      sourceType: 'manual',
      createdAt: new Date(),
      tags: []
    };
  }

  async analyzeAndEnhance(recipe: Recipe): Promise<Recipe> {
    const enhanced = await this.addMetadata(recipe);
    return enhanced;
  }

  private async fetchUrlContent(url: string): Promise<string> {
    try {
      const corsProxy = 'https://api.allorigins.win/get?url=';
      const response = await firstValueFrom(
        this.http.get<any>(`${corsProxy}${encodeURIComponent(url)}`)
      );
      return response.contents;
    } catch (error) {
      throw new Error('No se pudo acceder a la URL');
    }
  }

  private async parseHtmlToRecipe(html: string, sourceUrl: string): Promise<ImportPreview> {
    const prompt = `Analiza el siguiente HTML de una receta y extrae SOLO la información de la receta en formato JSON.
IMPORTANTE: Devuelve SOLO el objeto JSON válido, sin texto adicional antes ni después.

HTML:
${html.substring(0, 10000)}

Devuelve un JSON con esta estructura exacta:
{
  "title": "título de la receta",
  "description": "breve descripción",
  "ingredients": ["ingrediente 1 con cantidad", "ingrediente 2 con cantidad"],
  "instructions": ["paso 1", "paso 2"],
  "prepTime": "tiempo en formato '30 min' o '1 hora'",
  "servings": número_de_porciones,
  "imageUrl": "URL de la imagen principal o null",
  "tags": ["tag1", "tag2"]
}`;

    try {
      const result = await this.geminiService.analyzeWithAI(prompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No se pudo extraer JSON válido de la respuesta');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      const recipe: Recipe = {
        title: parsed.title || 'Receta sin título',
        description: parsed.description || '',
        ingredients: parsed.ingredients || [],
        instructions: parsed.instructions || [],
        prepTime: parsed.prepTime || '30 min',
        servings: parsed.servings || 4,
        imageUrl: parsed.imageUrl,
        sourceUrl: sourceUrl,
        sourceType: 'web-scraped',
        tags: parsed.tags || [],
        createdAt: new Date()
      };

      const warnings: string[] = [];
      if (recipe.ingredients.length === 0) warnings.push('No se encontraron ingredientes');
      if (recipe.instructions.length === 0) warnings.push('No se encontraron instrucciones');

      return {
        recipe,
        confidence: warnings.length === 0 ? 'high' : 'medium',
        warnings
      };
    } catch (error) {
      console.error('Error parsing HTML to recipe:', error);
      throw new Error('No se pudo extraer la receta del HTML');
    }
  }

  private detectSocialMediaPlatform(url: string): string {
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('pinterest.com')) return 'Pinterest';
    return 'Unknown';
  }

  private async fetchSocialMediaContent(url: string, platform: string): Promise<string> {
    return `Caption de ${platform}: Contenido simulado`;
  }

  private async parseSocialMediaToRecipe(content: string, sourceUrl: string, platform: string): Promise<ImportPreview> {
    const prompt = `Analiza el siguiente contenido de ${platform} y extrae una receta si existe.
Contenido: ${content}

Devuelve un JSON con esta estructura exacta:
{
  "title": "título de la receta",
  "description": "descripción",
  "ingredients": ["ingrediente 1", "ingrediente 2"],
  "instructions": ["paso 1", "paso 2"],
  "prepTime": "30 min",
  "servings": 4
}`;

    try {
      const result = await this.geminiService.analyzeWithAI(prompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No se pudo extraer receta');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      const recipe: Recipe = {
        ...parsed,
        sourceUrl,
        sourceType: 'social-media' as const,
        createdAt: new Date()
      };

      return {
        recipe,
        confidence: 'medium',
        warnings: ['Las recetas de redes sociales pueden no estar completas']
      };
    } catch (error) {
      throw new Error('No se pudo extraer receta del contenido de redes sociales');
    }
  }

  private async performOCR(imageDataUrl: string): Promise<string> {
    const prompt = `Analiza esta imagen de una receta y extrae TODO el texto visible.
Devuelve el texto en formato plano, preservando la estructura de listas e ingredientes.`;

    try {
      const result = await this.geminiService.analyzeImageWithAI(imageDataUrl, prompt);
      return result;
    } catch (error) {
      throw new Error('Error al analizar la imagen');
    }
  }

  private async parseOCRToRecipe(text: string, imageUrl: string): Promise<ImportPreview> {
    const prompt = `Analiza el siguiente texto extraído de una receta y estructúralo en JSON.
Texto:
${text}

Devuelve un JSON con esta estructura exacta:
{
  "title": "título de la receta",
  "description": "descripción breve",
  "ingredients": ["ingrediente 1 con cantidad", "ingrediente 2 con cantidad"],
  "instructions": ["paso 1", "paso 2"],
  "prepTime": "30 min",
  "servings": 4
}`;

    try {
      const result = await this.geminiService.analyzeWithAI(prompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No se pudo estructurar la receta');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      const recipe: Recipe = {
        ...parsed,
        imageUrl,
        sourceType: 'ocr' as const,
        createdAt: new Date()
      };

      const warnings: string[] = ['El OCR puede contener errores, revisa la receta'];

      return {
        recipe,
        confidence: 'medium',
        warnings
      };
    } catch (error) {
      throw new Error('No se pudo estructurar la receta desde el texto');
    }
  }

  private parseIngredients(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[-•*]\s*/, ''));
  }

  private parseInstructions(text: string): string[] {
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return lines.map((line, index) => {
      const cleanLine = line.replace(/^\d+[\.\)]\s*/, '');
      return cleanLine;
    });
  }

  private async addMetadata(recipe: Recipe): Promise<Recipe> {
    const prompt = `Analiza esta receta y determina:
1. Categoría (breakfast/lunch/dinner/dessert/snack)
2. Tags relevantes (vegano, sin gluten, rápido, etc.)
3. Calorías aproximadas por porción

Receta:
Título: ${recipe.title}
Ingredientes: ${recipe.ingredients.join(', ')}
Instrucciones: ${recipe.instructions.join('. ')}

Devuelve JSON:
{
  "category": "lunch",
  "tags": ["tag1", "tag2"],
  "calories": 350
}`;

    try {
      const result = await this.geminiService.analyzeWithAI(prompt);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const metadata = JSON.parse(jsonMatch[0]);
        return {
          ...recipe,
          category: metadata.category,
          tags: [...(recipe.tags || []), ...(metadata.tags || [])],
          nutrition: {
            ...recipe.nutrition,
            calories: metadata.calories || recipe.nutrition?.calories || 0
          }
        };
      }
    } catch (error) {
      console.error('Error adding metadata:', error);
    }

    return recipe;
  }
}
