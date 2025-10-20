#!/bin/bash

echo "═══════════════════════════════════════════════════════"
echo "    SCRIPT PARA OBTENER SHA-1 DE TU KEYSTORE"
echo "═══════════════════════════════════════════════════════"
echo ""

# Función para obtener SHA-1 del debug keystore
get_debug_sha1() {
    echo "Obteniendo SHA-1 del DEBUG keystore..."
    echo ""
    
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        keytool -list -v -keystore "$USERPROFILE/.android/debug.keystore" -alias androiddebugkey -storepass android -keypass android
    else
        # Mac/Linux
        keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
    fi
}

# Función para obtener SHA-1 del keystore de producción
get_release_sha1() {
    echo "Ingresa la ruta completa de tu keystore de producción:"
    read -r keystore_path
    
    echo "Ingresa el alias de tu keystore (ej: chef-ai-key):"
    read -r key_alias
    
    echo ""
    echo "Obteniendo SHA-1..."
    keytool -list -v -keystore "$keystore_path" -alias "$key_alias"
}

echo "¿Qué SHA-1 necesitas obtener?"
echo ""
echo "1) SHA-1 de DEBUG (para probar en desarrollo)"
echo "2) SHA-1 de PRODUCCIÓN (para la app final)"
echo ""
echo "Elige una opción (1 o 2):"
read -r option

echo ""

case $option in
    1)
        get_debug_sha1
        ;;
    2)
        get_release_sha1
        ;;
    *)
        echo "Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "═══════════════════════════════════════════════════════"
echo "BUSCA LA LÍNEA QUE DICE:"
echo "SHA1: XX:XX:XX:XX:XX:..."
echo ""
echo "COPIA ese valor completo y agrégalo en Firebase Console:"
echo "https://console.firebase.google.com/project/chef-ai-b08d8/settings/general"
echo "═══════════════════════════════════════════════════════"
