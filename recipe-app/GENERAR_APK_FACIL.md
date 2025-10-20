# 📱 Cómo Generar tu APK - Guía Ultra Fácil

Sigue estos pasos exactamente en orden. ¡Es más fácil de lo que parece!

---

## 📥 PASO 1: Descargar el Proyecto de Replit

### Opción A: Desde Replit (Más Fácil)

1. En Replit, haz clic en los **3 puntos** (⋮) en el panel de archivos (a la izquierda)
2. Selecciona **"Download as zip"**
3. Guarda el archivo en tu computadora (por ejemplo, en Descargas)
4. **Descomprime el archivo** (click derecho → Extraer aquí)
5. Tendrás una carpeta, muévela a un lugar fácil de encontrar (como Documentos)

### Opción B: Con Git (Si sabes usar Git)

```bash
git clone [URL_DE_TU_REPLIT]
```

✅ **Ya tienes el proyecto en tu computadora**

---

## 💻 PASO 2: Instalar Android Studio

1. Ve a: **https://developer.android.com/studio**
2. Haz clic en **"Download Android Studio"**
3. Espera la descarga (son unos 1 GB)
4. **Instala Android Studio**:
   - Windows: Ejecuta el .exe
   - Mac: Arrastra a Aplicaciones
   - Linux: Sigue las instrucciones del instalador
5. **Abre Android Studio por primera vez**
6. Te pedirá instalar componentes adicionales → Haz clic en **"Next"** hasta que termine

⏱️ **Tiempo estimado**: 20-30 minutos (incluye descarga e instalación)

✅ **Android Studio instalado**

---

## 📂 PASO 3: Abrir el Proyecto en Android Studio

1. Abre Android Studio
2. En la pantalla de bienvenida, haz clic en **"Open"**
3. Navega hasta donde descargaste el proyecto
4. Busca la carpeta: **`recipe-app/android`** (importante: la carpeta `android` dentro de `recipe-app`)
5. Selecciona esa carpeta y haz clic en **"OK"**
6. Android Studio empezará a cargar el proyecto
7. **ESPERA** a que termine (verás una barra de progreso abajo que dice "Gradle sync")
   - Esto puede tomar 5-10 minutos la primera vez

⚠️ **NO HAGAS NADA** mientras ve esa barra de progreso. Déjalo trabajar.

✅ **Proyecto abierto en Android Studio**

---

## 🔑 PASO 4: Crear tu Keystore (Clave de Firma)

Solo necesitas hacer esto **UNA VEZ**. Guarda bien este archivo porque lo usarás siempre.

1. En Android Studio, en el menú superior:
   - Ve a **Build** → **Generate Signed Bundle / APK**
2. Selecciona **APK** (o **Android App Bundle** si vas a subir a Play Store)
3. Haz clic en **Next**
4. Como es tu primera vez, haz clic en **"Create new..."** (abajo)
5. Completa el formulario:

   ```
   Key store path: [Elige dónde guardar - YO RECOMIENDO: Documentos/chef-ai-key.jks]
   Password: [Elige una contraseña SEGURA y ANÓTALA]
   Confirm: [Repite la contraseña]
   
   Alias: chef-ai-key
   Password: [Misma contraseña u otra - ANÓTALA]
   Confirm: [Repite]
   Validity (years): 25
   
   First and Last Name: [Tu nombre]
   Organizational Unit: [Tu empresa o nombre]
   Organization: [Mismo que arriba]
   City or Locality: [Tu ciudad]
   State or Province: [Tu estado/provincia]
   Country Code: [ES, MX, AR, etc. - 2 letras]
   ```

6. Haz clic en **"OK"**

⚠️ **MUY IMPORTANTE**: 
- **GUARDA EL ARCHIVO `.jks`** en un lugar seguro
- **ANOTA LAS CONTRASEÑAS** en un lugar seguro (papel, gestor de contraseñas)
- Si pierdes esto, NO podrás actualizar tu app en Google Play nunca más

✅ **Keystore creado y guardado**

---

## 📦 PASO 5: Generar el APK/AAB

Ahora que tienes el keystore:

1. Estarás de vuelta en la ventana de **"Generate Signed Bundle or APK"**
2. Verifica que los campos estén llenos:
   - Key store path: Ruta a tu archivo .jks
   - Key store password: Tu contraseña
   - Key alias: chef-ai-key
   - Key password: Tu contraseña de la clave
3. Haz clic en **"Next"**
4. Selecciona **"release"** (no debug)
5. Marca **V2 (Full APK Signature)**
6. Haz clic en **"Finish"**
7. **ESPERA** - verás un mensaje abajo que dice "Building APK..."

⏱️ **Esto toma 2-5 minutos**

---

## 🎉 PASO 6: Encontrar tu APK/AAB

Cuando termine verás una notificación:

1. Haz clic en **"locate"** en la notificación
2. O ve manualmente a:
   - **APK**: `recipe-app/android/app/build/outputs/apk/release/app-release.apk`
   - **AAB**: `recipe-app/android/app/build/outputs/bundle/release/app-release.aab`

✅ **¡YA TIENES TU APK!**

---

## 📱 ¿Qué Hago Ahora con el APK?

### Para Probar en tu Teléfono (APK):

1. Copia `app-release.apk` a tu teléfono (por USB, email, Drive, etc.)
2. En tu teléfono:
   - Ve a Configuración → Seguridad
   - Activa "Instalar apps de fuentes desconocidas"
3. Abre el archivo APK en tu teléfono
4. Instala la app
5. ¡Prueba tu app!

### Para Subir a Google Play Store (AAB):

1. Ve a [Google Play Console](https://play.google.com/console)
2. Crea tu aplicación
3. Sube el archivo `app-release.aab` (NO el APK)
4. Completa la información de la tienda
5. Publica

---

## 🔄 Para Actualizaciones Futuras

La segunda vez es MUCHO más rápido:

1. Haz cambios en tu código en Replit
2. Descarga el proyecto nuevamente
3. En Android Studio: **Build** → **Generate Signed Bundle / APK**
4. Usa el **MISMO keystore** que ya tienes
5. Listo en 2-3 minutos

---

## ❓ Problemas Comunes

### "Gradle sync failed"

**Solución**:
1. File → Invalidate Caches / Restart
2. Espera a que reinicie
3. Vuelve a abrir el proyecto

### "SDK location not found"

**Solución**:
1. Crea un archivo llamado `local.properties` en `recipe-app/android/`
2. Agrégale esta línea (ajusta la ruta según tu sistema):
   ```
   # En Windows:
   sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
   
   # En Mac:
   sdk.dir=/Users/TU_USUARIO/Library/Android/sdk
   
   # En Linux:
   sdk.dir=/home/TU_USUARIO/Android/Sdk
   ```

### "Build failed"

**Solución**:
1. Asegúrate de tener internet (Gradle necesita descargar cosas)
2. Espera más tiempo (la primera build tarda mucho)
3. Cierra Android Studio y vuelve a abrirlo

### "No puedo encontrar el APK"

**Solución**:
El APK está en: `android/app/build/outputs/apk/release/app-release.apk`

Búscalo desde tu explorador de archivos.

---

## 📋 Checklist Completo

- [ ] Descargué el proyecto de Replit
- [ ] Instalé Android Studio
- [ ] Abrí la carpeta `recipe-app/android` en Android Studio
- [ ] Esperé a que Gradle sync terminara
- [ ] Creé mi keystore y GUARDÉ las contraseñas
- [ ] Generé el APK/AAB firmado
- [ ] Encontré el archivo APK/AAB en mi computadora
- [ ] Probé el APK en mi teléfono / Lo subí a Play Store

---

## 🎯 Resumen Express

1. **Descargar** proyecto de Replit → 2 minutos
2. **Instalar** Android Studio → 30 minutos (solo primera vez)
3. **Abrir** proyecto en Android Studio → 10 minutos
4. **Crear** keystore → 3 minutos (solo primera vez)
5. **Generar** APK → 5 minutos
6. **¡Listo!** → Instalar en teléfono o subir a Play Store

**Tiempo total primera vez**: ~50 minutos
**Actualizaciones futuras**: ~10 minutos

---

## 💡 Consejo Final

La primera vez parece complicado, pero después de hacerlo una vez, será super fácil. Android Studio hace todo el trabajo pesado por ti.

¡Ánimo! 🚀
