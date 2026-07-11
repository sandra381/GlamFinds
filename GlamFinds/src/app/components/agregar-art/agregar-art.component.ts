import { Component, ElementRef, Inject, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Filter } from 'bad-words';
import { BackendService } from 'src/app/services/backend.service';
import { EditorModule } from '@tinymce/tinymce-angular';
@Component({
  selector: 'app-agregar-art',
  templateUrl: './agregar-art.component.html',
  styleUrls: ['./agregar-art.component.scss']
})
export class AgregarARTComponent {
  url: any;
	msg = '';
  imgUrl= "";
  fileType: string | null = null;
  formGroups: FormGroup = new FormGroup({});
  @ViewChild('content') editorComponent: ElementRef;


  constructor(private fb: FormBuilder,private router:Router, private backend:BackendService,public snackBar: MatSnackBar,public dialog: MatDialog, @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    const user = localStorage.getItem('ids');
    this.formGroups = this.fb.group({
      id:"",
      titulo: "",
      contenido: "",
      imagen:"",
      autor: Number(user),
      categoria: "",
    });
    if (data) {
      this.formGroups.patchValue({
        id: data.id_post,
        titulo: data.titulo,
        contenido: data.contenido,
        imagen: data.imagen,
        categoria: data.id_categoria?.toString(),
      });
      this.article = data.contenido || '';
      if (data.imagen) {
        this.imgUrl = data.imagen.startsWith('http') ? data.imagen : '../../../assets/img/' + data.imagen;
        this.fileType = 'image/';
      }
    }
    console.log(user);
  }

  article = "";
  modelChangeFn(e: string) {
    this.article = e;
    console.info(this.article);
  }
  guardarPostA() {
    const formData = new FormData();
    if (this.msg) {
      formData.append('imagen', this.msg);
    }
    const filter = new Filter();
    const spanishBadWords = [
      "asesinato", "asno", "bastardo", "bollera", "cabrón", "caca", "chupada",
      "chupapollas", "chupetón", "concha", "concha de tu madre", "coño",
      "coprofagía", "culo", "drogas", "esperma", "fiesta de salchichas",
      "follador", "follar", "gilipichis", "gilipollas", "hacer una paja",
      "haciendo el amor", "heroína", "hija de puta", "hijaputa", "hijo de puta",
      "hijoputa", "idiota", "imbécil", "infierno", "jilipollas", "kapullo",
      "lameculos", "maciza", "macizorra", "maldito", "mamada", "marica", "maricón",
      "mariconazo", "martillo", "mierda", "nazi", "orina", "pedo", "pendejo",
      "pervertido", "pezón", "pinche", "pis", "prostituta", "puta", "racista",
      "ramera", "sádico", "semen", "sexo", "sexo oral", "soplagaitas",
      "soplapollas", "tetas grandes", "tetas", "tía buena", "travesti", "trio", "verga",
      "vete a la mierda", "vulva"
    ];
    filter.addWords(...spanishBadWords);

    const titulo = this.formGroups.controls['titulo'].value;
    const contenido = this.formGroups.controls['contenido'].value;
    const categoria = this.formGroups.controls['categoria'].value;

    if (!titulo || !contenido || !categoria) {
      this.snackBar.open('Por favor, complete todos los campos correctamente.', 'Cerrar', {
        duration: 4000,
        panelClass: ['mensaje-error']
      });
      return;
    }

    try {
      if (filter.isProfane(contenido)) {
        this.snackBar.open('¡Descripción inapropiada! 😠🚫', 'Cerrar', {
          duration: 4000,
          panelClass: ['mensaje-error']
        });
        this.limpiar();
        return;
      }
    } catch (error) {
      console.error('Error en el filtro de palabras inapropiadas:', error);
      this.snackBar.open('Error al procesar el contenido.', 'Cerrar', {
        duration: 4000,
        panelClass: ['mensaje-error']
      });
    }

    const userId = localStorage.getItem('ids');
    this.formGroups.patchValue({ autor: userId ? Number(userId) : 0 });
    this.backend.insertarArticulos(formData, this.formGroups.value).subscribe(
      (response) => {
        this.snackBar.open('¡Post publicado con éxito! 🚀💫🌈 ¡Sigue brillando! ✨✨', 'Cerrar', {
          duration: 4000,
          panelClass: ['mensaje-exito']
        });
        this.limpiar();
        window.location.reload();
      },
      (error) => {
        this.snackBar.open('¡Oops! No se pudo publicar el post. 😞🚫', 'Cerrar', {
          duration: 4000,
          panelClass: ['mensaje-error']
        });
        console.error('Error al publicar:', error);
      }
    );
  }
  imagenSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileType = file.type;
      this.msg = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imgUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  limpiar(){
    this.formGroups.reset();
  }
  isImage(fileUrl: string | null): boolean {
    return this.fileType?.startsWith('image') ?? false;
  }
}
