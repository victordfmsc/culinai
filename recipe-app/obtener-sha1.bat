@echo off
echo ===============================================================
echo     SCRIPT PARA OBTENER SHA-1 DE TU KEYSTORE (WINDOWS)
echo ===============================================================
echo.

echo Que SHA-1 necesitas obtener?
echo.
echo 1) SHA-1 de DEBUG (para probar en desarrollo)
echo 2) SHA-1 de PRODUCCION (para la app final)
echo.
set /p option="Elige una opcion (1 o 2): "

echo.

if "%option%"=="1" (
    echo Obteniendo SHA-1 del DEBUG keystore...
    echo.
    keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
) else if "%option%"=="2" (
    set /p keystore_path="Ingresa la ruta completa de tu keystore: "
    set /p key_alias="Ingresa el alias de tu keystore (ej: chef-ai-key): "
    echo.
    echo Obteniendo SHA-1...
    keytool -list -v -keystore "%keystore_path%" -alias %key_alias%
) else (
    echo Opcion invalida
    exit /b 1
)

echo.
echo ===============================================================
echo BUSCA LA LINEA QUE DICE:
echo SHA1: XX:XX:XX:XX:XX:...
echo.
echo COPIA ese valor completo y agregalo en Firebase Console:
echo https://console.firebase.google.com/project/chef-ai-b08d8/settings/general
echo ===============================================================
pause
