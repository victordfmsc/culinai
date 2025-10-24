import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AutoTranslateService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;
  private apiKey: string = environment.googleTranslateApiKey;
  private cache: TranslationCache = {};
  private readonly CACHE_KEY = 'translation_cache';
  private readonly API_URL = 'https://translation.googleapis.com/language/translate/v2';

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadCache();
    }
    console.log('AutoTranslate Service initialized with API key:', this.apiKey ? '✓' : '✗');
  }

  /**
   * Translate a single text from source language to target language
   */
  async translate(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    // Return original if same language
    if (sourceLang === targetLang) {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}|${sourceLang}`;
    if (this.cache[cacheKey]?.[ targetLang]) {
      return this.cache[cacheKey][targetLang];
    }

    // If no API key, return original text
    if (!this.apiKey || this.apiKey === 'placeholder-will-be-replaced') {
      console.warn('Google Translate API key not configured');
      return text;
    }

    try {
      const url = `${this.API_URL}?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data.data.translations[0].translatedText;

      // Cache the result
      if (!this.cache[cacheKey]) {
        this.cache[cacheKey] = {};
      }
      this.cache[cacheKey][targetLang] = translatedText;
      this.saveCache();

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  }

  /**
   * Translate multiple texts in batch (more efficient)
   */
  async translateBatch(texts: string[], targetLang: string, sourceLang: string = 'en'): Promise<string[]> {
    // Return originals if same language
    if (sourceLang === targetLang) {
      return texts;
    }

    // Check which texts need translation
    const needsTranslation: { index: number; text: string }[] = [];
    const results: string[] = new Array(texts.length);

    texts.forEach((text, index) => {
      const cacheKey = `${text}|${sourceLang}`;
      if (this.cache[cacheKey]?.[targetLang]) {
        results[index] = this.cache[cacheKey][targetLang];
      } else {
        needsTranslation.push({ index, text });
      }
    });

    // If everything is cached, return immediately
    if (needsTranslation.length === 0) {
      return results;
    }

    // If no API key, return original texts
    if (!this.apiKey || this.apiKey === 'placeholder-will-be-replaced') {
      console.warn('Google Translate API key not configured');
      needsTranslation.forEach(({ index, text }) => {
        results[index] = text;
      });
      return results;
    }

    try {
      const url = `${this.API_URL}?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: needsTranslation.map(item => item.text),
          source: sourceLang,
          target: targetLang,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      const translations = data.data.translations;

      // Store translations and update cache
      needsTranslation.forEach(({ index, text }, i) => {
        const translatedText = translations[i].translatedText;
        results[index] = translatedText;

        const cacheKey = `${text}|${sourceLang}`;
        if (!this.cache[cacheKey]) {
          this.cache[cacheKey] = {};
        }
        this.cache[cacheKey][targetLang] = translatedText;
      });

      this.saveCache();
      return results;
    } catch (error: any) {
      console.error('Batch translation error:', error);
      console.error('Error details:', error.message, error.stack);
      // Fallback to original texts for failed translations
      needsTranslation.forEach(({ index, text }) => {
        results[index] = text;
      });
      return results;
    }
  }

  /**
   * Detect language of a text
   */
  async detectLanguage(text: string): Promise<string> {
    if (!this.apiKey || this.apiKey === 'placeholder-will-be-replaced') {
      return 'en'; // Default fallback
    }

    try {
      const url = `https://translation.googleapis.com/language/translate/v2/detect?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text
        })
      });

      if (!response.ok) {
        throw new Error(`Detection API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.detections[0][0].language;
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Fallback
    }
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache = {};
    if (this.isBrowser) {
      localStorage.removeItem(this.CACHE_KEY);
    }
    console.log('Translation cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { entries: number; size: string } {
    const entries = Object.keys(this.cache).length;
    const size = new Blob([JSON.stringify(this.cache)]).size;
    return {
      entries,
      size: `${(size / 1024).toFixed(2)} KB`
    };
  }

  private loadCache(): void {
    if (!this.isBrowser) {
      return;
    }
    
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        this.cache = JSON.parse(cached);
        console.log('Translation cache loaded:', this.getCacheStats());
      }
    } catch (error) {
      console.error('Failed to load translation cache:', error);
      this.cache = {};
    }
  }

  private saveCache(): void {
    if (!this.isBrowser) {
      return;
    }
    
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Failed to save translation cache:', error);
    }
  }
}
