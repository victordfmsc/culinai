# Guía de Construcción de la App Móvil Android

Esta guía te ayudará a construir y desplegar la versión móvil de Chef AI para Android.

## 📋 Requisitos Previos

Para construir la aplicación Android necesitas:

1. **Android Studio** instalado en tu computadora
   - Descarga desde: https://developer.android.com/studio
   
2. **Java Development Kit (JDK)** 17 o superior
   - Android Studio lo incluye, pero verifica que esté configurado

3. **Android SDK** con las siguientes herramientas:
   - SDK Platform para Android API 34 o superior
   - Android SDK Build-Tools
   - Android SDK Platform-Tools

## 🚀 Proceso de Construcción

### Paso 1: Construir la aplicación web

Primero, necesitas construir la versión de producción de Angular:

```bash
cd recipe-app
npm run build
```

Este comando genera los archivos optimizados en `dist/recipe-app/browser/`.

### Paso 2: Sincronizar con Android

Después de construir, sincroniza los cambios con el proyecto Android:

```bash
npm run android:sync
```

O usa el comando completo:

```bash
npm run mobile:build
```

Este último comando hace todo en uno: construye Angular + sincroniza con Capacitor.

### Paso 3: Abrir en Android Studio

Abre el proyecto Android en Android Studio:

```bash
npm run android:open
```

O manualmente:
1. Abre Android Studio
2. Selecciona "Open an existing project"
3. Navega a `recipe-app/android/` y ábrelo

### Paso 4: Configurar el dispositivo

Tienes dos opciones:

#### Opción A: Emulador (Recomendado para pruebas)
1. En Android Studio, ve a Tools > Device Manager
2. Crea un nuevo dispositivo virtual (AVD)
3. Selecciona un dispositivo (ej: Pixel 7) y una imagen del sistema (API 34+)
4. Haz clic en "Run" (▶️) en Android Studio

#### Opción B: Dispositivo físico
1. En tu teléfono Android:
   - Ve a Configuración > Acerca del teléfono
   - Toca 7 veces en "Número de compilación" para activar opciones de desarrollador
   - Ve a Configuración > Sistema > Opciones de desarrollador
   - Activa "Depuración USB"
2. Conecta tu teléfono a la computadora con un cable USB
3. Autoriza la conexión en tu teléfono
4. Haz clic en "Run" (▶️) en Android Studio y selecciona tu dispositivo

### Paso 5: Ejecutar la aplicación

Desde la línea de comandos (alternativa a Android Studio):

```bash
npm run android:run
```

Este comando:
- Sincroniza los cambios
- Compila la aplicación
- La instala en el dispositivo conectado/emulador
- La ejecuta automáticamente

## 📦 Generar APK para Distribución

### APK de Debug (para pruebas)

En Android Studio:
1. Build > Build Bundle(s) / APK(s) > Build APK(s)
2. Espera a que termine la compilación
3. Haz clic en "locate" en la notificación
4. El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

### APK/AAB de Release (para Google Play Store)

Para publicar en Google Play Store necesitas un APK/AAB firmado:

1. **Crear una clave de firma** (solo la primera vez):
   ```bash
   keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
   ```

2. **Configurar la firma en Android Studio**:
   - Build > Generate Signed Bundle / APK
   - Selecciona "Android App Bundle" o "APK"
   - Selecciona tu keystore y completa los datos
   - Selecciona "release" como Build Variant
   - Haz clic en "Finish"

3. El archivo firmado estará en:
   - AAB: `android/app/build/outputs/bundle/release/app-release.aab`
   - APK: `android/app/build/outputs/apk/release/app-release.apk`

## 🔧 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run build` | Construye la app Angular |
| `npm run mobile:build` | Construye Angular + sincroniza con móvil |
| `npm run android:sync` | Sincroniza cambios con Android |
| `npm run android:open` | Abre Android Studio |
| `npm run android:run` | Ejecuta la app en dispositivo/emulador |

## 🔄 Flujo de Trabajo de Desarrollo

Cuando hagas cambios en tu código:

1. Edita archivos TypeScript/HTML/CSS en `src/`
2. Ejecuta `npm run mobile:build`
3. Si Android Studio está abierto, haz clic en Run nuevamente

O usa este comando para hacer todo automáticamente:
```bash
npm run build && npm run android:sync && npm run android:run
```

## ✅ Verificación de Firebase

Tu app móvil ya tiene Firebase configurado con:
- ✅ `google-services.json` copiado en `android/app/`
- ✅ Plugin de Google Services configurado en Gradle
- ✅ Dependencias de Firebase agregadas (Auth, Firestore, Analytics)

La configuración de Firebase es la misma que la web:
- **Project ID**: `chef-ai-b08d8`
- **Package Name**: `com.daiary.chefai`

## 🐛 Solución de Problemas

### Error: "SDK location not found"
Crea un archivo `local.properties` en `recipe-app/android/`:
```
sdk.dir=/ruta/a/tu/Android/sdk
```

En macOS/Linux suele ser:
```
sdk.dir=/Users/TU_USUARIO/Library/Android/sdk
```

En Windows:
```
sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
```

### Error: "Gradle sync failed"
1. Abre Android Studio
2. File > Invalidate Caches / Restart
3. Vuelve a sincronizar

### La app no muestra cambios
1. Asegúrate de ejecutar `npm run build` antes de sincronizar
2. Limpia el build: Build > Clean Project en Android Studio
3. Vuelve a ejecutar la app

## 📱 Información de la App

- **Nombre**: Chef AI
- **ID de Paquete**: com.daiary.chefai
- **Versión**: 1.0 (versionCode: 1)
- **SDK Mínimo**: Android 5.0 (API 21)
- **SDK Objetivo**: API 34+

## 🎯 Próximos Pasos

1. Prueba la app en diferentes dispositivos/emuladores
2. Configura los íconos de la app en `android/app/src/main/res/`
3. Personaliza el splash screen si es necesario
4. Genera un APK firmado para distribución
5. Publica en Google Play Store

## 📚 Recursos Adicionales

- [Documentación de Capacitor](https://capacitorjs.com/docs)
- [Guía de Android Studio](https://developer.android.com/studio/intro)
- [Publicar en Google Play](https://developer.android.com/studio/publish)
- [Firebase para Android](https://firebase.google.com/docs/android/setup)
