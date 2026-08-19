import { ConstantPool } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Comments } from 'src/app/models/Comments';
import { Comments2 } from 'src/app/models/Comments2';
import { Comments3 } from 'src/app/models/Comments3';
import { Likes } from 'src/app/models/Likes';
import { Likes_cant } from 'src/app/models/Likes_cant';
import { Publicidad_post } from 'src/app/models/Publicidad_post';
import { Save } from 'src/app/models/Save';
import { BackendService } from 'src/app/services/backend.service';
import { AgregarPubUComponent } from '../agregar-pub-u/agregar-pub-u.component';
import { Publicidad } from 'src/app/models/Publicidad';
import { Usuario2 } from 'src/app/models/Usuario2';
import { MatDialog } from '@angular/material/dialog';
import { ModificarCommPComponent } from '../modificar-comm-p/modificar-comm-p.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Filter } from 'bad-words';

// Componente del feed de la categoría "Descuentos" (ruta "/descuentos").
// Muestra el listado de posts de publicidad/descuentos (tabla
// posts_publicidad), con likes, comentarios, guardado en favoritos y chips
// para filtrar por categoría. A diferencia de ropa/maquillaje/etc., no
// filtra por color ni por tipo de prenda (esos métodos existen pero no hacen nada).
@Component({
  selector: 'app-descuentos',
  templateUrl: './descuentos.component.html',
  styleUrls: ['./descuentos.component.scss']
})
export class DescuentosComponent  implements OnInit {
  // Todos los posts de descuentos obtenidos del backend, sin filtrar.
  dataSource: Array<Publicidad> = new Array<Publicidad>();
  // Posts que se muestran actualmente en pantalla (según el chip de categoría activo).
  filteredItems: Array<Publicidad> = [];
  // Comentarios de cada post, indexados por id_post.
  comentarios: Array<Comments2[]> = [];
  // Datos de perfil (foto, usuario) del autor de cada post, indexados por id_user.
  perfil: Array<Usuario2> = [];
  // Cantidad de likes de cada post, indexada por id_post.
  likes: Array<Likes_cant> = [];
  id_com: number;
  // Texto que el usuario está escribiendo en el input de comentario de cada post, indexado por id_post.
  comentario: { [key: number]: string } = {};
  // Estado visual de "like" (true/false) por índice del *ngFor.
  toggle: boolean[] = [];
  // Estado visual de "guardado" (true/false) por índice del *ngFor.
  toggle1: boolean[] = [];
  id_lik: number;
  valores: Likes;
  id_us: number;
  // Controla si se muestra el widget lateral (actualmente sin uso visible en el feed).
  showWidget: boolean = true;
  // Id del usuario actualmente logueado, leído de localStorage.
  usuariolog = Number(localStorage.getItem('ids'));
  // Controla si el modal de filtro por color está abierto (sin uso real en este feed).
  isModalOpen: boolean = false;
  // Controla si el modal de filtro por prenda está abierto (sin uso real en este feed).
  isModalOpen2: boolean = false;
  // Chip de categoría actualmente activo (por defecto "Todo").
  activeChip: string = 'Todo';

  // Se ejecuta al hacer click en el botón que abre/cierra el modal de filtro por color.
  toggleModal() { this.isModalOpen = !this.isModalOpen; }
  // Se ejecuta al hacer click en el botón que abre/cierra el modal de filtro por prenda.
  toggleModal2() { this.isModalOpen2 = !this.isModalOpen2; }
  // Se ejecuta al hacer click en "Limpiar filtro": restaura "filteredItems"
  // a todos los posts, vuelve el chip activo a "Todo" y cierra ambos modales.
  limpiarFiltro(): void { this.filteredItems = [...this.dataSource]; this.activeChip = 'Todo'; this.isModalOpen = false; this.isModalOpen2 = false; }
  // Se ejecuta al elegir un color en el modal de filtro por color. En este
  // feed no aplica ningún filtrado real, solo cierra el modal.
  seleccionarPorRango(color: string) { this.isModalOpen = false; }
  // Se ejecuta al elegir una prenda en el modal de filtro por prenda. En
  // este feed no aplica ningún filtrado real, solo cierra el modal.
  seleccionarPorRopa(prenda: string) { this.isModalOpen2 = false; }
  // Se ejecuta al hacer click en un chip de categoría. Si es "Todo" muestra
  // todos los posts; si no, filtra "dataSource" dejando solo los posts cuya
  // categoría coincida con el chip elegido.
  filtrarChip(categoria: string) { this.activeChip = categoria; this.filteredItems = categoria === 'Todo' ? [...this.dataSource] : this.dataSource.filter(p => p.name_categoria?.toLowerCase() === categoria.toLowerCase()); }
  constructor(private router:Router,private backend1: BackendService,private activateRouter:ActivatedRoute,public dialog: MatDialog,public snackBar: MatSnackBar){ }
  showShortDesciption = true
  // Modelo "plantilla" de un post (no se usa para mostrar datos reales, sirve de referencia de forma).
  articulo: any={
    id_post:0,
    descripcion:'',
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
  status = 'Enable';
  variable: string = "";
  id_new: number;
  id_likes:0;
  cant_like:0;

  // Se ejecuta automáticamente al crear el componente.
  // Pide al backend todos los posts de descuentos y los copia también a
  // "filteredItems" (sin filtrar todavía). Por cada post: inicializa su
  // campo de comentario vacío y sus estados de like/guardado en false;
  // luego carga en orden los comentarios, el conteo de likes y el perfil
  // del autor de cada post. Al terminar, restaura desde localStorage el
  // estado de like/guardado de visitas anteriores.
  ngOnInit(): void {
    this.backend1.obtenerDescuentos().subscribe(async x => {
      this.dataSource = x.datos;
      this.filteredItems = [...this.dataSource];
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
        this.id_us = this.dataSource[i].id_user;

        await this.obtenerComentariosAsync(this.id_com);
        await this.countLikeAsync(this.id_com);
        await this.obtenerPerfilAsync(this.id_us);

      }
      this.inicializarEstados();
    })
  }

  // Pide al backend los comentarios de un post de publicidad puntual y los
  // guarda en "comentarios[id_com]" (usa el método "...P" del backend, para posts de publicidad).
  async obtenerComentariosAsync(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.obtenerComentarioP(id_com).subscribe(async z => {
        this.comentarios[id_com] = z.datos;
        console.log(z.datos);
        resolve();
      });
    });
  }

  // Pide al backend la cantidad de likes de un post de publicidad puntual y la guarda en "likes[id_com]".
  async countLikeAsync(id_com: number) {
    return new Promise<void>(resolve => {
      console.log(id_com);
      this.backend1.countLikeP(id_com).subscribe(y => {
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

  // Se ejecuta al hacer click en el botón/ícono de "like" de un post de descuento.
  // Si ya tenía like, lo quita (baja el contador); si no, lo agrega (sube el
  // contador). Actualiza localStorage para recordar el estado.
  like(post: number, index: number) {
    var id_new = localStorage.getItem('ids');
    if (id_new) {
        var navegante = parseInt(id_new);

        if (this.toggle[index]) {
            this.backend1.eliminarLikeP(post, navegante).subscribe(() => {
                this.toggle[index] = false;
                this.likes[post].cantidad--;
                this.actualizarEstadoLocalStorage();
            });
        } else {
            let listadoLikes = new Likes(post, navegante);
            this.backend1.guardarLikesP(listadoLikes).subscribe(() => {
                this.toggle[index] = true;
                this.likes[post].cantidad++;
                this.actualizarEstadoLocalStorage();
            });
        }
    }
  }

  // Se ejecuta al hacer click en el botón "Publicar" comentario de un post de descuento.
  // Valida que no esté vacío, filtra palabras inapropiadas (bad-words) y,
  // si es válido, lo envía al backend (usa el método "...P" de publicidad);
  // al final recarga la página.
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
      "vete a la mierda", "vulva"
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
    this.backend1.guardarComentariosP(listadocoment).subscribe(y => {
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

  // Se ejecuta al hacer click en el botón/ícono de "guardar" de un post de descuento.
  // Si ya estaba guardado lo quita (eliminarSaveP); si no, lo guarda como favorito (guardarFavoritosP).
  save(post: number, index: number) {
    console.log("save");
    const id_new = localStorage.getItem('ids');
    if (id_new) {
        console.log(id_new);
        const navegante = parseInt(id_new);
        let listadoFav = new Save(post, navegante);

        if (this.isSaved(post)) {
            // Si el post ya está guardado, lo eliminamos de los guardados
            this.backend1.eliminarSaveP(post, navegante).subscribe(y => {
                localStorage.removeItem(`saveState_${post}`);  // Remueve el estado de guardado del localStorage
                this.toggle1[index] = false;
            }, error => {
                console.error('Error al eliminar el guardado:', error);
            });
        } else {
            // Si el post no está guardado, lo guardamos
            this.backend1.guardarFavoritosP(listadoFav).subscribe(y => {
                localStorage.setItem(`saveState_${post}`, 'true');  // Guarda el estado en localStorage
                this.toggle1[index] = true;
            }, error => {
                console.error('Error al guardar el post:', error);
            });
        }
    }
  }

  // Consulta en localStorage si un post ya fue marcado como guardado.
  isSaved(post: number): boolean {
    return localStorage.getItem(`saveState_${post}`) === 'true';
  }

  // Restaura desde localStorage el estado de like/guardado de cada post (de visitas anteriores).
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

  // Guarda en localStorage el estado actual de like/guardado de todos los posts.
  private actualizarEstadoLocalStorage() {
      for (let i = 0; i < this.dataSource.length; i++) {
        const post = this.dataSource[i].id_post;
        localStorage.setItem(`likeState_${post}`, JSON.stringify(this.toggle[i]));
        localStorage.setItem(`saveState_${post}`, JSON.stringify(this.toggle1[i]));
      }
    }

  // Se ejecuta al hacer click en "Publicar" de la barra superior; abre el diálogo para crear una publicación.
  openAgregar(){
    const dialogRef = this.dialog.open(AgregarPubUComponent, {restoreFocus: false,id: 'agregar'} );
  }

  // Se ejecuta al hacer click en "Editar" sobre un comentario propio; abre
  // el diálogo de edición de comentario de publicidad, pasándole el post,
  // el usuario y el comentario a editar.
  openMod(postid:number,id_comment:number){
    var id_new = localStorage.getItem('ids');
    if (id_new) {
    var navegante = parseInt(id_new);
    const dialogRef = this.dialog.open(ModificarCommPComponent, {restoreFocus: false,id: 'mod',data:{id:postid,nav:navegante,comm:id_comment}} );}
  }

  // Se ejecuta al hacer click en "Eliminar" sobre un comentario propio; lo
  // borra en el backend (método "...P" de publicidad) y recarga la página.
  deleteComment(post: number , id_comment:number) {
    const id_new = localStorage.getItem('ids');
    if (id_new) {
      const navegante = parseInt(id_new);
      this.backend1.eliminarComentarioP(post, navegante,id_comment).subscribe(
        () => {
          location.reload();
        },
        error => {
          console.error("Error al eliminar comentario:", error);
        }
      );
    }
  }

}
