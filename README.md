#  Ruleta de Sorteo AKVA

Una ruleta de sorteo web que carga la lista de participantes desde un archivo **Excel** (`.xlsx`/`.xls`) o **CSV** con columnas **Nombre** y **Apellido**, gira con animación y muestra al ganador con confeti. Ideal para concursos y eventos.

> 100% del lado del cliente (HTML + CSS + JavaScript). No requiere backend ni base de datos.

##  Características

-  **Carga desde Excel/CSV** — detecta automáticamente las columnas `Nombre` y `Apellido`.
-  **Plantilla descargable** para conocer el formato exacto.
-  **Ruleta animada** en `<canvas>` con puntero y botón central **GIRAR**.
-  **Modal de ganador** con confeti y sonido opcional.
-  **Quitar al ganador** automáticamente para no repetir.
-  **Edición manual** y botones para mezclar/limpiar.
-  **Responsive** — funciona en móvil y en proyector.

## 📋 Formato del Excel

| Nombre | Apellido   |
|--------|------------|
| Juan   | Pérez      |
| María  | González   |
| Carlos | Rodríguez  |

También se aceptan encabezados equivalentes como `Nombres`, `Apellidos`, `Name`, `Last name`, etc.
Si no encuentra esas columnas, usará la primera columna con texto.

##  Probar localmente

Al ser estático, basta con abrir `index.html` en el navegador. Para evitar restricciones del navegador, puedes levantar un servidor simple:

```bash
# Con Python
python3 -m http.server 5173
# luego abre http://localhost:5173
```

## ▲ Desplegar en Vercel (link provisional)

### Opción A — Desde la web (sin instalar nada)
1. Entra a <https://vercel.com> e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **Add New… → Project**.
3. Selecciona el repositorio **`ruleta_sorteo_AKVA`**.
4. Framework Preset: **Other** (es un sitio estático). No hay build command.
5. Pulsa **Deploy**.
6. Al terminar obtendrás un enlace tipo `https://ruleta-sorteo-akva.vercel.app` (y una *preview URL* por cada commit/PR).

### Opción B — Desde la terminal con Vercel CLI
```bash
npm i -g vercel      # instala la CLI
vercel               # primer deploy de desarrollo (preview)
vercel --prod        # publica en producción
```

> Cada vez que hagas *push* a `main`, Vercel volverá a desplegar automáticamente y generará una URL de **Preview** provisional para desarrollo.

##  Estructura

```
ruleta_sorteo_AKVA/
├── index.html                  # estructura principal y carga de SheetJS
├── src/
│   ├── js/
│   │   ├── main.js             # punto de entrada de la app
│   │   └── ruleta.js           # lógica: lectura de Excel, dibujo y giro
│   ├── styles/
│   │   └── styles.css          # estilos de la ruleta y el panel
│   └── integrations/
│       └── akvarell.js         # punto de integración para AKVArell
├── vercel.json     # configuración de despliegue
└── README.md
```

##  Integración AKVArell

Se agregó `src/integrations/akvarell.js` como punto único para integrar AKVArell sin mezclar esa configuración con la lógica de la ruleta.

## 🛠️ Tecnologías

- HTML5 `<canvas>` para la ruleta
- [SheetJS (xlsx)](https://sheetjs.com/) vía CDN para leer Excel/CSV
- CSS puro (sin frameworks)
- JavaScript vanilla (sin dependencias de build)
