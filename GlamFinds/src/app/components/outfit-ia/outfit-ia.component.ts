import { Component } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';

// Componente de la página "/outfit-ia": generador de outfits con Inteligencia
// Artificial. El usuario elige una ocasión, un clima y (opcionalmente)
// colores preferidos; el componente le pide al backend (que a su vez usa
// Gemini + Pexels) un outfit completo con descripciones e imágenes, y
// permite guardarlo en el perfil del usuario.
@Component({
  selector: 'app-outfit-ia',
  templateUrl: './outfit-ia.component.html',
  styleUrls: ['./outfit-ia.component.scss']
})
export class OutfitIaComponent {

  // Opciones fijas que se muestran como botones/chips para elegir la ocasión.
  ocasiones: string[] = ['Casual', 'Formal', 'Deportivo', 'Fiesta'];
  // Opciones fijas que se muestran como botones/chips para elegir el clima.
  climas: string[] = ['Calor', 'Frío', 'Templado', 'Lluvia'];
  // Opciones fijas de colores que el usuario puede seleccionar (multi-selección) como preferencia.
  coloresDisponibles: string[] = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Beige', 'Gris'];

  // Ocasión actualmente seleccionada (valor por defecto: 'Casual').
  ocasionSeleccionada = 'Casual';
  // Clima actualmente seleccionado (valor por defecto: 'Calor').
  climaSeleccionado = 'Calor';
  // Lista de colores que el usuario fue marcando como preferidos (puede estar vacía).
  coloresSeleccionados: string[] = [];

  // Outfit generado por la IA (contiene top/bottom/shoes/accessory con su
  // descripción, imagen y la razón de la sugerencia). Es null hasta que se genera uno.
  outfit: any = null;
  // Indica si se está esperando la respuesta del backend (para mostrar un loader
  // y evitar que el usuario dispare varias generaciones al mismo tiempo).
  cargando = false;
  // Mensaje de error a mostrar en pantalla si algo falla al generar el outfit.
  errorMensaje = '';

  constructor(private backend: BackendService) {}

  // Se ejecuta cuando el usuario hace click sobre un chip de color.
  // Si el color ya estaba seleccionado, lo quita de la lista; si no estaba,
  // lo agrega. Así se arma el array "coloresSeleccionados" (selección múltiple).
  toggleColor(color: string) {
    const index = this.coloresSeleccionados.indexOf(color);
    if (index === -1) {
      this.coloresSeleccionados.push(color);
    } else {
      this.coloresSeleccionados.splice(index, 1);
    }
  }

  // Función auxiliar usada en el HTML para saber si un color está actualmente
  // seleccionado (y así pintar el chip como "activo").
  colorSeleccionado(color: string): boolean {
    return this.coloresSeleccionados.includes(color);
  }

  // Se ejecuta cuando el usuario hace click en el botón "Generar outfit".
  // 1) Activa el estado de carga y limpia el outfit/errores previos.
  // 2) Llama al backend con la ocasión, el clima y los colores elegidos.
  // 3) Si la respuesta es exitosa (status 1), guarda el outfit recibido para mostrarlo.
  // 4) Si falla (status distinto de 1 o error de red), muestra un mensaje de error.
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

  // Se ejecuta cuando el usuario hace click en el botón "Guardar outfit".
  // No hace nada si todavía no se generó ningún outfit.
  // Arma un objeto con la ocasión, el clima, los colores y el outfit generado,
  // y lo envía al backend para guardarlo asociado al usuario logueado
  // (leído de localStorage). Muestra una alerta de éxito o error según la respuesta.
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
