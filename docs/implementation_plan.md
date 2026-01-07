# Plan de Implementación - Integración Firebase y Mejoras

# Descripción del Objetivo
Integrar Firebase Firestore para el almacenamiento persistente de datos (Perfiles de niños y Registros diarios) para evitar la pérdida de datos al recargar. Además, ampliar significativamente la base de datos de alimentos integrada utilizando generación por IA y mejorar la retroalimentación de la interfaz de usuario para acciones asíncronas.

## Revisión de Usuario Requerida
> [!IMPORTANT]
> **Configuración de Firebase**: Se creará un archivo `.env`. El usuario DEBE completar esto con las credenciales de su propio proyecto Firebase (API Key, Project ID, etc.) para que la aplicación funcione. Se proporcionarán valores de marcador de posición (placeholders).

## Cambios Propuestos

### Configuración
#### [NUEVO] [.env](file:///c:/Universo/repos/nami/.env)
- Agregar `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc.

#### [NUEVO] [src/firebaseConfig.ts](file:///c:/Universo/repos/nami/src/firebaseConfig.ts)
- Inicializar Firebase App e instancia de Firestore.

### Servicios
#### [NUEVO] [src/services/db.ts](file:///c:/Universo/repos/nami/src/services/db.ts)
- Implementar clase/funciones `FirestoreService`.
- **Modelo de Datos**:
    - `profiles` (Colección): Almacena `ChildProfile`.
    - `profiles/{profileId}/daily_logs` (Sub-colección):
        - *Decisión*: Usar `profiles/{profileId}/logs/{YYYY-MM-DD}` para obtener fácilmente el "registro de hoy" para un niño específico.
        - Estructura del documento: `{ date: string, entries: FoodEntry[] }`.

### Aplicación Principal
#### [MODIFICAR] [src/App.tsx](file:///c:/Universo/repos/nami/src/App.tsx)
- Eliminar `useState` para valores iniciales de `profiles` y `logs` (comenzar vacío).
- Agregar `useEffect` para suscribirse a `FirestoreService.getProfiles()`.
- Actualizar `handleLogFood` para llamar a `FirestoreService.addFoodEntry()`.
- Actualizar `handleAddProfile` para llamar a `FirestoreService.createProfile()`.

### Base de Datos de Alimentos
#### [MODIFICAR] [src/constants.ts](file:///c:/Universo/repos/nami/src/constants.ts)
- **Expansión IA**: Realizaré una generación clara "one-shot" con IA para crear una lista robusta de más de 50 alimentos aptos para niños pequeños (frutas, verduras, proteínas, lácteos) con datos precisos de micronutrientes (Hierro, Calcio, Zinc) y reemplazar la pequeña lista actual.

#### [NUEVO] [scripts/expand_db_prompt.md](file:///c:/Universo/repos/nami/scripts/expand_db_prompt.md)
- Guardar el prompt utilizado para generar la base de datos para futura replicabilidad.

### Mejoras de UI
#### [MODIFICAR] [src/components/NutrientHUD.tsx](file:///c:/Universo/repos/nami/src/components/NutrientHUD.tsx)
- Agregar estado de carga (skeleton) si los datos se están obteniendo.

## Plan de Verificación
### Verificación Manual
1.  **Prueba de Persistencia**: Crear un perfil "Bebé de Prueba", registrar "1 plátano". Recargar página. Verificar que el perfil y el registro aún existan.
2.  **Base de Datos de Alimentos**: Verificar la lógica de "Recomendación Inversa" con nuevos alimentos. (ej. si falta Zinc, ¿sugiere "Ternera" o "Semillas de Calabaza" de la nueva lista?).
