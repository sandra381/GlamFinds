import { Component } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table'
import { Router } from '@angular/router';
import { Posts } from 'src/app/models/Posts';
import { BackendService } from 'src/app/services/backend.service';
import { ShareDataService } from 'src/app/services/share-data.service';

// Tabla de administración de la categoría "Zapatos" (ruta "/tablaZapatos").
// Lista todos los posts de zapatos en una tabla de Angular Material con
// filtro de texto, y permite borrar o ir a modificar cada fila.
@Component({
  selector: 'app-tabla-zapatos',
  templateUrl: './tabla-zapatos.component.html',
  styleUrls: ['./tabla-zapatos.component.scss']
})
export class TablaZapatosComponent {
  // Fuente de datos de la tabla de Angular Material (envuelve el arreglo de posts).
  dataSource = new MatTableDataSource(new Array<Posts>());
  // Nombres de las columnas que se muestran en la tabla, en el orden en que aparecen.
  displayedColumns =['id_post','descripcion','imagen','usuario','name_categoria','borrar','modificar'];

  constructor(private share: ShareDataService, private router: Router, private backend2: BackendService) { }

  // Se ejecuta automáticamente al crear el componente.
  // Dispara la carga inicial de la lista de zapatos.
  ngOnInit(): void {

    this.listarZapatos();
  }

  // Pide al backend todos los posts de la categoría "Zapatos" y los carga
  // en "dataSource.data" para que la tabla los muestre.
  listarZapatos(){
    this.backend2.obtenerZapatos().subscribe(x=>{
      console.log(x);
       this.dataSource.data = x.datos;
    })
  }

  // Se ejecuta cada vez que el usuario escribe en el input de búsqueda de la tabla.
  // Aplica el texto escrito como filtro de Angular Material sobre "dataSource".
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Se ejecuta cuando el usuario hace click en el botón "Borrar" de una fila.
  // Pide al backend eliminar el post con ese id y, al terminar, refresca la
  // tabla navegando de nuevo a "/tablaZapatos".
  borrarTendencia(id:number){
    this.backend2.borrarTendencia(id).subscribe(x=>{
      console.log("Zapatos Borrados");
      this.router.navigateByUrl("/tablaZapatos");
    })

  }

  // Se ejecuta cuando el usuario hace click en el botón "Modificar" de una fila.
  // Navega a la ruta "/modificar/:id" para editar ese post.
  modificarTendecias(id:number){
    this.router.navigate(['/modificar/'+id]);

  }
}
