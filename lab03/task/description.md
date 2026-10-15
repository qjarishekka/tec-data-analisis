# Descripción de `task3.ipynb` — Laboratorio 03, variante 5.2

## Alcance

El notebook desarrolla los requisitos técnicos del nivel máximo de **12 puntos** para la variante **5.2, Avito Demand Prediction**. La variable objetivo es `deal_probability`, acotada entre 0 y 1. Para evitar bloquear el editor o agotar la memoria, los CSV de 1,5 millones de filas se procesan con Polars Lazy, streaming, Parquet y muestras deterministas.

Se completaron los puntos 1–15 descritos a continuación. El **punto 16, correspondiente a la entrega y al informe PDF, no se realizó**, tal como se solicitó. El notebook sí quedó ejecutado, pero no se preparó ni envió una entrega formal.

## 1. Preparación, datos y reproducibilidad

### Qué se hizo

- Se localizaron automáticamente `train.csv` y `test.csv`.
- Se fijó `SEED = 42` y se registraron las versiones de las bibliotecas.
- Se identificó `deal_probability` como objetivo.
- Se separó el `test.csv` oficial, que no contiene el objetivo, de la prueba interna usada para evaluar.

### Por qué se hizo

Una semilla y rutas detectadas automáticamente permiten repetir el análisis. Mantener aparte el test oficial evita utilizar datos futuros o sin etiqueta durante la selección del modelo.

### Cómo se hizo

Se buscaron los archivos dentro del proyecto, se inspeccionó su esquema mediante Polars y se utilizaron particiones deterministas basadas en el hash de `item_id`.

### Resultado

| conjunto | filas | columnas |
|---|---:|---:|
| entrenamiento | 1 503 424 | 18 |
| prueba oficial | 508 438 | 17 |

La muestra de modelado quedó dividida en 100 334 filas de entrenamiento y 24 996 de prueba interna.

## 2. Polars Lazy, streaming y Parquet

### Qué se hizo

- Se abrieron los CSV con `pl.scan_csv`, sin cargarlos completos al iniciar.
- Se mostró el plan optimizado con `.explain()`.
- Se convirtieron los datos a Parquet particionado por `activation_date`.
- Se reutiliza la conversión cuando existe la marca `_SUCCESS`.

### Por qué se hizo

Los CSV son demasiado grandes para abrirlos cómodamente en VS Code o materializarlos repetidamente en pandas. Lazy y Parquet reducen lectura, memoria y trabajo innecesario.

### Cómo se hizo

Las transformaciones se expresaron con la API nativa de Polars y se materializaron en modo streaming. Se generaron 21 archivos Parquet para entrenamiento y 9 para prueba.

### Resultado

La verificación del Parquet conservó las 1 503 424 filas de entrenamiento. Las ejecuciones posteriores leen columnas o particiones concretas en vez de recorrer siempre el CSV completo.

## 3. Calidad de datos y análisis exploratorio

### Qué se hizo

- Se revisaron dimensiones, esquema, nulos, duplicados y cardinalidad.
- Se corrigieron tipos numéricos, categóricos y temporales.
- Se razonó sobre mecanismos plausibles de faltantes: MCAR, MAR y MNAR.
- Se crearon histogramas, boxplots, Q-Q, dispersión y barras por categoría.
- Se calcularon Pearson, Spearman y V de Cramér.
- Se detectaron atípicos mediante IQR, z-score e Isolation Forest.

### Por qué se hizo

El EDA permite distinguir errores de observaciones válidas, detectar asimetría y conocer qué variables pueden aportar información al modelo. Los nulos no deben eliminarse sin considerar su significado.

### Cómo se hizo

Se tomó una muestra determinista de 75 818 anuncios. Los cálculos grandes se hicieron con expresiones Polars y las gráficas con una muestra manejable.

### Resultado

Los nulos más frecuentes fueron `param_3` (57,37 %), `param_2` (43,54 %), `description` (7,73 %), `image`/`image_top_1` (7,49 %) y `price` (5,68 %). Los detectores marcaron 17,39 % de precios por IQR, 0,30 % por z-score de `log_price` y 1 % mediante Isolation Forest; no se borraron automáticamente porque pueden ser anuncios legítimos.

## 4. Preprocesamiento, ingeniería y selección de características

### Qué se hizo

- Se crearon `has_image`, `has_description`, longitudes de texto, día de la semana, indicadores de nulos, `log_price` y `price_tier`.
- Se imputaron numéricas con la mediana y se estandarizaron.
- Se comprobaron pares con correlación absoluta superior a 0,95.
- Se calculó VIF y se aplicó `SelectKBest`.

### Por qué se hizo

Estas variables convierten información cruda en señales modelables. El ajuste exclusivo con entrenamiento evita fuga de datos. VIF y correlación ayudan a detectar redundancia y SelectKBest ofrece una selección estadística reproducible.

### Cómo se hizo

La ingeniería se realizó con expresiones de Polars, sin bucles por fila. Imputador, escalador y selector se ajustaron únicamente con la partición de entrenamiento. Se eliminó la redundancia exacta de `image_top_missing` respecto de `has_image` en la matriz avanzada.

### Resultado

El VIF máximo fue aproximadamente 1,18, por lo que no apareció multicolinealidad fuerte. La matriz avanzada empleada por los modelos tiene 47 características.

## 5. Texto y cinco codificaciones categóricas

### Qué se hizo

Se compararon:

1. One-Hot Encoding.
2. Frequency Encoding.
3. Feature Hashing.
4. Target Encoding bayesiano out-of-fold.
5. Codificación ordenada estilo CatBoost.

Para texto se dejó la rama SBERT y se ejecutó el fallback permitido TF-IDF + `TruncatedSVD` a 32 componentes.

### Por qué se hizo

Avito combina categorías de distinta cardinalidad y texto libre. Una única codificación no es óptima para todos los modelos. El Target Encoding debe construirse sin usar el objetivo de la misma fila ni el de validación.

### Cómo se hizo

El Target Encoding usa cinco folds y suavizado `alpha = 20`: cada fold se transforma con estadísticas de los otros cuatro. La prueba interna se transforma con mapas calculados solo sobre el entrenamiento. Las categorías desconocidas reciben la media global de entrenamiento.

### Resultado

One-Hot obtuvo el mejor Ridge de la comparación inicial, con RMSE aproximado de 0,2385. El fallback textual produjo 32 componentes sin descargar modelos ni requerir GPU. No se afirmó haber ejecutado SBERT: se documentó claramente la alternativa usada.

## 6. Tres consultas SQL con DuckDB

### Qué se hizo

Se ejecutaron tres consultas diferentes:

- agregación por categoría;
- función de ventana dentro de categorías;
- `JOIN` entre anuncios y una tabla resumen.

### Por qué se hizo

DuckDB permite analizar datos columnares con SQL sin abandonar el flujo Polars/Arrow y cumple el requisito específico del nivel 5.

### Cómo se hizo

La muestra de Polars se registró en una conexión DuckDB en memoria. Cada consulta devuelve una tabla pequeña que se puede inspeccionar directamente.

### Resultado

Las tres consultas se ejecutaron correctamente y muestran, respectivamente, estadísticas agregadas, comparaciones internas por grupo y enriquecimiento mediante unión.

## 7. Modelos y stacking

### Qué se hizo

Se entrenaron Ridge, ElasticNet, LightGBM, CatBoost, regresión cuantílica, RANSAC y una red MLP como fallback CPU. Además, se construyó un stacking con cuatro modelos base y Ridge como metamodelo.

### Por qué se hizo

La comparación incluye modelos lineales, robustos, cuantílicos, de árboles y neuronales. El stacking comprueba si combinar sesgos diferentes mejora la generalización.

### Cómo se hizo

Todos los modelos usaron la misma división y la misma matriz de entrada. Las predicciones se recortaron al intervalo válido `[0, 1]`. El stacking combinó cuatro estimadores base mediante predicciones fuera de fold.

### Resultado

| modelo | RMSE | MAE | R² | RMSLE |
|---|---:|---:|---:|---:|
| LightGBM optimizado | **0,234382** | 0,159610 | 0,183363 | 0,174902 |
| Stacking, 4 bases + Ridge | 0,234462 | 0,159735 | 0,182803 | 0,174932 |
| LightGBM | 0,234538 | 0,159867 | 0,182276 | 0,175006 |
| CatBoost | 0,235140 | 0,161283 | 0,178072 | 0,175470 |
| Ridge | 0,239540 | 0,166018 | 0,147021 | 0,178968 |
| MLP, fallback CPU | 0,240119 | 0,172994 | 0,142891 | 0,181569 |
| ElasticNet | 0,240490 | 0,167859 | 0,140244 | 0,179484 |
| RANSAC | 0,256091 | 0,137813 | 0,025073 | 0,187435 |
| Regresión cuantílica | 0,293401 | 0,138365 | -0,279691 | 0,221281 |

El stacking mejoró el LightGBM base en aproximadamente 0,00008 RMSE, pero no superó al LightGBM optimizado.

## 8. Optimización con Optuna

### Qué se hizo

Se optimizó LightGBM con `TPESampler`, `MedianPruner`, una partición de validación independiente y 200 pruebas. Se guardaron el estudio, el historial y la importancia de parámetros.

### Por qué se hizo

TPE explora el espacio de forma adaptativa y la poda evita gastar tiempo en pruebas poco prometedoras. La prueba interna final no debe intervenir en la optimización.

### Cómo se hizo

El objetivo minimizó RMSE en validación. Se exploraron número de árboles, tasa de aprendizaje, hojas, profundidad, mínimo por hoja, muestreo de filas/columnas y regularización.

### Resultado

- 200 pruebas terminadas y 130 podadas.
- Mejor RMSE de validación: 0,235394.
- Tiempo: 79,5 s.
- Parámetros más influyentes: `learning_rate`, `subsample`, `colsample_bytree` y `max_depth`.
- El mejor modelo final alcanzó RMSE 0,234382 en la prueba interna.

## 9. Evaluación, estadística y curvas de aprendizaje

### Qué se hizo

Se calcularon MSE, RMSE, MAE, R², RMSLE, tiempo de ajuste y tiempo de inferencia por fila. También se graficaron predicción frente a real, residuos y curvas de aprendizaje. Para el modelo lineal se aplicaron Shapiro-Wilk, Breusch-Pagan y Durbin-Watson.

### Por qué se hizo

Una sola métrica no describe precisión, sensibilidad a atípicos, coste y estabilidad. Las pruebas estadísticas verifican si los supuestos del modelo lineal son razonables.

### Cómo se hizo

Las métricas se calcularon sobre la prueba interna reservada. Las pruebas de residuos se realizaron sobre una muestra para mantener el coste controlado.

### Resultado

Shapiro-Wilk y Breusch-Pagan dieron p-values extremadamente pequeños, por lo que se rechazaron normalidad y homocedasticidad de los residuos lineales. Durbin-Watson fue aproximadamente 2,00, sin evidencia fuerte de autocorrelación secuencial en el orden analizado.

## 10. Explicabilidad del mejor modelo

### Qué se hizo

Se añadieron SHAP global y local, dependencias SHAP, Permutation Importance, PDP/ICE para las cinco características principales y LIME para una predicción individual.

### Por qué se hizo

Los métodos globales explican qué usa el modelo en general; los locales explican una decisión concreta. Comparar métodos ayuda a detectar conclusiones dependientes de una sola técnica.

### Cómo se hizo

SHAP se calculó con el modelo de árboles sobre una muestra. Permutation Importance midió cuánto aumenta el RMSE al desordenar cada variable. PDP/ICE evaluó la respuesta marginal y LIME ajustó una aproximación local.

### Resultado

Las cinco variables principales por SHAP fueron `TE_category_name`, `log_price`, `TE_parent_category_name`, `text_07` e `image_top_1`. SHAP y permutación coincidieron en cuatro de sus cinco primeras: categoría, precio logarítmico, categoría padre e `image_top_1`.

## 11. Predicción conformal al 90 %

### Qué se hizo

Se construyeron intervalos split-conformal con una calibración independiente de 8 000 filas y cobertura nominal del 90 %.

### Por qué se hizo

Una predicción puntual no comunica incertidumbre. Los intervalos permiten saber qué rango de valores es compatible con el error observado del modelo.

### Cómo se hizo

El modelo se ajustó sin las filas de calibración. Se calculó el cuantil finito de los residuos absolutos en calibración y se sumó/restó a cada predicción de prueba.

### Resultado

- Cobertura empírica: **0,899624**.
- Ancho medio: 0,566544.
- Cuantil residual: 0,426207.

La cobertura observada quedó prácticamente en el 90 % solicitado.

## 12. Calibración isotónica

### Qué se hizo

Se ajustó una regresión isotónica sobre el conjunto de calibración y se compararon las predicciones antes y después.

### Por qué se hizo

Aunque `deal_probability` parece una probabilidad, el problema se evalúa como regresión. La calibración busca alinear el valor predicho con el promedio observado sin usar la prueba para ajustar.

### Cómo se hizo

`IsotonicRegression` aprendió una transformación monótona entre predicción y objetivo en calibración y luego se aplicó a la prueba interna.

### Resultado

El MAE mejoró de 0,160052 a 0,158793, pero RMSE empeoró ligeramente de 0,234587 a 0,234869 y R² bajó de 0,181929 a 0,179962. Por eso la calibración no reemplaza automáticamente al predictor original: mejora un criterio, pero no todos.

## 13. Inferencia causal

### Qué se hizo

Se formuló la hipótesis de que disponer de imagen puede cambiar `deal_probability`. Se definieron tratamiento, resultado y confusores; se dibujó un DAG; se estimaron ATE, ATT y ATC mediante propensity score matching; y se ejecutaron refutaciones placebo y por subconjuntos.

### Por qué se hizo

La asociación entre imagen y demanda puede deberse a precio, categoría, región, tipo de usuario o calidad del anuncio. El análisis causal intenta comparar observaciones semejantes, aunque no convierte datos observacionales en un experimento.

### Cómo se hizo

Se estimó el propensity score con variables previas al tratamiento, se emparejaron anuncios y se revisó el balance mediante diferencias estandarizadas. También se ejecutó DoWhy como comprobación adicional.

### Resultado

El emparejamiento manual produjo ATE aproximado 0,014694, ATT 0,016264 y ATC -0,004390. DoWhy produjo -0,077836 con su configuración de PSM. La diferencia de signo y el balance imperfecto en varios confusores muestran sensibilidad al método y posible confusión residual; por eso el notebook presenta estos valores como estimaciones exploratorias, no como causalidad demostrada. En las refutaciones, el placebo tuvo media 0,002906 y los subconjuntos del 80 % media 0,027152.

## 14. Robustez

### Qué se hizo

- Se perturbó con ruido las tres características más importantes en siete niveles.
- Se introdujeron faltantes en seis niveles.
- Se evaluó un subconjunto fuera de distribución por precio.
- Se repitió el entrenamiento con cinco semillas.

### Por qué se hizo

Una métrica promedio puede ocultar fragilidad. Estas pruebas muestran cuánto empeora el modelo cuando la entrada es ruidosa, incompleta o distinta de la distribución habitual.

### Cómo se hizo

Se usaron `TE_category_name`, `log_price` y `TE_parent_category_name`, elegidas por importancia. Para cada nivel se repitió la perturbación y se calculó RMSE.

### Resultado

El RMSE pasó de 0,234382 a 0,246809 con ruido de nivel 1,0 y a 0,252078 con 50 % de faltantes. Entre cinco semillas, el RMSE medio fue 0,234431 con desviación 0,000057. En el subconjunto de precio alto el RMSE fue 0,138471; no se interpreta como mayor robustez general porque la composición y varianza del objetivo de ese subconjunto son diferentes.

## 15. Pipeline, persistencia, GPU, benchmark y radar

### Qué se hizo

- Se creó un `Pipeline` con `ColumnTransformer`, imputación, escalado, One-Hot y LightGBM.
- Se guardó y recargó con `joblib`.
- Se detectó la disponibilidad de GPU y se dejó documentado el fallback CPU.
- Se compararon Polars y pandas en lectura, nulos, agrupación, filtrado y ordenación.
- Se generó una tabla final y un radar de seis criterios.

### Por qué se hizo

El pipeline evita diferencias entre entrenamiento e inferencia. La persistencia prueba que el modelo es reutilizable. El benchmark justifica la elección de herramientas y el radar resume calidad más allá de una única métrica.

### Cómo se hizo

El pipeline acepta columnas crudas, ejecuta el preprocesamiento internamente y produce una predicción. Después de guardarlo, se recargó y se compararon ambas salidas. La detección comprobó `nvidia-smi`; al no encontrar GPU accesible, CatBoost y la MLP se ejecutaron en CPU.

### Resultado

- Archivo: `models/avito_pipeline.joblib`.
- RMSE del pipeline: 0,235339.
- Diferencia máxima entre predicciones antes y después de recargar: 0,0.
- En el benchmark de 200 000 filas, Polars leyó en 0,50 s y usó 119,67 MiB; pandas tardó 2,21 s y usó 282,88 MiB. Se informan todas las operaciones, incluso aquellas en que pandas fue competitivo o más rápido.
- El radar resume calidad, inferencia, interpretabilidad, robustez, optimización e ingeniería.

## 16. Entrega — excluida

No se creó el informe PDF, la portada formal ni el paquete de entrega. Tampoco se envió el trabajo a ninguna plataforma. Este punto queda deliberadamente pendiente.

## Archivos generados

- `task3.ipynb`: notebook completo, ejecutado y sin errores.
- `requirements.txt`: versiones del entorno utilizado.
- `artifacts/model_comparison.csv`: tabla comparativa de modelos.
- `artifacts/optuna_study.joblib`: estudio de Optuna guardado.
- `models/avito_pipeline.joblib`: pipeline recargable.

## Validación final

- 108 celdas totales, 62 de código.
- 0 excepciones guardadas.
- 0 salidas de advertencia en `stderr`.
- Estructura válida según `nbformat`.
- Mejor modelo: LightGBM optimizado, RMSE 0,234382.
- 200 pruebas de Optuna.
- Cobertura conformal empírica: 0,899624.
- El punto de entrega/PDF permanece excluido.
