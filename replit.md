# Overview

Chef AI is an Angular 19 recipe management application that leverages AI and gamification to enhance the home cooking experience. It enables users to manage fridge ingredients, discover AI-generated recipes, plan meals, create smart shopping lists, and track culinary achievements. The project aims to provide an intelligent, user-friendly platform that supports both web and mobile deployments, offering a premium subscription model for advanced features like AI recipe generation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
Built with Angular 19, utilizing standalone components, reactive signals for state management, and TailwindCSS for styling. It supports multilingual content via a custom translation service and integrates RevenueCat for subscription management. Key features include:

-   **Dynamic Portion Adjustment**: Real-time scaling of recipe servings (1-12).
-   **Dietary Goals System**: 15 optional filters applied to AI recipe generation (e.g., Vegan, Gluten-Free, Keto).
-   **Flexible Search Options**: Search by ingredients, dietary goals, or dish names, or a combination.
-   **Gamification System "Chef Master"**: Features achievements, points, levels, daily streaks, a profile dashboard, and real-time notifications.
-   **Privacy Policy**: A dedicated, localized page detailing data practices.
-   **Interactive Onboarding Experience**: First-time user flow with language selection and feature introductions.
-   **Weekly Meal Planner (MealPlanV2)**: Drag-and-drop interface for organizing weekly meals (7 days x 3 meals) with inline serving adjustments and Firestore persistence.
-   **Smart Recipe Import System**: Imports recipes from URLs, social media, OCR scanning, or manual entry, with AI-powered metadata generation and content enhancement.
-   **Intelligent Shopping List System**: Auto-generates shopping lists from meal plans, with smart ingredient parsing, duplicate detection, 8-category organization, multilingual categorization, and sharing capabilities.

## Backend Architecture
Firebase provides core backend services:
-   **Authentication**: Google OAuth and email/password, with guest mode support.
-   **Cloud Firestore**: Data persistence for user data, meal plans, shopping lists, and achievements.
-   **Structured Logging System**: Centralized `LoggerService` with `DEBUG`, `INFO`, `WARN`, `ERROR` levels, integrated with external monitoring.
-   **Optimized Translation System**: `AutoTranslateService` with dual-layer caching, debounced persistence, and batch translation.

## AI Recipe Generation
Utilizes Google's Gemini API (`gemini-1.5-flash`) to generate 10 unique, detailed, and beginner-friendly recipes per request in the user's selected language. The AI strictly enforces optional dietary goals and includes approximate nutritional values and classification tags.

## Data Models
Key models include `UserData`, `Recipe Model`, `Meal Plan Structure`, `RecipeSearchParams`, `PlannedMeal`, `DayMeals`, `MealPlanV2`, `ShoppingItem`, and `ImportPreview`.

## Mobile Architecture
Capacitor enables cross-platform deployment, specifically targeting Android, by wrapping the Angular web application, with safe area insets implemented.

# External Dependencies

-   **Firebase Services**: Firebase App, Firebase Auth, Cloud Firestore (v11.10.0, Project ID: `chef-ai-64400`).
-   **Google Generative AI**: `@google/generative-ai` (v0.21.0), using `gemini-1.5-flash`.
-   **Google Cloud Translation API**: For dynamic text translation.
-   **Angular Ecosystem**: `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser` (v19.0.0).
-   **TailwindCSS**: Utility-first CSS framework (v3.4.0).
-   **Capacitor**: `@capacitor/cli`, `@capacitor/core` (v7.4.3), `@capacitor/status-bar` (v7.0.3), and `@capacitor-firebase/authentication`.
-   **RevenueCat**: `@revenuecat/purchases-capacitor` for subscription management.