import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import {MatTabsModule} from '@angular/material/tabs';

// Componente/diálogo "Outfit aleatorio" (ruta "/randlook").
// Al abrirse, pide al backend dos looks armados al azar (uno con prendas
// "femeninas" y otro con prendas "masculinas") combinando una prenda de
// cada categoría (top, pantalón, accesorio, zapato, chaqueta).
@Component({
  selector: 'app-randlook',
  templateUrl: './randlook.component.html',
  styleUrls: ['./randlook.component.scss']
})
export class RandlookComponent implements OnInit {
  constructor(private backend: BackendService) {}

  // Look aleatorio "femenino": objeto con las prendas elegidas al azar (top, pantalon, accesorio, zapato, chaqueta).
  look: any;
  // Look aleatorio "masculino": mismo formato que "look" pero con las tablas de prendas masculinas.
  lookM: any;

  // Se ejecuta automáticamente al crear el componente.
  // Dispara la generación de ambos looks aleatorios (femenino y masculino).
  ngOnInit(): void {
    this.generarNuevoLook();
    this.generarNuevoLookM();
  }

  // Se ejecuta al iniciar el componente y también puede llamarse desde el
  // botón "Generar otro look" en el HTML.
  // Pide al backend un nuevo look femenino aleatorio y lo guarda en "look".
  generarNuevoLook() {
    this.backend.generarLookAleatorio().subscribe(data => {
      this.look = data;
    });
  }

  // Igual que generarNuevoLook() pero para el look masculino ("lookM"),
  // usando las tablas de prendas masculinas del backend.
  generarNuevoLookM() {
    this.backend.generarLookAleatorioM().subscribe(data => {
      this.lookM = data;
    });
  }
}
