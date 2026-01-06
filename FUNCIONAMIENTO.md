# Arquitectura y Funcionamiento de NutriPeque AI

Este documento detalla cómo **NutriPeque AI** obtiene datos, procesa información nutricional y utiliza Modelos de Lenguaje (LLMs) para asistir en la nutrición pediátrica.

---

## 1. ¿De dónde salen los valores nutricionales?

El sistema utiliza un **enfoque híbrido** para la gestión de datos, combinando bases de datos deterministas con inferencia probabilística (IA).

### A. Objetivos Nutricionales (Cálculo Determinista)
Los objetivos diarios (meta de hierro, calcio, calorías, etc.) **NO usan IA**. Se calculan mediante fórmulas matemáticas estrictas basadas en guías pediátricas estándar (RDA/DRI) ubicadas en `constants.ts`.
*   **Entrada:** Edad (meses) y Peso (kg) del niño.
*   **Proceso:** Algoritmo lógico (`calculateTargets`).
*   **Fiabilidad:** 100% consistente con las reglas programadas.

### B. Registro de Alimentos (Inferencia por IA)
Cuando un usuario ingresa "Comió medio plátano", el sistema **no** busca en una base de datos SQL tradicional. En su lugar, utiliza la **API de Google Gemini**.
*   **El Rol de la IA:** Gemini actúa como una "Base de Datos Nutricional Semántica". El modelo ha sido entrenado con terabytes de información que incluyen tablas nutricionales (USDA, etc.).
*   **El Proceso:**
    1.  Se envía el texto vago ("un puñado de uvas") y la edad del niño al LLM.
    2.  El LLM estima el gramaje basándose en el apetito promedio para esa edad (Prompt Engineering).
    3.  El LLM devuelve un objeto JSON con los micro y macronutrientes estimados basándose en su conocimiento interno.

### C. Recomendaciones Inversas (Lógica Híbrida)
Para sugerir alimentos que cierren brechas (ej. falta hierro):
1.  **Detección:** Código lógico matemático detecta el déficit (`targets - current`).
2.  **Selección:** Busca en una **Base de Datos Local Rígida** (`FOOD_DATABASE` en `constants.ts`). Esto asegura que las sugerencias sean alimentos controlados y seguros, no alucinaciones de la IA.

---

## 2. ¿Dónde se usa Inteligencia Artificial (LLM) y para qué?

La aplicación utiliza el modelo **Gemini 3 Flash** en dos puntos críticos:

### 1. Motor de Interpretación y Cuantificación (`geminiService.ts` -> `parseFoodInput`)
*   **Función:** Convertir lenguaje natural ambiguo en datos estructurados.
*   **Por qué IA:** Una base de datos tradicional fallaría con entradas como "se comió las sobras de mi sándwich" o "media manzana pequeña". La IA entiende el contexto, estima el tamaño de la porción según la edad del niño (calibración contextual) y extrae los nutrientes.

### 2. Chef Generativo (`geminiService.ts` -> `getSmartRecipe`)
*   **Función:** Crear micro-recetas o consejos de preparación.
*   **Por qué IA:** Para dar contexto humano. En lugar de decir simplemente "Dale Hígado", la IA genera: *"Para mejorar la absorción del hierro, ofrece el hígado salteado con un poco de jugo de naranja (Vitamina C)"*. Aplica reglas de sinergia nutricional dinámicamente.

---

## 3. Fiabilidad Científica y Precisión

### ¿Qué tan correcto es el sistema?

1.  **Estimación de Porciones (Nivel de Confianza: Medio-Alto):**
    *   La IA es excelente estimando promedios. Sin embargo, "medio plátano" puede pesar 40g o 60g dependiendo de la fruta real. El sistema ofrece una **estimación educada**, no una medición de laboratorio. Para el seguimiento de hábitos a largo plazo, esta precisión es suficiente y mucho más útil que no registrar nada.

2.  **Valores de Nutrientes (Nivel de Confianza: Alto):**
    *   Los modelos como Gemini tienen "memorizados" los valores nutricionales estándar. Son muy fiables para alimentos comunes (huevo, manzana, pollo). Pueden ser menos precisos para alimentos procesados de marcas específicas (ej. "Galletas marca X") si no se le dan los ingredientes.

3.  **Lógica de Déficit (Nivel de Confianza: Muy Alto):**
    *   Al usar lógica programática (`if iron < 7`) y no IA para calcular las brechas, el sistema evita "alucinaciones" matemáticas. La matemática es exacta.

### Limitaciones
*   **Alucinaciones:** Aunque raro en tareas de extracción JSON, la IA podría inventar un valor si el alimento no existe (ej. "Carne de unicornio").
*   **Variabilidad Biológica:** Los objetivos nutricionales son promedios poblacionales. Un niño específico podría necesitar más o menos según su metabolismo, algo que la app no puede saber sin análisis clínicos.

---

## Resumen Técnico

| Componente | Fuente de Datos / Tecnología | Tipo de Lógica |
| :--- | :--- | :--- |
| **Metas (RDA)** | Código (`constants.ts`) | Determinista (Exacta) |
| **Parsing de Comida** | **Google Gemini API** | Probabilística (Inferencia) |
| **Cálculo de Déficit** | Código (Resta matemática) | Determinista (Exacta) |
| **Sugerencia de Alimentos** | Base de Datos Local (`FOOD_DATABASE`) | Determinista (Segura) |
| **Generación de Recetas** | **Google Gemini API** | Creativa / Generativa |
