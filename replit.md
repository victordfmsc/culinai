# Overview

This project is a recipe management application, "Chef AI," built with Angular 19. It enables users to manage fridge ingredients, discover AI-generated recipes, plan meals, and create smart shopping lists. Key features include gamification, multilingual support, and a premium subscription model. The application integrates with Google's Gemini AI for recipe generation and Firebase for authentication and data persistence. It is deployable as both a web application and a mobile application via Capacitor.

The project's ambition is to provide a comprehensive, intelligent, and user-friendly platform for home cooks, enhancing their culinary experience through AI-powered assistance and robust management tools.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with Angular 19, utilizing standalone components and reactive signals for state management. Styling is handled by TailwindCSS. The application supports multilingual content through a custom translation service, which integrates with the Google Cloud Translation API for dynamic content and leverages a localStorage-based cache. The Gemini service generates all recipe content (titles, descriptions, ingredients, instructions) in the user's selected language.

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