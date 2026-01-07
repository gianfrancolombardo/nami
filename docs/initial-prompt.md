# ROL:
Actúa como un equipo multidisciplinario compuesto por:
1. Un Nutricionista Pediátrico Senior (especializado en alimentación de 12 a 36 meses y nutrición óptima).
2. Un Product Manager experto en "Behavioral Design" (Diseño del comportamiento).
3. Un Diseñador UI/UX experto en visualización de datos.

# OBJETIVO DEL PRODUCTO:
Diseñar la arquitectura lógica, funcional y visual de una aplicación móvil llamada "NutriToddler AI".
El objetivo no es solo registrar comida, sino actuar como un COPILOTO INTELIGENTE que garantiza la nutrición óptima del niño. La app debe eliminar la carga mental de los padres diciéndoles exactamente QUÉ y CUÁNTO dar de comer para cubrir los requerimientos del día.

# FILOSOFÍA NUTRICIONAL (Base de Conocimiento):
La app debe basarse en estándares de "Nutrición Óptima" (no solo mínimos de supervivencia).
- Prioridad a alimentos densos en nutrientes (Superfoods reales: huevo, legumbres, pescados grasos, brócoli).
- Enfoque en micronutrientes críticos para el neurodesarrollo: Hierro, Calcio, Omega-3 (DHA), Zinc, Vitamina D.
- Sinergia de alimentos: La app debe saber que el Hierro se absorbe mejor con Vitamina C.

# REQUERIMIENTOS FUNCIONALES CLAVE:

1. DASHBOARD TIPO "HEADS-UP DISPLAY" (HUD):
   - Visualización principal mediante BARRAS DE PROGRESO horizontales (Progress Bars).
   - Categorías: Macros (Proteína, Grasa, Carbo), Micros Críticos (Hierro, Calcio, Vit D) y Grupos (Verduras, Frutas).
   - Las barras se llenan en tiempo real y se resetean cada 24 horas.

2. EL "MOTOR DE RECOMENDACIÓN INVERSA" (La función Estrella):
   - En la parte superior, un widget de "Acción Requerida".
   - Lógica: Si al niño le faltan 4mg de Hierro a las 5:00 PM, la app NO debe decir "Falta Hierro". Debe decir: "Falta Hierro. Sugerencia para la cena: Dale 40g de Lentejas o 30g de Ternera".
   - El motor debe calcular la cantidad exacta (gramaje) necesaria para cerrar la brecha nutricional del día.

3. REGISTRO DE DATOS (INPUT):
   - Búsqueda predictiva e ingreso por gramos o porciones caseras.
   - Feedback inmediato: Al ingresar "Espinacas", la barra de Hierro y Vitamina A debe crecer visualmente al instante.

4. HISTÓRICO Y ANALÍTICA:
   - "Mapa de Calor Nutricional": Calendario visual donde verde oscuro es nutrición óptima y colores pálidos son días deficientes.
   - Detección de patrones: Alerta semanal tipo "Esta semana el consumo de pescado fue bajo, intenta reforzar Omega-3 el fin de semana".

# REQUERIMIENTOS DE UX/UI (Patrones de Diseño):

- **Divulgación Progresiva:** Muestra primero si el día está "OK" o "Incompleto". Solo muestra los detalles de vitaminas específicas si el usuario hace drill-down (clic).
- **Prevención de Errores:** Si el usuario intenta cerrar el día con déficit grave, una notificación suave (Nudge) sugiere un snack rápido (ej. "Un vaso de leche antes de dormir completaría el Calcio").
- **Diseño Emocional:** Uso de colores cálidos y refuerzo positivo. No regañar al padre, sino empoderarlo con soluciones.

# ENTREGABLE SOLICITADO:
1. **Estructura de la Base de Datos (Esquema conceptual):** Cómo se relacionan los Alimentos, Nutrientes y las "Reglas de Sugerencia".
2. **User Flow del "Copiloto":** Paso a paso de cómo la app detecta un déficit y sugiere el alimento exacto.
3. **Descripción de Pantallas:** Detalle de los componentes de la interfaz para el Dashboard y el Buscador.