import { Component, ViewChild } from '@angular/core';
import { IngresoComponent } from '../ingreso/ingreso.component';
import {MatDialog, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatMenuTrigger, MatMenuModule} from '@angular/material/menu';
import { Router } from '@angular/router';
import { TendenciasComponent } from '../tendencias/tendencias.component';
import { BackendService } from 'src/app/services/backend.service';
import { AgregarPubUComponent } from '../agregar-pub-u/agregar-pub-u.component';


@Component({
  selector: 'app-menu2',
  templateUrl: './menu2.component.html',
  styleUrls: ['./menu2.component.scss']
})
export class Menu2Component  {

  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;
  @ViewChild(TendenciasComponent) info!: TendenciasComponent;
  url: any;
  msg = '';
  imgUrl= "";
  constructor(public dialog: MatDialog,private router:Router,private backend1: BackendService){}
  user: any={
    id_user:0,
    usuario:'',
    nombre:'',
    apellido:'',
    edad:'',
    sexo:'',
    correo:'',
    contrase:'',
    imagen:''
  }
  ngAfterViewInit(){
    var id_new = localStorage.getItem('ids');
    if(id_new){
      this.backend1.obtenerUsuario( parseInt(id_new)).subscribe(x=>{
      console.log(x.datos[0]);
      this.user = x.datos[0];
      const read = new FileReader();
      read.onload = (this.user);
    })}
  }
  openAgregar() {
    this.dialog.open(AgregarPubUComponent, { restoreFocus: false, id: 'agregar' });
  }

  cerrarSesion(){
    this.router.navigate(['/']);
  }

}
