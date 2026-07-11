import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Posts } from 'src/app/models/Posts';
import { BackendService } from 'src/app/services/backend.service';
import { ShareDataService } from 'src/app/services/share-data.service';
import { Router } from '@angular/router';
import { Publicidad_post } from 'src/app/models/Publicidad_post';
@Component({
  selector: 'app-tabla-descuentos',
  templateUrl: './tabla-descuentos.component.html',
  styleUrls: ['./tabla-descuentos.component.scss']
})
export class TablaDescuentosComponent {
  dataSource = new MatTableDataSource(new Array<Publicidad_post>());
  displayedColumns =['id_post','descripcion','imagen','usuario','name_categoria','borrar','modificar'];

  constructor(private share: ShareDataService, private router: Router, private backend2: BackendService) { }
  ngOnInit(): void {

    this.listarDescuentos();
  }
  listarDescuentos(){
    this.backend2.obtenerDescuentos().subscribe(x=>{
      console.log(x);
      this.dataSource.data = x.datos;
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  borrarTendencia(id:number){
    this.backend2.borrarTendencia(id).subscribe(x=>{
      console.log("Descuento Borrado");
      this.router.navigateByUrl("/tablaDescuentos");
    })

  }
  modificarTendecias(id:number){
    this.router.navigate(['/modificar/'+id]);

  }
}
