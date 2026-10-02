# Guía completa del laboratorio 02 de análisis de datos

## Propósito de este archivo

Este documento conserva el contexto técnico y académico del laboratorio para poder retomarlo desde otro dispositivo o entregárselo a otra IA sin reconstruir toda la conversación. Describe los archivos utilizados, las decisiones tomadas, el estado del notebook, la preparación de variables, los modelos, los resultados esperados y las precauciones metodológicas.

El trabajo corresponde al laboratorio 02 sobre pronóstico de series temporales. El enunciado y los comentarios del notebook están principalmente en ruso, mientras que esta guía está en español para facilitar la continuación del trabajo.

## Archivos principales

- Notebook terminado: `/home/qjaricalizaya/work_university/tec-data-analisis/lab02/task/lab02_task.ipynb`
- Dataset actual: `/home/qjaricalizaya/work_university/tec-data-analisis/lab02/task/rainfall.csv`
- Enunciado oficial: `/home/qjaricalizaya/work_university/tec-data-analisis/lab02/Лабораторная_2_Прогнозирование_временных_рядов.docx`
- Presentación teórica: `/home/qjaricalizaya/work_university/tec-data-analisis/lab02/К_Лабораторной_2_прогнозирование_на_Polars.pptx`
- Ejemplo con Polars: `/home/qjaricalizaya/work_university/tec-data-analisis/lab02/Пример_работы_с_рядами_на_Polars.ipynb`
- Ejemplo con Pandas: `/home/qjaricalizaya/work_university/tec-data-analisis/lab02/Пример_Прогнозирование_временных_рядов_на_Pandas.ipynb`
- Dependencias: `/home/qjaricalizaya/work_university/tec-data-analisis/requirements.txt`
- Copia del notebook anterior basado en precios de RAM: `/home/qjaricalizaya/work_university/tec-data-analisis/lab02/task/lab02_task_ram_backup.ipynb`

## Entorno de Python

El entorno virtual utilizado se encuentra en:

```text
/home/qjaricalizaya/work_university/tec-data-analisis/.venv
```

Las dependencias declaradas son:

```text
polars
numpy
matplotlib
statsmodels
scikit-learn
```

Para instalar o actualizar las dependencias desde la raíz del proyecto:

```bash
/home/qjaricalizaya/work_university/tec-data-analisis/.venv/bin/pip install -r /home/qjaricalizaya/work_university/tec-data-analisis/requirements.txt
```

El notebook debe abrirse con el kernel asociado a este entorno virtual. Si aparece un error de importación de `sklearn`, se debe comprobar que Jupyter esté usando ese kernel y no otro Python del sistema.

## Dataset utilizado

El notebook fue adaptado desde un dataset de precios de memoria RAM al archivo `rainfall.csv`. Aunque el nombre del archivo menciona lluvia, contiene varias observaciones meteorológicas diarias.

La variable objetivo es:

```text
temp
```

La unidad de temperatura no está documentada en el archivo original. Por esa razón, el notebook utiliza el nombre `temp` y evita afirmar que se trata de grados Celsius o Fahrenheit.

Características temporales del dataset:

- Primera fecha: 2016-01-01.
- Última fecha: 2020-11-15.
- Número de observaciones: 1781.
- Frecuencia: diaria.
- Fechas duplicadas: ninguna.
- Huecos entre fechas consecutivas: ninguno.
- Valores nulos en el archivo original: ninguno.

La columna `datetime` llega como texto en formato `día-mes-año` y se convierte mediante:

```python
pl.col("datetime").str.to_date("%d-%m-%Y")
```

## División temporal

La división entre entrenamiento y prueba se realiza sin mezclar las filas:

```python
split_date = date(2019, 1, 1)
```

- Entrenamiento: fechas anteriores a 2019-01-01.
- Prueba: fechas desde 2019-01-01 hasta 2020-11-15.

Después de eliminar las primeras filas que no poseen suficiente historial para los lags y ventanas móviles:

- Entrenamiento: 1066 filas.
- Prueba: 685 filas.
- Variables básicas: 7.
- Variables avanzadas: 45.

No se debe aplicar un `train_test_split` aleatorio porque destruiría el orden temporal y permitiría que información futura aparezca en el entrenamiento.

## Resumen de las tareas completadas

### Tarea 1

Se carga el CSV con `pl.scan_csv`, se inspecciona el esquema, se cuentan las filas y se comprueba la proporción de valores nulos. Después se convierte la fecha, se ordena la tabla y se calculan estadísticas básicas de temperatura.

### Tarea 2

Se construye una matriz de dispersión con Matplotlib para temperatura, punto de rocío, humedad y presión. También se calculan correlaciones de Pearson entre `temp` y las demás variables meteorológicas. Finalmente se representa la serie temporal completa.

### Tarea 3

Se selecciona el año 2019 completo y se calculan ACF y PACF. La serie presenta una dependencia muy fuerte con el día anterior. No se encontró una evidencia clara de una estacionalidad semanal independiente; las autocorrelaciones altas en varios lags se explican principalmente por la persistencia y la dinámica estacional lenta.

### Tarea 4

Se crearon los siguientes atributos básicos:

- `lag_1`
- `lag_7`
- `lag_14`
- `lag_30`
- `diff_1`
- `diff_7`
- `ratio_7`

El notebook muestra primero las fórmulas solicitadas literalmente por el enunciado. Para el modelado de las tareas 7 a 11 se reconstruyen las diferencias y ratios utilizando únicamente información pasada. Esta decisión evita fuga de la variable objetivo.

### Tarea 5

Se crearon variables avanzadas de los siguientes grupos:

- Calendario: día de semana, mes, trimestre, día del año, semana del año y día del mes.
- Codificación cíclica con seno y coseno.
- Fourier semanal y anual para armónicos `k = 1, 2, 3`.
- Media móvil, desviación estándar móvil, mínimo y máximo móvil.
- EWMA con spans de 7, 30 y 90 días.
- Desviación respecto a EWMA, ratio de medias móviles y z-score.
- Indicadores `is_weekend` e `is_winter`.

En la sección inicial de exploración se rellenan nulos con cero porque así lo permite el enunciado. En la preparación final para modelos se eliminan las filas sin historial suficiente y no se introducen ceros artificiales.

### Tarea 6

Se calcula una tendencia mediante media móvil de 365 días. La serie nivelada se obtiene con:

```text
temp_detrended = temp - trend_365 + max(trend_365)
```

Se ejecuta el test Dickey-Fuller aumentado sobre la serie original y la nivelada.

Resultados guardados:

- Serie original: ADF = -4.2517, p-value = 0.000538.
- Serie nivelada: ADF = -4.1497, p-value = 0.000801.

Ambos p-values son menores que 0.05. Las dos series se consideran estacionarias. La eliminación de tendencia no cambia la clasificación porque la serie original ya pasaba el test.

### Tarea 7

Se entrenan tres modelos permitidos por el enunciado:

- `DecisionTreeRegressor`
- `GradientBoostingRegressor`
- `ExtraTreesRegressor`

Los modelos expresamente prohibidos en esta tarea son Linear Regression, MLP, KNN, Random Forest y SVR. No deben sustituirse los modelos actuales por ninguno de esos cinco sin modificar antes la justificación del laboratorio.

Se utiliza `TimeSeriesSplit(n_splits=10)` y R² como métrica de validación cruzada. Luego cada modelo se entrena con todos los datos de entrenamiento y se evalúa en el periodo de prueba usando R², MAE, MSE, RMSE y MAPE.

Resultados esperados con variables básicas:

| Modelo | R² | MAE | RMSE | MAPE |
|---|---:|---:|---:|---:|
| Decision Tree | 0.7719 | 0.7169 | 0.9576 | 2.6050 % |
| Gradient Boosting | 0.8428 | 0.6098 | 0.7950 | 2.2172 % |
| Extra Trees | 0.8278 | 0.6423 | 0.8319 | 2.3334 % |

El mejor resultado de prueba es Gradient Boosting con variables básicas.

### Tarea 8

Se repite la validación y evaluación usando las 45 variables avanzadas. También se representa la importancia de las 20 variables principales de la mejor alternativa.

Resultados esperados con variables avanzadas:

| Modelo | R² | MAE | RMSE | MAPE |
|---|---:|---:|---:|---:|
| Decision Tree | 0.7498 | 0.7641 | 1.0029 | 2.7726 % |
| Gradient Boosting | 0.8341 | 0.6209 | 0.8167 | 2.2663 % |
| Extra Trees | 0.8278 | 0.6339 | 0.8319 | 2.3107 % |

La mejor alternativa avanzada también es Gradient Boosting. El atributo dominante es `lag_1`, con una importancia aproximada de 0.882. Los atributos avanzados no mejoran el mejor R² de las variables básicas en este dataset.

### Tarea 9

Se implementa un pronóstico recursivo con la mejor alternativa avanzada, Gradient Boosting.

El pronóstico directo usa los valores reales anteriores disponibles en cada fecha de prueba. El pronóstico recursivo solo conoce las temperaturas reales del periodo de entrenamiento. Cada predicción se añade a la historia y se utiliza para construir los atributos del día siguiente.

Resultados esperados:

| Enfoque | R² | MAE | RMSE | MAPE |
|---|---:|---:|---:|---:|
| Directo avanzado | 0.8341 | 0.6209 | 0.8167 | 2.2663 % |
| Recursivo | 0.2353 | 1.4836 | 1.7533 | 5.1947 % |

La caída de calidad es normal: en el enfoque recursivo los errores de días anteriores se convierten en entradas para días posteriores y se acumulan.

La función recursiva está optimizada. Calcula una sola fila de variables desde el historial en lugar de reconstruir todo el DataFrame en cada paso. La implementación fue comparada con Polars y la diferencia máxima observada en la primera fila fue menor que `2e-13`.

### Tarea 10

Se forma un ensamble ponderado con las predicciones avanzadas de los tres modelos. El peso bruto se calcula como:

```text
1 / (MSE + 1e-8)
```

Después los pesos se normalizan para sumar uno.

Pesos esperados:

- Decision Tree: aproximadamente 0.2524.
- Gradient Boosting: aproximadamente 0.3807.
- Extra Trees: aproximadamente 0.3669.

Resultado esperado del ensamble:

- R²: 0.8286.
- MAE: 0.6332.
- RMSE: 0.8302.
- MAPE: 2.3098 %.

El ensamble es estable, pero no supera a Gradient Boosting por separado.

### Tarea 11

Se construye una tabla final con ocho filas:

- Tres modelos con variables básicas.
- Tres modelos con variables avanzadas.
- El pronóstico recursivo de la mejor alternativa avanzada.
- El ensamble ponderado.

También se construye una gráfica de barras que compara R² entre variables básicas y avanzadas para los tres modelos.

Conclusiones generales:

- El mejor resultado global es Gradient Boosting con variables básicas.
- Las variables avanzadas no mejoran el mejor resultado en este caso.
- `lag_1` es la variable más importante.
- El pronóstico recursivo pierde bastante precisión por acumulación de errores.
- El ensamble no mejora el mejor modelo individual.

## Decisión importante sobre fuga de información

El enunciado define literalmente:

```text
diff_1 = y_t - y_(t-1)
ratio_7 = y_t / y_(t-7)
```

Si se intenta predecir `y_t`, ambas expresiones contienen el valor objetivo actual. Lo mismo sucede si una media móvil o una EWMA incluye el día que se está intentando predecir. Esto produce fuga de información y métricas artificialmente altas.

Por esa razón, la función `build_feature_frame` de las tareas 7 a 11 utiliza:

- `diff_1`: diferencia más reciente conocida, `y_(t-1) - y_(t-2)`.
- `diff_7`: `y_(t-1) - y_(t-8)`.
- `ratio_7`: `y_(t-1) / y_(t-8)`.
- Estadísticas móviles calculadas sobre `temp.shift(1)`.
- EWMA calculada sobre `temp.shift(1)`.
- Desviaciones y z-score calculados usando `lag_1`, no la temperatura objetivo actual.

Las tareas 4 y 5 conservan las fórmulas académicas solicitadas para mostrar el ejercicio. Las tareas de modelado reconstruyen una versión segura para pronóstico real. Una IA futura no debe eliminar esta separación sin comprender la fuga que volvería a introducir.

## Estructura relevante del notebook

Las primeras celdas contienen las tareas 1 a 6. A partir de la celda cuyo encabezado es `Задание 7` se añade una implementación completa y autocontenida para el modelado.

Objetos principales disponibles después de ejecutar todo:

- `data_df`: datos originales ordenados por fecha.
- `FEATURES_BASE`: nombres de las siete variables básicas seguras.
- `FEATURES_ADV`: nombres de las 45 variables avanzadas.
- `modeling_data`: tabla con variables y objetivo.
- `train_model`, `test_model`: divisiones temporales.
- `models`: diccionario con los tres estimadores.
- `base_metrics`, `advanced_metrics`: métricas por modelo.
- `base_predictions`, `advanced_predictions`: predicciones directas.
- `best_advanced_name`, `best_advanced_model`: mejor modelo avanzado.
- `recursive_prediction`, `recursive_metrics`: resultado recursivo.
- `ensemble_weights`, `ensemble_prediction`, `ensemble_metrics`: resultado del ensamble.
- `summary_table`: tabla final de la tarea 11.

## Cómo ejecutar el notebook

1. Abrir `lab02_task.ipynb` con el kernel del entorno `.venv`.
2. Reiniciar el kernel para eliminar variables antiguas.
3. Ejecutar todas las celdas desde el principio y en orden.
4. Confirmar que no aparece ninguna excepción.
5. Comprobar que las dimensiones de modelado sean `(1066, 7)`, `(685, 7)`, `(1066, 45)` y `(685, 45)`.
6. Comprobar que la tabla final tenga ocho filas.

La validación cruzada entrena varias veces cada modelo. En un equipo normal, la sección de tareas 7 a 11 puede tardar varios segundos. El pronóstico recursivo optimizado debe tardar menos de unos pocos segundos; si tarda alrededor de un minuto, probablemente se sustituyó la función optimizada por una versión que reconstruye toda la tabla en cada iteración.

## Gráficos generados

El notebook genera los siguientes gráficos relevantes para las tareas finales:

- Boxplot de R² con variables básicas.
- Tres gráficos de hecho frente a pronóstico con variables básicas.
- Boxplot de R² con variables avanzadas.
- Tres gráficos de hecho frente a pronóstico con variables avanzadas.
- Importancia de las 20 variables principales.
- Comparación directa y recursiva en dos paneles.
- Hecho frente a ensamble.
- Barras de R² para variables básicas y avanzadas.

Se usa Matplotlib. El enunciado menciona Plotly solo como ejemplo, por lo que Matplotlib cumple el requisito sin añadir otra dependencia.

## Interpretación de las métricas

- R²: cuanto más cercano a 1, mejor explica el modelo la variación de la temperatura.
- MAE: error absoluto medio en la unidad original de `temp`.
- MSE: error cuadrático medio; penaliza con mayor fuerza los errores grandes.
- RMSE: raíz del MSE; vuelve a la unidad original de `temp`.
- MAPE: error porcentual absoluto medio. Se multiplica por 100 y se muestra como porcentaje.

Para este dataset, el criterio principal del enunciado es R². Las otras métricas se usan para confirmar que la mejora no se debe a una sola medida.

## Advertencias y posibles mejoras futuras

1. La unidad física de `temp` no está documentada. No agregar `°C` a títulos o conclusiones sin verificar la fuente del dataset.
2. `is_winter` considera diciembre, enero y febrero. Esto supone una definición de invierno del hemisferio norte.
3. La división de prueba contiene casi dos años. Puede cambiarse, pero todas las comparaciones deben recalcularse con la misma fecha.
4. Los hiperparámetros se eligieron para producir un resultado estable y una ejecución razonable, no mediante una búsqueda exhaustiva.
5. Una optimización de hiperparámetros debe usar una validación temporal, nunca `KFold` aleatorio.
6. Los resultados pueden cambiar si se modifica la versión de scikit-learn, los hiperparámetros, las variables o la fecha de división.
7. Los modelos usan `random_state=42` para facilitar la reproducibilidad.
8. El mejor modelo básico supera levemente al avanzado. Esto no es un error: más variables no garantizan mejor generalización.
9. El resultado recursivo bajo tampoco es un error de ejecución. Refleja acumulación de predicciones imperfectas durante 685 días.

## Instrucciones para otra IA

Cuando otra IA reciba este archivo, debería seguir este orden:

1. Leer el enunciado Word y este README.
2. Inspeccionar el notebook actual antes de sugerir cambios.
3. Ejecutar el notebook completo en una copia temporal o con el kernel correcto.
4. No reemplazar el dataset por el antiguo archivo de precios de RAM.
5. Mantener los comentarios académicos del notebook en ruso.
6. Mantener las explicaciones dirigidas al estudiante en español, salvo que se solicite otro idioma.
7. No reintroducir fuga de información en las variables de modelado.
8. No usar modelos prohibidos en la tarea 7.
9. Si cambian los resultados, actualizar tanto las conclusiones del notebook como este README.
10. Verificar que `requirements.txt` siga incluyendo `scikit-learn`.

## Estado final esperado

El laboratorio está implementado hasta la tarea 11. El siguiente trabajo razonable sería revisar la presentación, simplificar comentarios si el profesor exige menos texto o ajustar hiperparámetros si se desea mejorar las métricas. No debería ser necesario reescribir las funciones principales.
