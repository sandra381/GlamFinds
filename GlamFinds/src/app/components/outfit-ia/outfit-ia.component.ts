import { Component } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-outfit-ia',
  templateUrl: './outfit-ia.component.html',
  styleUrls: ['./outfit-ia.component.scss']
})
export class OutfitIaComponent {

  ocasiones: string[] = ['Casual', 'Formal', 'Deportivo', 'Fiesta'];
  climas: string[] = ['Calor', 'Frío', 'Templado', 'Lluvia'];
  coloresDisponibles: string[] = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Beige', 'Gris'];

  ocasionSeleccionada = 'Casual';
  climaSeleccionado = 'Calor';
  coloresSeleccionados: string[] = [];

  outfit: any = null;
  cargando = false;
  errorMensaje = '';

  constructor(private backend: BackendService) {}

  toggleColor(color: string) {
    const index = this.coloresSeleccionados.indexOf(color);
    if (index === -1) {
      this.coloresSeleccionados.push(color);
    } else {
      this.coloresSeleccionados.splice(index, 1);
    }
  }

  colorSeleccionado(color: string): boolean {
    return this.coloresSeleccionados.includes(color);
  }

  generarOutfit() {
    this.cargando = true;
    this.errorMensaje = '';
    this.outfit = null;

    this.backend.generarOutfitIA(this.ocasionSeleccionada, this.climaSeleccionado, this.coloresSeleccionados)
      .subscribe({
        next: (respuesta) => {
          this.cargando = false;
          if (respuesta.status === 1) {
            this.outfit = respuesta.datos;
          } else {
            this.errorMensaje = respuesta.mensaje || 'No se pudo generar el outfit, intenta de nuevo.';
          }
        },
        error: () => {
          this.cargando = false;
          this.errorMensaje = 'Ocurrió un error al conectar con el servidor.';
        }
      });
  }

  guardarOutfit() {
    if (!this.outfit) return;

    const idUsuario = Number(localStorage.getItem('ids'));
    const payload = {
      ocasion: this.ocasionSeleccionada,
      clima: this.climaSeleccionado,
      colores: this.coloresSeleccionados,
      ...this.outfit
    };

    this.backend.guardarOutfitIA(idUsuario, payload).subscribe({
      next: (respuesta) => {
        if (respuesta.status === 1) {
          alert('Outfit guardado. Puedes verlo en la sección Guardados de tu perfil.');
        } else {
          alert('No se pudo guardar el outfit, intenta de nuevo.');
        }
      },
      error: () => {
        alert('Ocurrió un error al guardar el outfit.');
      }
    });
  }

}
