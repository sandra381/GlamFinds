import { Component, ElementRef, HostBinding, ViewChild, AfterViewInit } from '@angular/core';
import interact from 'interactjs';
import domtoimage from 'dom-to-image';

// Editor de "moodboards" (ruta "/moodboard"): permite al usuario armar un
// tablero visual combinando imágenes y bloques de texto, arrastrándolos,
// rotándolos y redimensionándolos libremente sobre un lienzo, personalizar
// fuente/color/fondo, y finalmente exportar el resultado como una imagen PNG.
@Component({
  selector: 'app-moodboard',
  templateUrl: './moodboard.component.html',
  styleUrls: ['./moodboard.component.scss']
})
export class MoodboardComponent implements AfterViewInit {
  // Referencia al lienzo (contenedor) donde se colocan las imágenes y textos.
  @ViewChild('moodboard',   { static: false }) moodboard!: ElementRef;
  // Referencia al input de archivo oculto usado para subir imágenes.
  @ViewChild('fileInput',   { static: false }) fileInput!: ElementRef<HTMLInputElement>;
  // Agrega/quita la clase CSS "mb-preview-active" al host del componente
  // según si está activo el modo de previsualización (oculta controles de edición).
  @HostBinding('class.mb-preview-active') get previewActive() { return this._isPreviewMode; }

  // Lista de ítems del moodboard (imágenes y bloques de texto) con su
  // posición, tamaño, rotación y (para el texto) fuente/color/contenido.
  moodboardItems: any[]    = [];
  // Bandera interna del modo previsualización (ver getter/setter isPreviewMode más abajo).
  private _isPreviewMode   = false;
  // Bandera interna que indica si ya se aplicó el "ajuste automático" (applyFit) del lienzo.
  private _fitApplied      = false;
  // Guarda la posición (dx, dy) de cada ítem justo antes de aplicar el ajuste automático,
  // para poder deshacerlo si se sale del modo previsualización.
  private _preFitState: Array<{ dx: number; dy: number }> = [];
  // Ancho calculado del contenido real del moodboard tras el ajuste automático (usado al exportar/recortar).
  private _fitContentW     = 0;
  // Alto calculado del contenido real del moodboard tras el ajuste automático (usado al exportar/recortar).
  private _fitContentH     = 0;

  // Getter/setter público del modo previsualización. Al activarlo, espera un
  // instante (a que el sidebar desaparezca del DOM) y luego ajusta el
  // tamaño del lienzo al contenido real (applyFit). Al desactivarlo, restaura
  // el tamaño original del lienzo (resetCanvasSize).
  get isPreviewMode()        { return this._isPreviewMode; }
  set isPreviewMode(val: boolean) {
    this._isPreviewMode = val;
    if (val) {
      // Esperar a que el sidebar desaparezca del DOM antes de medir
      setTimeout(() => this.applyFit(), 60);
    } else {
      this.resetCanvasSize();
    }
  }

  // Título del moodboard, editado por el usuario (se usa también como nombre del archivo al descargar).
  boardTitle               = '';
  // Índice del ítem actualmente seleccionado en el lienzo (null si ninguno está seleccionado).
  selectedIndex: number | null = null;
  // Color de fondo actual del lienzo.
  canvasBg                 = '#f4ede4';
  // Fuente tipográfica seleccionada para los nuevos textos (y la que se aplica al agregar texto).
  selectedFont             = 'Playfair Display';
  // Color de texto seleccionado para los nuevos bloques de texto.
  selectedTextColor        = '#1a1a1a';
  // Controla si el menú desplegable de selección de fuente está abierto.
  fontDropdownOpen         = false;

  // Paleta fija de colores de fondo que el usuario puede elegir para el lienzo.
  readonly bgOptions = [
    { color: '#f4ede4', label: 'Crema'  },
    { color: '#FFFFFF', label: 'Blanco' },
    { color: '#0A0A0A', label: 'Negro'  },
    { color: '#E8E4E0', label: 'Gris'   },
  ];

  // Lista fija de fuentes disponibles para los bloques de texto (con su
  // etiqueta visible, la familia CSS, una fuente de respaldo y si es cursiva por defecto).
  readonly fontOptions = [
    { label: 'Playfair',   family: 'Playfair Display',  fallback: 'Georgia, serif',      italic: true  },
    { label: 'Cormorant',  family: 'Cormorant Garamond', fallback: 'Georgia, serif',      italic: true  },
    { label: 'Montserrat', family: 'Montserrat',          fallback: 'Arial, sans-serif',   italic: false },
    { label: 'Dancing',    family: 'Dancing Script',      fallback: 'cursive',             italic: false },
    { label: 'Bebas',      family: 'Bebas Neue',          fallback: 'Impact, sans-serif',  italic: false },
  ];

  // Paleta fija de colores de texto disponibles para los bloques de texto.
  readonly textColorOptions = [
    { color: '#1a1a1a', label: 'Negro'       },
    { color: '#FFFFFF', label: 'Blanco'      },
    { color: '#4A4A4A', label: 'Gris'        },
    { color: '#D4A5A5', label: 'Rosado'      },
    { color: '#C4A882', label: 'Dorado'      },
    { color: '#7B2D42', label: 'Vino'        },
    { color: '#E8DDD0', label: 'Beige'       },
    { color: '#8A9E85', label: 'Salvia'      },
  ];

  /* ── Selección / deselección ──────────────────────────── */

  // Se ejecuta cuando el usuario hace click sobre un ítem del lienzo (imagen o texto).
  // Detiene la propagación del evento (para no disparar deselectAll()) y marca ese ítem como seleccionado.
  selectItem(index: number, event: Event) {
    event.stopPropagation();
    this.selectedIndex = index;
  }

  // Se ejecuta cuando el usuario hace click en un área vacía del lienzo (fuera de cualquier ítem).
  // Quita la selección actual y cierra el menú desplegable de fuentes si estaba abierto.
  deselectAll() {
    this.selectedIndex    = null;
    this.fontDropdownOpen = false;
  }

  /* ── Rotación ─────────────────────────────────────────── */

  // Se ejecuta cuando el usuario hace click en los botones de rotar
  // izquierda/derecha de un ítem seleccionado. Suma o resta 90° a la
  // rotación actual de ese ítem (dir: 'left' resta, 'right' suma),
  // manteniendo el valor siempre entre 0 y 359.
  rotateItem(index: number, dir: 'left' | 'right', event: Event) {
    event.stopPropagation();
    const item    = this.moodboardItems[index];
    const delta   = dir === 'left' ? -90 : 90;
    item.rotation = ((item.rotation || 0) + delta + 360) % 360;
  }

  /* ── Añadir texto ─────────────────────────────────────── */

  // Se ejecuta cuando el usuario hace click en el botón "Añadir texto".
  // Agrega un nuevo bloque de texto ("Minimal" por defecto) al lienzo, con
  // una posición ligeramente desplazada según cuántos ítems ya existen (para
  // que no queden todos superpuestos), usando la fuente y color actualmente seleccionados.
  addText() {
    const offset = this.moodboardItems.length * 24;
    this.moodboardItems.push({
      type:       'text',
      content:    'Minimal',
      top:        120 + offset,
      left:       120 + offset,
      width:      200,
      height:     56,
      fontSize:   32,
      fontFamily:   this.selectedFont,
      fontFallback: this.selectedFontFallback,
      color:        this.selectedTextColor,
      rotation:   0
    });
  }

  /* ── Selector de fuente ───────────────────────────────── */

  // Getter usado en el HTML para saber si la fuente actualmente seleccionada
  // es cursiva por defecto (según fontOptions), y así aplicar el estilo correspondiente.
  get selectedFontItalic(): boolean {
    return this.fontOptions.find(f => f.family === this.selectedFont)?.italic ?? false;
  }

  // Getter usado en el HTML para obtener la fuente de respaldo (fallback)
  // de la fuente actualmente seleccionada.
  get selectedFontFallback(): string {
    return this.fontOptions.find(f => f.family === this.selectedFont)?.fallback ?? 'serif';
  }

  // Se ejecuta cuando el usuario elige una fuente del menú desplegable.
  // Cambia la fuente seleccionada y cierra el menú.
  selectFont(family: string) {
    this.selectedFont     = family;
    this.fontDropdownOpen = false;
  }

  /* ── Fondo del canvas ─────────────────────────────────── */

  // Se ejecuta cuando el usuario hace click en una de las opciones de color de fondo.
  // Cambia el color de fondo del lienzo.
  setCanvasBg(color: string) {
    this.canvasBg = color;
  }

  /* ── Abrir explorador de archivos ────────────────────── */

  // Se ejecuta cuando el usuario hace click en el botón "Subir imagen".
  // Simula un click sobre el input de archivo oculto para abrir el explorador del sistema.
  openFilePicker() {
    this.fileInput.nativeElement.click();
  }

  // Se ejecuta cuando el usuario selecciona uno o varios archivos en el
  // input de archivo (evento "change"). Procesa los archivos seleccionados
  // y limpia el valor del input para poder volver a seleccionar el mismo archivo después.
  onFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    this.processFiles(Array.from(files));
    (event.target as HTMLInputElement).value = '';
  }

  /* ── Drag & drop de imágenes ──────────────────────────── */

  // Se ejecuta mientras el usuario arrastra un archivo sobre el lienzo
  // (evento nativo "dragover"). Evita el comportamiento por defecto del
  // navegador para permitir soltar el archivo.
  onDragOver(event: DragEvent) { event.preventDefault(); }

  // Se ejecuta cuando el usuario suelta uno o varios archivos sobre el
  // lienzo (evento nativo "drop", arrastrados desde fuera del navegador).
  // Procesa los archivos soltados igual que onFileSelected().
  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (!files) return;
    this.processFiles(Array.from(files));
  }

  // Recorre los archivos recibidos (por selección o drag&drop), descarta los
  // que no sean imágenes, y por cada imagen válida: la lee como data URL,
  // calcula un tamaño proporcional (máximo 280px de lado manteniendo el
  // aspecto) y la agrega al lienzo como un nuevo ítem de tipo "image".
  private processFiles(files: File[]) {
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const maxSide = 280;
          const ratio   = img.naturalWidth / img.naturalHeight;
          const w = ratio >= 1 ? maxSide : Math.round(maxSide * ratio);
          const h = ratio >= 1 ? Math.round(maxSide / ratio) : maxSide;
          const offset = this.moodboardItems.length * 20;
          this.moodboardItems.push({
            type:     'image',
            src:      e.target.result,
            top:      80 + offset,
            left:     80 + offset,
            width:    w,
            height:   h,
            rotation: 0
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ── Eliminar ítem ────────────────────────────────────── */

  // Se ejecuta cuando el usuario hace click en el botón de eliminar de un ítem.
  // Lo quita del arreglo "moodboardItems" y, si era el ítem seleccionado, limpia la selección.
  removeItem(index: number, event: Event) {
    event.stopPropagation();
    this.moodboardItems.splice(index, 1);
    if (this.selectedIndex === index) this.selectedIndex = null;
  }

  /* ── Actualizar contenido de texto ───────────────────── */

  // Se ejecuta cuando el usuario termina de editar un bloque de texto
  // directamente en el lienzo (contenido editable). Actualiza el texto
  // guardado en "moodboardItems" con el nuevo contenido escrito.
  updateText(index: number, event: Event) {
    this.moodboardItems[index].content = (event.target as HTMLElement).innerText;
  }

  // Quita el foco del elemento sobre el que se disparó el evento (usado, por
  // ejemplo, al presionar Enter dentro de un texto editable, para dejar de editarlo).
  blurTarget(event: Event) {
    (event.target as HTMLElement).blur();
  }

  /* ── Calcular bounding box y ajustar canvas ──────────────── */

  // Ajusta automáticamente el tamaño del lienzo para que se ajuste
  // exactamente al contenido (todos los ítems), agregando un margen fijo.
  // Se usa al entrar en modo previsualización y antes de exportar a imagen.
  // 1) Si ya se había aplicado un ajuste antes, primero deshace el
  //    desplazamiento anterior para medir las posiciones reales de los ítems.
  // 2) Guarda las posiciones actuales de cada ítem.
  // 3) Calcula el rectángulo (bounding box) que envuelve a todos los ítems.
  // 4) Desplaza todos los ítems para que el contenido quede pegado a la
  //    esquina superior izquierda (con el margen "pad").
  // 5) Redimensiona el lienzo al tamaño exacto del contenido + margen.
  private applyFit() {
    const canvas = this.moodboard.nativeElement as HTMLElement;
    const items  = Array.from(
      canvas.querySelectorAll('.moodboard-item')
    ) as HTMLElement[];

    if (items.length === 0) return;

    // Deshacer desplazamiento anterior para medir desde posiciones reales
    if (this._fitApplied && this._preFitState.length > 0) {
      items.forEach((item, i) => {
        const s = this._preFitState[i];
        if (s) {
          item.style.transform = `translate(${s.dx}px, ${s.dy}px)`;
          item.setAttribute('data-x', String(s.dx));
          item.setAttribute('data-y', String(s.dy));
        }
      });
      this._fitApplied  = false;
      this._preFitState = [];
    }

    // Guardar posiciones actuales (antes del ajuste)
    this._preFitState = items.map(item => ({
      dx: parseFloat(item.getAttribute('data-x') || '0'),
      dy: parseFloat(item.getAttribute('data-y') || '0')
    }));

    // Medir bounding box real de todos los ítems
    const cRect = canvas.getBoundingClientRect();
    let minLeft = Infinity, minTop = Infinity;
    let maxRight = -Infinity, maxBottom = -Infinity;

    items.forEach(item => {
      const r   = item.getBoundingClientRect();
      minLeft   = Math.min(minLeft,   r.left   - cRect.left);
      minTop    = Math.min(minTop,    r.top    - cRect.top);
      maxRight  = Math.max(maxRight,  r.right  - cRect.left);
      maxBottom = Math.max(maxBottom, r.bottom - cRect.top);
    });

    const pad    = 30;
    const shiftX = -minLeft + pad;
    const shiftY = -minTop  + pad;

    // Desplazar ítems para que el contenido empiece en (pad, pad)
    items.forEach((item, i) => {
      const s  = this._preFitState[i];
      const dx = s.dx + shiftX;
      const dy = s.dy + shiftY;
      item.style.transform = `translate(${dx}px, ${dy}px)`;
      item.setAttribute('data-x', String(dx));
      item.setAttribute('data-y', String(dy));
    });

    this._fitApplied = true;

    const contentW       = maxRight - minLeft;
    const contentH       = maxBottom - minTop;
    this._fitContentW    = contentW + 2 * pad;
    this._fitContentH    = contentH + 2 * pad;
    canvas.style.flex    = 'none';
    canvas.style.width   = this._fitContentW + 'px';
    canvas.style.height  = this._fitContentH + 'px';
  }

  // Deshace el ajuste hecho por applyFit(): restaura la posición original de
  // cada ítem y devuelve el lienzo a su tamaño normal (flex/ancho/alto por defecto).
  // Se usa al salir del modo previsualización.
  private resetCanvasSize() {
    const canvas = this.moodboard.nativeElement as HTMLElement;
    const items  = Array.from(
      canvas.querySelectorAll('.moodboard-item')
    ) as HTMLElement[];

    // Restaurar posiciones originales antes del ajuste
    if (this._fitApplied && this._preFitState.length > 0) {
      items.forEach((item, i) => {
        const s = this._preFitState[i];
        if (s) {
          item.style.transform = `translate(${s.dx}px, ${s.dy}px)`;
          item.setAttribute('data-x', String(s.dx));
          item.setAttribute('data-y', String(s.dy));
        }
      });
      this._fitApplied  = false;
      this._preFitState = [];
    }

    this._fitContentW   = 0;
    this._fitContentH   = 0;
    canvas.style.flex   = '';
    canvas.style.width  = '';
    canvas.style.height = '';
  }

  /* ── Descargar moodboard ──────────────────────────────── */

  // Se ejecuta cuando el usuario hace click en el botón "Descargar".
  // 1) Ajusta el lienzo al contenido real (applyFit) para no exportar espacio vacío.
  // 2) Espera un instante a que se apliquen los estilos, y usa dom-to-image
  //    para convertir el lienzo completo en una imagen PNG.
  // 3) Recorta la imagen resultante al tamaño real del contenido (usando la
  //    escala real del dispositivo) dibujándola en un <canvas> temporal.
  // 4) Descarga el PNG resultante con el nombre del moodboard (o "moodboard" si no tiene título).
  // 5) Si no se estaba en modo previsualización, restaura el tamaño del lienzo al finalizar.
  downloadMoodboard() {
    const node   = this.moodboard.nativeElement as HTMLElement;
    const filter = (n: any) =>
      n.tagName !== 'BUTTON' &&
      !n.classList?.contains('rotate-controls') &&
      !n.classList?.contains('resize-handle');

    this.applyFit();

    setTimeout(() => {
      const captureW = node.offsetWidth;
      const captureH = node.offsetHeight;

      domtoimage.toPng(node, { filter, width: captureW, height: captureH })
        .then((dataUrl: string) => {
          // Recortar al bounding box del contenido (sin el espacio vacío del canvas)
          const cropW = this._fitContentW || captureW;
          const cropH = this._fitContentH || captureH;

          const img = new Image();
          img.onload = () => {
            // Calcular escala real (device pixel ratio / dom-to-image scale)
            const scaleX = img.width  / captureW;
            const scaleY = img.height / captureH;

            const tmpCanvas        = document.createElement('canvas');
            tmpCanvas.width        = Math.round(cropW * scaleX);
            tmpCanvas.height       = Math.round(cropH * scaleY);
            const ctx              = tmpCanvas.getContext('2d')!;
            // Dibujar solo la región del contenido (esquina superior izquierda)
            ctx.drawImage(
              img,
              0, 0, tmpCanvas.width, tmpCanvas.height,
              0, 0, tmpCanvas.width, tmpCanvas.height
            );

            const link    = document.createElement('a');
            link.href     = tmpCanvas.toDataURL('image/png');
            link.download = `${this.boardTitle || 'moodboard'}.png`;
            link.click();
            if (!this._isPreviewMode) this.resetCanvasSize();
          };
          img.src = dataUrl;
        })
        .catch((err: any) => console.error('Error al capturar moodboard:', err));
    }, 80);
  }

  /* ── interact.js ──────────────────────────────────────── */

  // Se ejecuta después de que Angular termina de renderizar la vista.
  // Configura la librería interactjs para que los ítems del lienzo se
  // puedan manipular con el mouse:
  // - Todos los ítems (".moodboard-item") se pueden ARRASTRAR (ignorando
  //   clicks sobre el texto editable, los controles de rotación, el botón de
  //   borrar y las manijas de resize, para no interferir con esas acciones).
  // - Solo las IMÁGENES (".image-item") se pueden REDIMENSIONAR desde sus
  //   bordes/esquinas, manteniendo la proporción original y con un tamaño
  //   mínimo de 80x80 y máximo de 1000x1000.
  // - Los bloques de TEXTO (".text-item") también se pueden redimensionar,
  //   pero además escalan el tamaño de fuente proporcionalmente al cambio de ancho.
  ngAfterViewInit() {
    // Drag — todos los ítems
    interact('.moodboard-item').draggable({
      ignoreFrom: '.text-content, .rotate-controls, .delete-btn, .resize-handle',
      listeners: {
        move(event) {
          const t = event.target;
          const x = (parseFloat(t.getAttribute('data-x')) || 0) + event.dx;
          const y = (parseFloat(t.getAttribute('data-y')) || 0) + event.dy;
          t.style.transform = `translate(${x}px, ${y}px)`;
          t.setAttribute('data-x', String(x));
          t.setAttribute('data-y', String(y));
        }
      }
    });

    // Resize — solo imágenes
    interact('.image-item').resizable({
      edges: {
        top:    '.resize-nw, .resize-ne',
        bottom: '.resize-sw, .resize-se',
        left:   '.resize-nw, .resize-sw',
        right:  '.resize-ne, .resize-se'
      },
      modifiers: [
        interact.modifiers.aspectRatio({ ratio: 'preserve' }),
        interact.modifiers.restrictSize({
          min: { width: 80,   height: 80   },
          max: { width: 1000, height: 1000 }
        })
      ],
      listeners: {
        move(event) {
          const t = event.target;
          let x   = (parseFloat(t.getAttribute('data-x')) || 0);
          let y   = (parseFloat(t.getAttribute('data-y')) || 0);

          t.style.width  = event.rect.width  + 'px';
          t.style.height = event.rect.height + 'px';

          x += event.deltaRect.left;
          y += event.deltaRect.top;

          t.style.transform = `translate(${x}px, ${y}px)`;
          t.setAttribute('data-x', String(x));
          t.setAttribute('data-y', String(y));
        }
      }
    });

    // Resize — ítems de texto (escala el fontSize proporcionalmente)
    interact('.text-item').resizable({
      edges: {
        top:    '.resize-nw, .resize-ne',
        bottom: '.resize-sw, .resize-se',
        left:   '.resize-nw, .resize-sw',
        right:  '.resize-ne, .resize-se'
      },
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: 60,   height: 20  },
          max: { width: 1000, height: 600 }
        })
      ],
      listeners: {
        start(event) {
          const t        = event.target;
          const textEl   = t.querySelector('.text-content') as HTMLElement;
          const fontSize = textEl
            ? parseFloat(window.getComputedStyle(textEl).fontSize)
            : 32;
          t.setAttribute('data-initial-width',    String(t.offsetWidth));
          t.setAttribute('data-initial-fontsize', String(fontSize));
        },
        move(event) {
          const t    = event.target;
          let x      = (parseFloat(t.getAttribute('data-x')) || 0);
          let y      = (parseFloat(t.getAttribute('data-y')) || 0);
          const initW  = parseFloat(t.getAttribute('data-initial-width')    || String(t.offsetWidth));
          const initFs = parseFloat(t.getAttribute('data-initial-fontsize') || '32');
          const newFs  = Math.max(8, initFs * (event.rect.width / initW));

          t.style.width  = event.rect.width  + 'px';
          t.style.height = event.rect.height + 'px';

          const textEl = t.querySelector('.text-content') as HTMLElement;
          if (textEl) textEl.style.fontSize = newFs + 'px';

          x += event.deltaRect.left;
          y += event.deltaRect.top;

          t.style.transform = `translate(${x}px, ${y}px)`;
          t.setAttribute('data-x', String(x));
          t.setAttribute('data-y', String(y));
        }
      }
    });
  }
}
