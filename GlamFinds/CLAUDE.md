# GlamFinds — Guía rápida para Claude

App social de moda estilo Pinterest/Instagram. Angular 16, módulo-based (no standalone).

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 16, Angular Material |
| Estilos | SCSS con design tokens en `src/styles.scss` |
| Backend | REST API en `http://localhost:8000` |
| Chat IA | `http://localhost:8000/api/requestText` (ChatService) |
| Auth | localStorage (`ids` = id del usuario logueado) |
| Fuentes | Playfair Display (serif, títulos) + DM Sans (sans, cuerpo) |

---

## Estructura de carpetas

```
src/
├── app/
│   ├── components/       — Un directorio por componente
│   ├── services/
│   │   ├── backend.service.ts   — Todas las llamadas HTTP
│   │   ├── chat.service.ts      — Chatbot IA
│   │   └── share-data.service.ts
│   ├── models/           — DTOs (Posts, Likes, Comments, Save, Usuario, etc.)
│   ├── app-routing.module.ts
│   └── app.module.ts
├── assets/img/           — Imágenes y videos de posts (referenciados como ../../../assets/img/nombre)
├── environments/
│   └── environment.ts    — api_backend: "http://localhost:8000"
└── styles.scss           — Design system global
```

---

## Rutas principales

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | IngresoComponent | Login |
| `/home` | TendenciasComponent | Feed principal (masonry Pinterest) |
| `/ropa` | RopaComponent | Feed de ropa |
| `/maquillaje` | MaquillajeComponent | Feed de maquillaje |
| `/accesorios` | AccesoriosComponent | Feed de accesorios |
| `/zapatos` | ZapatosComponent | Feed de zapatos |
| `/descuentos` | DescuentosComponent | Feed de descuentos |
| `/dups` | DupsComponent | Outfit del día |
| `/moodboard` | MoodboardComponent | Moodboards |
| `/articulo` | ArticulosComponent | Artículos |
| `/randlook` | RandlookComponent | Outfit aleatorio |
| `/tryon` | TryOnComponent | Armario virtual |
| `/noticias` | NoticiasComponent | Noticias de moda |
| `/asistente` | AsistenteComponent | Chat IA |
| `/perfil/:id` | PerfilComponent | Perfil de usuario |
| `/configuracion` | EditarComponent | Editar perfil propio |
| `/registrar` | RegistroComponent | Registro |
| `/admin` | AdminComponent | Panel admin |
| `RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })` | — | Permite re-navegar a la misma ruta |

---

## Componentes de layout (siempre presentes)

- **menu/menu.component** — Sidebar izquierdo (220px), secciones "MI ESTILO" y "DESCUBRIR"
- **menu2/menu2.component** — Topbar: logo + buscador + tabs (Para ti / Siguiendo / Tendencias) + botón Publicar

El layout de cada página usa `mat-drawer-container` + `mat-drawer` (sidebar) + contenido principal.

---

## Design tokens (`src/styles.scss`)

```scss
:root {
  --sidebar-width: 220px;    /* NUNCA bajar de 220px — causó bug histórico */
  --topnav-height: 54px;
  --clr-cream:  #F7F3EE;    /* fondo principal */
  --clr-rose:   #D4A5A5;    /* color acento principal */
  --clr-gold:   #C4A882;    /* acento secundario */
  --clr-black:  #0A0A0A;
  --font-serif: 'Playfair Display', Georgia, serif;  /* títulos */
  --font-sans:  'DM Sans', 'Helvetica Neue', Arial, sans-serif;  /* cuerpo */
}
mat-drawer {
  background: #FFFFFF !important;
  width: var(--sidebar-width) !important;  /* forzado para todos los drawers */
}
```

> **Importante**: El `width: var(--sidebar-width) !important` en `mat-drawer` global sobreescribe cualquier ancho definido en el componente. Si el sidebar se ve angosto, buscar aquí primero.

---

## Servicios clave

### BackendService (`backend.service.ts`)
Todas las llamadas van a `environment.api_backend` = `http://localhost:8000`.

```typescript
// Posts
obtenerTendencias()         // GET /obtener — feed principal
obtenerRopa/Zapatos/Maquillaje/Accesorios()
getTrends()                 // noticias de moda

// Interacciones
guardarLikes(likes: Likes)          // POST /likes
eliminarLike(postId, navegante)     // DELETE /borrarLikes/:postId/:userId
countLike(id_post)                  // GET /countLike:id

guardarComentarios(comment: Comments)  // POST /comments
obtenerComentarios(id_post)            // GET /getComentarios:id
eliminarComentario(postId, userId, commentId)
modificarComentario(id_comment, comment)

guardarFavoritos(save: Save)         // POST /save
eliminarSave(postId, navegante)      // DELETE /borrarSaves/:postId/:userId
getSave(id_user)

// Usuario
ingresarMenu(user: Usuario_ver)      // POST /verificar
obtenerUsuario(id_user)              // GET /user:id
getdescripcion(id_user)              // GET /getdescripcion:id (incluye imagen de perfil)
```

### ChatService (`chat.service.ts`)
```typescript
sendMessage(proyectId: string, message: string): Observable<ResponseMessage>
// POST http://localhost:8000/api/requestText
// { proyectId, requestText }
```

---

## Modelos importantes

| Modelo | Campos clave |
|--------|-------------|
| Posts | `id_post, imagen, descripcion, usuario, id_user, categoria, prenda1-5, link1-5` |
| Likes | `id_post, id_user` |
| Comments | `id_post, id_user, comentario` |
| Save | `id_post, id_user` |
| Usuario_ver | `usuario, contrase` |

---

## TendenciasComponent — el más complejo

**Archivo**: `src/app/components/tendencias/`

### Variables de estado
```typescript
dataSource: any[]           // todos los posts
filteredItems: any[]        // posts filtrados por búsqueda/categoría
toggle: boolean[]           // estado like por índice de loop (toggle[i])
toggle1: boolean[]          // estado guardado por índice de loop
likes: { [id_post]: { cantidad: number } }  // conteo real de likes
comentarios: { [id_post]: any[] }           // lista de comentarios por post
comentario: { [id_post]: string }           // ngModel del input de comentario
perfil: { [id_user]: { imagen, usuario } }  // datos de perfil de autores
showEmojiPicker: { [id_post]: boolean }     // toggle del selector de emojis
user: any                   // usuario logueado (imagen, nombre)
usuariolog: number          // id del usuario logueado (localStorage 'ids')
```

### Funciones principales
```typescript
like(post: number, index: number)      // toggle like, actualiza toggle[index]
save(post: number, index: number)      // toggle guardado, actualiza toggle1[index]
comment(post: number)                  // envía comentario, recarga lista
deleteComment(postId, userId, commentId)
isImage(fileName: string): boolean     // true si es imagen, false si es video
toggleEmojiPicker(postId: number)
insertEmoji(emoji: string, postId: number)
replyTo(username: string, postId: number)  // foca input con @username
goToProfile(userId: number)            // navega a /perfil/:userId
```

### Lógica de índices (importante)
- `toggle[i]` y `toggle1[i]` usan el **índice del ngFor** (`i`), no el `id_post`
- `likes[articulo.id_post]` y `comentarios[articulo.id_post]` usan el **id del post**
- `like(articulo.id_post, i)` recibe ambos por eso

### CSS modal (CSS-only, sin TypeScript)
```html
<input type="checkbox" [id]="'p'+articulo.id_post" class="modal-toggle">
<label [for]="'p'+articulo.id_post"><!-- clickable area --></label>
<div class="post-modal"><!-- modal content --></div>
```
```scss
.modal-toggle { display: none; }
.post-modal { visibility: hidden; opacity: 0; transition: 0.25s; }
.modal-toggle:checked ~ .post-modal { visibility: visible; opacity: 1; }
```

### Layout del modal
```
modal-box (flex row, 980px x 680px, overflow: hidden)
├── modal-left  (imagen del post, 55%)
└── modal-right (flex column, 45%, overflow: hidden, height: 100%)
    ├── modal-header-row  (avatar + info + X)
    ├── modal-scroll      (flex: 1, overflow-y: auto)
    │   ├── descripción, hashtags
    │   ├── stats (likes + comentarios)
    │   └── lista de comentarios
    └── modal-input-wrap  (flex-shrink: 0, siempre visible al fondo)
        ├── emoji-panel (condicional)
        └── modal-input-row (avatar + emoji-toggle + input + botón Publicar)
```

> **Bug histórico**: Si `.modal-right` no tiene `overflow: hidden` + `height: 100%`, el botón "Publicar" queda oculto debajo del modal-box.

---

## Convenciones del proyecto

- **No usar `location.reload()`** — rompe la UX. Después de guardar un comentario, usar `obtenerComentariosAsync(post)` para refrescar sin recargar.
- **Imágenes**: siempre con `loading="lazy"` y `object-fit: cover; object-position: center top` para no cortar la parte superior.
- **Sin elementos flotantes**: No agregar FAB buttons, `df-messenger`, ni `app-widget` en ningún componente de feed. Fueron eliminados deliberadamente.
- **Tipografía**: Playfair Display para títulos/headings, DM Sans para cuerpo y UI.
- **Paleta rosa**: `#c9687a` = rosa activo (like), `#D4A5A5` = rosa claro (--clr-rose), `#C4A882` = oro (--clr-gold).
- **`mat-icon` color**: Aplicar color directamente sobre el `mat-icon` en SCSS, no solo en el botón padre (la herencia de color puede fallar con Material).
- **ViewEncapsulation**: Todos los componentes usan la encapsulación emulada por defecto. Para estilos que afecten hijos de Angular Material, usar `::ng-deep` si es necesario.

---

## Autenticación

```typescript
// Leer usuario logueado
const id = localStorage.getItem('ids');  // string con el id numérico
const userId = parseInt(id);

// Guardar al login (en IngresoComponent)
localStorage.setItem('ids', response.id_user.toString());
localStorage.setItem('user', response.usuario);
```

---

## Comandos útiles

```bash
ng serve          # Dev server en http://localhost:4200
ng build          # Build de producción
```

El backend debe estar corriendo en `http://localhost:8000` (ver `environment.ts`).
