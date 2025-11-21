import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeImportService, ImportPreview } from '../../services/recipe-import.service';
import { Recipe } from '../../services/gemini.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

type ImportMode = 'url' | 'manual' | 'ocr' | 'search';

@Component({
  selector: 'app-recipe-import',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './recipe-import.component.html',
  styleUrls: ['./recipe-import.component.css']
})
export class RecipeImportComponent {
  private importService = inject(RecipeImportService);

  @Output() recipeImported = new EventEmitter<Recipe>();
  @Output() close = new EventEmitter<void>();

  currentMode = signal<ImportMode>('url');
  isLoading = signal(false);
  error = signal<string | null>(null);
  preview = signal<ImportPreview | null>(null);

  urlInput = signal('');
  manualTitle = signal('');
  manualIngredients = signal('');
  manualInstructions = signal('');

  searchIngredients = signal('');
  availableRecipes = signal<Recipe[]>([]);

  async importFromUrl() {
    const url = this.urlInput().trim();
    if (!url) {
      this.error.set('Por favor ingresa una URL válida');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const result = await this.importService.importFromUrl(url);
      this.preview.set(result);
    } catch (err: any) {
      this.error.set(err.message || 'Error al importar la receta');
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const imageDataUrl = e.target?.result as string;
      this.isLoading.set(true);
      this.error.set(null);

      try {
        const result = await this.importService.importFromOCR(imageDataUrl);
        this.preview.set(result);
      } catch (err: any) {
        this.error.set(err.message || 'Error al escanear la imagen');
      } finally {
        this.isLoading.set(false);
      }
    };

    reader.readAsDataURL(file);
  }

  createManualRecipe() {
    const title = this.manualTitle().trim();
    const ingredients = this.manualIngredients().trim();
    const instructions = this.manualInstructions().trim();

    if (!title || !ingredients || !instructions) {
      this.error.set('Por favor completa todos los campos obligatorios');
      return;
    }

    const recipe = this.importService.createManualRecipe(title, ingredients, instructions);
    
    this.preview.set({
      recipe,
      confidence: 'high',
      warnings: []
    });
  }

  async saveRecipe() {
    const previewData = this.preview();
    if (!previewData) return;

    this.isLoading.set(true);

    try {
      const enhanced = await this.importService.analyzeAndEnhance(previewData.recipe);
      this.recipeImported.emit(enhanced);
      this.resetForm();
      this.close.emit();
    } catch (err) {
      console.error('Error saving recipe:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  editPreview() {
    this.preview.set(null);
  }

  resetForm() {
    this.urlInput.set('');
    this.manualTitle.set('');
    this.manualIngredients.set('');
    this.manualInstructions.set('');
    this.searchIngredients.set('');
    this.preview.set(null);
    this.error.set(null);
    this.currentMode.set('url');
  }

  closeModal() {
    this.close.emit();
  }

  updateIngredient(index: number, value: string) {
    const p = this.preview();
    if (p) {
      p.recipe.ingredients[index] = value;
      this.preview.set({ ...p });
    }
  }

  updateInstruction(index: number, value: string) {
    const p = this.preview();
    if (p) {
      p.recipe.instructions[index] = value;
      this.preview.set({ ...p });
    }
  }

  removeIngredient(index: number) {
    const p = this.preview();
    if (p) {
      p.recipe.ingredients.splice(index, 1);
      this.preview.set({ ...p });
    }
  }

  removeInstruction(index: number) {
    const p = this.preview();
    if (p) {
      p.recipe.instructions.splice(index, 1);
      this.preview.set({ ...p });
    }
  }

  addIngredient() {
    const p = this.preview();
    if (p) {
      p.recipe.ingredients.push('');
      this.preview.set({ ...p });
    }
  }

  addInstruction() {
    const p = this.preview();
    if (p) {
      p.recipe.instructions.push('');
      this.preview.set({ ...p });
    }
  }
}
