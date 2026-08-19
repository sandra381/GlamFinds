import { Component } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { ShareDataService } from 'src/app/services/share-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// Formulario de edición de un POST GENERAL, usado desde las pantallas de
// administración (tablas "tabla-*") al hacer click en "modificar" sobre una
// fila. Se accede por la ruta "/modificar/:id"; el id del post viaja en la URL.
@Component({
  selector: 'app-modificar',
  templateUrl: './modificar.component.html',
  styleUrls: ['./modificar.component.scss']
})
export class ModificarComponent implements OnInit {
  fomGroup: FormGroup = new FormGroup({});
  comicControl = new FormControl('', Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  // Datos del post que se está editando (descripción, imagen, autor,
  // categoría). Se llenan desde el backend en ngOnInit y se enlazan con
  // ngModel a los campos del formulario.
  posts_generales: any={
      id:0,
      descripcion:'',
      imagen:'',
      autor:0,
      categoria:0
  }
  constructor(private fb: FormBuilder,private share : ShareDataService , private router:Router, private backend4:BackendService,private activateRouter:ActivatedRoute) {
  }

  // Se ejecuta automáticamente al crear el componente.
  // Lee el id del post desde el parámetro de la URL (":id") y, si existe,
  // pide al backend los datos actuales de ese post para precargar el formulario.
  ngOnInit(): void {
    const id_new=this.activateRouter.snapshot.params['id'];
    console.log("id de entrada: " + id_new);

    if(id_new){
      this.backend4.obtenerGeneral(id_new).subscribe(x=>{
      this.posts_generales = x.datos[0];
      console.log(x.datos[0]);
      })
    }
  }

  // Se ejecuta cuando el usuario hace click en el botón "Guardar cambios" del formulario.
  // Envía los datos editados al backend para actualizar el post (usando el
  // id tomado de la URL) y luego redirige a la tabla de administración que
  // corresponde según la categoría del post (tendencias, ropa, maquillaje,
  // accesorios, zapatos, descuentos o dups).
  guardarModificar(){
    const id_new=this.activateRouter.snapshot.params['id'];
    this.backend4.editarPosts(id_new,this.posts_generales).subscribe(x=>{
      console.log(x);
    });
    if (this.posts_generales.categoria== 1) {
      this.router.navigateByUrl("/tablaTendencias");
    } else if (this.posts_generales.categoria == 2) {
      this.router.navigateByUrl("/tablaRopa");
    } else if (this.posts_generales.categoria == 3) {
      this.router.navigateByUrl("/tablaMaquillaje");
    } else if (this.posts_generales.categoria == 4) {
      this.router.navigateByUrl("/tablaAccesorios");
    }else if (this.posts_generales.categoria == 5) {
      this.router.navigateByUrl("/tablaZapatos");
    }else if (this.posts_generales.categoria == 6) {
      this.router.navigateByUrl("/tablaDescuentos");
    }else {
      this.router.navigateByUrl("/tablaDups");
    }

  }

  // Se ejecuta cuando el usuario hace click en el botón "Cancelar"/"Volver".
  // No guarda ningún cambio: solo redirige a la tabla de administración que
  // corresponde según la categoría actual del post (misma lógica de
  // redirección que guardarModificar(), pero sin llamar al backend).
  regresar() {

    if (this.posts_generales.categoria== 1) {
      this.router.navigateByUrl("/tablaTendencias");
    } else if (this.posts_generales.categoria == 2) {
      this.router.navigateByUrl("/tablaRopa");
    } else if (this.posts_generales.categoria == 3) {
      this.router.navigateByUrl("/tablaMaquillaje");
    } else if (this.posts_generales.categoria == 4) {
      this.router.navigateByUrl("/tablaAccesorios");
    }else if (this.posts_generales.categoria == 5) {
      this.router.navigateByUrl("/tablaZapatos");
    }else if (this.posts_generales.categoria == 6) {
      this.router.navigateByUrl("/tablaDescuentos");
    }else {
      this.router.navigateByUrl("/tablaDups");
    }
  }
}
