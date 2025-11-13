# Overview

Chef AI is an Angular 19 recipe management application designed to enhance the home cooking experience. It enables users to manage fridge ingredients, discover AI-generated recipes, plan meals, and create smart shopping lists. Key features include a comprehensive gamification system, dynamic portion adjustment, multilingual support, a premium subscription model, an interactive onboarding experience, and a privacy policy page. The application integrates with Google's Gemini AI for recipe generation and Firebase for authentication and data persistence. It is deployable as both a web and mobile application via Capacitor. The project aims to provide an intelligent, user-friendly platform that leverages AI and gamification to assist users in their culinary journey.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with Angular 19, utilizing standalone components and reactive signals for state management. Styling is handled by TailwindCSS. Multilingual content is supported through a custom translation service integrating Google Cloud Translation API and a localStorage-based cache. The Gemini service generates all recipe content (titles, descriptions, ingredients, instructions) in the user's selected language.

### RevenueCat Subscription System with Firestore Persistence

The application integrates RevenueCat for subscription management across web and mobile platforms with automatic Firestore synchronization. RevenueCat acts as the source of truth, with all subscription changes persisted to Firestore's `UserData.subscription` field. Users must subscribe to generate AI recipes.

### Dynamic Portion Adjustment

Recipes feature real-time portion scaling (1-12 servings) on suggestion cards and within the cooking modal. The scaling algorithm applies proportional adjustments to numeric quantities.

### Dietary Goals System

The fridge component includes 15 optional dietary goal filters: Low Fat, Low Carb, Low Sugar, High Protein, Vegetarian, Vegan, Gluten Free, Dairy Free, Keto, Paleo, Low Calorie, Mediterranean, Heart Healthy, Diabetic Friendly, and Quick (Under 30 min). Selected goals are passed to the Gemini AI service to ensure all generated recipes strictly adhere to the specified dietary requirements. Goal labels are translated in the UI but sent to Gemini in English for consistency.

**Flexible Search Options:**
- Users can search with ingredients only (traditional approach)
- Users can search with dietary goals only (generates recipes with any ingredients meeting the dietary requirements)
- Users can combine both ingredients and dietary goals for precise results
- The text input accepts both ingredient lists AND desired dish names (e.g., "paella", "chocolate cake", "quick pasta")

### Gamification System "Chef Master"

A comprehensive gamification system encourages user engagement, featuring:
-   **Achievements**: 10 achievements across three tiers.
-   **Points System**: Points awarded for various user actions.
-   **Levels**: 31 progressive levels based on accumulated points.
-   **Daily Streaks**: Tracks consecutive daily usage.
-   **Profile Dashboard**: Displays user avatar, progress, statistics, and achievements.
-   **Real-time Notifications**: Toast notifications for points, achievements, level-ups, and streaks, color-coded and localized.

### Privacy Policy

A dedicated, localized Privacy Policy page is accessible from the Profile section, detailing data practices in Spanish to comply with Google Play Store requirements.

### Interactive Onboarding Experience

A first-time user onboarding flow introduces core features before authentication. It includes a language selector (5 options), followed by 4 informational slides covering app introduction, fridge management, planning & organization, and gamification. Onboarding state is persisted in localStorage.

## Backend Architecture

Firebase serves as the core backend, providing:
-   **Authentication**: Google OAuth and email/password authentication, with native integration for Android/iOS using `@capacitor-firebase/authentication`. Guest mode allows unauthenticated exploration.
-   **Cloud Firestore**: Data persistence for user data, meal plans, shopping lists, and achievements.

### Structured Logging System

A centralized `LoggerService` provides production-grade logging with `DEBUG`, `INFO`, `WARN`, and `ERROR` levels. Logs include timestamps, categories, contextual metadata (e.g., user IDs), and are integrated with external monitoring services for ERROR-level logs.

### Optimized Translation System

The translation system includes an `AutoTranslateService` with a dual-layer (in-memory and localStorage) cache, debounced persistence, and batch translation support. The `TranslationService` enhances this with automatic prefetching of common UI translations upon language changes, optimizing performance.

### Gamification Data Model
`UserAchievements` stores metrics such as `unlockedAchievements`, `currentStreak`, `longestStreak`, `lastActiveDate`, `recipesCooked`, `recipesGenerated`, `mealPlansCreated`, `shoppingItemsAdded`, `languagesUsed`, `portionsAdjusted`, and `premiumSubscribed`.

## AI Recipe Generation

The application uses Google's Gemini API (`gemini-1.5-flash`) to generate 10 unique, detailed, and beginner-friendly recipes per request in the user's selected language. Recipes include approximate nutritional values and 2-4 classification tags (e.g., "High Protein"), which are translated for display. The generation process accepts optional dietary goals that are strictly enforced in the AI prompt to ensure all recipes meet the specified requirements (e.g., vegan, gluten-free, low-carb).

## Data Models

Key data models include:
-   **`UserData`**: Stores user-specific information, including points, level, meal plan, shopping list, and achievements.
-   **`Recipe Model`**: Contains `title`, `description`, `ingredients`, `instructions`, `prepTime`, `servings`, `adjustedServings`, `tags`, and `nutrition` details.
-   **`Meal Plan Structure`**: A seven-day structure containing recipe names.
-   **`RecipeSearchParams`**: Interface containing `ingredients` (string) and `dietaryGoals` (string array) for AI recipe generation requests.

## Mobile Architecture

Capacitor is used for cross-platform deployment, specifically targeting Android, by wrapping the Angular web application. Safe area insets are implemented using CSS environment variables and Capacitor's status bar plugin to prevent UI overlap with system bars.

# External Dependencies

-   **Firebase Services**: Firebase App, Firebase Auth, Cloud Firestore (Project ID: `chef-ai-64400`, migrated from `chef-ai-b08d8` on 2025-11-12). Uses Firebase v11.10.0 with modular SDK.
-   **Android Package Name**: `com.daiary.chefai2` (changed from `com.daiary.chefai` due to Firebase registration conflict).
-   **Google Generative AI**: `@google/generative-ai` (v0.21.0), utilizing the `gemini-1.5-flash` model.
-   **Google Cloud Translation API**: For dynamic text translation.
-   **Angular Ecosystem**: `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser` (v19.0.0).
-   **TailwindCSS**: Utility-first CSS framework (v3.4.0).
-   **Capacitor**: `@capacitor/cli`, `@capacitor/core` (v7.4.3), and `@capacitor/status-bar` (v7.0.3).
-   **RevenueCat**: `@revenuecat/purchases-capacitor` for subscription management.

# Local Development and Compilation

## TypeScript Configuration for Firebase v11

Firebase v11 with the modular SDK requires specific TypeScript import patterns to avoid namespace errors. Type imports use the `type` keyword with aliases:

```typescript
import type { User as FirebaseUser } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
```

The `tsconfig.json` includes `allowSyntheticDefaultImports: true` for better module compatibility.

## Android Compilation Guide

Two comprehensive guides are available for local Android compilation:

1. **GUIA-INSTALACION-LOCAL.md** - Detailed step-by-step guide covering:
   - Prerequisites (Node.js, Android Studio, Java JDK)
   - Installation steps with environment variables setup
   - APK generation (debug and release)
   - Device installation methods
   - Troubleshooting common errors
   - Required API keys and Firebase configuration

2. **recipe-app/COMPILAR-ANDROID.md** - Quick reference guide with:
   - Critical warnings (OneDrive space issues, .env file requirements)
   - Fast-track compilation steps
   - Common errors and quick solutions
   - Device installation tips

**Critical Requirements:**
- Project must NOT be stored in OneDrive due to large `node_modules` size (~600MB)
- `.env` file required with API keys: GEMINI_API_KEY, GOOGLE_TRANSLATE_API_KEY, REVENUECAT_ANDROID_API_KEY, REVENUECAT_WEB_API_KEY
- Compilation flow: `npm install` → `npm run build` → `npx cap sync android` → Android Studio build