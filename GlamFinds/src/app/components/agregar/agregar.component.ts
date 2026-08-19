import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {FormControl, Validators} from '@angular/forms';
import { BackendService } from 'src/app/services/backend.service';
import { PostsGenerales } from 'src/app/models/PostsGenerales';

import { Descuentos } from 'src/app/models/Descuentos';
import { Dups } from 'src/app/models/Dups';
import { Publicidad } from 'src/app/models/Publicidad';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Filter } from 'bad-words';

// Formulario de administración con DOS secciones/formularios distintos:
// 1) Publicar un POST GENERAL (para los feeds de ropa/maquillaje/etc.).
// 2) Publicar un POST DE PUBLICIDAD (para descuentos/dups), que además lleva un link.
// Se usa desde la ruta "/agregar" (a la que llega el usuario "AdminUser" tras loguearse).
@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.component.html',
  styleUrls: ['./agregar.component.scss']
})
export class AgregarComponent {
  url: any;
  // Archivo de imagen seleccionado (File) para el POST GENERAL, listo para enviarse en el FormData.
	msg = '';
  // URL local (data URL) de la imagen del post general, usada para mostrar la vista previa.
  imgUrl= "";
  url2: any;
  // Archivo de imagen seleccionado (File) para el POST DE PUBLICIDAD.
	msg2 = '';
  // URL local (data URL) de la imagen del post de publicidad, usada para la vista previa.
  imgUrl2= "";
  // Formulario reactivo del POST GENERAL (descripción, imagen, autor, categoría).
  formGroups: FormGroup = new FormGroup({});
  // Formulario reactivo del POST DE PUBLICIDAD (descripción, imagen, autor, link, categoría).
  formGroups2: FormGroup = new FormGroup({});

  // Al construirse el componente, arma ambos FormGroup con el id del usuario
  // logueado (localStorage "ids") precargado como "autor".
  constructor(private fb: FormBuilder,private router:Router, private backend:BackendService,public snackBar: MatSnackBar,public dialog: MatDialog) {
    const user = localStorage.getItem('ids');
    this.formGroups = this.fb.group({
      id:"",
      descripcion: "",
      imagen:"",
      autor: Number(user),
      categoria: "",
    });
    this.formGroups2 = this.fb.group({
      id:"",
      descripcion: "",
      imagen:"",
      autor: Number(user),
      link: "",
      categoria: "",
    });
    console.log(user);
  }
  //Post Generales

  // Se ejecuta cuando el usuario hace click en el botón "Publicar" del formulario de post general.
  // Arma un FormData con la imagen seleccionada y envía el formulario al
  // backend (insertarPosts). Si todos los campos requeridos tienen valor,
  // muestra un mensaje de éxito y limpia el formulario; si no, muestra un
  // mensaje pidiendo completar los campos.
  guardarPostsG(){
    const formData = new FormData();
    formData.append('imagen', this.msg);
    this.backend.insertarPosts(formData, this.formGroups.value).subscribe((response) => {
      console.log('FormGroup Value:', this.formGroups.value);
      if(this.formGroups.controls['descripcion'].value != ''&&this.formGroups.controls['imagen'].value!= ''&&
        this.formGroups.controls['categoria'].value!= ''){
        this.snackBar.open('¡Post publicado con éxito! 🚀💫🌈 ¡Sigue brillando! ✨✨', 'Undo', {
          duration: 4000,
        });
        this.limpiar();
      }else{
        this.snackBar.open('Por favor, complete todos los campos correctamente.', 'Undo', {
          duration: 4000,
        });
      }
    });
  }

  // Se ejecuta cuando el usuario selecciona un archivo de imagen en el input
  // del formulario de post general (evento "change" del <input type="file">).
  // Lee el archivo como data URL (para la vista previa en "imgUrl"), guarda
  // el archivo real en "msg" para subirlo luego, y actualiza el campo
  // "imagen" del formulario con el nombre del archivo.
  imagenSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any)=>{
        this.imgUrl = event.target.result;
      }
      this.msg = file;
      this.formGroups.patchValue({ imagen: file.name }); // ← línea nueva
    } else {
      console.error('No se seleccionó ningún archivo');
    }
  }

  // Resetea (vacía) el formulario del post general.
  limpiar(){
    this.formGroups.reset();
  }

  //Post Publicidad

  // Se ejecuta cuando el usuario hace click en el botón "Publicar" del
  // formulario de post de publicidad (descuentos/dups).
  // Arma un FormData con la imagen seleccionada y envía el formulario al
  // backend (insertarPostsP). Si todos los campos requeridos tienen valor,
  // muestra un mensaje de éxito y limpia el formulario; si no, pide completar los campos.
  guardarPublicidad(){
    const formData2 = new FormData();
    formData2.append('imagen', this.msg2);
    this.backend.insertarPostsP(formData2, this.formGroups2.value).subscribe((response) => {
      console.log('FormGroup Value:', this.formGroups2.value);
      if(this.formGroups2.controls['descripcion'].value != ''&&this.formGroups2.controls['imagen'].value!= ''&&
      this.formGroups2.controls['link'].value!= ''&&
        this.formGroups2.controls['categoria'].value!= ''){
        this.snackBar.open('¡Post publicado con éxito! 🚀💫🌈 ¡Sigue brillando! ✨✨', 'Undo', {
          duration: 4000,
        });
        this.limpiarP();
      }else{
        this.snackBar.open('Por favor, complete todos los campos correctamente.', 'Undo', {
          duration: 4000,
        });
      }
    });
  }

  // Se ejecuta cuando el usuario selecciona un archivo de imagen en el input
  // del formulario de post de publicidad (evento "change" del <input type="file">).
  // Igual que imagenSelect() pero para el segundo formulario: guarda la
  // vista previa en "imgUrl2" y el archivo en "msg2".
  imagenSelectP(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any)=>{
        this.imgUrl2 = event.target.result;
      }
      this.msg2 = file;
    } else {
      console.error('No se seleccionó ningún archivo');
    }
  }

  // Resetea (vacía) el formulario del post de publicidad.
  limpiarP(){
    this.formGroups2.reset();
  }
}
