import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Posts } from 'src/app/models/Posts';
import { BackendService } from 'src/app/services/backend.service';
import {MatTableDataSource} from '@angular/material/table'
import { ShareDataService } from 'src/app/services/share-data.service';

@Component({
  selector: 'app-tabla-ropa',
  templateUrl: './tabla-ropa.component.html',
  styleUrls: ['./tabla-ropa.component.scss']
})
export class TablaRopaComponent {
  dataSource = new MatTableDataSource(new Array<Posts>());
  displayedColumns =['id_post','descripcion','imagen','usuario','name_categoria','borrar','modificar'];

  constructor(private share: ShareDataService, private router: Router, private backend2: BackendService) { }
  ngOnInit(): void {

    this.listarRopa();
  }
  listarRopa(){
    this.backend2.obtenerRopa().subscribe(x=>{
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
      console.log("Ropa Borrada");
      this.router.navigateByUrl("/tablaRopa");
    })

  }
  modificarTendecias(id:number){
    this.router.navigate(['/modificar/'+id]);

  }
}
