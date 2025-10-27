import { Injectable, signal, inject } from '@angular/core';
import { AutoTranslateService } from './auto-translate.service';

type Language = 'en' | 'es' | 'fr' | 'de' | 'it';

interface Translations {
  [key: string]: { [lang in Language]: string };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLanguage = signal<Language>('en');
  private autoTranslate = inject(AutoTranslateService);

  // Base translations in English - will be auto-translated to other languages
  private baseTranslations: { [key: string]: string } = {
    app_title: 'Recipe Manager',
    points: 'Points',
    level: 'Level',
    logout: 'Logout',
    nav_home: 'Home',
    nav_fridge: 'Fridge',
    nav_recipes: 'Recipes',
    nav_shopping: 'Shopping',
    nav_profile: 'Profile',
    login_welcome: 'Welcome!',
    login_prompt: 'Sign in to manage your recipes',
    login_with_google: 'Sign in with Google',
    login_email_continue: 'Or continue with email',
    login_email_placeholder: 'Email',
    login_password_placeholder: 'Password',
    login_signin_button: 'Sign In',
    login_signup_button: 'Sign Up',
    login_skip: 'Skip login and try the app',
    cancel: 'Cancel',
    cooked_button: 'I Cooked This!',
    modal_plan_recipe_title: 'Plan Recipe',
    modal_plan_recipe_prompt: 'Select a day for {title}',
    modal_select_recipe_title: 'Select Recipe for {day}',
    modal_select_recipe_prompt: 'Choose a recipe:',
    modal_select_recipe_empty: 'No recipes available',
    modal_select_recipe_empty_cta: 'Find recipes from your fridge first!',
    suggestions_ingredients_title: 'Ingredients',
    suggestions_instructions_title: 'Instructions',
    day_monday: 'Mon',
    day_tuesday: 'Tue',
    day_wednesday: 'Wed',
    day_thursday: 'Thu',
    day_friday: 'Fri',
    day_saturday: 'Sat',
    day_sunday: 'Sun',
    shopping_title: 'Shopping List',
    shopping_empty: 'Your shopping list is empty',
    shopping_clear: 'Clear Checked Items',
    home_meal_plan: 'Weekly Meal Plan',
    home_no_meals: 'No meals planned',
    fridge_question: 'What ingredients do you have?',
    fridge_placeholder: 'e.g., chicken, tomatoes, onions, garlic...',
    fridge_find: 'Find Recipes',
    fridge_common: 'Common Ingredients',
    suggestions_title: 'Recipe Suggestions',
    suggestions_empty: 'No recipes yet. Go to your Fridge to find recipes!',
    suggestions_servings: 'servings',
    suggestions_cook: 'Cook Now',
    suggestions_plan: 'Plan for Later',
    suggestions_add_shopping: 'Add to Shopping List',
    recipe_time: 'Time',
    recipe_servings: 'Servings',
    recipe_start_cooking: 'Start Cooking',
    adjust_servings: 'Adjust Servings',
    profile_points: 'Points',
    profile_current_streak: 'Day Streak',
    profile_recipes_cooked: 'Recipes Cooked',
    profile_achievements: 'Achievements',
    profile_meal_plans: 'Meal Plans',
    profile_weekly_challenge: 'Weekly Challenge',
    profile_challenge_completed: 'Challenge Completed!',
    profile_achievements_title: 'Achievements',
    profile_unlocked: 'Unlocked',
    profile_locked: 'Locked',
    level_apprentice: 'Apprentice Chef',
    level_home_cook: 'Home Cook',
    level_professional: 'Professional Chef',
    level_master: 'Master Chef',
    level_legend: 'Culinary Legend',
    achievement_first_step_title: 'First Step',
    achievement_first_step_desc: 'Add your first recipe to the weekly meal plan',
    achievement_smart_shopper_title: 'Smart Shopper',
    achievement_smart_shopper_desc: 'Add 5 ingredients to the shopping list',
    achievement_explorer_title: 'Explorer',
    achievement_explorer_desc: 'Generate 10 recipes with AI',
    achievement_planner_pro_title: 'Planner Pro',
    achievement_planner_pro_desc: 'Complete a full weekly meal plan',
    achievement_multilingual_title: 'Multilingual',
    achievement_multilingual_desc: 'Use the app in 3 different languages',
    achievement_portion_master_title: 'Portion Master',
    achievement_portion_master_desc: 'Adjust portions 20 times',
    achievement_active_cook_title: 'Active Cook',
    achievement_active_cook_desc: 'Cook 25 recipes',
    achievement_streak_master_title: 'Streak Master',
    achievement_streak_master_desc: 'Use the app for 30 consecutive days',
    achievement_collector_title: 'Collector',
    achievement_collector_desc: 'Cook 100 different recipes',
    achievement_premium_chef_title: 'Premium Chef',
    achievement_premium_chef_desc: 'Subscribe to the premium plan',
    challenge_quick_cook_title: 'Quick Cook Master',
    challenge_quick_cook_desc: 'Cook 3 recipes under 30 minutes',
    challenge_meal_planner_title: 'Perfect Planner',
    challenge_meal_planner_desc: 'Complete your weekly meal plan',
    challenge_shopping_efficient_title: 'Efficient Shopper',
    challenge_shopping_efficient_desc: 'Add 10 items to shopping list',
    tag_high_protein: 'High Protein',
    tag_low_calorie: 'Low Calorie',
    tag_low_carb: 'Low Carb',
    tag_vegetarian: 'Vegetarian',
    tag_vegan: 'Vegan',
    tag_gluten_free: 'Gluten Free',
    tag_dairy_free: 'Dairy Free',
    tag_spicy: 'Spicy',
    tag_quick: 'Quick',
    tag_healthy: 'Healthy',
    tag_no_salt: 'No Salt',
    tag_keto: 'Keto',
    nutrition_calories: 'Calories',
    nutrition_protein: 'Protein',
    nutrition_carbs: 'Carbs',
    nutrition_fat: 'Fat',
    nutrition_per_serving: 'per serving',
    notif_ingredient_added: 'Ingredient added',
    notif_recipe_generated: 'Recipe generated',
    notif_recipe_cooked: 'Recipe cooked',
    notif_meal_plan: 'Meal plan updated',
    notif_shopping_item: 'Shopping item added',
    notif_portions: 'Portions adjusted',
    notif_achievement_unlocked: 'Achievement Unlocked!',
    notif_level_up: 'Level Up!',
    notif_streak_active: 'Streak Active!',
    notif_days: 'consecutive days',
    points_short: 'pts',
    onboarding_skip: 'Skip',
    onboarding_language_title: 'Choose Your Language',
    onboarding_language_subtitle: 'Select your preferred language to continue',
    onboarding_welcome_title: 'Welcome to Chef AI!',
    onboarding_welcome_desc: 'Your intelligent cooking assistant that helps you create amazing meals with what you have',
    onboarding_fridge_title: 'Manage Your Fridge',
    onboarding_fridge_desc: 'Add your ingredients and let AI generate personalized recipes instantly',
    onboarding_recipes: 'recipes',
    onboarding_plan_title: 'Plan & Organize',
    onboarding_plan_desc: 'Create weekly meal plans and smart shopping lists automatically',
    onboarding_meal_plan: 'Meal Plan',
    onboarding_shopping: 'Shopping List',
    onboarding_gamification_title: 'Level Up Your Skills',
    onboarding_gamification_desc: 'Unlock achievements, earn points, and track your culinary journey',
    onboarding_gamification_features: 'Points • Achievements • Levels • Streaks',
    onboarding_back: 'Back',
    onboarding_next: 'Next',
    onboarding_start: 'Get Started'
  };

  // Manual fallback translations (used if auto-translate fails)
  private fallbackTranslations: Translations = {
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
    shopping_title: { en: 'Shopping List', es: 'Lista de Compras', fr: 'Liste de Courses', de: 'Einkaufsliste', it: 'Lista della Spesa' },
    shopping_empty: { en: 'Your shopping list is empty', es: 'Tu lista de compras está vacía', fr: 'Votre liste de courses est vide', de: 'Ihre Einkaufsliste ist leer', it: 'La tua lista della spesa è vuota' },
    shopping_clear: { en: 'Clear Checked Items', es: 'Eliminar Marcados', fr: 'Effacer les éléments cochés', de: 'Markierte löschen', it: 'Cancella Selezionati' },
    home_meal_plan: { en: 'Weekly Meal Plan', es: 'Plan Semanal de Comidas', fr: 'Plan de Repas Hebdomadaire', de: 'Wöchentlicher Essensplan', it: 'Piano Pasti Settimanale' },
    home_no_meals: { en: 'No meals planned', es: 'Sin comidas planeadas', fr: 'Aucun repas prévu', de: 'Keine Mahlzeiten geplant', it: 'Nessun pasto pianificato' },
    fridge_question: { en: 'What ingredients do you have?', es: '¿Qué ingredientes tienes?', fr: 'Quels ingrédients avez-vous?', de: 'Welche Zutaten haben Sie?', it: 'Quali ingredienti hai?' },
    fridge_placeholder: { en: 'e.g., chicken, tomatoes, onions, garlic...', es: 'ej., pollo, tomates, cebollas, ajo...', fr: 'ex., poulet, tomates, oignons, ail...', de: 'z.B. Hühnchen, Tomaten, Zwiebeln, Knoblauch...', it: 'es., pollo, pomodori, cipolle, aglio...' },
    fridge_find: { en: 'Find Recipes', es: 'Buscar Recetas', fr: 'Trouver des Recettes', de: 'Rezepte finden', it: 'Trova Ricette' },
    fridge_common: { en: 'Common Ingredients', es: 'Ingredientes Comunes', fr: 'Ingrédients Courants', de: 'Häufige Zutaten', it: 'Ingredienti Comuni' },
    suggestions_title: { en: 'Recipe Suggestions', es: 'Sugerencias de Recetas', fr: 'Suggestions de Recettes', de: 'Rezeptvorschläge', it: 'Suggerimenti Ricette' },
    suggestions_empty: { en: 'No recipes yet. Go to your Fridge to find recipes!', es: '¡Aún no hay recetas. Ve a tu Nevera para buscar recetas!', fr: 'Pas encore de recettes. Allez à votre Frigo pour trouver des recettes!', de: 'Noch keine Rezepte. Gehen Sie zu Ihrem Kühlschrank, um Rezepte zu finden!', it: 'Ancora nessuna ricetta. Vai al tuo Frigo per trovare ricette!' },
    suggestions_servings: { en: 'servings', es: 'porciones', fr: 'portions', de: 'Portionen', it: 'porzioni' },
    suggestions_cook: { en: 'Cook Now', es: 'Cocinar Ahora', fr: 'Cuisiner Maintenant', de: 'Jetzt Kochen', it: 'Cucina Ora' },
    suggestions_plan: { en: 'Plan for Later', es: 'Planificar', fr: 'Planifier', de: 'Planen', it: 'Pianifica' },
    suggestions_add_shopping: { en: 'Add to Shopping List', es: 'Agregar a Compras', fr: 'Ajouter à la Liste', de: 'Zur Einkaufsliste', it: 'Aggiungi alla Spesa' },
    adjust_servings: { en: 'Adjust Servings', es: 'Ajustar Porciones', fr: 'Ajuster les Portions', de: 'Portionen Anpassen', it: 'Regola Porzioni' },
    recipe_time: { en: 'Time', es: 'Tiempo', fr: 'Temps', de: 'Zeit', it: 'Tempo' },
    recipe_servings: { en: 'Servings', es: 'Porciones', fr: 'Portions', de: 'Portionen', it: 'Porzioni' },
    recipe_start_cooking: { en: 'Start Cooking', es: 'Empezar a Cocinar', fr: 'Commencer à Cuisiner', de: 'Mit Kochen beginnen', it: 'Inizia a Cucinare' },
    notif_ingredient_added: { en: 'Ingredient added', es: 'Ingrediente agregado', fr: 'Ingrédient ajouté', de: 'Zutat hinzugefügt', it: 'Ingrediente aggiunto' },
    notif_recipe_generated: { en: 'Recipe generated', es: 'Receta generada', fr: 'Recette générée', de: 'Rezept generiert', it: 'Ricetta generata' },
    notif_recipe_cooked: { en: 'Recipe cooked', es: 'Receta cocinada', fr: 'Recette cuisinée', de: 'Rezept gekocht', it: 'Ricetta cucinata' },
    notif_meal_plan: { en: 'Meal plan updated', es: 'Plan de comidas actualizado', fr: 'Plan de repas mis à jour', de: 'Essensplan aktualisiert', it: 'Piano pasti aggiornato' },
    notif_shopping_item: { en: 'Shopping item added', es: 'Artículo agregado', fr: 'Article ajouté', de: 'Artikel hinzugefügt', it: 'Articolo aggiunto' },
    notif_portions: { en: 'Portions adjusted', es: 'Porciones ajustadas', fr: 'Portions ajustées', de: 'Portionen angepasst', it: 'Porzioni regolate' },
    notif_achievement_unlocked: { en: 'Achievement Unlocked!', es: '¡Logro Desbloqueado!', fr: 'Succès Débloqué!', de: 'Erfolg Freigeschaltet!', it: 'Obiettivo Sbloccato!' },
    notif_level_up: { en: 'Level Up!', es: '¡Subiste de Nivel!', fr: 'Niveau Supérieur!', de: 'Levelaufstieg!', it: 'Livello Superiore!' },
    notif_streak_active: { en: 'Streak Active!', es: '¡Racha Activa!', fr: 'Série Active!', de: 'Streak Aktiv!', it: 'Striscia Attiva!' },
    notif_days: { en: 'consecutive days', es: 'días consecutivos', fr: 'jours consécutifs', de: 'aufeinanderfolgende Tage', it: 'giorni consecutivi' },
    points_short: { en: 'pts', es: 'pts', fr: 'pts', de: 'Pkt', it: 'pt' },
    onboarding_skip: { en: 'Skip', es: 'Saltar', fr: 'Passer', de: 'Überspringen', it: 'Salta' },
    onboarding_language_title: { en: 'Choose Your Language', es: 'Elige tu Idioma', fr: 'Choisissez votre Langue', de: 'Wählen Sie Ihre Sprache', it: 'Scegli la tua Lingua' },
    onboarding_language_subtitle: { en: 'Select your preferred language to continue', es: 'Selecciona tu idioma preferido para continuar', fr: 'Sélectionnez votre langue préférée pour continuer', de: 'Wählen Sie Ihre bevorzugte Sprache, um fortzufahren', it: 'Seleziona la tua lingua preferita per continuare' },
    onboarding_welcome_title: { en: 'Welcome to Chef AI!', es: '¡Bienvenido a Chef AI!', fr: 'Bienvenue à Chef AI!', de: 'Willkommen bei Chef AI!', it: 'Benvenuto in Chef AI!' },
    onboarding_welcome_desc: { en: 'Your intelligent cooking assistant that helps you create amazing meals with what you have', es: 'Tu asistente inteligente de cocina que te ayuda a crear comidas increíbles con lo que tienes', fr: 'Votre assistant de cuisine intelligent qui vous aide à créer des repas incroyables avec ce que vous avez', de: 'Ihr intelligenter Kochassistent, der Ihnen hilft, fantastische Mahlzeiten mit dem zu kreieren, was Sie haben', it: 'Il tuo assistente di cucina intelligente che ti aiuta a creare pasti straordinari con ciò che hai' },
    onboarding_fridge_title: { en: 'Manage Your Fridge', es: 'Gestiona tu Nevera', fr: 'Gérez votre Frigo', de: 'Verwalten Sie Ihren Kühlschrank', it: 'Gestisci il tuo Frigo' },
    onboarding_fridge_desc: { en: 'Add your ingredients and let AI generate personalized recipes instantly', es: 'Agrega tus ingredientes y deja que la IA genere recetas personalizadas al instante', fr: 'Ajoutez vos ingrédients et laissez l\'IA générer des recettes personnalisées instantanément', de: 'Fügen Sie Ihre Zutaten hinzu und lassen Sie die KI sofort personalisierte Rezepte generieren', it: 'Aggiungi i tuoi ingredienti e lascia che l\'IA generi ricette personalizzate all\'istante' },
    onboarding_recipes: { en: 'recipes', es: 'recetas', fr: 'recettes', de: 'Rezepte', it: 'ricette' },
    onboarding_plan_title: { en: 'Plan & Organize', es: 'Planifica y Organiza', fr: 'Planifiez et Organisez', de: 'Planen & Organisieren', it: 'Pianifica e Organizza' },
    onboarding_plan_desc: { en: 'Create weekly meal plans and smart shopping lists automatically', es: 'Crea planes semanales de comidas y listas de compras inteligentes automáticamente', fr: 'Créez des plans de repas hebdomadaires et des listes de courses intelligentes automatiquement', de: 'Erstellen Sie automatisch wöchentliche Essenspläne und intelligente Einkaufslisten', it: 'Crea piani pasto settimanali e liste della spesa intelligenti automaticamente' },
    onboarding_meal_plan: { en: 'Meal Plan', es: 'Plan de Comidas', fr: 'Plan de Repas', de: 'Essensplan', it: 'Piano Pasti' },
    onboarding_shopping: { en: 'Shopping List', es: 'Lista de Compras', fr: 'Liste de Courses', de: 'Einkaufsliste', it: 'Lista Spesa' },
    onboarding_gamification_title: { en: 'Level Up Your Skills', es: 'Sube de Nivel', fr: 'Montez de Niveau', de: 'Steigern Sie Ihre Fähigkeiten', it: 'Aumenta le tue Abilità' },
    onboarding_gamification_desc: { en: 'Unlock achievements, earn points, and track your culinary journey', es: 'Desbloquea logros, gana puntos y sigue tu viaje culinario', fr: 'Débloquez des succès, gagnez des points et suivez votre parcours culinaire', de: 'Schalten Sie Erfolge frei, verdienen Sie Punkte und verfolgen Sie Ihre kulinarische Reise', it: 'Sblocca obiettivi, guadagna punti e traccia il tuo percorso culinario' },
    onboarding_gamification_features: { en: 'Points • Achievements • Levels • Streaks', es: 'Puntos • Logros • Niveles • Rachas', fr: 'Points • Succès • Niveaux • Séries', de: 'Punkte • Erfolge • Level • Streaks', it: 'Punti • Obiettivi • Livelli • Streaks' },
    onboarding_back: { en: 'Back', es: 'Atrás', fr: 'Retour', de: 'Zurück', it: 'Indietro' },
    onboarding_next: { en: 'Next', es: 'Siguiente', fr: 'Suivant', de: 'Weiter', it: 'Avanti' },
    onboarding_start: { en: 'Get Started', es: '¡Empezar!', fr: 'Commencer', de: 'Loslegen', it: 'Inizia' }
  };

  // Cache for auto-translated texts
  private translationCache: Map<string, Promise<string>> = new Map();

  translate(key: string, params?: Record<string, any>): string {
    const lang = this.currentLanguage();
    
    // If English, return original
    if (lang === 'en') {
      let translation = this.baseTranslations[key] || key;
      if (params) {
        Object.keys(params).forEach(param => {
          translation = translation.replace(`{${param}}`, params[param]);
        });
      }
      return translation;
    }

    // Try fallback first (synchronous)
    let translation = this.fallbackTranslations[key]?.[lang];
    
    // If not in fallback, use base English as fallback
    if (!translation) {
      translation = this.baseTranslations[key] || key;
    }

    // Apply params
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }

    return translation;
  }

  /**
   * Async version that uses Google Translate API for any text
   * This is useful for dynamic content like recipe names, user input, etc.
   */
  async translateText(text: string, targetLang?: Language): Promise<string> {
    const lang = targetLang || this.currentLanguage();
    
    // If English, return original
    if (lang === 'en') {
      return text;
    }

    // Try auto-translate with cache
    const cacheKey = `${text}|${lang}`;
    if (!this.translationCache.has(cacheKey)) {
      const translationPromise = this.autoTranslate.translate(text, lang, 'en')
        .catch(error => {
          console.warn('Auto-translation failed, clearing cache and using original text:', error);
          this.translationCache.delete(cacheKey);
          throw error;
        });
      this.translationCache.set(cacheKey, translationPromise);
    }

    try {
      return await this.translationCache.get(cacheKey)!;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Fallback to original
    }
  }

  /**
   * Translate multiple texts in batch (more efficient)
   */
  async translateBatch(texts: string[], targetLang?: Language): Promise<string[]> {
    const lang = targetLang || this.currentLanguage();
    
    // If English, return originals
    if (lang === 'en') {
      return texts;
    }

    try {
      return await this.autoTranslate.translateBatch(texts, lang, 'en');
    } catch (error) {
      console.error('Batch translation failed:', error);
      return texts; // Fallback to originals
    }
  }

  setLanguage(lang: Language) {
    this.currentLanguage.set(lang);
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.translationCache.clear();
    this.autoTranslate.clearCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      service: this.autoTranslate.getCacheStats(),
      local: { entries: this.translationCache.size }
    };
  }
}
