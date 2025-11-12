# 🔥 Guía Rápida - Compilar Chef AI para Android

## ⚠️ MUY IMPORTANTE

### 1. NO uses OneDrive para el proyecto
El proyecto ocupa más de 600 MB en `node_modules`. Si lo instalas en OneDrive, obtendrás errores de "no space left on device".

✅ **Correcto:** `D:\Proyectos\chef-ai`  
❌ **Incorrecto:** `C:\Users\PC\OneDrive\Escritorio\chef-ai`

### 2. Crea el archivo .env antes de compilar

En la carpeta `recipe-app`, crea un archivo `.env` con tus claves API:

```env
GEMINI_API_KEY=tu_clave_aqui
GOOGLE_TRANSLATE_API_KEY=tu_clave_aqui
REVENUECAT_ANDROID_API_KEY=tu_clave_aqui
REVENUECAT_WEB_API_KEY=tu_clave_aqui
```

Si no tienes estas claves, la compilación funcionará pero algunas funcionalidades no estarán disponibles.

---

## 📦 Pasos Rápidos

### 1. Descarga y Descomprime
```bash
# Descarga el ZIP desde Replit
# Descomprime en: D:\Proyectos\chef-ai (o similar - NO en OneDrive)
```

### 2. Instala Dependencias
```bash
cd D:\Proyectos\chef-ai\recipe-app
npm install
```

### 3. Compila Angular
```bash
npm run build
```

### 4. Sincroniza con Capacitor
```bash
npx cap sync android
```

### 5. Abre en Android Studio
```bash
# Abre Android Studio
# File → Open → Selecciona: D:\Proyectos\chef-ai\recipe-app\android
```

### 6. Compila la APK
```
En Android Studio:
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

La APK estará en: `recipe-app/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🐛 Errores Comunes y Soluciones

### Error: `ENOSPC: no space left on device`
**Solución:** Mueve el proyecto FUERA de OneDrive

### Error: `Failed to resolve: project :capacitor-android`
**Solución:** 
```bash
cd recipe-app/android
./gradlew clean
# En Android Studio: File → Sync Project with Gradle Files
```

### Error: Firebase TypeScript types
**Solución:** Ya está corregido en el proyecto. Solo asegúrate de ejecutar `npm install` completo.

### La app se cierra inmediatamente
**Solución:** Verifica el archivo `.env` y que todas las claves API sean correctas.

---

## 📱 Instalar en tu Teléfono

1. Habilita "Opciones de desarrollador" en tu Android:
   - Ajustes → Acerca del teléfono
   - Toca 7 veces "Número de compilación"

2. Activa "Depuración USB":
   - Ajustes → Opciones de desarrollador → Depuración USB

3. Copia `app-debug.apk` a tu teléfono e instálala

---

## 💡 Consejos

- **Primera vez:** La instalación de `npm install` puede tardar 10-15 minutos
- **Gradle Sync:** En Android Studio, la primera sincronización puede tardar 5-10 minutos
- **APK de Debug:** Es más rápida de compilar, úsala para pruebas
- **APK de Release:** Necesita un keystore firmado, úsala para publicar en Play Store

---

¿Problemas? Revisa el archivo **GUIA-INSTALACION-LOCAL.md** para más detalles.
