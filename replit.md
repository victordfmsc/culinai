# Overview

This project, "Chef AI," is an Angular 19 recipe management application designed to enhance the home cooking experience. It enables users to manage fridge ingredients, discover AI-generated recipes, plan meals, and create smart shopping lists. Key features include a comprehensive gamification system, dynamic portion adjustment, multilingual support, and a premium subscription model. The application integrates with Google's Gemini AI for recipe generation and Firebase for authentication and data persistence. It is deployable as both a web and mobile application via Capacitor. The project aims to provide an intelligent, user-friendly platform that leverages AI and gamification to assist users in their culinary journey.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with Angular 19, utilizing standalone components and reactive signals for state management. Styling is handled by TailwindCSS. Multilingual content is supported through a custom translation service integrating Google Cloud Translation API and a localStorage-based cache. The Gemini service generates all recipe content (titles, descriptions, ingredients, instructions) in the user's selected language.

### RevenueCat Subscription System

The application integrates RevenueCat for subscription management across web and mobile platforms. Users have a free tier limit of 3 recipe generations, after which a paywall is displayed. The `SubscriptionService` manages this limit, tracks generated recipes in Firebase UserAchievements, and controls access to premium features. Upon subscription, a "Premium Chef" achievement is unlocked as part of the gamification system. Platform-specific configurations are in place for Android and Web.

### Dynamic Portion Adjustment

Recipes feature real-time portion scaling. Users can adjust servings (1-12) on suggestion cards before adding to the shopping list, and also within the cooking modal. The scaling algorithm uses regex to extract numeric quantities, applies proportional scaling, and rounds quantities while preserving non-numeric ingredients.

### Gamification System "Chef Master"

A comprehensive gamification system encourages user engagement. It includes:
-   **Achievements**: 10 achievements across Beginner, Experienced, and Master tiers, with points awarded for completion.
-   **Points System**: Points are awarded for various user actions (e.g., adding ingredients, generating recipes, cooking).
-   **Levels**: 31 progressive levels, from Apprentice Chef to Culinary Legend, based on accumulated points.
-   **Daily Streaks**: Tracks consecutive daily usage, offering bonus points at milestones (7 and 30 days).
-   **Profile Dashboard**: Displays user avatar (animated based on level), progress to the next level, key statistics, and achievement showcases. ProfileComponent uses reactive signals to update in real-time when user data changes.
-   **Real-time Notifications**: Toast notifications appear when earning points, unlocking achievements, leveling up, or reaching streak milestones. Notifications are color-coded by type (yellow for points, purple for achievements, green for level-up, orange for streaks), auto-dismiss after 3-4 seconds with manual close option, stack vertically in top-right corner, and feature slide-in animations. All notification text is fully localized through TranslationService across all 5 languages (including dynamic point badges displaying "pts" in English/Spanish/French, "Pkt" in German, "pt" in Italian).

## Backend Architecture

Firebase serves as the core backend, providing:
-   **Authentication**: Google OAuth and email/password authentication. A guest mode allows unauthenticated exploration with in-memory data.
-   **Cloud Firestore**: Data persistence for user data, meal plans, shopping lists, and achievements. Dates stored as Timestamps are automatically converted to JavaScript Date objects.

### Gamification Data Model
`UserAchievements` stores: `unlockedAchievements`, `currentStreak`, `longestStreak`, `lastActiveDate`, `recipesCooked`, `recipesGenerated`, `mealPlansCreated`, `shoppingItemsAdded`, `languagesUsed`, `portionsAdjusted`, and `premiumSubscribed`.

## AI Recipe Generation

The application uses Google's Gemini API (specifically `gemini-1.5-flash`) to generate 10 unique, detailed, and beginner-friendly recipes per request. Recipes include precise timings, temperatures, visual cues, technique explanations, safety warnings, and tips, all generated in the user's selected language.

**Nutritional Analysis and Classification Tags**: Each recipe includes approximate nutritional values per serving (calories, protein, carbs, fat) and 2-4 classification tags (e.g., "High Protein," "Low Calorie," "Vegan"). Tags are generated in English by Gemini, then translated for display, and are associated with color-coded badges and themed icons for visual recognition.

## Data Models

Key data models include:
-   **`UserData`**: Stores user-specific information like UID, email, points, level, meal plan, shopping list, and achievements.
-   **`Recipe Model`**: Contains `title`, `description`, `ingredients`, `instructions`, `prepTime`, `servings`, `adjustedServings`, `tags` (e.g., ["High Protein"]), and `nutrition` (calories, protein, carbs, fat).
-   **`Meal Plan Structure`**: A seven-day structure containing recipe names.

## Mobile Architecture

The mobile application utilizes Capacitor for cross-platform deployment, targeting Android. It wraps the Angular web application, providing a native-like experience. The Android project is configured for import into Android Studio, using Firebase SDKs for native authentication and data persistence.

# External Dependencies

-   **Firebase Services**: Firebase App, Firebase Auth, Cloud Firestore (Project ID: `chef-ai-b08d8`).
-   **Google Generative AI**: `@google/generative-ai` (v0.21.0), using the `gemini-1.5-flash` model.
-   **Google Cloud Translation API**: For dynamic text translation in `AutoTranslateService`.
-   **Angular Ecosystem**: `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser` (v19.0.0).
-   **TailwindCSS**: Utility-first CSS framework (v3.4.0).
-   **Capacitor**: `@capacitor/cli` and `@capacitor/core` (v7.4.3) for mobile development.
-   **RevenueCat**: `@revenuecat/purchases-capacitor` for subscription management and in-app purchases.