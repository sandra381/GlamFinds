import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Comments2 } from 'src/app/models/Comments2';
import { BackendService } from 'src/app/services/backend.service';
import { ShareDataService } from 'src/app/services/share-data.service';
import { Comments } from 'src/app/models/Comments';

// Diálogo modal para editar un comentario ya existente de un POST GENERAL
// (feeds de ropa, maquillaje, accesorios, zapatos, tendencias, perfil, etc.).
// Se abre pasándole por MAT_DIALOG_DATA el id del post, el id del usuario
// (navegante) y el id del comentario a editar.
@Component({
  selector: 'app-modificar-comm',
  templateUrl: './modificar-comm.component.html',
  styleUrls: ['./modificar-comm.component.scss']
})
export class ModificarCommComponent {

  fomGroup: FormGroup = new FormGroup({});
  comicControl = new FormControl('', Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  comentario: { [key: number]: string } = {};
  // Datos del comentario que se está editando: a qué post pertenece, quién
  // lo escribió (navegante) y el texto del comentario (comments), que se
  // enlaza con ngModel al textarea de edición.
  commentario: any={
      post:0,
      navegante:0,
      comments:''
  }

  // "data" llega inyectado desde el componente que abrió este diálogo
  // (MAT_DIALOG_DATA) y contiene { id: idPost, nav: idUsuario, comm: idComentario }.
  constructor(private fb: FormBuilder,private share : ShareDataService , private router:Router, private backend1:BackendService,private activateRouter:ActivatedRoute,@Inject(MAT_DIALOG_DATA) public data: any ) {}

  // Se ejecuta automáticamente al crear el diálogo.
  // Pide al backend los datos actuales del comentario (post, navegante y
  // texto) para precargarlos en el formulario de edición.
  ngOnInit() {
    this.backend1.obtenerComentarioUser(this.data.id,this.data.nav,this.data.comm).subscribe(x=>{
      this.commentario = x.datos[0];
      console.log(this.commentario);
    });
  }

  // Se ejecuta cuando el usuario hace click en el botón "Guardar"/"Editar" del formulario.
  // Envía al backend el texto actualizado del comentario (identificado por
  // data.comm) y, al terminar, recarga la página para reflejar el cambio.
  editComment() {
    this.backend1.modificarComentario(this.data.comm,this.commentario).subscribe(x=>{
      console.log(x);
      location.reload();
    });
  }
}
