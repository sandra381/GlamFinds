# ESTRUCTURA.md — GlamFinds

> Documento de análisis generado automáticamente. Describe la estructura completa del repositorio, la función de cada carpeta/archivo relevante y señala código que parece no usarse o estar obsoleto. **No se modificó ningún archivo del proyecto para generar este documento.**

---

## 0. Visión general del repositorio

El repositorio contiene **tres proyectos independientes** que no comparten build system ni dependencias entre sí (se comunican solo por HTTP en tiempo de ejecución):

```
GlamFinds/                    (raíz del repo, contiene .git)
├── README.md                 ⚠️ VACÍO
├── GlamFinds/                 → Frontend Angular 16 (la app "GlamFinds" en sí)
├── conexionbase-proyecto/     → Backend Node.js/Express + MySQL (API REST principal)
└── ai_service/                → Microservicio Python FastAPI (visión por computador / IA)
```

Flujo de datos general:

```
Angular (GlamFinds, :4200)
   │  HTTP (environment.api_backend)
   ▼
Express (conexionbase-proyecto, puerto 5000 por defecto)
   │  MySQL "glamfinds"            │  axios → microservicio IA (127.0.0.1:8000)
   ▼                                ▼
Base de datos MySQL              ai_service (FastAPI, análisis de imágenes)
```

Existe una **inconsistencia de puertos** detectada entre la documentación del propio proyecto y el código real — ver sección 5 ("Observaciones").

---

## 1. Árbol general de carpetas y función de cada una

### 1.1 `GlamFinds/` (Frontend — Angular 16 + Angular Material)

```
GlamFinds/
├── CLAUDE.md                 Guía interna del proyecto para asistentes de IA (muy completa, ver notas)
├── README.md                 README genérico generado por Angular CLI (sin info del proyecto)
├── angular.json               Configuración del CLI/build de Angular
├── package.json                Dependencias del frontend
├── tsconfig*.json              Configuración de TypeScript
├── .editorconfig / .gitignore
└── src/
    ├── index.html             HTML raíz (carga fuentes Google, Material Icons y script de Dialogflow)
    ├── main.ts                Bootstrap de la aplicación Angular (AppModule)
    ├── styles.scss            Design system global (tokens de color, tipografía, overrides de Material)
    ├── favicon.ico
    ├── environments/          Configuración de entorno (URL del backend)
    ├── assets/                Imágenes, videos, íconos y el modelo TensorFlow.js de clasificación de zapatos
    └── app/
        ├── app.module.ts       Módulo raíz: declara TODOS los componentes e importa módulos de Material
        ├── app-routing.module.ts   Definición de rutas
        ├── app.component.*     Componente raíz (solo contiene <router-outlet>)
        ├── components/         ~35 componentes de feature (feeds, formularios, tablas admin, modales, herramientas)
        ├── feed-tendencias/ feed-siguiendo/ feed-parati/   3 componentes de "feed" nuevos (fuera de components/)
        ├── shoe-classifier/     Componente de IA en el navegador (TensorFlow.js) — fuera de components/
        ├── models/              ~30 clases/interfaces TypeScript usadas como DTOs de las respuestas del backend
        └── services/            3 servicios Angular (HTTP, chat, estado compartido)
```

### 1.2 `conexionbase-proyecto/` (Backend — Node.js + Express + MySQL)

```
conexionbase-proyecto/
├── package.json               Nombre del paquete: "tarea-4" ⚠️ (ver observaciones)
├── tablas.sql                 Script de creación de tablas ⚠️ (esquema de un proyecto distinto, ver observaciones)
├── test_opencv.js             Script suelto de prueba de opencv4nodejs (no forma parte de la app)
├── uploads/                   Imágenes de prueba subidas por multer en algún momento del desarrollo
└── src/
    ├── index.js                Punto de entrada: levanta el servidor Express
    ├── config/
    │   ├── server.js            Configuración de Express (middlewares, CORS, body-parser)
    │   ├── database.js          Conexión MySQL (mysql, no mysql2) a la BD "glamfinds"
    │   ├── gemini.js             Cliente para la API de Google Gemini (genera outfits con IA)
    │   └── pexels.js             Cliente para la API de Pexels (busca fotos de stock para los outfits)
    ├── app/rutas/
    │   └── glamfinds.js          **Archivo principal de rutas** (~1830 líneas, toda la API REST vive aquí)
    ├── sql/
    │   └── queries.sql           ⚠️ Consultas de un proyecto NO relacionado ("usuarios"/"comics")
    └── yolo/
        └── yolo_model.py         Script Python suelto de detección de objetos con YOLOv8 (no integrado al server Node)
```

### 1.3 `ai_service/` (Microservicio Python — FastAPI + visión por computador)

```
ai_service/
├── requirements.txt            ⚠️ VACÍO (no declara las dependencias reales que usa app.py)
└── app.py                      Único archivo del microservicio: segmentación de prendas, detección de
                                 joyería/accesorios y detección de maquillaje sobre imágenes subidas
```

---

## 2. Detalle de archivos importantes

### 2.1 Frontend — núcleo de la aplicación

**`src/main.ts`** — Arranca Angular con `platformBrowserDynamic().bootstrapModule(AppModule)`.

**`src/app/app.module.ts`** — Módulo raíz. Declara todos los componentes (~45) e importa los módulos de Angular Material usados en la app (dialog, menu, sidenav, toolbar, card, form-field, button, table, icon, tabs, grid-list, input, snack-bar), `DragDropModule` (CDK) y `EditorModule` (TinyMCE). Usa `CUSTOM_ELEMENTS_SCHEMA` para permitir elementos web no Angular (p. ej. `df-messenger` de Dialogflow, aunque ya no se usa en ninguna plantilla — ver observaciones).

**`src/app/app-routing.module.ts`** — Define las rutas de la SPA. Nota: usa `RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })` para permitir re-navegar a la misma URL (necesario para refrescar feeds sin `location.reload()`). Tabla de rutas principales:

| Ruta | Componente | Función |
|---|---|---|
| `/` | `IngresoComponent` | Login |
| `/feed` | `TendenciasComponent` | Feed principal "clásico" (masonry) |
| `/ropa`, `/maquillaje`, `/accesorios`, `/zapatos` | Componentes homónimos | Feeds filtrados por categoría |
| `/descuentos`, `/dups` | Componentes homónimos | Feeds de publicidad/outfit del día |
| `/perfil`, `/perfil/:id` | `PerfilComponent` | Perfil propio / de otro usuario |
| `/admin` | `AdminComponent` | Panel admin (placeholder, ver obsoletos) |
| `/agregar`, `/modificar`, `/modificar/:id`, `/eliminar`, `/eliminarUser` | CRUD admin | Alta/edición/baja de posts y usuarios |
| `/tablaTendencias`, `/tablaRopa`, `/tablaMaquillaje`, `/tablaAccesorios`, `/tablaZapatos`, `/tablaDescuentos`, `/tablaDups` | `Tabla*Component` | Tablas de administración (listar/borrar/editar) |
| `/registrar` | `RegistroComponent` | Registro (se usa como diálogo modal, no como página) |
| `/configuracion` | `EditarComponent` | Edición de perfil propio |
| `/modComment` | `ModificarCommComponent` | (registrada pero se usa normalmente como diálogo, no navegación directa) |
| `/imagecolor`, `/moodboard`, `/articulo`, `/randlook`, `/tryon`, `/noticias`, `/asistente` | Herramientas / feeds secundarios | Ver detalle más abajo |
| `/tendencias`, `/siguiendo`, `/parati` | `FeedTendenciasComponent`, `FeedSiguiendoComponent`, `FeedParatiComponent` | Sistema de feeds "nuevo" (algorítmico) |
| `/outfit-ia` | `OutfitIaComponent` | Generador de outfits con IA (Gemini + Pexels) |

**`src/app/app.component.ts` / `.html`** — Componente raíz; solo contiene `<router-outlet>`, sin lógica.

**`src/styles.scss`** — Design system global: variables CSS (`--sidebar-width`, paleta de color rosa/dorado/crema, tipografías Playfair Display + DM Sans) y overrides forzados (`!important`) sobre `mat-drawer` para fijar el ancho del sidebar en todas las páginas.

**`src/index.html`** — Carga fuentes de Google Fonts, Material Icons, y **un `<script>` del bootstrap de Dialogflow Messenger** que ya no se usa en ninguna plantilla (ver observaciones).

**`src/environments/environment.ts`** — `api_backend: "http://localhost:5000"` (también `apiUrl`, `requestTextUrl`, config de Dialogflow). **`environment.prod.ts`** — misma URL, sin las claves extra.

### 2.2 Servicios (`src/app/services/`)

**`backend.service.ts`** — Servicio central de acceso a la API REST del backend Node. Concentra ~70 métodos HTTP (GET/POST/DELETE) organizados por dominio:
- **Usuario**: `ingresarMenu`, `guardarUsuarioConImagen`, `obtenerUsuario`, `getdescripcion`, `getSave`, `PostDes`, `PostPerfil`, `editarPosts2`.
- **Posts generales** (feeds de ropa/maquillaje/etc.): `insertarPosts`, `guardarLikes`/`eliminarLike`, `guardarComentarios`/`modificarComentario`/`eliminarComentario`/`obtenerComentarioUser`, `guardarFavoritos`/`eliminarSave`, `obtenerRopa`/`obtenerTendencias`/`obtenerZapatos`/`obtenerMaquillaje`/`obtenerAccesorios`, `countLike`.
- **Posts de publicidad** (descuentos/dups): mismo set de métodos con sufijo `P` (`guardarLikesP`, `obtenerDups`, `obtenerDescuentos`, etc.).
- **Admin**: `borrarTendencia`, `insertarPubli`, `obtenerGeneral`, `editarPosts`, `getColors`, `generarLookAleatorio`/`generarLookAleatorioM`, `obtenerPrenda`, `Prenda`.
- **Artículos** (blog): mismo patrón con sufijo `A`/`ART` (`insertarArticulos`, `obtenerArticulos`, `guardarLikesA`, etc.).
- **Nuevas funciones** (sistema de feeds algorítmico): `getUserStats`, `obtenerFeedTendencias`, `obtenerFeedSiguiendo`, `obtenerFeedParaTi`, `obtenerCategorias`, `actualizarPreferencias`.
- **Outfit IA**: `generarOutfitIA`, `guardarOutfitIA`, `obtenerOutfitsGuardados`, `eliminarOutfitGuardado`.
- **Noticias**: `getTrends`.

Todas las llamadas usan `console.log` antes de cada petición (ruido de depuración dejado en producción).

**`chat.service.ts`** — Servicio del chatbot. `sendMessage(proyectId, message)` hace `POST http://localhost:8000/api/requestText`. **Nota**: la URL está *hardcodeada* (no usa `environment`) y apunta al puerto 8000, que en este repo corresponde al microservicio Python (`ai_service`) — pero ese servicio **no expone** la ruta `/api/requestText` (ver observaciones, integración rota).

**`share-data.service.ts`** — Servicio de estado compartido vía `BehaviorSubject` (patrón store simple). Expone `setNewUser`/`currentuser` y `setListadoTendencias`/`currentListadoTendencias`. Se inyecta en varios componentes pero su uso real es mínimo (la mayoría de componentes vuelven a pedir los datos al backend en vez de leer del store).

### 2.3 Modelos (`src/app/models/`)

Son ~30 clases/interfaces TypeScript, casi todas DTOs simples (constructor + propiedades) que reflejan filas de la base de datos o envoltorios de respuesta `{status, mensaje, datos}`:

- **Entidades de dominio**: `Posts` (el más grande — incluye campos "antiguos" de color/prenda y campos "nuevos" de IA: `prendas[]`, `makeup_zones[]`, `face_detected`, `skin_reference_color`), `Usuario`, `Usuario_ver` (login), `Usuario2`, `Comments`/`Comments2`/`Comments3`/`Comments4`, `Likes`/`Likes2`/`Likes_cant`, `Save`, `Publicidad`/`Publicidad_post`, `Descuentos`, `Dups`, `Articulos`, `Perfil`.
- **Envoltorios de respuesta HTTP** (`Response1`…`Response8`, `Response2A`, `Response31`, `Response41`, `Response51`, `ArticulosResponse`, `PostGeneralesResponse`, `PostsGenerales`, `PublicidadResponse`/`PublicidadResponse2`): solo se usan como parámetro de tipo genérico en `backend.service.ts` (`this.http.get<Response6>(...)`), no tienen lógica.
- **Chat**: `message.model.ts` (`Message`), `text-message.model.ts` (`TextMessage`), `response-message.model.ts` (`ResponseMessage`).

### 2.4 Componentes (`src/app/components/`, `src/app/feed-*`, `src/app/shoe-classifier`)

La mayoría de los componentes de "feed" (listados de posts tipo Pinterest) **comparten casi textualmente el mismo código** (aprox. 500–650 líneas cada uno, duplicadas). Para no repetir la misma descripción 12 veces, se documenta el **patrón común** una vez y luego solo las diferencias de cada componente.

#### Patrón común "Componente de Feed" (compartido por: `tendencias`, `ropa`, `maquillaje`, `accesorios`, `zapatos`, `descuentos`, `dups`, `articulos`, `feed-tendencias`, `feed-siguiendo`, `feed-parati`, y parcialmente `perfil`)

Estado típico: `dataSource` (posts crudos), `filteredItems` (posts tras aplicar filtro), `comentarios`/`likes`/`perfil` (diccionarios indexados por `id_post`/`id_user`), `toggle`/`toggle1` (estado visual de like/guardado por índice del `*ngFor`), `colorShades` (paleta de ~150 tonos con nombre en español + su RGB) y `clothes` (mapa de nombres de prendas para filtrar).

Funciones típicas:
- `ngOnInit()` — pide los posts al backend y, por cada uno, carga en paralelo/serie sus comentarios, su conteo de likes y el perfil del autor.
- `like(post, index)` / `save(post, index)` — alternan like/guardado llamando al backend y actualizan `localStorage` (`likeState_<id>`, `saveState_<id>`) para persistir el estado visual entre recargas.
- `comment(post)` — valida que el texto no esté vacío, pasa el texto por un filtro de palabras malsonantes en español (librería `bad-words`, con una lista de ~90 palabras hardcodeada **repetida en cada componente**), guarda el comentario y (en la mayoría de variantes) hace `location.reload()`.
- `deleteComment` / `openMod` (abre `ModificarCommComponent` como diálogo) / `isSaved` / `inicializarEstados` / `actualizarEstadoLocalStorage`.
- `seleccionarPorRango(color)` / `seleccionarPorRopa(prenda)` / `limpiarFiltro()` — filtran `filteredItems` por tono de color o tipo de prenda.
- `openAgregar` / `open` (color) / `openMood` / `openRand` / `openTryOn` — abren los distintos diálogos/herramientas (`AgregarPubUComponent`, `ImagecolorComponent`, `MoodboardComponent`, `RandlookComponent`, `TryOnComponent`) desde la barra de la publicación.
- `isImage(fileName)` — decide si el post es imagen o video por extensión.

Diferencias por componente concreto:

| Componente | Ruta | Backend usado | Particularidad |
|---|---|---|---|
| `tendencias/` | `/feed` | `obtenerTendencias()` | El más completo: superpone sobre la imagen botones de "comprar" posicionados según el `bbox` de cada prenda detectada por IA y según la zona de maquillaje (`getTopPosition`, `getLeftPosition`, `getMakeupTopPosition/LeftPosition`, `getColorName`, `getSearchUrl`, `getMakeupSearchUrl`); selector de emojis (`toggleEmojiPicker`, `insertEmoji`, `replyTo`); chips de categoría (`filtrarChip`, `cargarCategorias`); al dar like llama además a `actualizarPreferencias` (alimenta el feed "Para ti"). No usa `location.reload()` tras comentar (refresca solo la lista). |
| `ropa/`, `maquillaje/`, `accesorios/`, `zapatos/` | `/ropa`, `/maquillaje`, `/accesorios`, `/zapatos` | `obtenerRopa/Maquillaje/Accesorios/Zapatos()` | Copia casi idéntica entre sí; filtran por color/prenda usando los campos "antiguos" (`prenda1..6`, `vibrant_class`, etc.) en vez del array `prendas[]` nuevo que sí usa `tendencias`. |
| `descuentos/` | `/descuentos` | `obtenerDescuentos()` (tabla `posts_publicidad`) | Usa el modelo `Publicidad`; tiene chips de categoría pero los métodos de filtro por color/prenda están vacíos (`seleccionarPorRango`/`seleccionarPorRopa` solo cierran el modal, no filtran nada). |
| `dups/` | `/dups` | `obtenerDups()` | Igual que `descuentos` pero sin chips ni filtros de color/prenda. |
| `articulos/` | `/articulo` | `obtenerArticulos()` (blog) | Usa sufijo `A`/`ART` del backend service; añade `toggleLeerMas`/`mostrarMas` para expandir contenido largo; abre `AgregarARTComponent`/`ModificarCommARTComponent` en vez de las variantes genéricas. |
| `feed-tendencias/` | `/tendencias` | `obtenerFeedTendencias()` (ranking por `trending_score`) | Variante moderna de `tendencias/`, misma lógica de overlay de IA; usa `loading` flag y `Promise.all` en vez de bucle secuencial `await` para cargar comentarios/likes/perfiles (más eficiente que la versión antigua). |
| `feed-siguiendo/` | `/siguiendo` | `obtenerFeedSiguiendo(userId)` | Igual que `feed-tendencias/` pero pide el feed de usuarios seguidos; si no hay usuario logueado no llama al backend. |
| `feed-parati/` | `/parati` | `obtenerFeedParaTi(userId)` | Igual patrón, feed personalizado según `user_preferred_labels` (alimentado por los likes vía `actualizarPreferencias`). |
| `perfil/` | `/perfil`, `/perfil/:id` | `obtenerUsuario`, `PostPerfil`, `getSave`, `getSaveA`, `obtenerOutfitsGuardados` | Combina 4 fuentes de datos en pestañas (`activeTab`): posts propios, posts guardados, artículos guardados y outfits de IA guardados; añade `unsavePost`/`unsaveOutfit`/`unsaveGuardado`/`unsaveArticulo` para quitar de guardados directamente desde el perfil. |

#### Componentes de tabla de administración (`tabla-*`)

`tabla-tendencias`, `tabla-ropa`, `tabla-maquillaje`, `tabla-accesorios`, `tabla-zapatos`, `tabla-descuentos`, `tabla-dups` — todos idénticos en estructura: usan `MatTableDataSource`, cargan datos con el getter correspondiente de `BackendService`, exponen `applyFilter(event)` (filtro de texto de Angular Material), `borrarTendencia(id)` (borra vía `backend2.borrarTendencia`, aunque el nombre del método es genérico se usa para todas las categorías) y `modificarTendecias(id)` (navega a `/modificar/:id`).

#### Formularios y modales de creación/edición

- **`agregar/`** — Formulario de doble uso: publica un post general (`guardarPostsG`) o un post de publicidad/descuento (`guardarPublicidad`), cada uno con su propio `FormGroup`, preview de imagen (`imagenSelect`/`imagenSelectP`) y `limpiar()`.
- **`agregar-art/`** — Formulario de artículos de blog con editor enriquecido TinyMCE (`article`, `modelChangeFn`), filtro de palabras inapropiadas antes de publicar, soporta modo edición si recibe `data` por `MAT_DIALOG_DATA` (precarga campos desde un artículo existente).
- **`agregar-pub-u/`** — Versión "rápida" del formulario de post general, pensada para abrirse como diálogo desde la barra superior (`Menu2Component`) en cualquier feed; incluye `cerrarModalSegunRuta()` para cerrar el diálogo solo en ciertas rutas.
- **`modificar/`** — Formulario de edición de un post general (usado desde las tablas admin); tras guardar, navega a la tabla correspondiente según `categoria`.
- **`modificar-comm/`, `modificar-comm-p/`, `modificar-comm-art/`** — Tres componentes casi idénticos (diálogo de edición de un único comentario) para posts generales, posts de publicidad y artículos respectivamente.
- **`editar/`** — Página de "configuración" del perfil propio: edita usuario/descripción/foto, y muestra estadísticas (`getUserStats`) y las publicaciones/artículos propios en pestañas.
- **`registro/`** — Diálogo de registro de usuario nuevo; incluye medidor de fortaleza de contraseña (`passwordStrength`/`passwordStrengthLabel`) y un sistema de "toast" propio (no usa `MatSnackBar`).
- **`ingreso/`** — Página de login (ruta `/`); guarda `ids`/`user` en `localStorage` al autenticar y redirige a `/agregar` si el usuario es `AdminUser`, o a `/feed` en caso contrario; también tiene su propio sistema de "toast".

#### Herramientas / feeds secundarios / componentes de layout

- **`imagecolor/`** — Extrae la paleta de colores dominante de una URL de imagen vía `backend.getColors()` (que en el backend usa la librería `node-vibrant`).
- **`moodboard/`** — Editor de moodboards: permite arrastrar/rotar/redimensionar imágenes y bloques de texto sobre un lienzo (usa `interactjs`), cambiar fuente/color/fondo, y exportar el resultado a PNG (`dom-to-image` + recorte manual por `<canvas>`). Es el componente más grande de lógica de UI de todo el proyecto.
- **`randlook/`** — Genera un "look" aleatorio (femenino y masculino) combinando prendas aleatorias desde las tablas `tops/pantalones/accesorios/zapatos/chaquetas` (y sus variantes `...H`) del backend.
- **`try-on/`** — "Armario virtual": permite arrastrar prendas (cargadas desde `backend.Prenda()`) a un lienzo tipo moodboard, o subir imágenes propias, usando `interactjs`, `Konva` y `html2canvas` (aunque estas dos últimas librerías no se usan activamente en el código actual del componente más allá del import).
- **`outfit-ia/`** — Formulario que pide ocasión/clima/colores y llama a `generarOutfitIA()` (que en el backend combina Gemini + Pexels) para proponer un outfit completo con imágenes de stock; permite guardarlo (`guardarOutfitIA`) para verlo luego en el perfil.
- **`noticias/`** — Lista de noticias de moda obtenidas de `getTrends()` (NewsAPI, vía backend).
- **`asistente/`** — Chat con un asistente IA (`ChatService`), UI tipo burbuja de mensajes, con `onKeyDown` para enviar con Enter.
- **`widget/`** — Mini-widget de noticias de tendencia pensado para la barra lateral; **no está referenciado en ninguna plantilla actual** (ver observaciones).
- **`menu/`** — Sidebar izquierdo estático (enlaces de navegación); su `.ts` no tiene lógica, todo vive en el HTML.
- **`menu2/`** — Barra superior usada en la mayoría de feeds: carga el usuario logueado (`ngAfterViewInit`), abre el diálogo de publicar (`openAgregar`) y cierra sesión (`cerrarSesion`, solo borra la ruta, **no limpia `localStorage`**, ver observaciones).
- **`menu3/`** — Variante de barra superior usada en vistas de administración/tablas/`eliminar*` (mismo patrón que `menu2` pero sin botón de publicar).
- **`shoe-classifier/`** (fuera de `components/`) — Demo de clasificación de imágenes de zapatos en el navegador usando TensorFlow.js y el modelo en `src/assets/model_zapato/`; **no tiene ruta asignada ni está incluido en ninguna plantilla** (ver observaciones — componente huérfano).

#### Componentes vacíos / placeholder

- **`eliminar/`**, **`eliminar-user/`** — Solo contienen el layout base (`<app-menu3>` + `<p>...works!</p>`, el texto por defecto que genera `ng generate component`). No tienen lógica TypeScript ni formulario real, pese a estar enrutados (`/eliminar`, `/eliminarUser`).
- **`admin/`** — Igual: solo el layout base (`mat-drawer-container` + `menu3`), sección de contenido vacía.

---

### 2.5 Backend Node/Express (`conexionbase-proyecto/`)

**`src/index.js`** — Carga variables de entorno (`dotenv`), importa la app de Express desde `config/server.js`, monta el router de `app/rutas/glamfinds.js` en la raíz (`/`) y arranca el servidor en `process.env.PUERTO || 5000`.

**`src/config/server.js`** — Configura Express: `express.json()`, CORS abierto a cualquier origen, `body-parser`, límite de payload de 10 MB (para imágenes en base64), servido estático de `img` (ruta relativa `img`, casi con seguridad rota — ver observaciones) y un middleware de manejo de errores genérico. Importa `WebhookClient` de `dialogflow-fulfillment` pero **nunca lo usa**.

**`src/config/database.js`** — Crea la conexión MySQL (`mysql.createConnection`) a `localhost/glamfinds` con usuario `root` sin contraseña; loguea éxito/error por consola.

**`src/config/gemini.js`** — `generarOutfitIA(ocasion, clima, colores, intento)`: construye un prompt detallado para el modelo `gemini-3.1-flash-lite`, pide un JSON con `top/bottom/shoes/accessory` (+ sus `_query` de búsqueda en inglés) y una `reason`; reintenta hasta 3 veces con backoff si la API responde 503 (saturada).

**`src/config/pexels.js`** — `buscarImagenPexels(consulta)`: busca 1 foto en orientación retrato en la API de Pexels para una consulta de texto (usada para ilustrar cada prenda del outfit generado por Gemini).

**`src/app/rutas/glamfinds.js`** — Archivo con **toda la API REST** (~1830 líneas, sin dividir en subrouters). Contiene:
- Utilidades de color: `colorShades` (mapa de ~150 tonos con nombre y RGB, duplicado del que existe en cada componente Angular), `getAllColors`, `colorDistance`, `findClosestColor`.
- `addPrendasToPosts(posts, callback)` — enriquece una lista de posts con sus prendas detectadas (`post_prendas`) para los feeds nuevos.
- `CATEGORIA_LABELS` — mapeo de categorías (top/bottom/shoes/accessory) a etiquetas de segmentación (definido pero sin uso visible en el resto del archivo, ver observaciones).
- **Rutas de posts generales**: `GET /api-fashion-trends` (proxy a NewsAPI con API key hardcodeada en el código), `POST /agregarPost` (sube imagen/video con `multer`, si es imagen la envía al microservicio `analyze-outfit` para guardar prendas y zonas de maquillaje detectadas), `GET /obtener` (feed principal con prendas y maquillaje), `GET /getRopa|getZapatos|getMaquillaje|getAccesorios`.
- **Interacciones**: likes/comentarios/guardados para posts generales (`/likes`, `/comments` —con moderación vía llamada a un endpoint `/moderate` del microservicio que **no existe** en `ai_service/app.py`, ver observaciones—, `/save`, `/borrarLikes`, `/borrarSaves`, `/updateCom`, `/borrarComment`, `/getComment`) y sus equivalentes para posts de publicidad (sufijo sin cambios de nombre, mismas rutas con `P`: `/likesP`, `/commentsP`, etc.) y para artículos (sufijo `ART`).
- **Publicidad/descuentos/dups**: `GET /getDescuentos`, `GET /getDups`, `POST /agregarPostP`.
- **Usuario**: `GET /user:id`, `POST /login` (registro), `POST /verificar` (login), `GET /getsave:id`, `GET /getdescripcion:id`, `GET /PostPerfil:id`, `GET /PostDes:id`, `POST /update2/:id` (editar perfil), `DELETE /borrarPosts/:id`.
- **Edición de posts (admin)**: `GET /modificar1/:id`, `POST /update1/:id`.
- **Color**: `POST /extract-colors` (usa `node-vibrant` sobre una URL de imagen), `GET /filtrar` (consulta a una tabla `post_generales` que no coincide con el nombre real `posts_generales`, ver observaciones).
- **Looks aleatorios**: `GET /generar-look` / `GET /generar-lookM` (arma un look consultando 5 tablas distintas con `ORDER BY RAND() LIMIT 1`).
- **Artículos (blog)**: CRUD completo análogo al de posts generales (`/agregarART`, `/obtenerART`, likes/comentarios/saves `...ART`).
- **Follows y estadísticas**: `POST /follow`, `POST /unfollow`, `GET /followers/:id`, `GET /following/:id`, `GET /user-stats/:id`.
- **Feeds algorítmicos** (funcionalidad más reciente del proyecto): `GET /trending` (ranking por `(likes + comentarios*2) / horas_desde_publicación`), `GET /feed/:id` (posts de usuarios seguidos), `POST /actualizarPreferencias` (registra afinidad usuario↔prenda al dar like), `GET /parati/:id` (recomendación por prendas preferidas).
- **Categorías**: `GET /categorias`.
- **Outfit con IA**: `POST /outfit-ia/generar` (orquesta Gemini + Pexels), `POST /outfit-ia/guardar`, `GET /outfit-ia/guardados/:id_usuario`, `DELETE /outfit-ia/eliminar/:id_outfit`.

**`tablas.sql`** — Script SQL con `CREATE TABLE usuarios` y `CREATE TABLE comics`; **no corresponde al esquema real usado por `glamfinds.js`** (que usa tablas como `posts_generales`, `likes_postG`, `comments_postG`, `post_prendas`, `post_makeup_zones`, `followers`, `user_preferred_labels`, `outfits_guardados`, etc., ninguna de las cuales aparece aquí).

**`src/sql/queries.sql`** — Igual que el anterior: script de ejemplo con tablas `usuarios`/`comics` de un ejercicio de clase distinto ("tarea-4").

**`test_opencv.js`** — Script de una sola línea que imprime la versión de `opencv4nodejs`; no se importa desde ningún otro archivo ni se referencia en `package.json` `scripts`.

**`src/yolo/yolo_model.py`** — Script Python independiente (no Node) que carga un modelo YOLOv8 (`yolov8x.pt`) y detecta objetos en una imagen cuya ruta está hardcodeada a la máquina de un desarrollador distinto. No se invoca desde ningún otro archivo del backend Node ni del `ai_service`.

**`uploads/`** — Carpeta con ~9 imágenes de prueba; el middleware `multer` de `glamfinds.js` en realidad guarda los archivos en una ruta absoluta hardcodeada fuera de este repo (`C:\Users\danie\...\GlamFinds\src\assets\img`), por lo que esta carpeta parece ser un destino de subida usado en una configuración anterior.

### 2.6 Microservicio de IA (`ai_service/app.py`)

Aplicación **FastAPI** que carga en memoria, al iniciar:
- Un modelo de **segmentación semántica de moda** (`sayeed99/segformer-b3-fashion`, vía HuggingFace `transformers`) para detectar prendas.
- Un modelo **OWL-ViT** (`google/owlvit-base-patch32`) para detección de joyería/accesorios por texto (zero-shot).
- **MediaPipe FaceMesh** (con 3 estrategias de importación en cascada, por compatibilidad de versiones) para detectar landmarks faciales y analizar zonas de maquillaje.

Funciones auxiliares:
- `get_dominant_colors_from_array(img_array, k)` — K-Means en espacio de color LAB para extraer los 3 colores dominantes de un recorte de imagen.
- `isolate_foreground_otsu(crop_bgr)` — separa primer plano/fondo con umbralización de Otsu (usado antes de sacar colores de joyería).
- `get_landmark_points`, `get_roi_mask_and_crop`, `compute_lab_distance`, `color_mas_cercano`, `generar_link_producto` — utilidades exclusivas de MediaPipe para recortar zonas del rostro (labios, ojos, mejillas), medir distancia de color a la piel de referencia y generar un link de búsqueda en Sephora.

Endpoints:
- `POST /segment-outfit` — Segmenta las prendas de una imagen (por ruta local `image_path`) y devuelve, por cada una: etiqueta, confianza, bounding box, 3 colores dominantes y máscara en base64.
- `POST /detect-jewelry` — Detecta joyería/accesorios (aretes, collares, anillos, relojes, etc.) por detección de objetos guiada por texto.
- `POST /detect-makeup` — Requiere `MEDIAPIPE_AVAILABLE`; detecta si hay maquillaje en labios/ojos/mejillas comparando el color de cada zona contra un color de piel de referencia (distancia LAB > umbral por zona).
- `POST /visualize-segmentation` — Devuelve una imagen PNG (base64) con la segmentación superpuesta a color, para depuración visual.
- `POST /analyze-outfit` — Endpoint "todo en uno" usado por el backend Node al publicar un post: combina segmentación de prendas + joyería + maquillaje + detección de rostro en una sola llamada (es el que realmente consume `glamfinds.js` en `/agregarPost`).
- `POST /moderate` — **Comentado en el código** (líneas finales del archivo); referenciaría una función `moderate_text` que no está definida en este archivo. El backend Node sí intenta llamarlo (ver observaciones).

---

## 3. Modelo de datos (según el uso real del código, no según `tablas.sql`)

A partir de las consultas en `glamfinds.js`, el esquema MySQL real esperado incluye (entre otras) las tablas: `usuarios`, `categorias`, `posts_generales`, `posts_publicidad`, `posts_articulos`, `post_prendas`, `post_makeup_zones`, `likes_postG` / `likes_postp` / `likes_articulos`, `comments_postG` / `comments_postp` / `comments_articulos`, `save_postG` / `save_postP` / `save_articulos`, `followers`, `user_preferred_labels`, `outfits_guardados`, y las tablas de prendas para "look aleatorio" (`tops`, `pantalones`, `accesorios`, `zapatos`, `chaquetas` y sus variantes `...H`). **Ninguno de los dos scripts `.sql` del repo (`tablas.sql`, `src/sql/queries.sql`) define este esquema** — ver observaciones.

---

## 4. Assets (`GlamFinds/src/assets/`)

- `img/` — ~108 imágenes/videos de ejemplo usados por los posts sembrados en la base de datos.
- `tryon/` — ~26 imágenes recortadas (fondo transparente) usadas como "prendas" de prueba en el armario virtual (`try-on/`).
- `model_zapato/` — Modelo TensorFlow.js (`model.json`, `weights.bin`, `metadata.json`) consumido únicamente por `shoe-classifier/`, componente huérfano (ver observaciones).
- Íconos sueltos (`logo.png`, `like.png`, `guardar.png`, `enviar.png`, `mensaje.png`, `menus.png`, `random.png`, `smile.png`, `icon.png`, `1.png`/`2.png`/`3.png`, `fotoarticulo.png`, `tryon.png`).

---

## 5. Observaciones — código, archivos o configuración que parecen sin uso u obsoletos

> Nada de esto fue eliminado ni modificado; se señala únicamente para que el equipo lo revise.

1. **`README.md` (raíz del repo) está vacío.** No documenta qué es el repositorio ni cómo levantar los 3 proyectos juntos.
2. **`ai_service/requirements.txt` está vacío**, pese a que `app.py` depende de `fastapi`, `transformers`, `torch`, `opencv-python`, `scikit-learn`, `scikit-image`, `mediapipe`, `pillow`, `pydantic`, etc. Cualquiera que clone el repo no puede instalar el entorno del microservicio a partir de este archivo.
3. **Integración chat/moderación rota**: `ChatService.sendMessage()` (frontend) llama a `http://localhost:8000/api/requestText`, y `POST /comments` (backend Node, `glamfinds.js`) llama a `http://127.0.0.1:8000/moderate` — **ninguna de las dos rutas existe** en `ai_service/app.py` (el `/moderate` está comentado y sin la función `moderate_text` definida; `/api/requestText` no existe en absoluto). Es decir, el `AsistenteComponent` (chatbot) y la moderación de comentarios en los feeds "clásicos" fallarán siempre en tiempo de ejecución contra el `ai_service` actual.
4. **Bug en `POST /commentsART`** (`conexionbase-proyecto/src/app/rutas/glamfinds.js`): usa `filter.isProfane(...)` pero la variable `filter` **nunca se declara ni se importa** en ese archivo (a diferencia del frontend, que sí crea su propio `new Filter()` de `bad-words` en cada componente). Esa ruta lanzará un `ReferenceError` en cuanto se invoque.
5. **Rutas de archivos hardcodeadas a una máquina de desarrollo específica**, que no existen en este entorno:
   - `angular.json` → `input: "C:/Users/gabri/OneDrive/Documentos/Codigo-Fuente-SP2-main/GlamFinds/GlamFinds/src/assets/img"` (glob de assets adicional).
   - `glamfinds.js` → destino de `multer` (`C:\Users\danie\...\GlamFinds\src\assets\img`) usado en `/agregarPost`, `/agregarPostP`, `/login`.
   - `yolo_model.py` → ruta de imagen de prueba hardcodeada a otra máquina (`C:\Users\danie\...`).
   Esto sugiere que el proyecto se desarrolló en varias máquinas distintas y esas rutas quedaron "quemadas" en el código en vez de ser configurables.
6. **`conexionbase-proyecto/package.json`** tiene `"name": "tarea-4"` y `"author": "Sandra Soria"` — nombre genérico de una tarea universitaria, no del proyecto GlamFinds. Sugiere que este backend partió de una plantilla de otro ejercicio de clase.
7. **`tablas.sql` y `src/sql/queries.sql` no coinciden con el esquema real** que usa `glamfinds.js`. `tablas.sql` crea tablas `usuarios`/`comics`; `queries.sql` también crea `usuarios`/`categorias`/`posts_generales`/`posts_publicidad` pero con columnas distintas a las que el código realmente consulta (p. ej. usa `contrase` en el código pero el `CREATE TABLE` de `queries.sql` sí coincide en eso; en cambio `tablas.sql` usa `clave` y una tabla `comics` que no tiene relación con moda). Ninguno de los dos scripts crea `post_prendas`, `post_makeup_zones`, `followers`, `user_preferred_labels`, `outfits_guardados`, etc., que sí se usan activamente. **No hay un script de esquema actualizado y fiable en el repo.**
8. **`test_opencv.js`** y **`src/yolo/yolo_model.py`** son scripts sueltos de prueba/prototipo que no están integrados al flujo de la aplicación (no se importan ni se llaman desde `index.js`, `glamfinds.js` ni `ai_service/app.py`). Parecen restos de experimentación con librerías de visión por computador (OpenCV, YOLO) que finalmente no se usaron (el proyecto terminó usando Segformer + OWL-ViT + MediaPipe en `ai_service/app.py`).
9. **`conexionbase-proyecto/uploads/`** contiene imágenes de prueba, pero el código de subida (`multer`) actualmente escribe en una ruta absoluta distinta (ver punto 5), por lo que esta carpeta no recibe archivos nuevos con la configuración actual.
10. **Componentes huérfanos** (declarados en `AppModule` y con su propio `@Component`, pero sin ruta asignada y sin que su selector aparezca en ninguna plantilla `.html` del proyecto):
    - **`shoe-classifier/`** — Demo funcional de clasificación de zapatos con TensorFlow.js, pero inaccesible desde la UI (no está en `app-routing.module.ts` ni referenciado por ningún `<app-shoe-classifier>`).
    - **`widget/`** (`WidgetComponent`) — Mini-widget de noticias; el propio `CLAUDE.md` del proyecto documenta explícitamente: *"Sin elementos flotantes: No agregar FAB buttons, `df-messenger`, ni `app-widget` en ningún componente de feed. Fueron eliminados deliberadamente."* — es decir, quedó como código muerto a propósito, pendiente de borrar.
    - **`admin/`**, **`eliminar/`**, **`eliminar-user/`** — Sí tienen ruta (`/admin`, `/eliminar`, `/eliminarUser`) y se puede navegar a ellas, pero sus plantillas están **vacías o con el texto placeholder por defecto de Angular CLI** (`<p>eliminar works!</p>`) y sus clases `.ts` no tienen ninguna propiedad ni método — parecen features nunca implementadas.
11. **Script de Dialogflow Messenger en `index.html`** (`<script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js...">`) se sigue cargando en cada carga de página, pero no hay ningún `<df-messenger>` en ninguna plantilla del proyecto (fue removido según la nota de "Convenciones" en `CLAUDE.md`). Es peso muerto de red en cada carga.
12. **`models/message.model.ts`** (`export class Message { text; date; userOwner }`) no tiene ninguna referencia de import en todo `src/` — parece un modelo de un chat con burbujas fecha/emisor que se dejó de usar en favor del array `messages` con tipo inline en `asistente.component.ts`.
13. **`text-message.model.ts`** y **`response-message.model.ts`** se importan en `backend.service.ts` pero **no se usan** como tipo en ningún método concreto de esa clase (no aparecen como tipo de retorno de ningún `Observable<...>` dentro del archivo); y `chat.service.ts` define su **propia interfaz local** `ResponseMessage` en vez de reutilizar la de `models/response-message.model.ts`, generando dos definiciones distintas con el mismo nombre.
14. **`share-data.service.ts`** (`ShareDataService`) se inyecta en varios componentes (`editar`, `modificar`, `modificar-comm*`) pero sus métodos `setNewUser`/`setListadoTendencias` casi no se invocan — la mayoría de componentes prefieren pedir los datos de nuevo al backend en cada `ngOnInit` en lugar de leer del store compartido, por lo que el servicio aporta muy poco valor real actualmente.
15. **`CATEGORIA_LABELS`** (definido en `glamfinds.js`, líneas ~311-316) se declara pero no se referencia en el resto del archivo — parece preparado para una función de categorización automática de prendas que no llegó a implementarse.
16. **`GET /filtrar`** (`glamfinds.js`) consulta `FROM post_generales` (sin la `s` de `posts_generales`), lo que casi con certeza produce un error de "tabla no existe" si se llega a invocar; no se encontró ninguna llamada a esta ruta desde `backend.service.ts`, por lo que parece código muerto que además está roto.
17. **`Menu2Component.cerrarSesion()` / `Menu3Component.cerrarSesion()`** solo hacen `this.router.navigate(['/'])`; **no borran `localStorage.getItem('ids')`** ni `'user'`, por lo que "cerrar sesión" no cierra realmente la sesión (el siguiente `ngOnInit` de cualquier feed seguirá leyendo el `ids` anterior).
18. **Duplicación masiva de código**: la paleta `colorShades` (~150 tonos) y la lista de ~90 palabras malsonantes en español están copiadas y pegadas de forma idéntica en cada uno de los ~12 componentes de feed, y también existe una copia adicional del mapa de colores en el propio backend (`glamfinds.js`). Cualquier corrección o ampliación de estas listas hoy requiere editarlas en más de 12 archivos distintos.
19. **Pruebas unitarias**: todos los archivos `*.spec.ts` del frontend son el boilerplate por defecto generado por `ng generate component/service` (`it('should create', ...)`), sin ninguna aserción sobre el comportamiento real de los componentes/servicios. El backend Node y `ai_service` no tienen ningún archivo de pruebas.
20. **Puertos inconsistentes en la documentación interna**: `GlamFinds/CLAUDE.md` indica que el backend corre en `http://localhost:8000` y que ese es también el chat IA, pero el código real (`environment.ts`, `index.js`) usa el puerto **5000** para el backend Node, mientras que **8000** es en realidad el puerto del microservicio Python `ai_service` (FastAPI). Quien siga la guía `CLAUDE.md` al pie de la letra apuntará el frontend al servicio equivocado.
