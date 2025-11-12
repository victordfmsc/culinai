# Overview

This project, "Chef AI," is an Angular 19 recipe management application designed to enhance the home cooking experience. It enables users to manage fridge ingredients, discover AI-generated recipes, plan meals, and create smart shopping lists. Key features include a comprehensive gamification system, dynamic portion adjustment, multilingual support, a premium subscription model, an interactive onboarding experience, and a privacy policy page. The application integrates with Google's Gemini AI for recipe generation and Firebase for authentication and data persistence. It is deployable as both a web and mobile application via Capacitor. The project aims to provide an intelligent, user-friendly platform that leverages AI and gamification to assist users in their culinary journey.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with Angular 19, utilizing standalone components and reactive signals for state management. Styling is handled by TailwindCSS. Multilingual content is supported through a custom translation service integrating Google Cloud Translation API and a localStorage-based cache. The Gemini service generates all recipe content (titles, descriptions, ingredients, instructions) in the user's selected language.

### RevenueCat Subscription System

The application integrates RevenueCat for subscription management across web and mobile platforms. **Users must subscribe immediately** (FREE_RECIPE_LIMIT = 0) to generate any AI recipes. The paywall appears when clicking "Find Recipes" for the first time. The `SubscriptionService` manages this subscription requirement, tracks generated recipes in Firebase UserAchievements, and controls access to premium features. Upon subscription, a "Premium Chef" achievement is unlocked as part of the gamification system.

**Configuration Details:**
- RevenueCat API Key: `goog_VQfWXrZVpHQbWSUNaScmoQflDDn` (configured for Android and Web)
- Target Offering ID: `ofrng0c6cce3960` (loaded specifically in `RevenueCatService.getOfferings()`)
- Product IDs: `prod639e144080` (0,99€/month), `prod952e6667f9` (3,99€/year)
- Paywall UI: Professional gradient design with animations, fully translated across all 5 languages (18 new translation keys added to `TranslationService`)
- Premium Benefits: Unlimited recipe generation, +200 bonus points, "Premium Chef" achievement, advanced meal planning, exclusive badge, priority support
- Web Demo Mode: Shows demo pricing in euros for testing UI/UX; real RevenueCat integration works only on Android/iOS devices

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

### Privacy Policy

A dedicated Privacy Policy page is accessible from the Profile section via a clickable link. The policy page displays Kineti Apps' privacy information in Spanish, including data collection practices, usage, security measures, user rights, and contact information (victordfmsc@gmail.com). The page includes a back button to return to the Profile view. The privacy policy is required for Google Play Store compliance.

### Interactive Onboarding Experience

A first-time user onboarding flow introduces the app's core features before the authentication screen. The onboarding starts with a language selector, then proceeds through 4 informational slides:

-   **Language Selection** (Slide 0): Users choose their preferred language from 5 options (English, Español, Français, Deutsch, Italiano) with flag icons. Upon selection, the language is saved and the onboarding automatically advances to the next slide, displaying all subsequent content in the chosen language.
-   **Welcome**: Introduction to Chef AI as an intelligent cooking assistant
-   **Fridge Management**: How to add ingredients and generate AI-powered recipes instantly
-   **Planning & Organization**: Weekly meal planning and smart shopping list features
-   **Gamification**: Achievements, points, levels, and daily streaks system

The onboarding features smooth slide transitions, progress indicators (dots for slides 1-4), navigation buttons (Next/Back starting from slide 1), and a Skip button in the top-right corner (visible from slide 1 onwards). It appears only on the first visit, with completion state persisted in localStorage via `OnboardingService`. All onboarding content is fully translated across all 5 supported languages through the `TranslationService`.

## Backend Architecture

Firebase serves as the core backend, providing:
-   **Authentication**: Google OAuth and email/password authentication with robust error handling. Native authentication for Android/iOS uses `@capacitor-firebase/authentication` with mandatory credential synchronization via `signInWithCredential`. The system validates credentials before proceeding, preventing crashes from missing tokens, and provides user-friendly error messages in Spanish for common failures (popup closed, network errors, missing credentials). A guest mode allows unauthenticated exploration with in-memory data.
-   **Cloud Firestore**: Data persistence for user data, meal plans, shopping lists, and achievements. Dates stored as Timestamps are automatically converted to JavaScript Date objects.

### Structured Logging System

The application implements a centralized `LoggerService` for production-grade logging with contextual metadata. The logging system provides:

-   **Log Levels**: `DEBUG`, `INFO`, `WARN`, and `ERROR` with automatic filtering based on environment (production shows WARN+ only)
-   **Structured Metadata**: All logs include timestamps, categories, and contextual data (e.g., user IDs, error codes, platform info)
-   **Visual Indicators**: Emoji prefixes (🔍 DEBUG, ✅ INFO, ⚠️ WARN, ❌ ERROR) for quick visual scanning
-   **Error Context**: Error logs automatically capture error messages, stack traces, and custom metadata
-   **Production Monitoring**: Hooks for external monitoring services (Sentry, LogRocket) on ERROR-level logs
-   **Service Integration**: All critical services (AuthService, TranslationService, AutoTranslateService) use structured logging with consistent categorization

Example usage:
```typescript
this.logger.info('AuthService', 'User authenticated', {
  uid: user.uid,
  email: user.email,
  provider: user.providerData[0]?.providerId
});
this.logger.error('AuthService', 'Google login failed', error, {
  errorCode: error.code,
  platform: Capacitor.getPlatform()
});
```

### Optimized Translation System

The translation system implements intelligent caching and prefetching to minimize API calls and improve performance:

**AutoTranslateService optimizations:**
-   **Dual-layer cache**: In-memory cache with persistent localStorage backup
-   **Normalized cache keys**: Include source language, target language, and trimmed text to prevent duplicates
-   **Debounced persistence**: localStorage writes are debounced (500ms) to reduce main-thread blocking
-   **Cache hit/miss tracking**: Real-time statistics with hit rate calculation for monitoring
-   **Batch translation support**: Efficient API usage by translating multiple texts in a single request

**TranslationService enhancements:**
-   **Automatic prefetching**: Common UI translations (navigation, auth, actions, notifications) are batch-loaded when language changes
-   **Smart prefetch strategy**: Uses Angular signals effect to detect language changes and triggers one-time prefetch per language
-   **Performance monitoring**: Tracks prefetch duration and logs metrics for observability
-   **Comprehensive logging**: All translation operations logged with LoggerService for debugging and monitoring

Cache statistics example:
```typescript
{
  hits: 1247,
  misses: 53,
  entries: 152,
  size: "23.45 KB (95.9% hit rate)"
}
```

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

### Safe Area Insets for Android

The application implements safe area handling to prevent UI elements from overlapping with Android system bars (status bar, navigation buttons, notches, punch-holes). The implementation uses:
-   **CSS Environment Variables**: Global CSS variables (`--safe-area-inset-top`, `--safe-area-inset-bottom`) with `env()` fallbacks
-   **Utility Classes**: `.safe-top` and `.safe-bottom` classes apply `padding-top` and `padding-bottom` using `max(env(safe-area-inset-*), 0px)`
-   **Header Protection**: Header has `safe-top` class to respect status bar and notches
-   **Navigation Protection**: Bottom navigation has `safe-bottom` class to respect gesture navigation and button bars
-   **StatusBar Plugin**: `@capacitor/status-bar` (v7.0.3) configured in `main.ts` with light style and `overlay: false`
-   **Viewport Configuration**: `viewport-fit=cover` meta tag enables safe area detection on devices with notches
-   **Cross-Platform**: Web browsers render 0px padding (no-op), while Android automatically calculates correct spacing

# External Dependencies

-   **Firebase Services**: Firebase App, Firebase Auth, Cloud Firestore (Project ID: `chef-ai-b08d8`).
-   **Google Generative AI**: `@google/generative-ai` (v0.21.0), using the `gemini-1.5-flash` model.
-   **Google Cloud Translation API**: For dynamic text translation in `AutoTranslateService`.
-   **Angular Ecosystem**: `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser` (v19.0.0).
-   **TailwindCSS**: Utility-first CSS framework (v3.4.0).
-   **Capacitor**: `@capacitor/cli` and `@capacitor/core` (v7.4.3) for mobile development; `@capacitor/status-bar` (v7.0.3) for safe area handling.
-   **RevenueCat**: `@revenuecat/purchases-capacitor` for subscription management and in-app purchases.