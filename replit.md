# Overview

This project is a recipe management application, "Chef AI," built with Angular 19. It enables users to manage fridge ingredients, discover AI-generated recipes, plan meals, and create smart shopping lists. Key features include **comprehensive gamification system**, dynamic portion adjustment, multilingual support, and a premium subscription model. The application integrates with Google's Gemini AI for recipe generation and Firebase for authentication and data persistence. It is deployable as both a web application and a mobile application via Capacitor.

The project's ambition is to provide a comprehensive, intelligent, and user-friendly platform for home cooks, enhancing their culinary experience through AI-powered assistance, robust management tools, and motivating gamification.

**Deployment Options**:
- **Web Application**: Deployed via Angular dev server on port 5000
- **Mobile Application**: Android app via Capacitor framework (see Mobile Architecture section)

**Recent Changes (Oct 26, 2025)**:
- 🎮 **Complete Gamification System "Chef Master"**:
  - **10 Achievements** across 3 tiers (Beginner, Experienced, Master)
  - **Daily Streaks** with bonus points (7 days: 100 pts, 30 days: 500 pts)
  - **31 Progressive Levels** from Apprentice Chef to Culinary Legend
  - **Points System** integrated into all user actions (10-500 pts per action)
  - **Profile Dashboard** showing avatar with level, achievement showcase, stats, and progress bars
  - **Premium Integration** with special Premium Chef achievement
  - **Multilingual Achievement Support** (English, Spanish, French, German, Italian)
  - Automatic level calculation based on points (100-15000+ point scale)
  - Achievement progress tracking with visual indicators
  - Weekly challenges (currently defined, to be fully integrated)
  
- ✅ **Dynamic Portion Adjustment in Suggestion Cards**:
  - Portion slider (1-12 servings) on each recipe card BEFORE adding to shopping list
  - Real-time ingredient quantity scaling with proportional calculations
  - Scaled quantities correctly added to shopping list when clicking "Add to Shopping List"
  - Multilingual support (English, Spanish, French, German, Italian)

**Recent Changes (Oct 25, 2025)**:
- ✅ **Smart Shopping List with Context-Aware Extraction**:
  - **Numeric quantities with units**: Extracts base ingredient name, preserves unit, and sums (e.g., "400 g carne" + "1000 g carne" = "1400 g carne")
  - **Numeric quantities without units**: Shows multiplier (e.g., "2 tomatoes" + "3 tomatoes" = "5× tomatoes")
  - **Non-numeric items**: Keeps full text as-is (e.g., "sal", "aceite de oliva", "una pizca de hierbas secas")
  - Prevents nonsensical extractions like "pulgada de..." or "de hierbas secas"
- ✅ **Unit Preservation & Display**: Shopping list displays proper units (g, kg, l, ml, cups, tbsp, etc.) instead of just multipliers for measurable ingredients
- ✅ **Multi-Language Unit Recognition**: Supports units in 5 languages (cup/taza/tasse, gram/gramo/gramme, etc.)
- ✅ **Smart Unit Validation**: System validates unit-ingredient compatibility and discards invalid combinations:
  - Proteins (chicken, beef, pork, fish, etc.) cannot use volume units (cups, liters) - only weight (g, kg, lb, oz)
  - Vegetables (tomatoes, onions, broccoli, etc.) cannot use volume units - only weight
  - Liquids (water, milk, oil, juice, etc.) cannot use weight units - only volume (ml, l, cups)
  - Liquids with spoons: max 10 units allowed (e.g., "3 tbsp oil" ✅, "20 tbsp oil" → "20× oil" ❌)
  - Invalid combinations show quantity multiplier instead (e.g., "2 cups carne" → "2× carne")
- ✅ **Multi-Language Descriptor Removal** (only for numeric quantities):
  - 🇬🇧 English: "chopped", "diced", "cut into", "bite-sized", etc.
  - 🇪🇸 Spanish: "picado", "cortado en", "tamaño de un bocado", etc.
  - 🇫🇷 French: "haché", "coupé en", "en dés", etc.
  - 🇩🇪 German: "gehackt", "geschnitten", "gewürfelt", etc.
  - 🇮🇹 Italian: "tritato", "tagliato", "a cubetti", etc.
- ✅ **Visual Quantity Badges**: Items with quantity > 1 display colored badges (e.g., "3× tomatoes")
- ✅ **Fixed Ingredient Translation Bug**: Clicking translated ingredients now correctly adds the translated name instead of English
- ✅ **Gemini API Updated**: Changed from deprecated `gemini-pro` to `gemini-1.5-flash` model

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with Angular 19, utilizing standalone components and reactive signals for state management. Styling is handled by TailwindCSS. The application supports multilingual content through a custom translation service, which integrates with the Google Cloud Translation API for dynamic content and leverages a localStorage-based cache. The Gemini service generates all recipe content (titles, descriptions, ingredients, instructions) in the user's selected language.

### Dynamic Portion Adjustment

The application features real-time portion scaling in two locations:
1. **Suggestion Cards**: Users can adjust servings (1-12) BEFORE adding to shopping list, ensuring correct quantities are added
2. **Cooking Modal**: Final adjustment during recipe preparation

The scaling algorithm:
- Extracts numeric quantities from ingredient strings using regex
- Applies proportional scaling based on the ratio of new servings to original servings
- Rounds scaled quantities to one decimal place for readability
- Preserves ingredients without numeric quantities unchanged

### Gamification System "Chef Master"

#### Achievement Tiers
**Beginner Tier** (50 points each):
- "First Step" - Add first recipe to weekly meal plan
- "Smart Shopper" - Add 5 ingredients to shopping list
- "Explorer" - Generate 10 recipes with AI

**Experienced Tier** (100-150 points):
- "Planner Pro" - Complete a full weekly meal plan (7 days)
- "Multilingual" - Use app in 3 different languages
- "Portion Master" - Adjust portions 20 times
- "Active Cook" - Cook 25 recipes

**Master Tier** (200-500 points):
- "Streak Master" - Use app for 30 consecutive days (500 pts)
- "Collector" - Cook 100 different recipes (500 pts)
- "Premium Chef" - Subscribe to premium plan (200 pts)

#### Points System
- +10 pts: Add ingredient to fridge
- +15 pts: Generate recipes
- +25 pts: Cook a recipe
- +20 pts: Add recipe to meal plan
- +10 pts per item: Add to shopping list
- +50 pts: Unlock achievement
- +100 pts: 7-day streak bonus
- +500 pts: 30-day streak bonus

#### Level Progression
- **Levels 1-5**: Apprentice Chef (0-500 points)
- **Levels 6-10**: Home Cook (500-1500 points)
- **Levels 11-20**: Professional Chef (1500-5000 points)
- **Levels 21-30**: Master Chef (5000-15000 points)
- **Level 31+**: Culinary Legend (15000+ points)

#### Streak System
- Tracks consecutive daily usage
- Automatic reset if user misses a day
- Bonus points at milestones (7, 30 days)
- Visual "fire" indicator in profile

#### Profile Dashboard
- Animated avatar (changes based on level: 👶→🧑‍🍳→👨‍🍳→⭐→👑)
- Progress bar to next level with exact points display
- Stats grid: Current Streak, Recipes Cooked, Achievements, Meal Plans
- Achievement showcase (unlocked with green badges, locked with progress bars)
- Weekly challenge display (when implemented)

## Backend Architecture

Firebase is central to the backend, providing Authentication (Google OAuth, email/password) and Cloud Firestore for data persistence (user data, meal plans, shopping lists, **achievements**). A guest mode allows users to explore the app without authentication, using in-memory data storage for non-persistent interactions.

### Gamification Data Model
```typescript
UserAchievements {
  unlockedAchievements: string[]
  currentStreak: number
  longestStreak: number
  lastActiveDate: Date  // Converted from Firestore Timestamp
  recipesCooked: number
  recipesGenerated: number
  mealPlansCreated: number
  shoppingItemsAdded: number
  languagesUsed: string[]
  portionsAdjusted: number
  premiumSubscribed: number  // 0 or 1
  weeklyChallenge?: WeeklyChallenge
}
```

**Important**: Firestore stores dates as Timestamp objects, which are automatically converted to JavaScript Date objects on load to ensure streak and challenge logic works correctly.

## AI Recipe Generation

The application integrates with Google's Gemini API (gemini-1.5-flash model) to generate 10 unique, highly detailed, and beginner-friendly recipes per request. Recipes include exact temperatures, precise timings, visual cues for doneness, technique explanations, safety warnings, and tips for success. The AI generates all recipe content in the user's selected language.

## Data Models

Core data models include `UserData` (uid, email, points, level, mealPlan, shoppingList, **achievements**), a `Recipe Model` (title, description, ingredients, instructions, prep time, servings, adjustedServings), and a `Meal Plan Structure` (seven-day structure with recipe names).

## Mobile Architecture

The mobile application is built using Capacitor for cross-platform deployment, specifically targeting Android. It leverages Capacitor to wrap the Angular web application, providing a native-like experience. The Android project is self-contained and configured for direct import into Android Studio, utilizing Firebase SDKs for native authentication and data persistence.

# External Dependencies

-   **Firebase Services**: Firebase App, Firebase Auth (for user authentication), Cloud Firestore (for NoSQL data persistence including achievements). Project ID: `chef-ai-b08d8`.
-   **Google Generative AI**: `@google/generative-ai` (v0.21.0) using the `gemini-1.5-flash` model for AI recipe generation.
-   **Google Cloud Translation API**: Used by `AutoTranslateService` for real-time, dynamic text translation with caching.
-   **Angular Ecosystem**: `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser` (v19.0.0).
-   **TailwindCSS**: Utility-first CSS framework (v3.4.0).
-   **Capacitor**: `@capacitor/cli` and `@capacitor/core` (v7.4.3) for cross-platform mobile development.
-   **RevenueCat**: `@revenuecat/purchases-capacitor` for subscription management and handling in-app purchases (Android via Google Play, Web via Stripe). Integrates with gamification for Premium Chef achievement.
