import { Component } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table'
import { Router } from '@angular/router';
import { Posts } from 'src/app/models/Posts';
import { BackendService } from 'src/app/services/backend.service';
import { ShareDataService } from 'src/app/services/share-data.service';

@Component({
  selector: 'app-tabla-zapatos',
  templateUrl: './tabla-zapatos.component.html',
  styleUrls: ['./tabla-zapatos.component.scss']
})
export class TablaZapatosComponent {
  dataSource = new MatTableDataSource(new Array<Posts>());
  displayedColumns =['id_post','descripcion','imagen','usuario','name_categoria','borrar','modificar'];

  constructor(private share: ShareDataService, private router: Router, private backend2: BackendService) { }
  ngOnInit(): void {

    this.listarZapatos();
  }
  listarZapatos(){
    this.backend2.obtenerZapatos().subscribe(x=>{
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
      console.log("Zapatos Borrados");
      this.router.navigateByUrl("/tablaZapatos");
    })

  }
  modificarTendecias(id:number){
    this.router.navigate(['/modificar/'+id]);

  }
}
