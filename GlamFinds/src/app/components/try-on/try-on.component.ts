import { Component, ElementRef, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import interact from 'interactjs';
import Konva from 'konva';
import { Posts } from 'src/app/models/Posts';
import { BackendService } from 'src/app/services/backend.service';

// "Armario virtual" (ruta "/tryon"): permite al usuario arrastrar prendas
// (cargadas desde el backend) o imágenes propias hacia un lienzo, para
// armar un outfit visual arrastrando y redimensionando cada prenda con el mouse.
@Component({
  selector: 'app-try-on',
  templateUrl: './try-on.component.html',
  styleUrls: ['./try-on.component.scss']
})
export class TryOnComponent {
  // Referencia al lienzo (contenedor) donde se sueltan las prendas.
  @ViewChild('moodboard', { static: false }) moodboard!: ElementRef;
  // Referencia al carrusel horizontal de prendas disponibles para arrastrar.
  @ViewChild('carousel') carousel: ElementRef;
  // Referencia al input de archivo oculto usado para subir una imagen propia.
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(private backend: BackendService) {}

  // Lista de ítems (imágenes) que el usuario ya soltó sobre el lienzo, con su
  // posición y tamaño (top, left, width, height).
  moodboardItems: any[] = [];
  // Lista de prendas disponibles para arrastrar, cargada desde el backend (carrusel).
  images: any[] =[];

  // Guarda temporalmente la URL de la imagen que se está arrastrando desde
  // el carrusel, para poder soltarla luego sobre el lienzo (onDrop).
  private draggedImageSrc: string | null = null;
  // Indica si la vista está en modo "previsualización" (oculta controles de edición).
  isPreview = false;

  // Se ejecuta después de que Angular termina de renderizar la vista.
  // Carga las prendas disponibles y configura interactjs para que los
  // elementos con clase "moodboard-item" (los ítems ya puestos en el lienzo)
  // se puedan arrastrar (draggable) y redimensionar (resizable) con el mouse,
  // actualizando su posición/tamaño vía transform CSS y atributos data-x/data-y.
  ngAfterViewInit() {
    this.loadImages()
    interact('.moodboard-item')
      .draggable({
        listeners: {
          move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          }
        }
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          move(event) {
            let target = event.target;
            let x = (parseFloat(target.getAttribute('data-x')) || 0);
            let y = (parseFloat(target.getAttribute('data-y')) || 0);
            target.style.width = event.rect.width + 'px';
            target.style.height = event.rect.height + 'px';
            x += event.deltaRect.left;
            y += event.deltaRect.top;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          }
        }
      });
  }

  // Pide al backend la lista de prendas disponibles (imágenes) y la guarda
  // en "images" para mostrarlas en el carrusel.
  loadImages() {
    this.backend.Prenda().subscribe((data) => {
        this.images = data.datos;
        console.log(data.datos)
      },(error) => {
        console.error('Error al cargar imágenes', error);
      }
    );
  }

  // Se ejecuta cuando el usuario empieza a arrastrar una prenda del carrusel
  // (evento nativo "dragstart"). Guarda la URL de esa imagen para usarla al soltarla.
  onDragStart(event: DragEvent, src: string) {
    this.draggedImageSrc = src;
  }

  // Se ejecuta mientras el usuario arrastra un elemento sobre el lienzo
  // (evento nativo "dragover"). Evita el comportamiento por defecto del
  // navegador para permitir que el "drop" funcione.
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // Se ejecuta cuando el usuario suelta la prenda arrastrada sobre el lienzo
  // (evento nativo "drop"). Si había una imagen siendo arrastrada, la agrega
  // a "moodboardItems" en la posición donde se soltó, con un tamaño fijo de 150x150.
  onDrop(event: DragEvent) {
    event.preventDefault();
    if (this.draggedImageSrc) {
      this.moodboardItems.push({
        type: 'image',
        src: this.draggedImageSrc,
        top: event.offsetY - 75,
        left: event.offsetX - 75,
        width: 150,
        height: 150
      });
      this.draggedImageSrc = null;
    }
  }

  // Se ejecuta cuando el usuario hace click en la flecha izquierda del carrusel.
  // Desplaza el carrusel de prendas hacia la izquierda con animación suave.
  Left(){
    this.carousel.nativeElement.scrollBy({ left: -150, behavior: 'smooth' });
  }

  // Se ejecuta cuando el usuario hace click en la flecha derecha del carrusel.
  // Desplaza el carrusel de prendas hacia la derecha con animación suave.
  Right(){
    this.carousel.nativeElement.scrollBy({ left: 150, behavior: 'smooth' });
  }

  // Se ejecuta cuando el usuario hace click en el botón de eliminar de un
  // ítem puesto en el lienzo. Lo quita del arreglo "moodboardItems" según su índice.
  removeItem(index: number) {
    this.moodboardItems.splice(index, 1);
  }

  // Se ejecuta cuando el usuario hace click en el botón "Subir imagen".
  // Simula un click sobre el input de archivo oculto para abrir el explorador de archivos.
  subirimagen() {
    this.fileInput.nativeElement.click();
  }

  // Se ejecuta cuando el usuario selecciona un archivo en el input oculto
  // (evento "change"). Lee la imagen como data URL y la agrega al lienzo
  // ("moodboardItems") en la posición (0,0) con tamaño 100x100.
  archivoSeleccionado(event: any) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const src = reader.result as string;
          this.moodboardItems.push({ type: 'image', src, top: 0, left: 0, width: 100, height: 100 });
        };
        reader.readAsDataURL(file);
      }
    }

  // Se ejecuta cuando el usuario hace click en el botón "Vista previa".
  // Alterna el modo "isPreview" (activa/desactiva la previsualización sin controles de edición).
  verificarPreview() {
    this.isPreview = !this.isPreview;
  }
}
