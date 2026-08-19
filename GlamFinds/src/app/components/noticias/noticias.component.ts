import { Component, OnInit } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';

// Componente de la página "/noticias".
// Muestra un listado de noticias de moda obtenidas de una API externa
// (a través del backend). No tiene interacción más allá de mostrar la lista.
@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.scss']
})
export class NoticiasComponent implements OnInit {
  // Lista de noticias de moda a mostrar (título, descripción, link, imagen, fuente).
  trends: any[] = [];

  constructor(private backend1: BackendService) {}

  // Se ejecuta automáticamente al crear el componente.
  // Pide las noticias al backend y las guarda en "trends" para que el HTML las liste.
  ngOnInit(): void {
    this.backend1.getTrends().subscribe((data) => {
      this.trends = data;
    });
  }
}
