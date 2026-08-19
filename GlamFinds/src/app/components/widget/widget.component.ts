import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';

// Mini-widget de noticias de tendencia pensado para mostrarse en una barra
// lateral. Carga las últimas noticias de moda al iniciar y permite cerrarse
// (ocultarse) con un botón. Nota: según las convenciones del proyecto, este
// widget ya no se usa en los feeds actuales (fue removido deliberadamente de
// las plantillas), por lo que puede no estar visible en ninguna pantalla.
@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class WidgetComponent implements OnInit{
  // Lista de noticias de moda obtenidas del backend (título, descripción, link, imagen, fuente).
  trends: any[] = [];
  // Controla si el widget se muestra u oculta en pantalla.
  showWidget: boolean = true;


  constructor(private backend1: BackendService) {}

  // Se ejecuta automáticamente cuando Angular crea el componente.
  // Dispara la carga inicial de noticias.
  ngOnInit(): void {
    this.loadTrends();
  }

  // Pide al backend las noticias de tendencia (endpoint de noticias de moda)
  // y las guarda en "trends" para que la plantilla las muestre en una lista.
  loadTrends(){
    this.backend1.getTrends().subscribe((data) => {
      this.trends = data;
    });
  }

  // Se ejecuta cuando el usuario hace click en el botón de cerrar (X) del widget.
  // Efecto: pone "showWidget" en false, lo que hace que el HTML deje de renderizar el widget.
  closeWidget(): void {
    this.showWidget = false;
  }
}
