import { Component, ElementRef, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import interact from 'interactjs';
import Konva from 'konva';
import { Posts } from 'src/app/models/Posts';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-try-on',
  templateUrl: './try-on.component.html',
  styleUrls: ['./try-on.component.scss']
})
export class TryOnComponent {
  @ViewChild('moodboard', { static: false }) moodboard!: ElementRef;
  @ViewChild('carousel') carousel: ElementRef;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(private backend: BackendService) {}

  moodboardItems: any[] = [];
  images: any[] =[];

  private draggedImageSrc: string | null = null;
  isPreview = false;
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
  loadImages() {
    this.backend.Prenda().subscribe((data) => {
        this.images = data.datos;
        console.log(data.datos)
      },(error) => {
        console.error('Error al cargar imágenes', error);
      }
    );
  }
  onDragStart(event: DragEvent, src: string) {
    this.draggedImageSrc = src;
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
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
  Left(){
    this.carousel.nativeElement.scrollBy({ left: -150, behavior: 'smooth' });
  }
  Right(){
    this.carousel.nativeElement.scrollBy({ left: 150, behavior: 'smooth' });
  }
  removeItem(index: number) {
    this.moodboardItems.splice(index, 1);
  }
  subirimagen() {
    this.fileInput.nativeElement.click();
  }
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
  verificarPreview() {
    this.isPreview = !this.isPreview;
  }
}
