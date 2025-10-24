# Overview

This is a recipe management application built with Angular 19 that helps users manage their fridge ingredients, discover recipes, plan meals, and create shopping lists. The application integrates with Google's Gemini AI for recipe generation and Firebase for authentication and data persistence. It features a gamification system with points and levels, multilingual support (English, Spanish, French, German, Italian), and a subscription-based premium model.

**Deployment Options**:
- **Web Application**: Deployed via Angular dev server on port 5000
- **Mobile Application**: Android app via Capacitor framework (see Mobile Architecture section)

**Recent Changes (Oct 24, 2025)**:
- ✅ **AI Recipe Generation**: Now generates 10 unique recipes per request (previously 3)
- ✅ **Auto-Translation of AI Content**: Gemini now generates ALL recipe content (titles, descriptions, ingredients, instructions) in the selected language
- ✅ **Complete UI Translation**: All UI elements, labels, and buttons now translate automatically when language changes
- ✅ **Deployment Fix**: Simplified deployment to use direct Angular output directory (recipe-app/dist/recipe-app/browser) instead of copying to intermediate Chefai folder
- ✅ Environment variables now auto-injected on build via inject-env.js script
- ✅ Android project is now self-contained with plugins copied locally (no node_modules dependency)
- ✅ capacitor.settings.gradle modified to use local plugin directories
- ✅ Project ready for direct import into Android Studio without npm install
- ✅ Added "X" button on login screen to allow guest mode (try app without authentication)
- ✅ Guest mode signal implemented for non-authenticated app exploration

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: Angular 19 standalone components with reactive signals
- Uses standalone components exclusively (no NgModules for components)
- Implements Angular's new signal-based reactivity for state management
- Change detection strategy relies on signals and computed values
- TailwindCSS for utility-first styling approach

**Component Structure**:
- `AppComponent`: Main container orchestrating authentication state and view navigation
- Feature components: Home (meal planner), Fridge (ingredient input), Suggestions (recipe display), Shopping List, Profile
- Utility components: Paywall (subscription prompt), Language Selector
- All components are self-contained with their own templates and imports

**State Management**:
- Signal-based reactive state throughout the application
- No centralized state management library
- Services expose signals for components to consume
- Parent-to-child communication via `@Input()`, child-to-parent via `@Output()` EventEmitters

**Internationalization**:
- Custom translation system using `TranslationService` and `TranslatePipe`
- Supported languages: English, Spanish, French, German, Italian
- Translation keys stored in service, not external files
- Language selection persists in signal state
- **AI Content Translation**: Gemini service receives current language and generates ALL recipe content (titles, descriptions, ingredients, instructions) in the selected language
- Complete UI translation including all labels, buttons, placeholders, and messages across all components

## Backend Architecture

**Firebase Integration**:
- Firebase Authentication handles user authentication (Google OAuth, email/password)
- Cloud Firestore stores user data, meal plans, and shopping lists
- Firebase configuration embedded directly in service files using project `chef-ai-b08d8`
- Configured with real Firebase credentials from google-services.json
- Separate app instances for Auth and Firestore to avoid initialization conflicts

**Authentication Flow**:
- `AuthService` manages authentication state using Firebase Auth SDK
- Maintains `currentUser` signal updated via `onAuthStateChanged` listener
- Triggers Firestore data loading on successful authentication
- Supports Google Sign-In popup and traditional email/password authentication
- **Guest Mode**: Users can skip login via "X" button to explore app without authentication
  - `guestMode` signal in AppComponent controls guest access
  - Guest users can use all features with in-memory data storage
  - Guest data (points, level, meal plans, shopping lists) stored in signals, not persisted to database
  - "I Cooked This!" button awards points to guest users via `guestPoints` and `guestLevel` signals
  - Logging out resets guest mode and clears all guest data

**Data Storage**:
- `FirestoreService` manages all database operations
- User documents structure: `{ uid, email, points, level, mealPlan, shoppingList, createdAt }`
- Meal plans organized by days of week (Monday-Sunday)
- Shopping list items stored as `{ text: string, checked: boolean }`

**AI Recipe Generation**:
- `GeminiService` integrates with Google's Generative AI API
- Uses `gemini-pro` model for recipe generation
- **Generates 10 unique recipes per request** with diverse cuisines (Italian, Asian, Mexican, Mediterranean, Indian, etc.)
- Varies cooking methods: stir-fry, baked, grilled, soup, salad, pasta, rice bowl, curry, tacos, flatbread
- **Multilingual Recipe Generation**: Automatically generates ALL content in the user's selected language (English, Spanish, French, German, Italian)
- Language parameter passed from TranslationService to ensure recipe titles, descriptions, ingredients, and instructions match UI language
- Falls back to 10 mock recipes when API key not configured
- Generates structured recipe objects with title, description, ingredients, instructions, prep time, servings
- Configured with user's GEMINI_API_KEY secret for personalized AI-generated recipes

## Data Models

**User Model** (`UserData`):
- Core user properties: uid, email, points, level, creation timestamp
- Nested meal plan object with arrays of recipe names per day
- Shopping list as array of items with text and checked status

**Recipe Model**:
- Title, description, ingredients (string array), instructions (string array)
- Metadata: prep time, number of servings
- Generated by AI or provided as mock data

**Meal Plan Structure**:
- Seven-day structure with empty arrays as default
- Each day can contain multiple recipe names (strings)
- Days referenced by lowercase keys: 'monday', 'tuesday', etc.

## External Dependencies

**Firebase Services** (v11.1.0):
- Firebase App: Core initialization
- Firebase Auth: User authentication with Google OAuth and email/password providers
- Cloud Firestore: NoSQL document database for user data persistence
- Project ID: `chef-ai-b08d8`

**Google Generative AI** (@google/generative-ai v0.21.0):
- Gemini Pro model for recipe generation
- Structured prompt engineering for JSON recipe responses
- Uses placeholder API key ('demo-key') - update with real key to enable AI recipe generation
- Falls back to mock recipes when API key not configured

**Angular Ecosystem** (v19.0.0):
- @angular/core: Framework foundation with signals and standalone components
- @angular/common: Common directives and pipes
- @angular/forms: Template-driven and reactive forms support
- @angular/platform-browser: Browser-specific implementations

**Styling Framework**:
- TailwindCSS v3.4.0: Utility-first CSS framework
- PostCSS and Autoprefixer for processing
- Custom configuration in `tailwind.config.js` scanning all HTML and TypeScript files

**Development Tools**:
- TypeScript 5.6.2 with strict mode enabled
- Angular CLI for build and development server
- Development server configured for host `0.0.0.0:5000` with disabled host checking

**Subscription Management**:
- `SubscriptionService` integrates with RevenueCat for subscription management
- RevenueCat SDK (@revenuecat/purchases-capacitor) handles cross-platform purchases
- Supports Android (Google Play), Web (Stripe), and iOS (future)
- Automatically shows paywall to non-subscribed users on login
- Entitlement ID: "premium" - configured in RevenueCat dashboard
- API keys managed via environment variables: REVENUECAT_ANDROID_API_KEY, REVENUECAT_WEB_API_KEY

## Mobile Architecture

**Capacitor Integration** (v7.4.3):
- Capacitor CLI and Core for cross-platform mobile deployment
- Android platform configured and ready for native app builds
- Web assets compiled to `dist/recipe-app/browser` and synced to Android project

**Android Configuration**:
- **App ID**: `com.daiary.chefai`
- **App Name**: Chef AI
- **Target SDK**: Android API 34+
- **Min SDK**: Android API 21 (Android 5.0)
- **Version**: 1.0 (versionCode: 1)

**Android Build Setup**:
- Gradle 8.7.2 with Google Services plugin 4.4.4
- Firebase BoM 34.4.0 managing SDK versions
- Firebase dependencies: Analytics, Auth, Firestore
- google-services.json configured in `android/app/` directory
- Build files configured in `android/build.gradle` and `android/app/build.gradle`

**Mobile Build Scripts** (package.json):
- `build:mobile`: Builds Angular and syncs with Capacitor
- `android:sync`: Syncs changes to Android platform
- `android:open`: Opens project in Android Studio
- `android:run`: Runs app on connected device/emulator
- `mobile:build`: Complete build and sync workflow

**Build Process**:
1. Angular builds production web app to `dist/recipe-app/browser`
2. Capacitor syncs web assets to `android/app/src/main/assets/public`
3. Android Studio compiles native app with embedded web view
4. Firebase SDK provides native authentication and data persistence
5. APK/AAB generated for distribution

**Documentation**:
- Complete mobile build guide available in `MOBILE_BUILD.md`
- Includes setup instructions, build commands, and troubleshooting
- Covers APK generation for testing and signed releases for Google Play Store