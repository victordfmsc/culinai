# 🔐 Configurar Google Sign-In para Android - Guía Fácil

## ⚠️ Por qué necesitas hacer esto

El error **"The requested action is invalid"** aparece porque Firebase necesita saber que TU app Android específica está autorizada para hacer login con Google.

Esto es una **medida de seguridad** de Google que NO se puede evitar.

---

## ✅ Solución en 3 Pasos Simples

### **PASO 1: Obtener tu SHA-1**

Tienes **2 opciones** según tu sistema operativo:

#### **Opción A: Usar el script automático** (Más fácil)

**Windows:**
1. Abre `obtener-sha1.bat` (doble click)
2. Elige opción 1 o 2
3. Copia el SHA-1 que aparece

**Mac/Linux:**
1. Abre Terminal
2. Ejecuta: `bash obtener-sha1.sh`
3. Elige opción 1 o 2
4. Copia el SHA-1 que aparece

#### **Opción B: Comando manual**

**Para DEBUG keystore (probar la app):**

Windows:
```bash
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

Mac/Linux:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Para PRODUCCIÓN keystore (app final):**
```bash
keytool -list -v -keystore ruta/a/tu/chef-ai-key.jks -alias chef-ai-key
```
(Te pedirá la contraseña)

Busca la línea que dice:
```
SHA1: A1:B2:C3:D4:E5:F6:...
```

**¡COPIA todo ese valor!**

---

### **PASO 2: Agregar SHA-1 a Firebase**

1. Ve a: **https://console.firebase.google.com**

2. Selecciona el proyecto: **chef-ai-b08d8**

3. Click en el **ícono de engranaje** ⚙️ (arriba izquierda) → **Project Settings**

4. Baja hasta la sección **"Your apps"**

5. Busca tu app Android o agrégala si no existe:
   - Si NO existe: Click en **"Add app"** → Ícono Android
   - Package name: `com.daiary.chefai`
   - App nickname: `Chef AI Android`
   - **Descarga el google-services.json**

6. Si YA existe: Click en tu app Android

7. Baja hasta **"SHA certificate fingerprints"**

8. Click en **"Add fingerprint"**

9. **Pega el SHA-1** que copiaste

10. Click en **"Save"**

---

### **PASO 3: Actualizar google-services.json**

1. En Firebase Console, descarga el nuevo **google-services.json**

2. **Reemplaza** el archivo en tu proyecto:
   ```
   recipe-app/android/app/google-services.json
   ```

3. **Recompila el APK** en Android Studio:
   - Build → Clean Project
   - Build → Rebuild Project
   - Build → Generate Signed Bundle / APK

4. **Instala el nuevo APK** en tu teléfono

5. **Prueba el login con Google** → ¡Ahora funcionará! ✅

---

## 💡 Consejos Importantes

### **Agrega AMBOS SHA-1** (Recomendado)

1. **SHA-1 del debug keystore** → Para probar mientras desarrollas
2. **SHA-1 del keystore de producción** → Para la app final en Play Store

Firebase te permite tener múltiples SHA-1. Agrega ambos para que funcione siempre.

### **Si sigues teniendo problemas**

1. Verifica que el package name sea exactamente: `com.daiary.chefai`
2. Desinstala la app vieja del teléfono antes de instalar la nueva
3. Asegúrate de haber descargado el nuevo google-services.json
4. Limpia y recompila el proyecto en Android Studio

---

## 🎯 Resumen Visual

```
1. Obtener SHA-1
   ↓
2. Ir a Firebase Console (chef-ai-b08d8)
   ↓
3. Agregar SHA-1 en "SHA certificate fingerprints"
   ↓
4. Descargar nuevo google-services.json
   ↓
5. Reemplazar en android/app/google-services.json
   ↓
6. Recompilar APK
   ↓
7. ¡Google Sign-In funciona!
```

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué no funciona el login con email/password?**
R: Email/password SÍ funciona, solo Google Sign-In necesita SHA-1.

**P: ¿Tengo que hacer esto cada vez que compilo?**
R: No, solo una vez. Cuando ya está configurado, funciona siempre.

**P: ¿El SHA-1 cambia?**
R: Solo si cambias de keystore. Si usas el mismo keystore, el SHA-1 es siempre igual.

**P: ¿Puedo probar sin hacer esto?**
R: Sí, usa login con email/password mientras tanto. Google Sign-In requiere este paso.

---

## 🔗 Enlaces Útiles

- Firebase Console: https://console.firebase.google.com/project/chef-ai-b08d8
- Documentación oficial: https://firebase.google.com/docs/android/setup

---

**¡Esto toma solo 5 minutos y luego funciona para siempre!** 🚀
