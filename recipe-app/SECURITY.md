# Security Configuration

This project uses environment variables to manage sensitive API keys securely.

## How it Works

1. **Template File**: `src/environments/environment.template.ts` contains placeholder values
2. **Generated File**: `src/environments/environment.ts` is auto-generated from environment variables
3. **Git Ignore**: The generated file is excluded from version control (.gitignore)
4. **Injection Script**: `inject-env.js` creates the environment.ts file at build/start time

## Required Environment Variables

The following secrets must be configured in your Replit environment:

- `GEMINI_API_KEY` - Google Gemini AI API key for recipe generation
- `GOOGLE_TRANSLATE_API_KEY` - Google Cloud Translation API key for auto-translation
- `REVENUECAT_ANDROID_API_KEY` - RevenueCat Android/Play Store API key
- `REVENUECAT_WEB_API_KEY` - RevenueCat Web/Stripe API key
- `REVENUECAT_IOS_API_KEY` - RevenueCat iOS/App Store API key (optional)

## Build Process

When you run `npm start` or `npm run build`, the following happens:

1. `inject-env.js` reads environment variables
2. Creates `src/environments/environment.ts` with real API keys
3. Angular builds/serves the application
4. The generated file is NOT committed to git

## Important Notes

⚠️ **Never commit real API keys to version control**

✅ Always use `environment.template.ts` as the source of truth for structure

✅ Keep API keys in Replit Secrets or environment variables only

✅ The `environment.ts` file is regenerated on every build
