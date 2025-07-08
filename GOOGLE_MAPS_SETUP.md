# Google Maps API Setup Guide

## 1. Obtener la API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Maps:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**

## 2. Crear la API Key

1. Ve a **APIs & Services** > **Credentials**
2. Clic en **Create Credentials** > **API Key**
3. Copia la API Key generada

## 3. Configurar restricciones (Recomendado)

1. Clic en la API Key creada
2. En **Application restrictions**, selecciona **HTTP referrers**
3. Agrega los dominios permitidos:
   - `localhost:3000/*` (para desarrollo)
   - `your-domain.com/*` (para producción)

## 4. Configurar en el proyecto

1. Agrega la API Key en el archivo `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
   ```

2. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 5. Verificar la configuración

La implementación en `app/Book-Now/page.tsx` ya incluye:
- Importación de `useJsApiLoader` y `Autocomplete`
- Configuración de librerías `["places"]`
- Campos de input con autocomplete para pickup y drop-off locations

## Características implementadas

✅ **Pickup Location**: Campo con autocomplete de Google Maps
✅ **Drop-off Location**: Campo con autocomplete de Google Maps
✅ **Validación**: Los campos se validan automáticamente
✅ **Integración**: Los valores se envían correctamente al API
✅ **UI/UX**: Diseño consistente con el resto de la aplicación

## Estructura del modal actualizada

El modal de confirmación de cita ahora incluye:
- Información del instructor y cita
- **Nuevo**: Campo de Pickup Location con autocomplete
- **Nuevo**: Campo de Drop-off Location con autocomplete
- Selección de método de pago
- Botones de acción

## Troubleshooting

- **Error de API Key**: Verifica que la key esté correctamente configurada en `.env.local`
- **Autocomplete no funciona**: Asegúrate de que la Places API esté habilitada
- **Problemas de red**: Verifica las restricciones de dominio en Google Cloud Console