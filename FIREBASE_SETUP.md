# Configuración de Variables de Entorno para Firebase

## Configuración Inicial

1. **Copia el archivo de ejemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Obtén las credenciales del Admin SDK:**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto
   - Ve a **Configuración del proyecto** → **Cuentas de servicio**
   - Haz clic en **Generar nueva clave privada**
   - Descarga el archivo JSON

3. **Completa las variables en `.env`:**
   - Copia los valores del archivo JSON descargado
   - La `FIREBASE_PRIVATE_KEY` debe mantener los `\n` como texto literal

## Uso del Script de Admin

Para configurar un usuario como administrador:

```bash
npm run set-admin usuario@ejemplo.com
```

## Variables de Entorno Requeridas

### Cliente (Públicas)
- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`

### Admin SDK (Privadas)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
- `FIREBASE_AUTH_URI`
- `FIREBASE_TOKEN_URI`
- `FIREBASE_AUTH_CERT_URL`
- `FIREBASE_CLIENT_CERT_URL`

⚠️ **Importante:** Nunca commitees el archivo `.env` al repositorio.
