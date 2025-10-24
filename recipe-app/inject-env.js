#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, 'src', 'environments', 'environment.ts');

const googleApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const revenuecatAndroidKey = process.env.REVENUECAT_ANDROID_API_KEY || '';
const revenuecatWebKey = process.env.REVENUECAT_WEB_API_KEY || '';
const revenuecatIosKey = process.env.REVENUECAT_IOS_API_KEY || '';

const envContent = `export const environment = {
  production: false,
  googleApiKey: '${googleApiKey}',
  revenuecatAndroidKey: '${revenuecatAndroidKey}',
  revenuecatWebKey: '${revenuecatWebKey}',
  revenuecatIosKey: '${revenuecatIosKey}'
};
`;

fs.writeFileSync(envFilePath, envContent);
console.log('✅ Environment variables injected successfully');
console.log('   - Gemini API Key:', googleApiKey ? '✓ Configured' : '✗ Missing');
console.log('   - RevenueCat Android:', revenuecatAndroidKey ? '✓ Configured' : '✗ Missing');
console.log('   - RevenueCat Web:', revenuecatWebKey ? '✓ Configured' : '✗ Missing');
console.log('   - RevenueCat iOS:', revenuecatIosKey ? '✓ Configured' : '✗ Missing');
