import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';

export interface TranslationCache {
  [key: string]: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  size: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutoTranslateService {
  private platformId = inject(PLATFORM_ID);
  private logger = inject(LoggerService);
  private isBrowser: boolean;
  private apiKey: string = environment.googleTranslateApiKey;
  private cache: TranslationCache = {};
  private readonly CACHE_KEY = 'translation_cache';
  private readonly API_URL = 'https://translation.googleapis.com/language/translate/v2';
  
  // Cache statistics for monitoring
  private cacheHits = 0;
  private cacheMisses = 0;
  
  // Throttle cache saves to avoid repeated localStorage writes
  private saveCacheTimeout: any = null;
  private readonly SAVE_DEBOUNCE_MS = 500;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadCache();
    }
    this.logger.info('AutoTranslateService', 'Service initialized', {
      hasApiKey: !!this.apiKey,
      cacheEntries: Object.keys(this.cache).length,
      platform: this.isBrowser ? 'browser' : 'server'
    });
  }

  /**
   * Translate a single text from source language to target language
   */
  async translate(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    // Return original if same language
    if (sourceLang === targetLang) {
      return text;
    }

    // Normalize and create cache key
    const cacheKey = this.getCacheKey(text, sourceLang, targetLang);
    
    // Check cache first
    if (this.cache[cacheKey]) {
      this.cacheHits++;
      this.logger.debug('AutoTranslateService', 'Cache hit', {
        text: text.substring(0, 50),
        targetLang,
        cacheKey
      });
      return this.cache[cacheKey];
    }

    this.cacheMisses++;

    // If no API key, return original text
    if (!this.apiKey || this.apiKey === 'placeholder-will-be-replaced') {
      this.logger.warn('AutoTranslateService', 'API key not configured', { targetLang });
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
      this.cache[cacheKey] = translatedText;
      this.debouncedSaveCache();

      this.logger.debug('AutoTranslateService', 'Translation cached', {
        text: text.substring(0, 50),
        targetLang,
        translated: translatedText.substring(0, 50)
      });

      return translatedText;
    } catch (error: any) {
      this.logger.error('AutoTranslateService', 'Translation failed', error, {
        text: text.substring(0, 50),
        targetLang,
        sourceLang,
        errorStatus: error.message
      });
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
    let cachedCount = 0;

    texts.forEach((text, index) => {
      const cacheKey = this.getCacheKey(text, sourceLang, targetLang);
      if (this.cache[cacheKey]) {
        results[index] = this.cache[cacheKey];
        cachedCount++;
      } else {
        needsTranslation.push({ index, text });
      }
    });

    this.cacheHits += cachedCount;
    this.cacheMisses += needsTranslation.length;

    // If everything is cached, return immediately
    if (needsTranslation.length === 0) {
      this.logger.debug('AutoTranslateService', 'Batch fully cached', {
        totalTexts: texts.length,
        targetLang
      });
      return results;
    }

    this.logger.info('AutoTranslateService', 'Batch translation started', {
      totalTexts: texts.length,
      cached: cachedCount,
      toTranslate: needsTranslation.length,
      targetLang
    });

    // If no API key, return original texts
    if (!this.apiKey || this.apiKey === 'placeholder-will-be-replaced') {
      this.logger.warn('AutoTranslateService', 'Batch translation skipped: no API key', {
        textsCount: needsTranslation.length
      });
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
        const cacheKey = this.getCacheKey(text, sourceLang, targetLang);
        this.cache[cacheKey] = translatedText;
      });

      this.debouncedSaveCache();
      
      this.logger.info('AutoTranslateService', 'Batch translation completed', {
        translatedCount: needsTranslation.length,
        targetLang
      });
      
      return results;
    } catch (error: any) {
      this.logger.error('AutoTranslateService', 'Batch translation failed', error, {
        textsCount: needsTranslation.length,
        targetLang,
        errorStatus: error.message
      });
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
      this.logger.warn('AutoTranslateService', 'Language detection skipped: no API key');
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
      const detectedLang = data.data.detections[0][0].language;
      
      this.logger.debug('AutoTranslateService', 'Language detected', {
        text: text.substring(0, 50),
        detectedLang
      });
      
      return detectedLang;
    } catch (error: any) {
      this.logger.error('AutoTranslateService', 'Language detection failed', error);
      return 'en'; // Fallback
    }
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    const oldEntries = Object.keys(this.cache).length;
    this.cache = {};
    this.cacheHits = 0;
    this.cacheMisses = 0;
    
    if (this.isBrowser) {
      localStorage.removeItem(this.CACHE_KEY);
    }
    
    this.logger.info('AutoTranslateService', 'Cache cleared', {
      entriesRemoved: oldEntries
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    const entries = Object.keys(this.cache).length;
    const size = new Blob([JSON.stringify(this.cache)]).size;
    const hitRate = this.cacheHits + this.cacheMisses > 0 
      ? (this.cacheHits / (this.cacheHits + this.cacheMisses) * 100).toFixed(1)
      : '0';
    
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      entries,
      size: `${(size / 1024).toFixed(2)} KB (${hitRate}% hit rate)`
    };
  }

  /**
   * Create normalized cache key
   */
  private getCacheKey(text: string, sourceLang: string, targetLang: string): string {
    // Normalize text: trim whitespace, preserve case for proper nouns
    const normalizedText = text.trim();
    return `${normalizedText}|${sourceLang}|${targetLang}`;
  }

  /**
   * Debounced cache save to avoid repeated localStorage writes
   */
  private debouncedSaveCache(): void {
    if (this.saveCacheTimeout) {
      clearTimeout(this.saveCacheTimeout);
    }
    
    this.saveCacheTimeout = setTimeout(() => {
      this.saveCache();
    }, this.SAVE_DEBOUNCE_MS);
  }

  private loadCache(): void {
    if (!this.isBrowser) {
      return;
    }
    
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        this.cache = JSON.parse(cached);
        const stats = this.getCacheStats();
        this.logger.info('AutoTranslateService', 'Cache loaded from localStorage', {
          entries: stats.entries,
          size: stats.size
        });
      }
    } catch (error: any) {
      this.logger.error('AutoTranslateService', 'Failed to load cache', error);
      this.cache = {};
    }
  }

  private saveCache(): void {
    if (!this.isBrowser) {
      return;
    }
    
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
      this.logger.debug('AutoTranslateService', 'Cache saved to localStorage', {
        entries: Object.keys(this.cache).length
      });
    } catch (error: any) {
      this.logger.error('AutoTranslateService', 'Failed to save cache', error);
    }
  }
}
