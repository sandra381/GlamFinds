import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import Vibrant from 'node-vibrant';
interface ColorSwatch {
  rgb: number[];
  hex: string;
  population: number;
}
interface Palette {
  Vibrant?: ColorSwatch;
  Muted?: ColorSwatch;
  DarkVibrant?: ColorSwatch;
  DarkMuted?: ColorSwatch;
  LightVibrant?: ColorSwatch;
}
@Component({
  selector: 'app-imagecolor',
  templateUrl: './imagecolor.component.html',
  styleUrls: ['./imagecolor.component.scss']
})
export class ImagecolorComponent{
  imageUrl: string = '';
  colors: any = {};

  constructor(private backend: BackendService) {}

  getColorFromUrl(): void {
    this.backend.getColors(this.imageUrl).subscribe((x) => {
        this.colors = x;
        console.log(this.colors);
    },(error) => {
        console.error('Error obteniendo colores del backend:', error);
      }
    );
  }
  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }
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
