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
@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.component.html',
  styleUrls: ['./agregar.component.scss']
})
export class AgregarComponent {
  url: any;
	msg = '';
  imgUrl= "";
  url2: any;
	msg2 = '';
  imgUrl2= "";
  formGroups: FormGroup = new FormGroup({});
  formGroups2: FormGroup = new FormGroup({});

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
  limpiar(){
    this.formGroups.reset();
  }

  //Post Publicidad

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
  limpiarP(){
    this.formGroups2.reset();
  }
}
