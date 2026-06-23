# Changelog

Todas las versiones notables del proyecto **Ruleta de Sorteo AKVA**.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y el proyecto usa versionado semántico.

## [1.0.2] - 2026-06-23

### Añadido
- Integración del sistema de diseño **Akvarell** (botones, controles, utilidades).
- Logo de **AKVA group** en el encabezado y **favicon** con el icono del pez.
- Icono del pez en el centro del botón **GIRAR**.
- Panel de **Ganadores** a la izquierda (lista ordenada del primer al último premio).
- **Configuración** desplegable: quitar al ganador, sonido, **volumen**, **segundos de giro** (20 s por defecto) y **número de premios** (3 por defecto).
- Modal del ganador con fondo en degradado, número de premio y **GIFs de celebración** aleatorios (sin repetir el anterior).
- **Fanfarria de ganador** y tic de giro generados con WebAudio, con control de volumen maestro.
- Efecto de rebote de la flecha sincronizado con cada participante que cruza el puntero.
- Diseño **responsivo** para distintas resoluciones (escritorio, tablet y móvil).

### Cambiado
- Rueda más grande y con mayor resolución (canvas 1000×1000) para texto más nítido.
- La flecha del ganador se ubica a la derecha; el giro se detiene con el ganador alineado al puntero.
- El ganador se quita de la ruleta solo al pulsar **Continuar**.
- Los clics se sincronizan con el cruce real de cada participante y no suenan al llegar al ganador.
- Fondo principal con degradado oscuro inspirado en el tema de Akvarell.
- Logo renombrado a `akva-group-logo-white.svg` (sin espacios) para servir correctamente en Vercel.

### Eliminado
- Carga e importación desde Excel/CSV y descarga de plantilla.

## [1.0.1]

### Añadido
- Participantes precargados (editable) en la ruleta.

## [1.0.0]

### Añadido
- Versión inicial: ruleta de sorteo en HTML con importación de Excel/CSV, giro animado, confeti y configuración para Vercel.
