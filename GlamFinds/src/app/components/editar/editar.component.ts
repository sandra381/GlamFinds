import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import { ShareDataService } from 'src/app/services/share-data.service';

// Componente de "Configuración" (ruta "/configuracion"): permite al usuario
// logueado editar su propio perfil (usuario, descripción, foto) y ver sus
// estadísticas (seguidores/seguidos/publicaciones) junto con sus posts y
// artículos propios en pestañas.
@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss']
}) export class EditarComponent implements OnInit {
  fomGroup: FormGroup = new FormGroup({});
  comicControl = new FormControl('', Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  // Archivo de imagen de perfil nueva seleccionada (File), si el usuario decide cambiarla.
  msg = '';
  // URL local (data URL) de la nueva imagen seleccionada, usada para la vista previa.
  imgUrl= "";
  // Datos del perfil que se están editando: usuario, descripción e imagen actual.
  posts_generales: any={
      id:0,
      usuario:'',
      descripcion:'',
      imagen:''

  }
  // Lista de posts generales propios del usuario (pestaña "publicaciones").
  dataSource: any[] = [];
  // Lista de artículos propios del usuario (pestaña de artículos).
  dataSource5: any[] = [];
  // Pestaña actualmente activa en la vista (por defecto "publicaciones").
  activeTab = 'publicaciones';

  // Cantidad de seguidores del usuario, mostrada en las estadísticas.
  followersCount: number = 0;
  // Cantidad de usuarios a los que sigue, mostrada en las estadísticas.
  followingCount: number = 0;
  // Cantidad total de publicaciones del usuario, mostrada en las estadísticas.
  postsCount: number = 0;

  constructor(private fb: FormBuilder,private share : ShareDataService , private router:Router, private backend4:BackendService,private activateRouter:ActivatedRoute,public snackBar: MatSnackBar,public dialog: MatDialog) {}

  // Se ejecuta automáticamente al crear el componente.
  // Si hay un usuario logueado (localStorage "ids"), pide en paralelo:
  // sus datos de perfil, sus posts, sus artículos y sus estadísticas de
  // seguidores/seguidos/publicaciones, y los guarda en las variables correspondientes.
  ngOnInit(): void {
    const id_new = localStorage.getItem('ids');
    if(id_new){
      const userId = Number(id_new);
      this.backend4.obtenerUsuario(userId).subscribe(x=>{
        this.posts_generales.usuario = x.datos[0].usuario;
        this.posts_generales.descripcion=x.datos[0].descripcion;
        this.posts_generales.imagen =x.datos[0].imagen;
        console.log(x.datos[0]);
      });
      this.backend4.PostPerfil(userId).subscribe((x: any) => {
        this.dataSource = x.datos || x || [];
      });
      this.backend4.obtenerArticulos().subscribe((x: any) => {
        this.dataSource5 = x.datos || x || [];
      });
      this.backend4.getUserStats(userId).subscribe(stats => {
          this.followersCount = stats.followers;
          this.followingCount = stats.following;
          this.postsCount = stats.posts;
        },
        error => console.error('Error al cargar estadísticas', error)
      );
    }
  }


  // Función auxiliar usada en el HTML para decidir si un nombre de archivo
  // corresponde a una imagen (por su extensión), y así mostrarla como tal en la lista de posts/artículos.
  isImage(fileName: string): boolean {
    if (!fileName) return false;
    return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(fileName);
  }

  // Se ejecuta cuando el usuario hace click en el botón "Guardar cambios" del formulario de perfil.
  // Arma un FormData con el usuario, la descripción y la imagen (nueva si se
  // seleccionó una, o la actual si no) y lo envía al backend
  // (editarPosts2). Según la respuesta, muestra un mensaje de éxito y
  // regresa al perfil, o un mensaje de error.
  guardarModificar() {
    const id_new = localStorage.getItem('ids');
    if (id_new) {
      const formData = new FormData();
      formData.append('usuario', this.posts_generales.usuario);
      formData.append('descripcion', this.posts_generales.descripcion);
      if (this.msg) {
        formData.append('imagen', this.msg);
      } else {
        formData.append('imagen', this.posts_generales.imagen);
      }
      this.backend4.editarPosts2(Number(id_new), formData).subscribe(
        (response: any) => {
          if (response.status === 1) {
            this.snackBar.open('¡Modificaciones realizadas con éxito! 🚀💫🌈', 'Cerrar', {
              duration: 4000,
            });
            this.regresar();
          } else {
            this.snackBar.open('Error al actualizar el perfil. Intente nuevamente.', 'Cerrar', {
              duration: 4000,
            });
          }
        },(error) => {
          console.error('Error al actualizar el perfil:', error);
          this.snackBar.open('Error en el servidor. Intente más tarde.', 'Cerrar', {
            duration: 4000,
          });
        }
      );
    }
  }

  // Se ejecuta al terminar de guardar (o desde un botón "Cancelar").
  // Navega de vuelta a la pantalla de perfil ("/perfil").
  regresar() {
    this.router.navigateByUrl("/perfil");
  }

  // Se ejecuta cuando el usuario selecciona una nueva foto de perfil (evento
  // "change" del <input type="file">). Genera la vista previa (data URL) en
  // "imgUrl" y guarda el archivo real en "msg" para subirlo al guardar.
  imagenSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        this.imgUrl = e.target.result;
      };
      this.msg = file;
    } else {
      console.error('No se seleccionó ningún archivo');
    }
  }
}

