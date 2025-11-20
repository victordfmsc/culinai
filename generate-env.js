#!/usr/bin/env node

/**
 * Script para generar el archivo .env con las claves API de Replit
 * Uso: node generate-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔑 Generando archivo .env con las claves API...\n');

// Leer las claves de las variables de entorno de Replit
const secrets = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GOOGLE_TRANSLATE_API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY,
  REVENUECAT_ANDROID_API_KEY: process.env.REVENUECAT_ANDROID_API_KEY,
  REVENUECAT_WEB_API_KEY: process.env.REVENUECAT_WEB_API_KEY
};

// Verificar qué claves están disponibles
const missingKeys = [];
const availableKeys = [];

Object.keys(secrets).forEach(key => {
  if (secrets[key]) {
    availableKeys.push(key);
  } else {
    missingKeys.push(key);
  }
});

console.log('✅ Claves encontradas:', availableKeys.length + '/4');
availableKeys.forEach(key => {
  const preview = secrets[key].substring(0, 8) + '...';
  console.log(`   ✓ ${key}: ${preview}`);
});

if (missingKeys.length > 0) {
  console.log('\n⚠️  Claves faltantes:', missingKeys.length);
  missingKeys.forEach(key => {
    console.log(`   ✗ ${key}`);
  });
}

// Generar contenido del archivo .env
let envContent = `# Chef AI - Environment Variables
# Generado automáticamente desde Replit Secrets
# Fecha: ${new Date().toLocaleString('es-ES')}

`;

Object.keys(secrets).forEach(key => {
  const value = secrets[key] || 'TU_CLAVE_AQUI';
  envContent += `${key}=${value}\n`;
});

// Guardar en recipe-app/.env
const envPath = path.join(__dirname, 'recipe-app', '.env');

try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('\n✅ Archivo .env generado exitosamente!');
  console.log(`📍 Ubicación: ${envPath}`);
  console.log('\n📋 Contenido generado:');
  console.log('━'.repeat(60));
  
  // Mostrar el contenido con las claves censuradas para seguridad
  Object.keys(secrets).forEach(key => {
    if (secrets[key]) {
      const preview = secrets[key].substring(0, 12) + '...';
      console.log(`${key}=${preview}`);
    } else {
      console.log(`${key}=TU_CLAVE_AQUI`);
    }
  });
  
  console.log('━'.repeat(60));
  console.log('\n💡 Ahora puedes:');
  console.log('   1. Descargar el proyecto como ZIP desde Replit');
  console.log('   2. El archivo .env ya estará incluido');
  console.log('   3. Compilar directamente con: npm run build');
  console.log('\n🚀 ¡Listo para compilar en Android Studio!');
  
} catch (error) {
  console.error('\n❌ Error al crear el archivo .env:', error.message);
  process.exit(1);
}
