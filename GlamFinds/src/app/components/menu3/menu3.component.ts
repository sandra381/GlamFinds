import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';

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
  cerrarSesion(){
    this.router.navigate(['/']);
  }

}
