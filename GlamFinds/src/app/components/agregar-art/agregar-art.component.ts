import { Component, ElementRef, Inject, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Filter } from 'bad-words';
import { BackendService } from 'src/app/services/backend.service';
import { EditorModule } from '@tinymce/tinymce-angular';

// Formulario para crear (o editar, si se abre con datos) un ARTÍCULO de
// blog. Usa el editor de texto enriquecido TinyMCE para el contenido y
// filtra palabras inapropiadas antes de publicar. Puede abrirse como
// diálogo modal (con MAT_DIALOG_DATA) pasándole un artículo existente para
// precargar sus campos en modo edición.
@Component({
  selector: 'app-agregar-art',
  templateUrl: './agregar-art.component.html',
  styleUrls: ['./agregar-art.component.scss']
})
export class AgregarARTComponent {
  url: any;
  // Archivo de imagen seleccionado (File) para el artículo, listo para subirse.
	msg = '';
  // URL local (data URL) de la imagen seleccionada, o la URL/ruta de la
  // imagen ya existente cuando se abre en modo edición.
  imgUrl= "";
  // Tipo MIME del archivo seleccionado (ej. "image/png"), usado por isImage() para saber si mostrar la vista previa como imagen.
  fileType: string | null = null;
  // Formulario reactivo del artículo (id, titulo, contenido, imagen, autor, categoría).
  formGroups: FormGroup = new FormGroup({});
  // Referencia al elemento del editor TinyMCE en la plantilla.
  @ViewChild('content') editorComponent: ElementRef;


  // Arma el formulario con el autor precargado (usuario logueado). Si el
  // diálogo se abrió con "data" (un artículo existente pasado por
  // MAT_DIALOG_DATA), precarga todos los campos con esos valores para
  // habilitar el modo edición.
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

  // Contenido HTML del artículo, enlazado al editor TinyMCE.
  article = "";

  // Se ejecuta cada vez que cambia el contenido dentro del editor TinyMCE
  // (evento propio del editor). Actualiza la variable "article" con el nuevo texto.
  modelChangeFn(e: string) {
    this.article = e;
    console.info(this.article);
  }

  // Se ejecuta cuando el usuario hace click en el botón "Publicar" del formulario.
  // 1) Valida que título, contenido y categoría no estén vacíos.
  // 2) Pasa el contenido por un filtro de palabras inapropiadas en español (bad-words).
  //    Si detecta una palabra ofensiva, muestra un aviso, limpia el formulario y no publica.
  // 3) Si todo está bien, envía el formulario (con la imagen si hay una) al
  //    backend (insertarArticulos). Muestra un mensaje de éxito o error según la respuesta
  //    y, si tuvo éxito, recarga la página.
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

  // Se ejecuta cuando el usuario selecciona un archivo de imagen (evento
  // "change" del <input type="file">). Guarda el tipo del archivo, lo guarda
  // en "msg" para subirlo luego, y genera la vista previa en "imgUrl" leyendo el archivo como data URL.
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

  // Resetea (vacía) el formulario del artículo.
  limpiar(){
    this.formGroups.reset();
  }

  // Función auxiliar usada en el HTML para decidir si la vista previa debe
  // mostrarse como imagen (según el tipo de archivo detectado en imagenSelect()).
  isImage(fileUrl: string | null): boolean {
    return this.fileType?.startsWith('image') ?? false;
  }
}
