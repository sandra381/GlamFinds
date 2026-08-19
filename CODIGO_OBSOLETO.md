# Código obsoleto / posiblemente muerto

Este documento lista funciones, variables, imports, rutas y archivos completos que, tras
revisar el proyecto (frontend Angular, backend Node/Express y el microservicio Python
`ai_service`), **no se encontraron referenciados en ningún otro lugar del código**.

**Metodología**: búsqueda cruzada por nombre (grep) entre quien define algo (función, ruta,
componente, import) y quien lo consume (llamadas, templates, imports, rutas del router). Es
un análisis heurístico: puede haber falsos positivos si algo se invoca de forma muy dinámica
(por ejemplo, una URL armada por concatenación con un nombre que el grep no reconoce). Donde
hubo dudas, se indica explícitamente. **No se borró ni modificó nada, solo se documenta.**

---

## conexionbase-proyecto/src/app/rutas/glamfinds.js

- **Imports sin usar**: `sharp`, `fs`, `getColors` (`get-image-colors`). Cada uno solo aparece
  una vez en todo el archivo: la propia línea de `require(...)`. Ninguna función del archivo
  los invoca.
- **Subsistema de colores muerto**: el objeto `const colorShades = {...}` (~200 líneas, líneas
  ~34-249) y las funciones `getAllColors()`, `colorDistance()` y `findClosestColor()`
  (líneas ~255-283). `getAllColors` y `findClosestColor` no se llaman desde ninguna ruta;
  `colorDistance` solo se llama desde dentro de `findClosestColor`. Como nada invoca a
  `findClosestColor`, toda la cadena (incluyendo el objeto `colorShades` que le da los datos)
  queda sin usar. El endpoint real de colores (`/extract-colors`) usa `node-vibrant`, no estas
  funciones.
- **Ruta `/getdescripcion:id`**: no se encontró ningún método en `backend.service.ts` que
  apunte a esta URL (el método `getdescripcion()` que sí existe en el servicio tampoco lo llama
  ningún componente — ver hallazgo en `backend.service.ts`).
- **Ruta `/PostDes:id`**: mismo caso; el método `PostDes()` del servicio existe pero no lo usa
  ningún componente.
- **Ruta `/obtenerprenda`**: el método `obtenerPrenda()` del servicio existe pero no lo llama
  ningún componente.
- **Ruta `/filtrar`**: no se encontró ninguna referencia a `/filtrar` en todo
  `GlamFinds/src/app` (ni en `backend.service.ts` ni en componentes).
- **Rutas `/follow`, `/unfollow`, `/followers/:id`, `/following/:id`**: no hay ningún método en
  `backend.service.ts` ni texto "follow/unfollow/seguir" en los componentes que las use. Sí se
  usa `/user-stats/:id` (que internamente cuenta seguidores/seguidos), pero la acción de
  seguir/dejar de seguir y los listados de seguidores/seguidos no tienen consumidor en el
  frontend actual.
- **Llamada a `http://127.0.0.1:8000/moderate`** dentro de `router.post('/comments', ...)`
  (línea ~879): apunta a un endpoint que está **comentado/deshabilitado** en
  `ai_service/app.py` (`# @app.post("/moderate")`). No es código muerto en sí (se ejecuta en
  cada comentario), pero en la práctica siempre falla y cae al `catch`, por lo que la
  moderación de comentarios está rota/inactiva. Se documenta aquí por estar directamente
  ligada a código deshabilitado en `ai_service`.

## conexionbase-proyecto/src/config/server.js

- **Import sin usar**: `const { WebhookClient } = require('dialogflow-fulfillment');`. No
  aparece ninguna otra referencia a `WebhookClient` en el archivo. Es también la única razón
  por la que el paquete `dialogflow-fulfillment` figura como dependencia usada; sin este
  import, ninguna parte del backend lo necesitaría.

## conexionbase-proyecto/package.json

- **Dependencias declaradas que no se usan en ningún `require(...)` del código** (`src/`):
  `@google-cloud/dialogflow`, `@okta/jwt-verifier`, `@tensorflow/tfjs-node`, `clarifai`,
  `clarifai-nodejs-grpc`, `dialogflow`, `errorhandler`, `express-bearer-token`,
  `express-session`, `jimp`, `method-override`, `methods`, `morgan`, `quill`, `sqlite3`,
  `typeorm`, `uuid`. Ninguna aparece en un `require('<paquete>')` dentro de `src/`.
  *(`typescript`/`tsc` no se listan aquí porque podrían usarse solo como herramientas de build,
  no se verificó a fondo.)*

## conexionbase-proyecto/src/yolo/yolo_model.py

- **Archivo completo posiblemente obsoleto**: no hay ningún `child_process`/`spawn`/`exec` en
  todo el backend Node que invoque este script, y `ai_service/app.py` (el microservicio de IA
  activo) usa modelos Segformer + OwlViT en vez de YOLO para detectar prendas. Además el script
  tiene rutas absolutas hardcodeadas de otra máquina/desarrollador
  (`C:\Users\danie\...`), lo que sugiere que quedó de una iteración anterior del proyecto.

## conexionbase-proyecto/test_opencv.js

- **Archivo completo obsoleto/roto**: script de prueba suelto en la raíz que hace
  `require('opencv4nodejs')`, paquete que **no figura como dependencia** en `package.json` (no
  podría ejecutarse tal cual). No se referencia desde ningún script de `package.json` ni desde
  otro archivo.

## conexionbase-proyecto/src/sql/queries.sql

- **Archivo completo, esquema desactualizado/no relacionado**: define tablas `usuarios` (con
  columnas `usuario, clave, fecha_nac, sexo`) y `comics` — nombres y columnas que no coinciden
  con el esquema real que usan las consultas de `glamfinds.js` (que usa `usuarios` con columnas
  `usuario, nombre, apellido, edad, sexo, correo, contrase, imagen, descripcion`,
  `posts_generales`, `posts_publicidad`, `categorias`, etc. — ese esquema sí coincide con
  `conexionbase-proyecto/tablas.sql`). Todo indica que `queries.sql` es un esquema de otra
  versión/plantilla del proyecto ("comics") que quedó sin borrar.

## ai_service/app.py

- **Endpoint `/moderate` deshabilitado** (líneas finales, todo comentado con `#`). Como
  consecuencia:
  - La clase `InputText(BaseModel)` (línea ~664) solo se usa dentro de ese endpoint comentado
    → queda sin uso real.
  - El comentario hace referencia a una función `moderate_text(...)` que **no está definida ni
    importada** en ningún lugar del archivo — si se reactivara el endpoint tal cual, fallaría.
  - Ligado a esto, la llamada activa desde el backend Node
    (`glamfinds.js`, `POST /comments`) a `http://127.0.0.1:8000/moderate` siempre falla en
    tiempo de ejecución (ver hallazgo en `glamfinds.js`).

## ai_service/requirements.txt

- **Archivo vacío**: no lista ninguna de las dependencias que `app.py` sí importa
  (`fastapi`, `transformers`, `torch`, `opencv-python`, `scikit-learn`, `scikit-image`,
  `mediapipe`, etc.). No es "código muerto" en sí, pero es un archivo de configuración
  incompleto/no funcional que vale la pena señalar.

## GlamFinds/src/app/shoe-classifier/shoe-classifier.component.ts

- **Componente completo sin uso**: declarado en `app.module.ts` (`ShoeClassifierComponent`),
  pero su selector `app-shoe-classifier` no aparece en ningún `.html` del proyecto, no está
  registrado en `app-routing.module.ts`, y no se abre por `MatDialog` desde ningún componente
  (a diferencia de otros diálogos como `AgregarPubUComponent`, que sí se abren así). Único
  archivo que lo referencia fuera de su propia carpeta es `app.module.ts` y su `.spec.ts`.

## GlamFinds/src/app/components/widget/widget.component.ts

- **Componente completo sin uso real**: declarado en `app.module.ts` e importado en
  `tendencias.component.ts`, pero su selector `app-widget` no aparece en ningún `.html`. El
  propio `CLAUDE.md` del proyecto confirma que los elementos flotantes tipo widget "fueron
  eliminados deliberadamente" de los feeds, lo que coincide con este hallazgo.

## GlamFinds/src/app/components/tendencias/tendencias.component.ts

- **Import sin usar**: `import { WidgetComponent } from '../widget/widget.component';` — la
  clase `WidgetComponent` no se instancia ni se referencia en el resto del archivo (ver
  hallazgo anterior).
- **Variable sin usar**: `showWidget: boolean = true;` — no se lee en el `.html` del componente
  ni en ningún método del `.ts`. Parece un remanente del widget flotante ya retirado.

## GlamFinds/src/app/services/share-data.service.ts

- **Servicio prácticamente muerto en su totalidad**: se inyecta en el constructor de 12
  componentes (`editar`, `modificar`, `modificar-comm`, `modificar-comm-art`,
  `modificar-comm-p`, `tabla-accesorios`, `tabla-descuentos`, `tabla-dups`,
  `tabla-maquillaje`, `tabla-ropa`, `tabla-tendencias`, `tabla-zapatos`), pero ninguno de ellos
  llama a `setNewUser()` ni `setListadoTendencias()`, ni se suscribe a `currentuser` o
  `currentListadoTendencias`. Es decir: se inyecta la dependencia pero nunca se usa.

## GlamFinds/src/app/services/backend.service.ts

- **Método `getdescripcion(id_user)`**: no lo llama ningún componente (`grep` de
  `.getdescripcion(` en todo `src/app` no da resultados fuera del propio servicio). La ruta
  backend `/getdescripcion:id` que consume sí existe pero queda igualmente sin consumidor real.
- **Método `PostDes(id_user)`**: mismo caso, sin llamadas desde ningún componente.
- **Método `obtenerPrenda()`**: mismo caso, sin llamadas desde ningún componente.
- **Método `insertarPubli(users)`**: sin llamadas desde ningún componente **y además** apunta a
  `POST /agregarPubli`, una ruta que **no existe** en `glamfinds.js` (no hay ningún
  `router.post('/agregarPubli', ...)` en el backend). Doblemente muerto: ni se usa, ni el
  backend lo soportaría si se usara.

## GlamFinds/src/app/models/Response31.ts y GlamFinds/src/app/models/Likes2.ts

- **Par de archivos huérfanos**: `Response31` no se importa desde ningún servicio ni componente
  (a diferencia de sus "hermanos" `Response3`, `Response41`, etc., que sí se usan en
  `backend.service.ts`). `Likes2` solo se usa dentro de `Response31.ts`, así que al no usarse
  `Response31`, `Likes2` tampoco.

## GlamFinds/src/app/app.module.ts

- **Import sin usar**: `import {MatExpansionModule} from '@angular/material/expansion';` — se
  importa pero **no se agrega** al arreglo `imports: [...]` del `@NgModule`, y no hay otra
  referencia a `MatExpansionModule` en el archivo.
- **Import sin usar**: `import { AfterViewChecked } from '@angular/core';` — `AppModule` no
  implementa esta interfaz (es propia de componentes, no de módulos); no se usa en el archivo.
- **Import sin usar**: `import { Filter } from 'bad-words';` — no se instancia ningún `new
  Filter()` en el archivo. Posiblemente un intento anterior de moderación de texto en el
  cliente, reemplazado luego por la llamada (actualmente rota, ver hallazgo en `ai_service`) al
  microservicio de moderación en el backend.

## GlamFinds/src/environments/environment.ts

- **Propiedades sin usar**: `apiUrl`, `requestTextUrl` y el objeto `dialogflow: { projectId }`.
  No se encontró ningún `environment.apiUrl`, `environment.requestTextUrl` ni
  `environment.dialogflow` en el resto del código — `ChatService` (que sería el consumidor
  lógico de `requestTextUrl`) tiene su propia URL hardcodeada (`http://localhost:8000/api/...`)
  en vez de usar esta variable. La propiedad `firstName` tampoco se referencia en ningún lado.

---

## Resumen

Hallazgos de mayor impacto para revisar primero:

1. **Subsistema completo de colores sin usar** en `glamfinds.js`: objeto `colorShades`
   (~200 líneas) + `getAllColors`, `colorDistance`, `findClosestColor`.
2. **`ai_service/app.py`: endpoint `/moderate` deshabilitado**, lo que rompe en la práctica la
   moderación de comentarios llamada desde `glamfinds.js` (`POST /comments`).
3. **Componentes Angular completos sin usar**: `ShoeClassifierComponent` y `WidgetComponent`
   (este último confirmado como retiro deliberado por `CLAUDE.md`).
4. **`ShareDataService` inyectado en 12 componentes pero nunca invocado.**
5. **Archivos sueltos y desconectados**: `yolo_model.py` (enfoque de detección abandonado),
   `test_opencv.js` (dependencia ni siquiera instalada), `src/sql/queries.sql` (esquema de otro
   proyecto/versión, tablas `usuarios`/`comics` no relacionadas al esquema real).
6. **Rutas backend sin consumidor en el frontend**: `/filtrar`, `/follow`, `/unfollow`,
   `/followers/:id`, `/following/:id`, `/getdescripcion:id`, `/PostDes:id`, `/obtenerprenda`.
7. **`package.json` del backend con ~17 dependencias declaradas que no se usan** en ningún
   `require(...)` del código.
