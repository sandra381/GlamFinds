import { Component, ElementRef, HostBinding, ViewChild, AfterViewInit } from '@angular/core';
import interact from 'interactjs';
import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-moodboard',
  templateUrl: './moodboard.component.html',
  styleUrls: ['./moodboard.component.scss']
})
export class MoodboardComponent implements AfterViewInit {
  @ViewChild('moodboard',   { static: false }) moodboard!: ElementRef;
  @ViewChild('fileInput',   { static: false }) fileInput!: ElementRef<HTMLInputElement>;
  @HostBinding('class.mb-preview-active') get previewActive() { return this._isPreviewMode; }

  moodboardItems: any[]    = [];
  private _isPreviewMode   = false;
  private _fitApplied      = false;
  private _preFitState: Array<{ dx: number; dy: number }> = [];
  private _fitContentW     = 0;
  private _fitContentH     = 0;

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

  boardTitle               = '';
  selectedIndex: number | null = null;
  canvasBg                 = '#f4ede4';
  selectedFont             = 'Playfair Display';
  selectedTextColor        = '#1a1a1a';
  fontDropdownOpen         = false;

  readonly bgOptions = [
    { color: '#f4ede4', label: 'Crema'  },
    { color: '#FFFFFF', label: 'Blanco' },
    { color: '#0A0A0A', label: 'Negro'  },
    { color: '#E8E4E0', label: 'Gris'   },
  ];

  readonly fontOptions = [
    { label: 'Playfair',   family: 'Playfair Display',  fallback: 'Georgia, serif',      italic: true  },
    { label: 'Cormorant',  family: 'Cormorant Garamond', fallback: 'Georgia, serif',      italic: true  },
    { label: 'Montserrat', family: 'Montserrat',          fallback: 'Arial, sans-serif',   italic: false },
    { label: 'Dancing',    family: 'Dancing Script',      fallback: 'cursive',             italic: false },
    { label: 'Bebas',      family: 'Bebas Neue',          fallback: 'Impact, sans-serif',  italic: false },
  ];

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
  selectItem(index: number, event: Event) {
    event.stopPropagation();
    this.selectedIndex = index;
  }

  deselectAll() {
    this.selectedIndex    = null;
    this.fontDropdownOpen = false;
  }

  /* ── Rotación ─────────────────────────────────────────── */
  rotateItem(index: number, dir: 'left' | 'right', event: Event) {
    event.stopPropagation();
    const item    = this.moodboardItems[index];
    const delta   = dir === 'left' ? -90 : 90;
    item.rotation = ((item.rotation || 0) + delta + 360) % 360;
  }

  /* ── Añadir texto ─────────────────────────────────────── */
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
  get selectedFontItalic(): boolean {
    return this.fontOptions.find(f => f.family === this.selectedFont)?.italic ?? false;
  }

  get selectedFontFallback(): string {
    return this.fontOptions.find(f => f.family === this.selectedFont)?.fallback ?? 'serif';
  }

  selectFont(family: string) {
    this.selectedFont     = family;
    this.fontDropdownOpen = false;
  }

  /* ── Fondo del canvas ─────────────────────────────────── */
  setCanvasBg(color: string) {
    this.canvasBg = color;
  }

  /* ── Abrir explorador de archivos ────────────────────── */
  openFilePicker() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    this.processFiles(Array.from(files));
    (event.target as HTMLInputElement).value = '';
  }

  /* ── Drag & drop de imágenes ──────────────────────────── */
  onDragOver(event: DragEvent) { event.preventDefault(); }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (!files) return;
    this.processFiles(Array.from(files));
  }

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
  removeItem(index: number, event: Event) {
    event.stopPropagation();
    this.moodboardItems.splice(index, 1);
    if (this.selectedIndex === index) this.selectedIndex = null;
  }

  /* ── Actualizar contenido de texto ───────────────────── */
  updateText(index: number, event: Event) {
    this.moodboardItems[index].content = (event.target as HTMLElement).innerText;
  }

  blurTarget(event: Event) {
    (event.target as HTMLElement).blur();
  }

  /* ── Calcular bounding box y ajustar canvas ──────────────── */
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
