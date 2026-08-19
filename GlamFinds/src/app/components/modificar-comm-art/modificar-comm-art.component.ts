import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import { ShareDataService } from 'src/app/services/share-data.service';

// Diálogo modal para editar un comentario ya existente de un ARTÍCULO
// (feed de blog/artículos). Funciona igual que ModificarCommComponent pero
// usando los métodos "...A"/"...ART" del backend.
// Se abre pasándole por MAT_DIALOG_DATA el id del post, el id del usuario
// (navegante) y el id del comentario a editar.
@Component({
  selector: 'app-modificar-comm-art',
  templateUrl: './modificar-comm-art.component.html',
  styleUrls: ['./modificar-comm-art.component.scss']
})
export class ModificarCommARTComponent {

  fomGroup: FormGroup = new FormGroup({});
  comicControl = new FormControl('', Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  comentario: { [key: number]: string } = {};
  // Datos del comentario que se está editando: a qué artículo pertenece,
  // quién lo escribió (navegante) y el texto del comentario (comments),
  // enlazado con ngModel al textarea de edición.
  commentario: any={
      post:0,
      navegante:0,
      comments:''
  }

  // "data" llega inyectado desde el componente que abrió este diálogo
  // (MAT_DIALOG_DATA) y contiene { id: idArticulo, nav: idUsuario, comm: idComentario }.
  constructor(private fb: FormBuilder,private share : ShareDataService , private router:Router, private backend1:BackendService,private activateRouter:ActivatedRoute,@Inject(MAT_DIALOG_DATA) public data: any ) {}

  // Se ejecuta automáticamente al crear el diálogo.
  // Pide al backend los datos actuales del comentario del artículo para
  // precargarlos en el formulario de edición.
  ngOnInit() {
    this.backend1.obtenerComentarioUserA(this.data.id,this.data.nav,this.data.comm).subscribe(x=>{
      this.commentario = x.datos[0];
      console.log(this.commentario);
    });
  }

  // Se ejecuta cuando el usuario hace click en el botón "Guardar"/"Editar" del formulario.
  // Envía al backend el texto actualizado del comentario y, al terminar,
  // recarga la página para reflejar el cambio.
  editComment() {
    this.backend1.modificarComentarioA(this.data.comm,this.commentario).subscribe(x=>{
      console.log(x);
      location.reload();
    });
  }

}
