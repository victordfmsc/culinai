export const environment = {
  production: false,
  googleApiKey: (typeof process !== 'undefined' && process.env) ? process.env['GOOGLE_API_KEY'] || '' : '',
  revenuecatAndroidKey: (typeof process !== 'undefined' && process.env) ? process.env['REVENUECAT_ANDROID_API_KEY'] || '' : '',
  revenuecatWebKey: (typeof process !== 'undefined' && process.env) ? process.env['REVENUECAT_WEB_API_KEY'] || '' : '',
  revenuecatIosKey: (typeof process !== 'undefined' && process.env) ? process.env['REVENUECAT_IOS_API_KEY'] || '' : ''
};
