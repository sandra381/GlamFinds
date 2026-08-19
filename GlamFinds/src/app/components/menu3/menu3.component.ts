import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';

// Barra superior (topbar) usada en las vistas de administración/tablas y en
// las páginas "/eliminar", "/eliminarUser" y "/admin". Es una variante
// simplificada de Menu2Component: no tiene botón de publicar, solo muestra
// los datos del usuario logueado y permite cerrar sesión.
@Component({
  selector: 'app-menu3',
  templateUrl: './menu3.component.html',
  styleUrls: ['./menu3.component.scss']
})
export class Menu3Component {
  url: any;
  msg = '';
  imgUrl= "";
  constructor(private router:Router,private backend1: BackendService){}

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

  // Se ejecuta cuando el usuario hace click en "Cerrar sesión".
  // Navega de vuelta a la ruta raíz ("/", la pantalla de login).
  cerrarSesion(){
    this.router.navigate(['/']);
  }

}
