# Laboratorio 03: plan para alcanzar 12 puntos

## Objetivo

Completar el ciclo de análisis exploratorio y modelado de regresión con Polars en el nivel 5, incluyendo procesamiento de datos a gran escala, optimización, explicabilidad, predicción conformal, inferencia causal, calibración y análisis de robustez.

## Decisión pendiente: variante

La variante depende de la última cifra del número de matrícula:

| Última cifra | Variante | Conjunto de datos |
|---:|---:|---|
| 1 | 5.1 | Mercari Price Suggestion |
| 2 | 5.2 | **Avito Demand Prediction** |
| 3 | 5.3 | Zillow Home Value |
| 4 | 5.4 | Sberbank Housing Market |
| 5 | 5.5 | Rossmann Store Sales |
| 6 | 5.6 | Home Credit Default Risk |
| 7 | 5.7 | Elo Merchant Category |
| 8 | 5.8 | ASHRAE Energy Prediction |
| 9 | 5.9 | Restaurant Revenue Prediction |
| 0 | 5.10 | Google Store Customer Revenue |

Antes de implementar el notebook hay que confirmar la última cifra de la matrícula. Esto determinará el dataset, la variable objetivo, la ingeniería específica y la hipótesis causal.

## Plan de ejecución

### 1. Preparar el proyecto

- [ ] Crear `lab03/task/`.
- [ ] Crear el notebook principal `lab03_task.ipynb`.
- [ ] Preparar carpetas para datos, Parquet, figuras y modelos.
- [ ] Revisar las dependencias necesarias.
- [ ] Detectar si hay GPU disponible y preparar un fallback a CPU.
- [ ] Fijar semillas aleatorias y registrar versiones de las bibliotecas.

### 2. Obtener y documentar los datos

- [ ] Descargar el conjunto correspondiente a la variante.
- [ ] Registrar la fuente y las condiciones de uso.
- [ ] Identificar la variable objetivo.
- [ ] Describir variables numéricas, categóricas, textuales y temporales.
- [ ] Documentar el tamaño original y cualquier muestreo aplicado.

### 3. Cargar los datos con Polars

- [ ] Usar `scan_csv` o `scan_parquet` en lugar de cargar directamente todo en memoria.
- [ ] Mostrar las primeras diez filas.
- [ ] Calcular filas y columnas.
- [ ] Mostrar `schema` y corregir tipos.
- [ ] Contar valores nulos por variable.
- [ ] Mostrar y comentar el plan producido por `.explain()`.
- [ ] Convertir los datos a Parquet con `partition_by` cuando corresponda.
- [ ] Leer y procesar el conjunto mediante streaming.

### 4. Realizar el análisis exploratorio

- [ ] Comprobar duplicados y cardinalidad.
- [ ] Analizar los mecanismos plausibles de valores faltantes.
- [ ] Mostrar histogramas y diagramas de caja.
- [ ] Crear gráficos Q-Q para variables relevantes y residuos.
- [ ] Analizar relaciones mediante dispersión y gráficos por categoría.
- [ ] Calcular Pearson, Spearman y Cramer's V cuando corresponda.
- [ ] Detectar valores atípicos mediante IQR, z-score e Isolation Forest.
- [ ] Crear la variable categórica exigida por la variante.
- [ ] Calcular media, mediana y cantidad por categoría.
- [ ] Encontrar las categorías con valores medios mínimos y máximos del objetivo.

### 5. Diseñar una división sin fuga de datos

- [ ] Separar entrenamiento, validación o calibración y prueba.
- [ ] Usar división temporal o por grupos si la estructura del dataset lo exige.
- [ ] Reservar la prueba para la evaluación final.
- [ ] Ajustar imputadores, codificadores, escaladores, PCA y selectores solamente con entrenamiento.

### 6. Preprocesamiento e ingeniería de características

- [ ] Imputar faltantes o crear una categoría `missing`, según el significado de la variable.
- [ ] Aplicar `log1p` al objetivo cuando exista asimetría fuerte.
- [ ] Crear las características específicas de la variante.
- [ ] Eliminar una variable de cada par con correlación absoluta superior a `0.95` cuando sea apropiado.
- [ ] Calcular VIF y estudiar la eliminación de variables con `VIF > 10`.
- [ ] Comparar RFE o SelectKBest con el conjunto completo.
- [ ] Evitar `.apply()` y bucles sobre filas en Polars; usar expresiones nativas.

### 7. Comparar al menos cinco formas de codificación

- [ ] One-Hot Encoding.
- [ ] Frequency Encoding o Hash Encoding.
- [ ] Target Encoding bayesiano ajustado únicamente con entrenamiento.
- [ ] CatBoost Encoding o Entity Embeddings para alta cardinalidad.
- [ ] SBERT para texto, seguido de PCA hasta 32 componentes.
- [ ] Mantener TF-IDF como alternativa documentada si SBERT no resulta viable.
- [ ] Comparar calidad, memoria, dimensionalidad y tiempo.

### 8. Ejecutar tres consultas con DuckDB

- [ ] Una consulta de agregación analítica.
- [ ] Una consulta con función de ventana.
- [ ] Una consulta con `JOIN`.
- [ ] Explicar la utilidad de cada resultado dentro del análisis.

### 9. Entrenar al menos cinco modelos

Seleccionar al menos cinco alternativas apropiadas entre:

- [ ] ElasticNet.
- [ ] XGBoost.
- [ ] LightGBM.
- [ ] CatBoost.
- [ ] Quantile Regression.
- [ ] RANSAC.
- [ ] Red neuronal tabular con PyTorch.

Además:

- [ ] Entrenar una línea base simple.
- [ ] Construir un stacking con al menos cuatro modelos base.
- [ ] Utilizar Ridge como metamodelo del stacking.
- [ ] Medir la mejora del stacking frente a sus componentes.

### 10. Optimizar con Optuna

- [ ] Utilizar `TPESampler`.
- [ ] Utilizar `MedianPruner`.
- [ ] Ejecutar al menos 200 pruebas.
- [ ] Optimizar con validación cruzada o validación separada, nunca con prueba.
- [ ] Guardar los mejores parámetros y el mejor valor.
- [ ] Mostrar el historial de optimización.
- [ ] Mostrar la importancia de hiperparámetros.

### 11. Evaluar los modelos

- [ ] Calcular MSE, RMSE, MAE y R².
- [ ] Añadir RMSLE o MAPE cuando tenga sentido para el objetivo.
- [ ] Medir tiempo de entrenamiento.
- [ ] Medir tiempo de inferencia por muestra.
- [ ] Crear una tabla comparativa final.
- [ ] Graficar predicciones frente a valores reales.
- [ ] Analizar residuos.
- [ ] Crear curvas de aprendizaje y diagnosticar sesgo o varianza.
- [ ] Aplicar Shapiro-Wilk, Breusch-Pagan y Durbin-Watson al modelo lineal.

### 12. Explicar el mejor modelo

- [ ] SHAP global mediante `summary_plot`.
- [ ] SHAP de dependencia para las cinco características principales.
- [ ] SHAP local para ejemplos seleccionados.
- [ ] Permutation Importance.
- [ ] PDP e ICE para las cinco características principales.
- [ ] LIME para predicciones individuales.
- [ ] Comparar coincidencias y contradicciones entre los métodos.

### 13. Predicción conformal

- [ ] Usar un conjunto de calibración independiente.
- [ ] Implementar split conformal con cobertura nominal del 90 %.
- [ ] Calcular la cobertura empírica.
- [ ] Calcular el ancho medio de los intervalos.
- [ ] Graficar predicciones e intervalos para una muestra de observaciones.

### 14. Calibración

- [ ] Aplicar regresión isotónica o temperature scaling.
- [ ] Ajustar la calibración sin utilizar el conjunto de prueba.
- [ ] Comparar métricas antes y después.
- [ ] Construir un gráfico de valores predichos frente a observados.

### 15. Inferencia causal

- [ ] Formular una hipótesis causal relacionada con la variante.
- [ ] Definir tratamiento, resultado y variables de confusión.
- [ ] Dibujar y justificar un DAG.
- [ ] Estimar el ATE mediante propensity score matching.
- [ ] Ejecutar una refutación con tratamiento placebo.
- [ ] Añadir otra comprobación, como subconjunto o causa común aleatoria, si es viable.
- [ ] Explicar los supuestos y evitar afirmar causalidad más allá de la evidencia.

### 16. Analizar robustez

- [ ] Seleccionar las tres características más importantes.
- [ ] Añadir ruido en siete niveles.
- [ ] Introducir valores faltantes en seis niveles.
- [ ] Repetir con varias semillas si el tiempo lo permite.
- [ ] Graficar RMSE frente al nivel de perturbación.
- [ ] Explicar cuándo la degradación vuelve inseguro el modelo.

### 17. Crear un pipeline reproducible

- [ ] Construir un `Pipeline` con `ColumnTransformer`.
- [ ] Integrar imputación, escalado, codificación y modelo.
- [ ] Verificar que el pipeline acepta datos sin procesar.
- [ ] Guardar el pipeline final con `joblib` o `pickle`.
- [ ] Probar la carga del archivo guardado y realizar una predicción.

### 18. Utilizar GPU

- [ ] Usar XGBoost, LightGBM o PyTorch con GPU.
- [ ] Comparar tiempo de CPU y GPU si ambos están disponibles.
- [ ] Si no existe GPU, conservar el código de aceleración y documentar claramente la ejecución en CPU.

### 19. Comparar Polars y pandas

Medir tiempo y memoria bajo condiciones comparables para:

- [ ] Lectura.
- [ ] Conteo de nulos.
- [ ] Agrupación y agregación.
- [ ] Filtrado.
- [ ] Ordenación.
- [ ] Calcular la aceleración observada sin asumir de antemano que Polars siempre ganará.

### 20. Preparar el resumen visual

- [ ] Tabla de modelos con métricas y tiempos.
- [ ] Comparación del modelo final con el stacking.
- [ ] Radar normalizado con seis criterios: calidad, inferencia, interpretabilidad, robustez, optimización e ingeniería.
- [ ] Selección final del modelo considerando calidad e incertidumbre.

### 21. Preparar la entrega

- [ ] Notebook `.ipynb` completamente ejecutado y sin errores.
- [ ] Informe final en PDF.
- [ ] Portada con variante, nivel y conjunto de datos.
- [ ] Descripción del dataset y su fuente.
- [ ] EDA y tratamiento de datos.
- [ ] Ingeniería, codificación y selección de características.
- [ ] Modelos, hiperparámetros y métricas.
- [ ] Optuna y explicabilidad.
- [ ] Predicción conformal, calibración, causalidad y robustez.
- [ ] Benchmark Polars frente a pandas.
- [ ] Conclusiones y recomendaciones.
- [ ] Anexo con el código completo.

## Control de los 12 puntos

| Bloque evaluado | Puntos | Evidencia esperada |
|---|---:|---|
| EDA, Lazy, Streaming, Parquet y DuckDB | 2 | EDA completo, `.explain()`, Parquet particionado, streaming y tres consultas SQL |
| Cinco modelos, stacking y codificación | 2 | Tabla comparativa, stacking con cuatro bases y al menos cinco codificaciones |
| SBERT y Optuna | 2 | Embeddings reducidos a 32 componentes y 200 o más pruebas con poda |
| Explicabilidad | 1 | SHAP, Permutation Importance, PDP/ICE y LIME |
| Conformal y calibración | 1 | Intervalos al 90 %, cobertura empírica y calibración |
| Inferencia causal | 1 | DAG, ATE, propensity score matching y refutación |
| Robustez | 1 | Siete niveles de ruido y seis niveles de faltantes |
| GPU, pipeline y benchmark | 1 | Aceleración o fallback documentado, modelo guardado y cinco comparaciones |
| Informe y radar | 1 | PDF, notebook ejecutado, tabla final y radar de seis criterios |
| **Total** | **12** | |

## Errores que debemos evitar

- Ajustar transformaciones con todo el conjunto antes de dividirlo.
- Usar el conjunto de prueba durante Optuna o la selección de características.
- Ejecutar Target Encoding con estadísticas calculadas sobre validación o prueba.
- Eliminar todos los valores faltantes sin justificarlo.
- Cargar millones de filas con `read_csv` cuando corresponde usar Lazy API y streaming.
- Utilizar `.apply()` o bucles por fila en lugar de expresiones de Polars.
- Informar únicamente R² y omitir errores absolutos y tiempos.
- Presentar correlaciones observacionales como efectos causales.
- Informar cobertura conformal nominal sin comprobar la cobertura empírica.
- Comparar Polars y pandas con datos, operaciones o cachés diferentes.
- Entregar un notebook con celdas sin ejecutar o resultados no reproducibles.

## Estrategia práctica de implementación

1. Construir y validar todo el flujo con una muestra pequeña.
2. Congelar la división y las transformaciones para evitar fuga.
3. Ejecutar los modelos base antes de añadir métodos costosos.
4. Verificar SBERT, Optuna y GPU por separado.
5. Ejecutar el flujo completo sobre el conjunto grande.
6. Generar todas las tablas y figuras desde resultados guardados.
7. Revisar esta lista y completar la evidencia de cada punto antes de exportar el PDF.
