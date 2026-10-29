# Contexto del laboratorio 04 de Análisis de Datos

## Propósito y preferencias

Este archivo conserva el contexto del laboratorio entre chats dentro de este repositorio. El usuario eligió explícitamente la **variante 22**. Comunicarse con él en español. Los materiales académicos originales están en ruso; existen traducciones al español para facilitar su lectura. No cambiar la variante basándose en la regla general del documento sobre el último dígito del carnet.

Este contexto corresponde a `lab04/`. No aplicar sus requisitos a otros laboratorios. Antes de continuar una implementación, revisar los archivos actuales: el estado descrito aquí es una referencia del 28 de octubre de 2026, no una garantía de que el trabajo siga igual.

## Archivos de referencia

- `lab04/teoria/Лабораторная_работа_4_Векторное_представление_слов.docx`: enunciados de las variantes y condiciones sobre los textos. Su versión española es `lab04/teoria/PDFespaniol/Лабораторная_работа_4_Векторное_представление_слов_es.docx`.
- `lab04/teoria/04_Методические_указания_к_работе.docx`: guía metodológica, fórmulas, recomendaciones, preguntas de control y requisitos del informe. Traducción: `lab04/teoria/PDFespaniol/04_Методические_указания_к_работе_es.docx`.
- `lab04/teoria/Векторное_представление_слов_теория.docx`: fundamentos de BoW y TF-IDF, ejemplos y limitaciones. Traducción equivalente con sufijo `_es.docx` en `PDFespaniol/`.
- `lab04/teoria/К_ЛР4_Библиотека_pymorphy3_+_доп_задание.docx`: morfología rusa, ejemplos de pymorphy3 y ejercicios adicionales. Traducción equivalente con sufijo `_es.docx` en `PDFespaniol/`.
- `lab04/task/task.ipynb`: archivo previsto para el cuaderno de solución.
- `lab04/task/requirements.txt`: dependencias declaradas.

Consultar el original ruso para resolver discrepancias de traducción. Las fórmulas de Word pueden estar en objetos matemáticos OOXML (`m:oMath`), por lo que extraer solamente párrafos de texto puede omitirlas. Los archivos `.~lock.*` son bloqueos del editor, no material académico ni entregables.

## Objetivo general y alcance

El laboratorio se titula «Representación vectorial de palabras». Estudia el procesamiento de textos en ruso: preprocesamiento, representación mediante BoW, TF y TF-IDF e interpretación de resultados. La guía también cubre similitud, agrupamiento, grafos, sentimiento y evaluación, según la variante.

La variante 22 pertenece al **nivel 5, avanzado, hasta 8 puntos**. No asumir que obliga a implementar todas las variantes anteriores ni todos los temas de la guía. Los ejercicios adicionales de pymorphy3 son material complementario; no se ha confirmado que el docente exija entregarlos junto con la variante 22.

## Enunciado de la variante 22

Comparar dos enfoques sobre **dos textos**:

1. TF-IDF sin filtrado por frecuencia documental.
2. TF-IDF con filtrado por frecuencia documental: eliminar palabras presentes en **menos de dos documentos**, es decir, conservar `df(t) >= 2`.

Para cada texto, mostrar las cinco palabras principales de cada enfoque y explicar cómo cambia el conjunto de palabras clave y por qué importa. Añadir métricas cuantitativas: proporción de palabras exclusivas en los tops, proporción de palabras comunes y proporción de palabras que aparecen en el top únicamente después del filtrado. Implementar las métricas en un método independiente.

El enunciado general exige seleccionar por cuenta propia textos de **200–400 palabras cada uno**. Para esta variante aún no hay un corpus seleccionado en los archivos revisados. Utilizar textos rusos es coherente con la guía y con pymorphy3; conservar texto original, título y procedencia, y registrar el conteo antes del preprocesamiento.

Interpretar «sin filtrado» como sin el filtro experimental de frecuencia documental. Mantener el mismo preprocesamiento básico en ambas ramas para que la comparación aísle el efecto de `min_df=2`. Documentar cualquier decisión adicional.

## Teoría que debe sustentar la solución

### Preprocesamiento y morfología

- Tokenizar: dividir el texto en palabras; limpiar puntuación antes del análisis morfológico.
- Normalizar mayúsculas/minúsculas y definir explícitamente qué hacer con abreviaturas, números y palabras con guion. La guía presenta preservación de abreviaturas y sustitución de números por `<NUM>` como técnicas, pero no son exigencias particulares de la variante 22.
- Eliminar palabras vacías, por ejemplo con `nltk.corpus.stopwords.words('russian')`. El filtrado por longitud, típicamente menos de tres caracteres, debe ser consistente entre ramas si se utiliza.
- Lematizar con `pymorphy3.MorphAnalyzer()`: `morph.parse(token)[0].normal_form`. Reutilizar el analizador. El primer análisis es el más probable según el analizador, pero no garantiza desambiguación contextual.
- Lematización: forma de diccionario, por ejemplo `студентами → студент` y `учатся → учиться`. Stemming: recorte aproximado de terminaciones que puede no producir una palabra válida.
- pymorphy3 permite consultar POS, género, número, caso y tiempo, además de declinar. El filtrado por POS es una opción complementaria, no una obligación específica de esta variante.
- Calcular la frecuencia documental después de lematizar: formas flexionadas de la misma palabra deben contar como un único término.

### BoW, TF, df e IDF

Para documentos `d` y vocabulario común `V`:

- `BoW[d,t] = count(t,d)`. Una fila por documento, una columna por término. La suma de una fila coincide con los tokens de ese documento que pertenecen al vocabulario de esa rama.
- `TF(t,d) = count(t,d) / sum_u count(u,d)`. Documentar si el denominador se recalcula después del filtro; usar una convención explícita y coherente. Para documento vacío, devolver ceros.
- `df(t) = número de documentos que contienen t`, contando cada documento una sola vez, no el número total de apariciones.
- `IDF(t) = log(N / df(t))`, fórmula clásica de referencia. Indicar la base del logaritmo; usar logaritmo natural es una decisión válida si se declara.
- `TF-IDF(t,d) = TF(t,d) * IDF(t)`.
- Si `df=N`, el IDF clásico vale cero; los términos exclusivos reciben más peso.
- La guía también presenta `log((N+1)/(df+1)) + 1`, al estilo sklearn, y `log((N+c)/(df+c))`. No confundir estas fórmulas entre sí: el `+1` exterior cambia el peso de las palabras comunes.

Priorizar una implementación manual de BoW/TF/IDF para que la solución explique los cálculos, conforme al enfoque didáctico de la guía. No atribuir a la variante 22 una prohibición textual de bibliotecas que su enunciado no explicita. Una comparación con sklearn puede ser complementaria, pero sus opciones por defecto no equivalen a TF normalizado por longitud e IDF clásico: incluye suavizado, constante exterior y normalización L2.

BoW y TF-IDF pierden el orden de palabras, no capturan sinonimia ni significado contextual y dependen del corpus. Las representaciones son potencialmente dispersas: CSR de scipy permite guardar solo valores no nulos. Evitar densificar matrices grandes innecesariamente.

### Caso central de la variante 22: degeneración con dos documentos

Con exactamente dos documentos, conservar `df>=2` significa conservar solo términos presentes en ambos. Por tanto, bajo IDF clásico:

`N=2`, `df=2`, `IDF=log(2/2)=0`.

**Toda la matriz TF-IDF filtrada será cero**, o tendrá cero columnas si los textos no comparten lemas. Esto es una consecuencia matemática del enunciado, no necesariamente un error de implementación. El IDF suavizado sin constante exterior también da cero para esos términos.

- Explicar este resultado en tablas y conclusiones. El filtro elimina precisamente los términos que distinguían ambos documentos.
- No presentar cinco términos empatados en cero como palabras clave relevantes. Se puede mostrar un top formal de candidatos con sus pesos cero y una advertencia clara, o informar que no hay términos de peso positivo. Si hay menos de cinco candidatos, mostrar los disponibles sin inventar palabras.
- Separar las métricas sobre tops formales de las métricas sobre palabras de peso positivo si se presentan ambas. Los empates en cero pueden hacer que las métricas dependan de la regla de ordenación.
- Usar orden determinista, por ejemplo peso descendente y lema ascendente en empates.
- Si se quiere añadir una comparación informativa con `log((N+1)/(df+1))+1`, etiquetarla como experimento adicional y aplicar la misma fórmula a ambas ramas de ese experimento. No sustituir silenciosamente el análisis clásico.
- Una palabra «nueva después del filtrado» es nueva en el top, no en el vocabulario: el filtro no crea términos.

### Métricas de comparación

El enunciado pide proporciones, pero no fija todos los denominadores ni aclara por completo si cada comparación es entre enfoques o entre documentos. Declarar la convención utilizada. Una propuesta para comparar enfoques por documento es:

- `A`: conjunto de términos del top sin filtro; `B`: conjunto del top con filtro.
- Comunes: `|A ∩ B| / |A ∪ B|` (Jaccard).
- Exclusivas: `|A △ B| / |A ∪ B|`, equivalente a `1-Jaccard` cuando la unión no está vacía; la guía usa esta definición.
- Nuevas tras el filtro: `|B - A| / |B|`.

Definir explícitamente qué se devuelve para conjuntos vacíos; una convención operativa es cero cuando el denominador es cero, señalando que no hubo candidatos. No aplicar `exclusivas=1-comunes` a la unión vacía con esa convención. Devolver también conjuntos y tamaños facilita interpretar las proporciones. Si se compara además el top del documento 1 con el del documento 2, etiquetar esa comparación por separado.

## Otros conceptos de la guía

Son contexto teórico general; no ampliar automáticamente la entrega de la variante 22 para incluirlos:

- Coseno: `dot(a,b)/(norm(a)*norm(b))`; requiere una convención para vectores nulos. La diagonal de la matriz es uno solo para vectores no nulos.
- Normalización L2: dividir por la norma; mantener cero los vectores nulos. Tras normalizar vectores no nulos, el coseno coincide con el producto escalar.
- N-gramas conservan secuencias locales y aumentan el vocabulario.
- K-means, agrupamiento jerárquico y dendrogramas agrupan documentos; silueta y distancias intra/intergrupo permiten evaluar los grupos.
- NetworkX permite construir grafos por umbral de similitud y calcular centralidad de grado.
- Matplotlib y seaborn permiten visualizar pesos y matrices.
- Precisión, exhaustividad y F1 comparan términos extraídos con una referencia.
- La guía incluye logging, reproducibilidad, pruebas y procesamiento tabular con Polars como temas metodológicos.

## Estado del trabajo y entorno

En la revisión del 28 de octubre de 2026:

- `lab04/task/task.ipynb` tenía **0 bytes**: todavía no era un cuaderno JSON válido ni contenía una solución o resultados.
- `lab04/task/requirements.txt` declaraba: numpy, scipy, scikit-learn, pymorphy3, nltk, matplotlib, seaborn, networkx, gensim y pandas; sin versiones fijadas.
- Existía el entorno local `lab04/task/.venv312/`. Su presencia no demuestra que todas las dependencias funcionen ni que las pruebas se hayan ejecutado.
- La guía pide Python 3.10 o superior y menciona polars, pytest y joblib como adicionales para puntuación máxima. No estaban declarados en el requirements revisado.
- No se había implementado ni ejecutado la variante, seleccionado textos ni generado un informe en los archivos revisados.

No sobrescribir trabajo posterior del usuario ni confundir ejemplos de los documentos con resultados reales. No versionar entornos virtuales, bloqueos del editor o archivos temporales de extracción.

## Organización sugerida y comprobaciones

Una implementación razonable separa preprocesamiento, cálculo de BoW/TF-IDF, filtro por `df`, extracción de tops y cálculo de métricas. Los nombres de clases concretos de la variante 21 no son requisitos de la 22.

Verificar especialmente: frecuencia documental frente a frecuencia total; exclusión de términos con `df=1`; degeneración a cero con dos textos e IDF clásico; vocabulario filtrado vacío; documentos vacíos; empates; menos de cinco términos; métricas con conjuntos iguales, disjuntos y vacíos; ausencia de divisiones por cero; reproducibilidad. La guía recomienda casos habituales, extremos y límite, tolerancias numéricas y docstrings en funciones públicas.

## Entregables y explicación académica

La guía solicita código Python en un cuaderno y un informe en Markdown o PDF. El informe debe incluir portada (nombre, grupo, variante y fecha), enunciado, arquitectura, fragmentos de código relevantes, resultados, interpretación, conclusiones y fuentes externas. Responder las preguntas de control según indique el docente. No inventar datos personales.

Para la variante 22, priorizar: descripción y procedencia de los dos textos, preprocesamiento común, fórmulas utilizadas, vocabularios antes/después, tablas de hasta cinco términos por documento y enfoque con pesos, métricas con denominadores explícitos y explicación de la pérdida de poder discriminativo. Los dendrogramas, grafos y matrices de similitud de otras variantes no son requisitos específicos de esta.

Mantener actualizado este archivo cuando se tomen decisiones sobre corpus, fórmula, métricas o estructura, y cuando cambie el estado real de implementación. Distinguir siempre requisitos de los documentos, decisiones del usuario y recomendaciones de implementación.

## Decisiones posteriores sobre el corpus

El usuario pidió utilizar textos originales generados por el asistente en ruso, en lugar del artículo completo de Wikipedia. Ambos archivos contienen 335 palabras cada uno según separación por espacios, incluido el título:

- `lab04/task/солнечная_энергетика.txt`: trata sobre cambio climático; el nombre se conservó por petición del usuario aunque el tema cambió. Reemplaza la extracción anterior de Wikipedia y ya no contiene texto de esa fuente.
- `lab04/task/возобновляемая_энергетика.txt`: trata sobre energías renovables (solar, eólica e hidráulica), redes, almacenamiento y transición energética.

Estos son los textos elegidos actualmente para la comparación. Declarar su origen como textos generados por el asistente, sin atribuirlos a Wikipedia. La descripción inicial de corpus pendiente queda superada por esta decisión. El usuario prefiere avanzar paso a paso con explicaciones sencillas del código.


### Actualización del corpus: estadísticas (28 de octubre de 2026)

- `lab04/task/texts/climateChange.txt`: 33 palabras añadidas; 368 palabras totales, incluido el título.
- `lab04/task/texts/renewableEnergy.txt`: 35 palabras añadidas; 370 palabras totales, incluido el título.

El cuerpo sigue siendo generado por el asistente. Se incorporaron estadísticas verificadas en ruso: nivel del mar (0,20 m entre 1901 y 2018; 3,7 mm/año entre 2006 y 2018), según IPCC: https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/ ; generación eléctrica renovable (34% en 2025 frente a 23% diez años antes; eólica y solar fotovoltaica: 17% en 2025 y 15% en 2024), según IEA: https://www.iea.org/reports/global-energy-review-2026/electricity-supply . Estas rutas y conteos sustituyen los anteriores del corpus.
