import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Articulos } from 'src/app/models/Articulos';
import { Usuario2 } from 'src/app/models/Usuario2';
import { BackendService } from 'src/app/services/backend.service';
import { AgregarARTComponent } from '../agregar-art/agregar-art.component';
import { Comments2 } from 'src/app/models/Comments2';
import { Likes_cant } from 'src/app/models/Likes_cant';
import { Likes } from 'src/app/models/Likes';
import { Filter } from 'bad-words';
import { Comments } from 'src/app/models/Comments';
import { Save } from 'src/app/models/Save';
import { ModificarCommComponent } from '../modificar-comm/modificar-comm.component';
import { ModificarCommARTComponent } from '../modificar-comm-art/modificar-comm-art.component';
import { ImagecolorComponent } from '../imagecolor/imagecolor.component';
import { MoodboardComponent } from '../moodboard/moodboard.component';
import { RandlookComponent } from '../randlook/randlook.component';
import { TryOnComponent } from '../try-on/try-on.component';

// Componente del feed de "Artículos" (blog, ruta "/articulo").
// Muestra el listado de artículos publicados, con likes, comentarios,
// guardado en favoritos, un botón "Leer más" para expandir el contenido
// largo, y accesos a las herramientas (agregar artículo, extractor de
// color, moodboard, look aleatorio, armario virtual).
@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.scss']
})
export class ArticulosComponent implements OnInit{
  // Todos los artículos obtenidos del backend.
  dataSource: Array<Articulos> = new Array<Articulos>();
  // Datos de perfil (foto, usuario) del autor de cada artículo, indexados por id_user.
  perfil: Array<Usuario2> = [];
  // Modelo "plantilla" de un artículo (no se usa para mostrar datos reales, sirve de referencia de forma).
  articulo: any={
    id_post:0,
    titulo:'',
    contenido:'',
    imagen:'',
    id_user:0,
    usuario:'',
    id_categoria:0,
    name_categoria:'',
  }
  // Modelo "plantilla" de un usuario (no se usa para mostrar datos reales, sirve de referencia de forma).
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
  // Comentarios de cada artículo, indexados por id_post.
  comentarios: Array<Comments2[]> = [];
  // Cantidad de likes de cada artículo, indexada por id_post.
  likes: Array<Likes_cant> = [];
  id_com: number;
  // Texto que el usuario está escribiendo en el input de comentario de cada artículo, indexado por id_post.
  comentario: { [key: number]: string } = {};
  // Estado visual de "like" (true/false) por índice del *ngFor.
  toggle: boolean[] = [];
  // Estado visual de "guardado" (true/false) por índice del *ngFor.
  toggle1: boolean[] = [];
  id_lik: number;
  valores: Likes;
  id_us: number;
  id_new: number;
  id_likes:0;
  cant_like:0;
  // Id del usuario actualmente logueado, leído de localStorage.
  usuariolog = Number(localStorage.getItem('ids'));
  // Controla, por índice, si el contenido largo de un artículo está expandido ("Leer más" / "Leer menos").
  mostrarMas: boolean[] = [];
  constructor(private router:Router,private backend1: BackendService,private activateRouter:ActivatedRoute,public dialog: MatDialog,public snackBar: MatSnackBar){
    this.dataSource.forEach((articulo, index) => {
      this.mostrarMas[index] = false;
    });
  }

  // Se ejecuta automáticamente al crear el componente.
  // Pide al backend todos los artículos y, por cada uno: inicializa su
  // campo de comentario vacío y sus estados de like/guardado en false;
  // luego carga en orden los comentarios, el conteo de likes y el perfil
  // del autor de cada artículo. Al terminar, restaura desde localStorage el
  // estado de like/guardado de visitas anteriores.
  ngOnInit(): void {
    this.backend1.obtenerArticulos().subscribe(async x => {
      this.dataSource = x.datos;
      console.log(x.datos);
      this.dataSource.forEach(post => {
        this.comentario[post.id_post] = '';
      });

      this.dataSource.forEach((post) => {
        this.toggle[post.id_post] = false;
      });

      this.dataSource.forEach((post) => {
        this.toggle1[post.id_post] = false;
      });

      for (let i = 0; i < this.dataSource.length; i++) {
        this.id_com = this.dataSource[i].id_post;
        console.log(this.id_com);
        this.id_us = this.dataSource[i].id_user;
        await this.obtenerComentariosAsync(this.id_com);
        await this.countLikeAsync(this.id_com);
        await this.obtenerPerfilAsync(this.id_us);
      }
      this.inicializarEstados();
    });
  }

  // Pide al backend los comentarios de un artículo puntual y los guarda en
  // "comentarios[id_com]" (usa el método "...A" del backend, para artículos).
  async obtenerComentariosAsync(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.obtenerComentariosA(id_com).subscribe(async z => {
        this.comentarios[id_com] = z.datos;
        console.log(z.datos);
        resolve();
      });
    });
  }

  // Pide al backend la cantidad de likes de un artículo puntual y la guarda en "likes[id_com]".
  async countLikeAsync(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.countLikeA(id_com).subscribe(y => {
        this.likes[id_com] = y.datos[0];
        console.log(y.datos);
        resolve();
      });
    });

  }

  // Pide al backend los datos de perfil (foto, usuario) de un autor puntual y los guarda en "perfil[id_us]".
  async obtenerPerfilAsync(id_us: number) {
    return new Promise<void>(resolve => {
      this.backend1.obtenerUsuario(id_us).subscribe(async a => {
        this.perfil[id_us] = a.datos[0];
        console.log(a.datos);
        resolve();
      });
    });
  }

  // Se ejecuta al hacer click en el botón/ícono de "like" de un artículo.
  // Si ya tenía like, lo quita (baja el contador, sin bajar de 0); si no,
  // lo agrega (sube el contador). Actualiza localStorage para recordar el estado.
  like(post: number, index: number) {
    var id_new = localStorage.getItem('ids');
    if (id_new) {
      var navegante = parseInt(id_new);
      if (this.toggle[index]) {
        this.backend1.eliminarLikeA(post,navegante).subscribe(y=> {
          this.toggle[index] = false;
          if (!this.likes[post]) this.likes[post] = { cantidad: 0 } as any;
          if (this.likes[post].cantidad > 0) this.likes[post].cantidad--;
          this.actualizarEstadoLocalStorage();
        });
      } else {
        let listadoLikes = new Likes(post, navegante);
        this.backend1.guardarLikesA(listadoLikes).subscribe(y => {
          this.toggle[index] = true;
          if (!this.likes[post]) this.likes[post] = { cantidad: 0 } as any;
          this.likes[post].cantidad++;
          this.actualizarEstadoLocalStorage();
        });
      }
    }
  }

  // Se ejecuta al hacer click en el botón "Publicar" comentario de un artículo.
  // Valida que no esté vacío, filtra palabras inapropiadas (bad-words) y,
  // si es válido, lo envía al backend (método "...A" de artículos); al
  // final recarga la página.
  comment(post: number) {
    const comentario = this.comentario[post];
    if (comentario.trim() === '') {
      return;
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
      "soplapollas", "tetas grandes","tetas",  "tía buena", "travesti", "trio", "verga",
      "vete a la mierda", "vulva","pene","coito","pito","culito","panochon","culear", "culiar"
    ];
    filter.addWords(...spanishBadWords);
    var id_new = localStorage.getItem('ids');
    if (id_new) {
      var navegante = parseInt(id_new);
      let listadocoment = new Comments(post, navegante, comentario);
      if (filter.isProfane(comentario)) {
        this.snackBar.open('¡Comentario inapropiado! 😠🚫', 'Cerrar', {
        duration: 4000,
        panelClass: ['mensaje-error']
      });
      this.comentario[post] = '';
      return;
    }
    this.backend1.guardarComentariosA(listadocoment).subscribe(y => {
      console.log('Comentario válido:', comentario);
        this.comentario[post] = '';
      },(error) => {
          console.error('Error:', error);
          this.snackBar.open('¡Oops! No se pudo ingresar. 😞🚫', 'Cerrar', {
          duration: 4000,
          panelClass: ['mensaje-error']
        });
      }
      );
    }
    location.reload();
  }

  // Se ejecuta al hacer click en el botón/ícono de "guardar" de un artículo.
  // Si ya estaba guardado lo quita (eliminarSaveA); si no, lo guarda como favorito (guardarFavoritosA).
  save(post: number, index: number) {
    console.log("save");
    const id_new = localStorage.getItem('ids');
    if (id_new) {
        console.log(id_new);
        const navegante = parseInt(id_new);
        let listadoFav = new Save(post, navegante);

        if (this.isSaved(post)) {
            this.backend1.eliminarSaveA(post, navegante).subscribe(y => {
                localStorage.removeItem(`saveState_${post}`);
                this.toggle1[index] = false;
            }, error => {
                console.error('Error al eliminar el guardado:', error);
            });
        } else {
            this.backend1.guardarFavoritosA(listadoFav).subscribe(y => {
                localStorage.setItem(`saveState_${post}`, 'true');
                this.toggle1[index] = true;
            }, error => {
                console.error('Error al guardar el post:', error);
            });
        }
    }
  }

  // Consulta en localStorage si un artículo ya fue marcado como guardado.
  isSaved(post: number): boolean {
    return localStorage.getItem(`saveState_${post}`) === 'true';
  }

  // Restaura desde localStorage el estado de like/guardado de cada artículo (de visitas anteriores).
  private inicializarEstados() {
      for (let i = 0; i < this.dataSource.length; i++) {
        const post = this.dataSource[i].id_post;

        const likeState = localStorage.getItem(`likeState_${post}`);
        if (likeState) {
          this.toggle[i] = JSON.parse(likeState);
        }
        const saveState = localStorage.getItem(`saveState_${post}`);
        if (saveState) {
          this.toggle1[i] = JSON.parse(saveState);
        }
      }
    }

  // Guarda en localStorage el estado actual de like/guardado de todos los artículos.
  private actualizarEstadoLocalStorage() {
    for (let i = 0; i < this.dataSource.length; i++) {
      const post = this.dataSource[i].id_post;
      localStorage.setItem(`likeState_${post}`, JSON.stringify(this.toggle[i]));
      localStorage.setItem(`saveState_${post}`, JSON.stringify(this.toggle1[i]));
    }
  }

  // Se ejecuta al hacer click en "Eliminar" sobre un comentario propio; lo
  // borra en el backend (método "...A" de artículos) y recarga la página.
  deleteComment(post: number , id_comment:number) {
    const id_new = localStorage.getItem('ids');
    if (id_new) {
      const navegante = parseInt(id_new);
      this.backend1.eliminarComentarioA(post, navegante,id_comment).subscribe(
        () => {
          location.reload();
        },
        error => {
          console.error("Error al eliminar comentario:", error);
        }
      );
    }
  }

  // Se ejecuta al hacer click en "Editar" sobre un comentario propio; abre
  // el diálogo de edición de comentario de artículo, pasándole el post, el
  // usuario y el comentario a editar.
  openMod(postid:number,id_comment:number){
    var id_new = localStorage.getItem('ids');
    if (id_new) {
    var navegante = parseInt(id_new);
    const dialogRef = this.dialog.open(ModificarCommARTComponent, {restoreFocus: false,id: 'mod',data:{id:postid,nav:navegante,comm:id_comment}} );}
  }

  // Se ejecuta al hacer click en "Publicar artículo" (o en "Editar" sobre un
  // artículo propio, pasándole sus datos). Abre el diálogo de creación/edición de artículo.
  openAgregar(articuloData?: any){
    const dialogRef = this.dialog.open(AgregarARTComponent, {restoreFocus: false, id: 'agregar', data: articuloData || null} );
  }

  // Se ejecuta al hacer click en la herramienta de extracción de color; abre su diálogo.
  open(){
    const dialogRef = this.dialog.open(ImagecolorComponent, {restoreFocus: false,id: 'color'} );
  }

  // Se ejecuta al hacer click en la herramienta de moodboard; abre su diálogo.
  openMood(){
    const dialogRef = this.dialog.open(MoodboardComponent, {restoreFocus: false,id: 'board'} );
  }

  // Se ejecuta al hacer click en la herramienta de look aleatorio; abre su diálogo.
  openRand(){
    const dialogRef = this.dialog.open(RandlookComponent, {restoreFocus: false,id: 'look'} );
  }

  // Se ejecuta al hacer click en la herramienta de armario virtual (try-on); abre su diálogo.
  openTryOn(){
    const dialogRef = this.dialog.open(TryOnComponent, {restoreFocus: false,id: 'tryon'} );
  }

  // Se ejecuta al hacer click en el botón "Leer más"/"Leer menos" de un
  // artículo con contenido largo. Alterna el estado de expansión de ese artículo (por índice).
  toggleLeerMas(index: number): void {
    this.mostrarMas[index] = !this.mostrarMas[index];
  }
}
