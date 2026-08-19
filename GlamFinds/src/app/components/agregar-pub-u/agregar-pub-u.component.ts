import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import { Filter } from 'bad-words';

// Diálogo modal "Publicar" que se abre desde el botón de la barra superior
// (Menu2Component) en cualquier feed. Es una versión rápida/reducida del
// formulario de AgregarComponent, pensada para publicar un post general sin
// salir de la pantalla actual.
@Component({
  selector: 'app-agregar-pub-u',
  templateUrl: './agregar-pub-u.component.html',
  styleUrls: ['./agregar-pub-u.component.scss']
})
export class AgregarPubUComponent {
  url: any;
  // Archivo de imagen seleccionado (File), listo para enviarse en el FormData.
	msg = '';
  // Formulario reactivo del post (descripción, imagen, autor, categoría).
  formGroups: FormGroup = new FormGroup({});
  // URL local (data URL) de la imagen seleccionada, usada para la vista previa.
  imgUrl: string | null = null;
  // Tipo MIME del archivo seleccionado, usado por isImage() para decidir cómo mostrar la vista previa.
  fileType: string | null = null;

  // Arma el formulario con el autor precargado (usuario logueado, leído de localStorage).
  constructor(private fb: FormBuilder,private router:Router, private backend:BackendService,public snackBar: MatSnackBar,public dialog: MatDialog) {
    const user = localStorage.getItem('ids');
    this.formGroups = this.fb.group({
      id:"",
      descripcion: "",
      imagen:"",
      autor: Number(user),
      categoria: "",
    })
  }

  // Se ejecuta cuando el usuario hace click en el botón "Publicar" del diálogo.
  // 1) Valida que descripción, imagen y categoría no estén vacíos.
  // 2) Pasa la descripción por el filtro de palabras inapropiadas (bad-words);
  //    si detecta una palabra ofensiva, avisa, limpia el formulario y no publica.
  // 3) Envía el post al backend (insertarPosts). Si tiene éxito, muestra un
  //    mensaje, limpia el formulario y recarga la página; si falla, muestra un mensaje de error.
  guardarPostG() {
    const formData = new FormData();
    if (this.msg) {
      formData.append('imagen', this.msg);
    }

    // Crear el filtro de palabras inapropiadas
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

    const descripcion = this.formGroups.controls['descripcion'].value;
    const imagen = this.formGroups.controls['imagen'].value;
    const categoria = this.formGroups.controls['categoria'].value;

    if (!descripcion || !imagen || !categoria) {
      this.snackBar.open('Por favor, complete todos los campos correctamente.', 'Cerrar', {
        duration: 4000,
        panelClass: ['mensaje-error']
      });
      return;
    }

    if (filter.isProfane(descripcion)) {
      this.snackBar.open('¡Descripción inapropiada! 😠🚫', 'Cerrar', {
        duration: 4000,
        panelClass: ['mensaje-error']
      });
      this.limpiar();
      return;
    }

    this.backend.insertarPosts(formData, this.formGroups.value).subscribe(
      (response) => {
        this.snackBar.open('¡Post publicado con éxito! 🚀💫🌈 ¡Sigue brillando! ✨✨', 'Cerrar', {
          duration: 4000,
          panelClass: ['mensaje-exito']
        });
        this.limpiar();
        location.reload();
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
  // "change" del <input type="file">). Guarda el tipo de archivo, lo guarda
  // en "msg" para subirlo luego, y genera la vista previa en "imgUrl".
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

  // Resetea (vacía) el formulario.
  limpiar(){
    this.formGroups.reset();
  }

  // Se ejecuta cuando se quiere cerrar el diálogo automáticamente según la
  // ruta actual (por ejemplo tras navegar). Si la ruta activa es una de los
  // feeds principales (home/ropa/maquillaje/accesorios/zapatos), cierra el modal.
  cerrarModalSegunRuta() {
    const rutaActual = this.router.url;
    if (rutaActual === '/home') {
      this.cerrarModal();
    } else if (rutaActual === '/ropa') {
      this.cerrarModal();
    }else if (rutaActual === '/maquillaje') {
      this.cerrarModal();
    }else if (rutaActual === '/accesorios') {
      this.cerrarModal();
    }else if (rutaActual === '/zapatos') {
      this.cerrarModal();
    }
  }

  // Cierra el diálogo modal "agregar" (buscándolo por su id) si está abierto.
  // Se llama tanto desde cerrarModalSegunRuta() como potencialmente desde un
  // botón de "Cancelar"/"X" en el HTML.
  cerrarModal() {
    const dialogRef = this.dialog.getDialogById('agregar');
    if (dialogRef) {
      dialogRef.close();
    }
    console.log('Cerrando el modal');
  }

  // Función auxiliar usada en el HTML para decidir si la vista previa debe
  // mostrarse como imagen, según el tipo de archivo detectado en imagenSelect().
  isImage(fileUrl: string | null): boolean {
    return this.fileType?.startsWith('image') ?? false;
  }


}
