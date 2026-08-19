import { Component, ViewChild } from '@angular/core';
import { IngresoComponent } from '../ingreso/ingreso.component';
import {MatDialog, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatMenuTrigger, MatMenuModule} from '@angular/material/menu';
import { Router } from '@angular/router';
import { TendenciasComponent } from '../tendencias/tendencias.component';
import { BackendService } from 'src/app/services/backend.service';
import { AgregarPubUComponent } from '../agregar-pub-u/agregar-pub-u.component';


// Barra superior (topbar) que se muestra en la mayoría de los feeds:
// contiene el logo, el buscador, las pestañas (Para ti / Siguiendo /
// Tendencias) y el botón de "Publicar". Se encarga de cargar los datos del
// usuario logueado para mostrar su foto/nombre, de abrir el diálogo para
// crear una publicación nueva y de cerrar sesión.
@Component({
  selector: 'app-menu2',
  templateUrl: './menu2.component.html',
  styleUrls: ['./menu2.component.scss']
})
export class Menu2Component  {

  // Referencia al trigger del menú desplegable de Angular Material (definido en el HTML).
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;
  // Referencia al componente de tendencias, por si se necesita acceder a él desde este menú.
  @ViewChild(TendenciasComponent) info!: TendenciasComponent;
  url: any;
  msg = '';
  imgUrl= "";
  constructor(public dialog: MatDialog,private router:Router,private backend1: BackendService){}

  // Datos del usuario logueado que se muestran en la barra (foto de perfil, nombre, etc.).
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

  // Se ejecuta después de que Angular termina de renderizar la vista del componente.
  // Lee el id del usuario logueado guardado en localStorage ("ids") y, si existe,
  // pide sus datos al backend para completar la propiedad "user" (foto, nombre, etc.)
  // que se muestra en la barra superior.
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

  // Se ejecuta cuando el usuario hace click en el botón "Publicar" de la barra superior.
  // Abre el diálogo modal AgregarPubUComponent para crear una publicación rápida.
  openAgregar() {
    this.dialog.open(AgregarPubUComponent, { restoreFocus: false, id: 'agregar' });
  }

  // Se ejecuta cuando el usuario hace click en "Cerrar sesión".
  // Navega de vuelta a la ruta raíz ("/", la pantalla de login).
  cerrarSesion(){
    this.router.navigate(['/']);
  }

}
