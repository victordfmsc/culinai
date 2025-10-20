# 🚨 SOLUCIÓN: Login no funciona en Android

## ❌ Problema Detectado

Tu archivo `google-services.json` tiene esto:
```json
"oauth_client": []
```

Debería tener algo así:
```json
"oauth_client": [
  {
    "client_id": "xxxxx.apps.googleusercontent.com",
    "client_type": 3
  }
]
```

**Por eso NO funciona ningún login** (ni Google ni Email/Password en Android).

---

## ✅ SOLUCIÓN COMPLETA (10 minutos)

### **PASO 1: Obtener SHA-1 de tu keystore**

**Opción A: Si ya creaste tu keystore:**
```bash
keytool -list -v -keystore ruta/a/chef-ai-key.jks -alias chef-ai-key
```

**Opción B: Usar debug keystore (para probar):**

Windows:
```bash
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

Mac/Linux:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Copia el SHA-1** que aparece (línea completa con formato XX:XX:XX:...)

---

### **PASO 2: Configurar en Firebase Console**

1. **Ve a Firebase Console:**
   https://console.firebase.google.com/project/chef-ai-b08d8

2. **Click en el ícono de engranaje** ⚙️ (arriba izquierda) → **Project Settings**

3. **Scroll down** hasta la sección **"Your apps"**

4. **Encuentra tu app Android** (si existe) o **agrégala** (si no existe):

   **Si NO existe:**
   - Click en **"Add app"** → Selecciona el ícono de **Android**
   - Android package name: `com.daiary.chefai`
   - App nickname: `Chef AI`
   - Debug signing certificate SHA-1: **[PEGA TU SHA-1 AQUÍ]**
   - Click **"Register app"**
   - **Descarga** el archivo `google-services.json`
   - Click **"Next"** → **"Next"** → **"Continue to console"**

   **Si YA existe:**
   - Click en tu app Android
   - Scroll down hasta **"SHA certificate fingerprints"**
   - Click **"Add fingerprint"**
   - **Pega tu SHA-1**
   - Click **"Save"**

5. **IMPORTANTE: Descarga el NUEVO google-services.json**
   - En la página de configuración de tu app Android
   - Click en **"google-services.json"**
   - Descarga el archivo

---

### **PASO 3: Reemplazar google-services.json**

1. **Ubica el archivo descargado** (probablemente en Descargas)

2. **Reemplázalo en tu proyecto:**
   ```
   recipe-app/android/app/google-services.json
   ```

3. **Verifica que el nuevo archivo NO tenga "oauth_client" vacío**
   - Abre el archivo con un editor de texto
   - Busca `"oauth_client"`
   - Debería tener al menos un objeto dentro, no estar vacío `[]`

---

### **PASO 4: Recompilar y probar**

1. **Abre Android Studio**

2. **Build → Clean Project**

3. **Build → Rebuild Project**

4. **Build → Generate Signed Bundle / APK**

5. **Genera el APK** nuevamente

6. **Desinstala la app vieja** de tu teléfono:
   ```
   Ajustes → Apps → Chef AI → Desinstalar
   ```

7. **Instala el nuevo APK**

8. **Prueba el login** → ¡Ahora funcionará! ✅

---

## 🎯 Verificación Rápida

Antes de recompilar, **verifica tu nuevo google-services.json**:

```bash
# En tu computadora, ejecuta:
cat recipe-app/android/app/google-services.json | grep "oauth_client" -A 5
```

**Debería mostrar algo así:**
```json
"oauth_client": [
  {
    "client_id": "204589480105-xxxxx.apps.googleusercontent.com",
    "client_type": 3
  }
],
```

**Si está vacío `[]`**, significa que el SHA-1 no se agregó correctamente en Firebase Console.

---

## ❓ Preguntas Frecuentes

### **P: ¿Por qué funcionaba en web pero no en Android?**
R: La versión web usa diferentes credenciales OAuth. Android necesita SHA-1 configurado.

### **P: ¿Tengo que hacer esto cada vez?**
R: No, solo una vez. Después funciona siempre.

### **P: ¿Qué es el SHA-1?**
R: Es como una "huella digital" de tu app que Firebase usa para verificar que es legítima.

### **P: ¿Puedo usar el debug keystore?**
R: Sí, para probar. Pero para publicar en Play Store, necesitarás agregar también el SHA-1 de tu keystore de producción.

### **P: ¿Por qué no funciona email/password tampoco?**
R: Firebase Auth en Android requiere oauth_client configurado, incluso para email/password.

---

## 🔧 Troubleshooting

### **Error: "The requested action is invalid"**
→ Significa que el SHA-1 no está agregado o está mal. Repite el PASO 2.

### **Error: "Network error"**
→ Verifica que tu teléfono tenga internet activo.

### **Login no hace nada al hacer click**
→ Verifica que reemplazaste el google-services.json y recompilaste.

### **Sigue sin funcionar**
1. Desinstala completamente la app del teléfono
2. Borra caché de Google Play Services en tu teléfono
3. Reinicia el teléfono
4. Instala la app nuevamente

---

## 📋 Checklist Completo

- [ ] Obtuve el SHA-1 de mi keystore
- [ ] Agregué el SHA-1 en Firebase Console
- [ ] Descargué el nuevo google-services.json
- [ ] Verifiqué que oauth_client NO esté vacío
- [ ] Reemplacé el archivo en recipe-app/android/app/
- [ ] Hice Clean Project en Android Studio
- [ ] Recompilé el APK
- [ ] Desinstalé la app vieja del teléfono
- [ ] Instalé el nuevo APK
- [ ] ¡Login funciona!

---

## 🚀 Una vez configurado

Después de hacer esto correctamente:
- ✅ Google Sign-In funcionará
- ✅ Email/Password funcionará
- ✅ Firebase Auth funcionará completamente
- ✅ La app guardará datos en Firestore
- ✅ Todo funcionará perfectamente

**Este paso es obligatorio para cualquier app Android con Firebase.**

---

**Tiempo estimado:** 10 minutos
**Dificultad:** Fácil (solo seguir pasos)
**Frecuencia:** Solo una vez

¡Ánimo, está casi lista! 💪
