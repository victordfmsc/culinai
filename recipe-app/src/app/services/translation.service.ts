import { Injectable, signal } from '@angular/core';

type Language = 'en' | 'es' | 'fr' | 'de' | 'it';

interface Translations {
  [key: string]: { [lang in Language]: string };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLanguage = signal<Language>('en');

  private translations: Translations = {
    app_title: { en: 'Recipe Manager', es: 'Administrador de Recetas', fr: 'Gestionnaire de Recettes', de: 'Rezeptverwaltung', it: 'Gestore di Ricette' },
    points: { en: 'Points', es: 'Puntos', fr: 'Points', de: 'Punkte', it: 'Punti' },
    level: { en: 'Level', es: 'Nivel', fr: 'Niveau', de: 'Level', it: 'Livello' },
    logout: { en: 'Logout', es: 'Cerrar sesión', fr: 'Déconnexion', de: 'Abmelden', it: 'Esci' },
    nav_home: { en: 'Home', es: 'Inicio', fr: 'Accueil', de: 'Startseite', it: 'Home' },
    nav_fridge: { en: 'Fridge', es: 'Nevera', fr: 'Frigo', de: 'Kühlschrank', it: 'Frigo' },
    nav_recipes: { en: 'Recipes', es: 'Recetas', fr: 'Recettes', de: 'Rezepte', it: 'Ricette' },
    nav_shopping: { en: 'Shopping', es: 'Compras', fr: 'Courses', de: 'Einkaufen', it: 'Spesa' },
    nav_profile: { en: 'Profile', es: 'Perfil', fr: 'Profil', de: 'Profil', it: 'Profilo' },
    login_welcome: { en: 'Welcome!', es: '¡Bienvenido!', fr: 'Bienvenue!', de: 'Willkommen!', it: 'Benvenuto!' },
    login_prompt: { en: 'Sign in to manage your recipes', es: 'Inicia sesión para gestionar tus recetas', fr: 'Connectez-vous pour gérer vos recettes', de: 'Melden Sie sich an, um Ihre Rezepte zu verwalten', it: 'Accedi per gestire le tue ricette' },
    login_with_google: { en: 'Sign in with Google', es: 'Iniciar sesión con Google', fr: 'Se connecter avec Google', de: 'Mit Google anmelden', it: 'Accedi con Google' },
    login_email_continue: { en: 'Or continue with email', es: 'O continuar con correo', fr: 'Ou continuer avec email', de: 'Oder mit E-Mail fortfahren', it: 'O continua con email' },
    login_email_placeholder: { en: 'Email', es: 'Correo', fr: 'Email', de: 'E-Mail', it: 'Email' },
    login_password_placeholder: { en: 'Password', es: 'Contraseña', fr: 'Mot de passe', de: 'Passwort', it: 'Password' },
    login_signin_button: { en: 'Sign In', es: 'Iniciar sesión', fr: 'Se connecter', de: 'Anmelden', it: 'Accedi' },
    login_signup_button: { en: 'Sign Up', es: 'Registrarse', fr: "S'inscrire", de: 'Registrieren', it: 'Registrati' },
    login_skip: { en: 'Skip login and try the app', es: 'Saltar login y probar la app', fr: "Ignorer la connexion et essayer l'app", de: 'Anmeldung überspringen und App ausprobieren', it: 'Salta il login e prova l\'app' },
    cancel: { en: 'Cancel', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen', it: 'Annulla' },
    cooked_button: { en: 'I Cooked This!', es: '¡Lo cociné!', fr: "J'ai cuisiné ça!", de: 'Ich habe das gekocht!', it: 'L\'ho cucinato!' },
    modal_plan_recipe_title: { en: 'Plan Recipe', es: 'Planificar Receta', fr: 'Planifier la recette', de: 'Rezept planen', it: 'Pianifica Ricetta' },
    modal_plan_recipe_prompt: { en: 'Select a day for {title}', es: 'Selecciona un día para {title}', fr: 'Sélectionnez un jour pour {title}', de: 'Wählen Sie einen Tag für {title}', it: 'Seleziona un giorno per {title}' },
    modal_select_recipe_title: { en: 'Select Recipe for {day}', es: 'Seleccionar Receta para {day}', fr: 'Sélectionner une recette pour {day}', de: 'Rezept auswählen für {day}', it: 'Seleziona Ricetta per {day}' },
    modal_select_recipe_prompt: { en: 'Choose a recipe:', es: 'Elige una receta:', fr: 'Choisissez une recette:', de: 'Wählen Sie ein Rezept:', it: 'Scegli una ricetta:' },
    modal_select_recipe_empty: { en: 'No recipes available', es: 'No hay recetas disponibles', fr: 'Aucune recette disponible', de: 'Keine Rezepte verfügbar', it: 'Nessuna ricetta disponibile' },
    modal_select_recipe_empty_cta: { en: 'Find recipes from your fridge first!', es: '¡Busca recetas desde tu nevera primero!', fr: "Trouvez d'abord des recettes à partir de votre frigo!", de: 'Finden Sie zuerst Rezepte aus Ihrem Kühlschrank!', it: 'Trova prima ricette dal tuo frigo!' },
    suggestions_ingredients_title: { en: 'Ingredients', es: 'Ingredientes', fr: 'Ingrédients', de: 'Zutaten', it: 'Ingredienti' },
    suggestions_instructions_title: { en: 'Instructions', es: 'Instrucciones', fr: 'Instructions', de: 'Anweisungen', it: 'Istruzioni' },
    day_monday: { en: 'Mon', es: 'Lun', fr: 'Lun', de: 'Mo', it: 'Lun' },
    day_tuesday: { en: 'Tue', es: 'Mar', fr: 'Mar', de: 'Di', it: 'Mar' },
    day_wednesday: { en: 'Wed', es: 'Mié', fr: 'Mer', de: 'Mi', it: 'Mer' },
    day_thursday: { en: 'Thu', es: 'Jue', fr: 'Jeu', de: 'Do', it: 'Gio' },
    day_friday: { en: 'Fri', es: 'Vie', fr: 'Ven', de: 'Fr', it: 'Ven' },
    day_saturday: { en: 'Sat', es: 'Sáb', fr: 'Sam', de: 'Sa', it: 'Sab' },
    day_sunday: { en: 'Sun', es: 'Dom', fr: 'Dim', de: 'So', it: 'Dom' },
    
    // Shopping List
    shopping_title: { en: 'Shopping List', es: 'Lista de Compras', fr: 'Liste de Courses', de: 'Einkaufsliste', it: 'Lista della Spesa' },
    shopping_empty: { en: 'Your shopping list is empty', es: 'Tu lista de compras está vacía', fr: 'Votre liste de courses est vide', de: 'Ihre Einkaufsliste ist leer', it: 'La tua lista della spesa è vuota' },
    shopping_clear: { en: 'Clear Checked Items', es: 'Eliminar Marcados', fr: 'Effacer les éléments cochés', de: 'Markierte löschen', it: 'Cancella Selezionati' },
    
    // Home
    home_meal_plan: { en: 'Weekly Meal Plan', es: 'Plan Semanal de Comidas', fr: 'Plan de Repas Hebdomadaire', de: 'Wöchentlicher Essensplan', it: 'Piano Pasti Settimanale' },
    home_no_meals: { en: 'No meals planned', es: 'Sin comidas planeadas', fr: 'Aucun repas prévu', de: 'Keine Mahlzeiten geplant', it: 'Nessun pasto pianificato' },
    
    // Fridge
    fridge_question: { en: 'What ingredients do you have?', es: '¿Qué ingredientes tienes?', fr: 'Quels ingrédients avez-vous?', de: 'Welche Zutaten haben Sie?', it: 'Quali ingredienti hai?' },
    fridge_placeholder: { en: 'e.g., chicken, tomatoes, onions, garlic...', es: 'ej., pollo, tomates, cebollas, ajo...', fr: 'ex., poulet, tomates, oignons, ail...', de: 'z.B. Hühnchen, Tomaten, Zwiebeln, Knoblauch...', it: 'es., pollo, pomodori, cipolle, aglio...' },
    fridge_find: { en: 'Find Recipes', es: 'Buscar Recetas', fr: 'Trouver des Recettes', de: 'Rezepte finden', it: 'Trova Ricette' },
    fridge_common: { en: 'Common Ingredients', es: 'Ingredientes Comunes', fr: 'Ingrédients Courants', de: 'Häufige Zutaten', it: 'Ingredienti Comuni' },
    
    // Suggestions
    suggestions_title: { en: 'Recipe Suggestions', es: 'Sugerencias de Recetas', fr: 'Suggestions de Recettes', de: 'Rezeptvorschläge', it: 'Suggerimenti Ricette' },
    suggestions_empty: { en: 'No recipes yet. Go to your Fridge to find recipes!', es: '¡Aún no hay recetas. Ve a tu Nevera para buscar recetas!', fr: 'Pas encore de recettes. Allez à votre Frigo pour trouver des recettes!', de: 'Noch keine Rezepte. Gehen Sie zu Ihrem Kühlschrank, um Rezepte zu finden!', it: 'Ancora nessuna ricetta. Vai al tuo Frigo per trovare ricette!' },
    suggestions_servings: { en: 'servings', es: 'porciones', fr: 'portions', de: 'Portionen', it: 'porzioni' },
    suggestions_cook: { en: 'Cook Now', es: 'Cocinar Ahora', fr: 'Cuisiner Maintenant', de: 'Jetzt Kochen', it: 'Cucina Ora' },
    suggestions_plan: { en: 'Plan for Later', es: 'Planificar', fr: 'Planifier', de: 'Planen', it: 'Pianifica' },
    suggestions_add_shopping: { en: 'Add to Shopping List', es: 'Agregar a Compras', fr: 'Ajouter à la Liste', de: 'Zur Einkaufsliste', it: 'Aggiungi alla Spesa' },
    
    // Recipe Details
    recipe_time: { en: 'Time', es: 'Tiempo', fr: 'Temps', de: 'Zeit', it: 'Tempo' },
    recipe_servings: { en: 'Servings', es: 'Porciones', fr: 'Portions', de: 'Portionen', it: 'Porzioni' },
    recipe_start_cooking: { en: 'Start Cooking', es: 'Empezar a Cocinar', fr: 'Commencer à Cuisiner', de: 'Mit Kochen beginnen', it: 'Inizia a Cucinare' }
  };

  translate(key: string, params?: Record<string, any>): string {
    const lang = this.currentLanguage();
    let translation = this.translations[key]?.[lang] || key;
    
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }
    
    return translation;
  }

  setLanguage(lang: Language) {
    this.currentLanguage.set(lang);
  }
}
