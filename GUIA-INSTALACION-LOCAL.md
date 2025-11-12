# 📱 Guía de Instalación Local - Chef AI (Android)

Esta guía te ayudará a compilar y ejecutar la aplicación Chef AI en tu computadora local usando Android Studio.

## ⚠️ IMPORTANTE: Problema de Espacio en OneDrive

**NO instales el proyecto en OneDrive** porque `node_modules` ocupa aproximadamente 600 MB y puede causar errores de espacio insuficiente. 

**Solución:** Descarga y descomprime el proyecto en tu disco local (por ejemplo: `C:\Proyectos\`, `D:\Desarrollo\`, etc.)

---

## 📋 Requisitos Previos

### 1. Software Necesario

- **Node.js** (v18 o superior) - [Descargar aquí](https://nodejs.org/)
- **Android Studio** (última versión) - [Descargar aquí](https://developer.android.com/studio)
- **Java JDK** 17 - Android Studio lo instala automáticamente

### 2. Configuración de Android Studio

1. Abre Android Studio
2. Ve a **Tools → SDK Manager**
3. En la pestaña **SDK Platforms**, asegúrate de tener instalado:
   - Android 13.0 (API Level 33) o superior
4. En la pestaña **SDK Tools**, instala:
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android Emulator (opcional, si quieres probar en emulador)

---

## 🚀 Pasos de Instalación

### Paso 1: Descargar el Proyecto

1. En Replit, haz clic en los tres puntos (**⋮**) en la parte superior
2. Selecciona **"Download as ZIP"**
3. **IMPORTANTE:** Guarda el archivo en tu disco local (NO en OneDrive)
   - Ejemplo bueno: `C:\Proyectos\chef-ai.zip`
   - Ejemplo malo: `C:\Users\TuUsuario\OneDrive\chef-ai.zip` ❌

### Paso 2: Descomprimir el Proyecto

1. Descomprime el archivo ZIP en tu disco local
2. Abre una terminal (CMD, PowerShell o Git Bash)
3. Navega a la carpeta del proyecto:
   ```bash
   cd C:\Proyectos\chef-ai\recipe-app
   ```

### Paso 3: Instalar Dependencias

```bash
npm install
```

**Nota:** Este proceso tardará varios minutos la primera vez. Si recibes errores de espacio, verifica que NO estés en OneDrive.

### Paso 4: Crear Archivo de Variables de Entorno

Crea un archivo llamado `.env` en la carpeta `recipe-app` con el siguiente contenido:

```env
GEMINI_API_KEY=tu_clave_api_de_gemini
GOOGLE_TRANSLATE_API_KEY=tu_clave_de_traduccion
REVENUECAT_ANDROID_API_KEY=tu_clave_revenuecat_android
REVENUECAT_WEB_API_KEY=tu_clave_revenuecat_web
```

**IMPORTANTE:** Reemplaza los valores con tus claves API reales. Si no las tienes, solicítalas al administrador del proyecto.

### Paso 5: Compilar el Proyecto Angular

```bash
npm run build
```

Deberías ver un mensaje como:
```
✅ Environment variables injected successfully
Application bundle generation complete. [XX.XXX seconds]
```

### Paso 6: Sincronizar con Capacitor

```bash
npx cap sync android
```

Este comando:
- Copia los archivos compilados de Angular a la carpeta `android/`
- Actualiza las dependencias nativas de Android

---

## 📱 Compilar APK en Android Studio

### Paso 1: Abrir el Proyecto en Android Studio

1. Abre Android Studio
2. Selecciona **"Open an Existing Project"**
3. Navega a `C:\Proyectos\chef-ai\recipe-app\android` (la carpeta `android` dentro del proyecto)
4. Haz clic en **"OK"**

### Paso 2: Esperar la Sincronización de Gradle

Android Studio sincronizará automáticamente el proyecto. Verás una barra de progreso en la parte inferior:
```
Gradle sync in progress...
```

**Si ves errores de dependencias:**
1. Ve a **File → Invalidate Caches / Restart**
2. Selecciona **"Invalidate and Restart"**

### Paso 3: Generar el Keystore para Firmar la APK

#### Opción A: Debug APK (para pruebas)

Si solo quieres probar la app, Android Studio usa automáticamente un keystore de debug. Pasa al Paso 4.

#### Opción B: Release APK (para publicar)

1. Ve a **Build → Generate Signed Bundle / APK**
2. Selecciona **APK** y haz clic en **Next**
3. Haz clic en **"Create new..."** para crear un nuevo keystore
4. Completa los campos:
   - **Key store path:** `C:\Proyectos\chef-ai\keystore\release.jks`
   - **Password:** (crea una contraseña segura y guárdala)
   - **Alias:** `chef-ai-release`
   - **Validity:** 25 años
   - **Certificate:**
     - First and Last Name: Tu nombre
     - Organization: Tu organización
     - City, State, Country: Tu ubicación
5. Haz clic en **OK** y guarda las contraseñas

### Paso 4: Compilar la APK

#### Para Debug APK:
1. Ve a **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Espera a que termine la compilación
3. Haz clic en **"locate"** en la notificación para abrir la carpeta con la APK

**Ubicación del APK:**
```
recipe-app/android/app/build/outputs/apk/debug/app-debug.apk
```

#### Para Release APK:
1. Ve a **Build → Generate Signed Bundle / APK**
2. Selecciona **APK** → **Next**
3. Selecciona tu keystore y completa las contraseñas
4. Marca **release** como Build Variant
5. Haz clic en **Finish**

**Ubicación del APK:**
```
recipe-app/android/app/release/app-release.apk
```

---

## 📲 Instalar la APK en tu Dispositivo Android

### Método 1: Instalar en Dispositivo Físico

1. Conecta tu teléfono Android a la computadora con un cable USB
2. Habilita **"Opciones de desarrollador"** en tu teléfono:
   - Ve a **Ajustes → Acerca del teléfono**
   - Toca 7 veces sobre **"Número de compilación"**
3. Habilita **"Depuración USB"** en **Ajustes → Opciones de desarrollador**
4. Copia el archivo APK a tu teléfono
5. Abre el archivo APK en tu teléfono para instalar la app

### Método 2: Instalar en Emulador

1. En Android Studio, haz clic en **"Device Manager"** (icono de teléfono en la barra lateral)
2. Haz clic en **"Create Device"**
3. Selecciona un dispositivo (recomendado: Pixel 7)
4. Selecciona una imagen del sistema (recomendado: Android 13)
5. Haz clic en **Finish**
6. Inicia el emulador
7. Arrastra y suelta el archivo APK en la ventana del emulador

---

## 🔧 Solución de Problemas Comunes

### Error: "ENOSPC: no space left on device"

**Causa:** Estás instalando en OneDrive o una unidad sin suficiente espacio.

**Solución:**
1. Mueve el proyecto a tu disco local (C:\, D:\, etc.)
2. Elimina la carpeta `node_modules`
3. Ejecuta `npm install` nuevamente

### Error: "Failed to resolve: capacitor-android"

**Causa:** Gradle no puede encontrar las dependencias de Capacitor.

**Solución:**
1. Abre el archivo `recipe-app/android/build.gradle`
2. Verifica que tenga estas líneas en `repositories`:
   ```gradle
   google()
   mavenCentral()
   ```
3. En Android Studio, ve a **File → Sync Project with Gradle Files**

### Error: "SDK location not found"

**Causa:** Android Studio no encuentra el SDK de Android.

**Solución:**
1. Ve a **File → Project Structure → SDK Location**
2. Establece la ruta del SDK (normalmente: `C:\Users\TuUsuario\AppData\Local\Android\Sdk`)
3. Haz clic en **Apply** y luego en **OK**

### Error de Firebase: "google-services.json is missing"

**Causa:** El archivo de configuración de Firebase no está en su lugar.

**Solución:**
Verifica que el archivo `recipe-app/android/app/google-services.json` existe. Si no, contáctame para obtenerlo.

### La app se cierra inmediatamente después de abrirse

**Posibles causas:**
1. **Variables de entorno faltantes:** Verifica el archivo `.env`
2. **Errores de Firebase:** Revisa que `google-services.json` sea correcto
3. **Problemas de RevenueCat:** Si no tienes las claves de RevenueCat, la app podría fallar

**Solución:**
1. Conecta tu teléfono a la computadora
2. Abre Android Studio
3. Ve a **View → Tool Windows → Logcat**
4. Busca errores en rojo para identificar el problema exacto

---

## 📝 Notas Importantes

### Claves API Requeridas

La aplicación necesita las siguientes claves para funcionar completamente:

1. **GEMINI_API_KEY** - Para generar recetas con IA
2. **GOOGLE_TRANSLATE_API_KEY** - Para traducciones automáticas
3. **REVENUECAT_ANDROID_API_KEY** - Para gestionar suscripciones (Android)
4. **REVENUECAT_WEB_API_KEY** - Para gestionar suscripciones (Web)

### Configuración de Firebase

El proyecto ya está configurado con:
- **Project ID:** `chef-ai-64400`
- **Package Name:** `com.daiary.chefai2`
- **SHA-1 Fingerprint:** Configurado para el keystore de debug

Si vas a publicar la app, necesitarás generar un nuevo SHA-1 para tu keystore de release y agregarlo en la Firebase Console.

### Versión Actual

- **App Version:** 2.0
- **Version Code:** 11
- **Angular:** 19.0.0
- **Capacitor:** 7.4.3
- **Firebase:** 11.1.0

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún problema que no está listado aquí:

1. **Revisa los logs de Android Studio** (Logcat)
2. **Busca el mensaje de error específico** en Google
3. **Contacta al equipo de desarrollo** con capturas de pantalla del error

---

## ✅ Checklist de Compilación Exitosa

- [ ] Proyecto descargado y descomprimido en disco local (NO OneDrive)
- [ ] Node.js instalado correctamente
- [ ] `npm install` ejecutado sin errores
- [ ] Archivo `.env` creado con todas las claves API
- [ ] `npm run build` completado exitosamente
- [ ] `npx cap sync android` ejecutado sin errores
- [ ] Proyecto abierto en Android Studio
- [ ] Gradle sync completado sin errores
- [ ] APK generada correctamente
- [ ] APK instalada en dispositivo/emulador
- [ ] App se abre sin cerrarse inmediatamente

¡Buena suerte con tu compilación! 🚀
