# 🎯 Guía Simplificada: Configurar RevenueCat para Chef AI

Esta guía te ayudará a configurar RevenueCat paso a paso, sin necesidad de conocimientos técnicos previos.

---

## 📌 INFORMACIÓN QUE NECESITAS TENER A MANO

Antes de empezar, ten estos datos listos:

- **Package name de tu app**: `com.daiary.chefai`
- **Nombre de tu app**: Chef AI
- **Tu email de Gmail** (el mismo que usas para Google Play)

---

## 🔵 PASO 1: Completar Google Play Package en RevenueCat

1. En la pantalla que tienes abierta de RevenueCat
2. Busca el campo **"Google Play package"**
3. Escribe exactamente esto: `com.daiary.chefai`
4. **NO HAGAS CLIC EN "Save changes" TODAVÍA** (lo haremos al final)

✅ **Listo con el primer campo**

---

## ☁️ PASO 2: Ir a Google Cloud Console

1. Abre una nueva pestaña en tu navegador
2. Ve a: **https://console.cloud.google.com**
3. Inicia sesión con tu cuenta de Google
4. Si te pregunta sobre crear proyecto, haz clic en **"Crear proyecto"**
5. Ponle de nombre: **Chef AI**
6. Haz clic en **"Crear"**
7. Espera 10 segundos y verás que el proyecto está activo

✅ **Ya tienes tu proyecto en Google Cloud**

---

## 🔌 PASO 3: Activar las APIs de Google Play

Necesitas activar 2 APIs. Aquí te explico cómo:

### Primera API:

1. En Google Cloud Console, busca la barra de búsqueda (arriba)
2. Escribe: **Google Play Android Developer API**
3. Haz clic en el resultado que aparece
4. Verás un botón azul que dice **"HABILITAR"** o **"ENABLE"**
5. Haz clic en él
6. Espera 5-10 segundos

### Segunda API:

1. En la misma barra de búsqueda, escribe: **Google Play Developer Reporting API**
2. Haz clic en el resultado
3. Haz clic en **"HABILITAR"** o **"ENABLE"**
4. Espera 5-10 segundos

✅ **APIs activadas correctamente**

---

## 👤 PASO 4: Crear Service Account (Cuenta de Servicio)

1. En el menú lateral izquierdo de Google Cloud Console, busca **"IAM y administración"** (o **"IAM & Admin"**)
2. Haz clic en **"Cuentas de servicio"** (o **"Service Accounts"**)
3. Arriba verás un botón **"+ CREAR CUENTA DE SERVICIO"** (o **"+ CREATE SERVICE ACCOUNT"**)
4. Haz clic ahí
5. Completa el formulario:
   - **Nombre**: `RevenueCat Chef AI`
   - **ID**: Se completará automáticamente (déjalo así)
   - **Descripción**: `Conexión con RevenueCat para suscripciones`
6. Haz clic en **"CREAR Y CONTINUAR"**

### Agregar permisos:

7. En "Otorgar acceso a este proyecto", haz clic en el cuadro **"Seleccionar un rol"**
8. En el buscador que aparece, escribe: **Pub/Sub Editor**
9. Selecciónalo
10. Haz clic en **"+ AGREGAR OTRO ROL"**
11. Busca y selecciona: **Monitoring Viewer**
12. Haz clic en **"CONTINUAR"**
13. Haz clic en **"LISTO"**

✅ **Service Account creada**

---

## 📥 PASO 5: Descargar el Archivo JSON (¡MUY IMPORTANTE!)

1. Verás una lista de cuentas de servicio
2. Busca la que acabas de crear: **RevenueCat Chef AI**
3. Al final de la fila, verás 3 puntos verticales **⋮**
4. Haz clic en esos 3 puntos
5. Selecciona **"Administrar claves"** (o **"Manage Keys"**)
6. Haz clic en **"AGREGAR CLAVE"** (o **"ADD KEY"**)
7. Selecciona **"Crear clave nueva"** (o **"Create new key"**)
8. Te preguntará el tipo: selecciona **JSON**
9. Haz clic en **"CREAR"**
10. **Se descargará automáticamente un archivo** con un nombre largo que termina en `.json`
11. **¡GUARDA ESTE ARCHIVO EN UN LUGAR SEGURO!** Lo necesitarás en el siguiente paso

✅ **Archivo JSON descargado** - ¡No lo pierdas!

---

## 🎮 PASO 6: Conectar con Google Play Console

⚠️ **IMPORTANTE**: Para hacer este paso, primero debes:
- Haber creado tu cuenta de Google Play Developer (pago de $25 USD)
- Haber subido tu app a Google Play Console (aunque sea como borrador)

Si ya lo hiciste, continúa:

1. Ve a: **https://play.google.com/console**
2. Selecciona tu app **Chef AI**
3. En el menú lateral, busca **"Configuración"** → **"Acceso a API"** (o **"Setup"** → **"API access"**)
4. Busca la sección de **"Cuentas de servicio"**
5. Verás listada la cuenta que creaste (email largo que termina en `.iam.gserviceaccount.com`)
6. Haz clic en **"Otorgar acceso"** o **"Grant access"**
7. Marca estas 3 casillas:
   - ✅ Ver información de la app y descargar informes masivos
   - ✅ Ver datos financieros, pedidos y respuestas
   - ✅ Administrar pedidos y suscripciones
8. En **"Aplicaciones"**, selecciona tu app **Chef AI**
9. Haz clic en **"Invitar usuario"** o **"Apply"**
10. Confirma que el estado dice **"Activo"** o **"Active"**

✅ **Service Account conectado a Google Play**

---

## 📤 PASO 7: Subir el JSON a RevenueCat

1. Busca el archivo JSON que descargaste en el PASO 5
2. Ábrelo con cualquier editor de texto:
   - En Windows: Bloc de notas
   - En Mac: TextEdit
   - O simplemente arrástralo a tu navegador
3. **Copia TODO el contenido** del archivo (Ctrl+A, Ctrl+C en Windows o Cmd+A, Cmd+C en Mac)
4. Regresa a la pestaña de RevenueCat donde estabas configurando
5. Busca el campo **"Service Account Credentials JSON"**
6. Haz clic en **"Drop a file here, or click to select"**
7. **Opción A**: Pega el contenido que copiaste (Ctrl+V o Cmd+V)
   **Opción B**: Arrastra el archivo .json directamente al cuadro
8. Ahora sí, haz clic en **"Save changes"** (abajo a la derecha)

✅ **¡Configuración completada!**

---

## ⏰ IMPORTANTE: Tiempo de Espera

Después de guardar, RevenueCat mostrará un mensaje que dice algo como "validating credentials" (validando credenciales).

**ES NORMAL QUE ESTO TARDE HASTA 36 HORAS** ⏱️

No te preocupes si ves errores durante las primeras horas. Google tarda en activar las credenciales.

---

## ✅ VERIFICACIÓN FINAL

Para saber si todo funcionó:

1. Espera al menos 24-48 horas
2. Regresa a RevenueCat → Tu proyecto → Platforms → Play Store
3. Si ves un check verde ✅, ¡todo está perfecto!
4. Si ves un error rojo, espera un poco más o revisa que seguiste todos los pasos

---

## 🆘 ¿Problemas?

### "No puedo hacer el PASO 6 porque no tengo la app en Google Play"

**Solución**: 
1. Primero construye la app Android con Android Studio (sigue MOBILE_BUILD.md)
2. Genera un AAB firmado
3. Súbelo a Google Play Console como "Internal Testing"
4. Luego regresa al PASO 6

### "El archivo JSON no se descarga"

**Solución**: 
- Revisa tu carpeta de Descargas
- Intenta con otro navegador (Chrome funciona mejor)
- Asegúrate de tener permisos de descarga

### "RevenueCat dice que el JSON es inválido"

**Solución**:
- Asegúrate de copiar TODO el contenido del archivo (debe empezar con `{` y terminar con `}`)
- No modifiques nada del contenido
- Intenta arrastrando el archivo en lugar de pegar

---

## 📋 CHECKLIST COMPLETO

Marca cada paso cuando lo completes:

- [ ] Paso 1: Escribí el package name en RevenueCat
- [ ] Paso 2: Creé proyecto en Google Cloud Console
- [ ] Paso 3: Activé las 2 APIs de Google Play
- [ ] Paso 4: Creé la Service Account con los permisos
- [ ] Paso 5: Descargué el archivo JSON
- [ ] Paso 6: Conecté la Service Account en Google Play Console
- [ ] Paso 7: Subí el JSON a RevenueCat y guardé cambios
- [ ] Esperé 24-48 horas para validación

---

## 🎉 ¡Todo Listo!

Una vez que RevenueCat valide las credenciales, tu sistema de suscripciones estará completamente funcional.

Los usuarios podrán:
- ✅ Suscribirse desde la app Android
- ✅ Suscribirse desde la app web
- ✅ Ver su estado de suscripción
- ✅ Acceder a las funciones premium

---

**¿Necesitas más ayuda?** Puedes contactar al soporte de RevenueCat o revisar su documentación en: https://www.revenuecat.com/docs
