# Overview

This project is a recipe management application, "Chef AI," built with Angular 19. It enables users to manage fridge ingredients, discover AI-generated recipes, plan meals, and create smart shopping lists. Key features include gamification, multilingual support, dynamic portion adjustment, and a premium subscription model. The application integrates with Google's Gemini AI for recipe generation and Firebase for authentication and data persistence. It is deployable as both a web application and a mobile application via Capacitor.

The project's ambition is to provide a comprehensive, intelligent, and user-friendly platform for home cooks, enhancing their culinary experience through AI-powered assistance and robust management tools.

**Deployment Options**:
- **Web Application**: Deployed via Angular dev server on port 5000
- **Mobile Application**: Android app via Capacitor framework (see Mobile Architecture section)

**Recent Changes (Oct 26, 2025)**:
- ✅ **Dynamic Portion Adjustment**: Users can now adjust recipe servings (1-12 portions) with real-time ingredient scaling
  - Interactive slider with +/- buttons for precise portion control
  - All ingredient quantities automatically scale proportionally
  - Scaled ingredients properly added to shopping list
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

The application features real-time portion scaling that automatically adjusts ingredient quantities when users change serving sizes. The scaling algorithm:
- Extracts numeric quantities from ingredient strings using regex
- Applies proportional scaling based on the ratio of new servings to original servings
- Rounds scaled quantities to one decimal place for readability
- Preserves ingredients without numeric quantities unchanged

## Backend Architecture

Firebase is central to the backend, providing Authentication (Google OAuth, email/password) and Cloud Firestore for data persistence (user data, meal plans, shopping lists). A guest mode allows users to explore the app without authentication, using in-memory data storage for non-persistent interactions.

## AI Recipe Generation

The application integrates with Google's Gemini API (gemini-1.5-flash model) to generate 10 unique, highly detailed, and beginner-friendly recipes per request. Recipes include exact temperatures, precise timings, visual cues for doneness, technique explanations, safety warnings, and tips for success. The AI generates all recipe content in the user's selected language.

## Data Models

Core data models include `UserData` (uid, email, points, level, mealPlan, shoppingList), a `Recipe Model` (title, description, ingredients, instructions, prep time, servings), and a `Meal Plan Structure` (seven-day structure with recipe names).

## Mobile Architecture

The mobile application is built using Capacitor for cross-platform deployment, specifically targeting Android. It leverages Capacitor to wrap the Angular web application, providing a native-like experience. The Android project is self-contained and configured for direct import into Android Studio, utilizing Firebase SDKs for native authentication and data persistence.

# External Dependencies

-   **Firebase Services**: Firebase App, Firebase Auth (for user authentication), Cloud Firestore (for NoSQL data persistence). Project ID: `chef-ai-b08d8`.
-   **Google Generative AI**: `@google/generative-ai` (v0.21.0) using the `gemini-1.5-flash` model for AI recipe generation.
-   **Google Cloud Translation API**: Used by `AutoTranslateService` for real-time, dynamic text translation with caching.
-   **Angular Ecosystem**: `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser` (v19.0.0).
-   **TailwindCSS**: Utility-first CSS framework (v3.4.0).
-   **Capacitor**: `@capacitor/cli` and `@capacitor/core` (v7.4.3) for cross-platform mobile development.
-   **RevenueCat**: `@revenuecat/purchases-capacitor` for subscription management and handling in-app purchases (Android via Google Play, Web via Stripe).
