import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import Vibrant from 'node-vibrant';

// Estructura de un color extraído de una imagen: su RGB, su valor hexadecimal
// y qué tan poblado/frecuente es ese color dentro de la imagen.
interface ColorSwatch {
  rgb: number[];
  hex: string;
  population: number;
}
// Paleta de colores que puede devolver la librería Vibrant: color vibrante,
// apagado, vibrante oscuro, apagado oscuro y vibrante claro. Cada uno es opcional
// porque no todas las imágenes tienen los 5 tipos de color presentes.
interface Palette {
  Vibrant?: ColorSwatch;
  Muted?: ColorSwatch;
  DarkVibrant?: ColorSwatch;
  DarkMuted?: ColorSwatch;
  LightVibrant?: ColorSwatch;
}

// Componente/diálogo "Extractor de color de imagen".
// El usuario pega la URL de una imagen y el componente le muestra la paleta
// de colores dominantes de esa imagen (calculada en el backend con node-vibrant).
@Component({
  selector: 'app-imagecolor',
  templateUrl: './imagecolor.component.html',
  styleUrls: ['./imagecolor.component.scss']
})
export class ImagecolorComponent{
  // URL de la imagen ingresada por el usuario (ngModel del input de texto).
  imageUrl: string = '';
  // Paleta de colores devuelta por el backend (objeto tipo Palette una vez cargado).
  colors: any = {};

  constructor(private backend: BackendService) {}

  // Se ejecuta cuando el usuario hace click en el botón de "obtener colores".
  // Envía la URL de la imagen al backend, que calcula la paleta dominante,
  // y guarda el resultado en "colors" para que la plantilla la muestre.
  getColorFromUrl(): void {
    this.backend.getColors(this.imageUrl).subscribe((x) => {
        this.colors = x;
        console.log(this.colors);
    },(error) => {
        console.error('Error obteniendo colores del backend:', error);
      }
    );
  }

  // Función auxiliar usada en el HTML (ngFor) para recorrer las claves del
  // objeto "colors" (Vibrant, Muted, DarkVibrant, etc.) y mostrarlas una por una.
  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // Convierte un arreglo [r, g, b] en un string CSS válido tipo "rgb(r, g, b)"
  // para poder usarlo como color de fondo en la plantilla.
  formatRgb(rgbArray: number[]): string {
    if (rgbArray && rgbArray.length === 3) {
      const red = Math.round(rgbArray[0]);
      const green = Math.round(rgbArray[1]);
      const blue = Math.round(rgbArray[2]);
      return `rgb(${red}, ${green}, ${blue})`;
    }
    return '';
  }
}
