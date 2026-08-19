import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Comments } from 'src/app/models/Comments';
import { Comments2 } from 'src/app/models/Comments2';
import { Likes } from 'src/app/models/Likes';
import { Likes_cant } from 'src/app/models/Likes_cant';
import { Posts } from 'src/app/models/Posts';
import { Save } from 'src/app/models/Save';
import { BackendService } from 'src/app/services/backend.service';
import { Perfil } from 'src/app/models/Perfil';
import { Usuario2 } from 'src/app/models/Usuario2';
import { AgregarPubUComponent } from '../agregar-pub-u/agregar-pub-u.component';
import { MatDialog } from '@angular/material/dialog';
import { Usuario } from 'src/app/models/Usuario';
import { ModificarCommComponent } from '../modificar-comm/modificar-comm.component';
import { Articulos } from 'src/app/models/Articulos';

// Componente de la pantalla de "Perfil" (rutas "/perfil" para el propio
// usuario logueado, o "/perfil/:id" para ver el perfil de otro usuario).
// Combina en pestañas: los posts propios, los posts guardados, los
// artículos guardados y los outfits generados con IA guardados. También
// permite dar like/guardar/comentar directamente desde el perfil y quitar
// elementos de "guardados".
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})

export class PerfilComponent  implements OnInit {
  // Posts generales propios del usuario que se está viendo (pestaña "publicaciones").
  dataSource: Array<Posts> = new Array<Posts>();
  // Datos básicos del usuario del perfil (usuario, nombre, imagen, etc.).
  dataSource2: Array<Usuario> = new Array<Usuario>();
  // Posts generales guardados por el usuario logueado (pestaña "guardados").
  dataSource4: Array<Posts> = new Array<Posts>();
  // Artículos guardados por el usuario logueado (pestaña de artículos guardados).
  dataSource5: Array<Articulos> = new Array<Articulos>();
  // Comentarios de cada post/artículo mostrado, indexados por id_post.
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
  // Controla, por índice, si el contenido largo de un artículo está expandido ("Leer más").
  mostrarMas: boolean[] = [];
  // Outfits generados con IA guardados por el usuario, ya con su JSON parseado (pestaña de outfits guardados).
  dataSource6: any[] = [];

  // Id del usuario actualmente logueado, leído de localStorage (usado para
  // saber si el perfil que se ve es el propio y habilitar acciones).
  usuariolog = Number(localStorage.getItem('ids'));
  constructor(private router:Router,private backend1: BackendService,private activateRouter:ActivatedRoute,public dialog: MatDialog){
    this.dataSource.forEach((articulo, index) => {
      this.mostrarMas[index] = false;
    });
  }
  showShortDesciption = true
  // Descripción/usuario mostrados en el encabezado del perfil.
  descripcion:any={
    descripcion:'',
    usuarios:'',
  }
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
  // Pestaña actualmente activa del perfil (por defecto "posts").
  activeTab = 'posts';
  status = 'Enable';
  variable: string = "";
  id_new: number;
  id_likes:0;
  cant_like:0;

  // Se ejecuta automáticamente al crear el componente.
  // Determina de quién es el perfil a mostrar: si la URL trae un id
  // (":id"), usa ese; si no, usa el usuario logueado (localStorage "ids").
  // Con ese id, pide en paralelo: los datos básicos del usuario, sus posts
  // propios (con comentarios/likes/perfil de autor cargados en orden), sus
  // posts guardados, sus outfits de IA guardados y sus artículos guardados.
  ngOnInit(): void {
    const routeId = this.activateRouter.snapshot.paramMap.get('id');
    const user = routeId ? routeId : localStorage.getItem('ids');
    this.backend1.obtenerUsuario(Number(user)).subscribe(y => {
       this.dataSource2 =  y.datos;
       console.log(y.datos[0]);
    });
    this.backend1.PostPerfil(Number(user)).subscribe(async x => {
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
        this.id_us = this.dataSource[i].id_user;
        await this.obtenerComentariosAsync(this.id_com);
        await this.countLikeAsync(this.id_com);
        await this.obtenerPerfilAsync(this.id_us);
      }
      this.inicializarEstados();
    })

    this.backend1.getSave(Number(routeId ? routeId : localStorage.getItem('ids'))).subscribe(async m => {
      this.dataSource4 = m.datos;
      console.log(m.datos);
      this.dataSource4.forEach(post => {
        this.comentario[post.id_post] = '';
      });
      this.dataSource4.forEach((post) => {
        this.toggle[post.id_post] = false;
      });

      this.dataSource4.forEach((post) => {
        this.toggle1[post.id_post] = false;
      });

      for (let i = 0; i < this.dataSource4.length; i++) {
        this.id_com = this.dataSource4[i].id_post;
        await this.obtenerComentariosAsync(this.id_com);
        await this.countLikeAsync(this.id_com);
      }
    });

    this.backend1.obtenerOutfitsGuardados(Number(user)).subscribe(m => {
      this.dataSource6 = (m.datos || []).map((o: any) => {
        let parsed: any = {};
        try { parsed = JSON.parse(o.json_generado); } catch (e) { parsed = {}; }
        return { ...o, outfit: parsed };
      });
    });

    this.backend1.getSaveA(Number(routeId ? routeId : localStorage.getItem('ids'))).subscribe(async m => {
      this.dataSource5 = m.datos;
      console.log(m.datos);
      this.dataSource5.forEach(post => {
        this.comentario[post.id_post] = '';
      });
      this.dataSource5.forEach((post) => {
        this.toggle[post.id_post] = false;
      });

      this.dataSource5.forEach((post) => {
        this.toggle1[post.id_post] = false;
      });

      for (let i = 0; i < this.dataSource5.length; i++) {
        this.id_com = this.dataSource5[i].id_post;
        await this.obtenerComentariosAsyncA(this.id_com);
        await this.countLikeAsyncA(this.id_com);
      }
    });
  }

  // Pide al backend los comentarios de un ARTÍCULO guardado (usa el método "...A").
  async obtenerComentariosAsyncA(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.obtenerComentariosA(id_com).subscribe(async z => {
        this.comentarios[id_com] = z.datos;
        console.log(z.datos);
        resolve();
      });
    });
  }

  // Pide al backend la cantidad de likes de un ARTÍCULO guardado (usa el método "...A").
  async countLikeAsyncA(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.countLikeA(id_com).subscribe(y => {
        this.likes[id_com] = y.datos[0];
        console.log(y.datos);
        resolve();
      });
    });

  }

  // Pide al backend los comentarios de un POST GENERAL puntual.
  async obtenerComentariosAsync(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.obtenerComentarios(id_com).subscribe(async z => {
        this.comentarios[id_com] = z.datos;
        console.log(z.datos);
        resolve();
      });
    });
  }

  // Pide al backend la cantidad de likes de un POST GENERAL puntual.
  async countLikeAsync(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.countLike(id_com).subscribe(y => {
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

  // Se ejecuta al hacer click en el botón/ícono de "like" de un post
  // (funciona tanto para los posts propios como para los guardados). Si ya
  // tenía like, lo quita (baja el contador, sin bajar de 0); si no, lo
  // agrega (sube el contador). Actualiza localStorage.
  like(post: number, index: number) {
    var id_new = localStorage.getItem('ids');
    if (id_new) {
      var navegante = parseInt(id_new);
      if (this.toggle[index]) {
        this.backend1.eliminarLike(post,navegante).subscribe(y=> {
          this.toggle[index] = false;
          if (!this.likes[post]) this.likes[post] = { cantidad: 0 } as any;
          if (this.likes[post].cantidad > 0) this.likes[post].cantidad--;
          this.actualizarEstadoLocalStorage();
        });
      } else {
        let listadoLikes = new Likes(post, navegante);
        this.backend1.guardarLikes(listadoLikes).subscribe(y => {
          this.toggle[index] = true;
          if (!this.likes[post]) this.likes[post] = { cantidad: 0 } as any;
          this.likes[post].cantidad++;
          this.actualizarEstadoLocalStorage();
        });
      }
    }
  }

  // Se ejecuta al hacer click en el botón "Publicar" comentario. A
  // diferencia de los otros feeds, este método NO filtra palabras
  // inapropiadas (no usa bad-words). Valida que no esté vacío, lo envía al
  // backend y, al terminar (con éxito o error), recarga la página.
  comment(post: number) {
    const comentario = this.comentario[post];
    if (comentario.trim() === '') {
      return;
    }
    var id_new = localStorage.getItem('ids');
    if (id_new) {
      console.log(id_new);
        var navegante = parseInt(id_new);
        let listadocoment = new Comments(post, navegante, comentario);
        this.backend1.guardarComentarios(listadocoment).subscribe(
          y => {
            this.comentario[post] = '';
          },
          error => {
            console.error("Error al guardar comentario:", error);
          }
        );
    }
    location.reload();
  }

  // Se ejecuta al hacer click en el botón/ícono de "guardar" de un post.
  // Si ya estaba guardado lo quita; si no, lo guarda como favorito.
  save(post: number, index: number) {
    console.log("save");
    const id_new = localStorage.getItem('ids');
    if (id_new) {
        console.log(id_new);
        const navegante = parseInt(id_new);
        let listadoFav = new Save(post, navegante);

        if (this.isSaved(post)) {
            this.backend1.eliminarSave(post, navegante).subscribe(y => {
                localStorage.removeItem(`saveState_${post}`);
                this.toggle1[index] = false;
            }, error => {
                console.error('Error al eliminar el guardado:', error);
            });
        } else {
            // Si el post no está guardado, lo guardamos
            this.backend1.guardarFavoritos(listadoFav).subscribe(y => {
                localStorage.setItem(`saveState_${post}`, 'true');
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

  // Restaura desde localStorage el estado de like/guardado de cada post propio (de visitas anteriores).
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

  // Guarda en localStorage el estado actual de like/guardado de los posts propios.
  private actualizarEstadoLocalStorage() {
      for (let i = 0; i < this.dataSource.length; i++) {
        const post = this.dataSource[i].id_post;
        localStorage.setItem(`likeState_${post}`, JSON.stringify(this.toggle[i]));
        localStorage.setItem(`saveState_${post}`, JSON.stringify(this.toggle1[i]));
      }
    }
    // Se ejecuta al hacer click en "Editar" sobre un comentario propio; abre
    // el diálogo de edición pasándole el post, el usuario y el comentario a editar.
    openMod(postid:number,id_comment:number){
      var id_new = localStorage.getItem('ids');
      if (id_new) {
      var navegante = parseInt(id_new);
      const dialogRef = this.dialog.open(ModificarCommComponent, {restoreFocus: false,id: 'mod',data:{id:postid,nav:navegante,comm:id_comment}} );}
    }

    // Se ejecuta al hacer click en "Eliminar" sobre un comentario propio; lo borra en el backend y recarga la página.
    deleteComment(post: number , id_comment:number) {
      const id_new = localStorage.getItem('ids');
      if (id_new) {
        const navegante = parseInt(id_new);
        this.backend1.eliminarComentario(post, navegante,id_comment).subscribe(
          () => {
            location.reload();
          },
          error => {
            console.error("Error al eliminar comentario:", error);
          }
        );
      }
    }

    // Se ejecuta al hacer click en "Quitar de guardados" sobre un post en la
    // pestaña de publicaciones. Pide al backend eliminar el guardado y, al
    // terminar, lo saca localmente de "dataSource" (sin recargar la página).
    unsavePost(post: number) {
      const id_new = localStorage.getItem('ids');
      if (!id_new) return;
      const navegante = parseInt(id_new);
      this.backend1.eliminarSave(post, navegante).subscribe(() => {
        localStorage.removeItem(`saveState_${post}`);
        this.dataSource = this.dataSource.filter(p => p.id_post !== post);
      });
    }

    // Se ejecuta al hacer click en "Quitar" sobre un outfit de IA guardado.
    // Pide al backend eliminar ese outfit y, al terminar, lo saca localmente de "dataSource6".
    unsaveOutfit(id_outfit: number) {
      this.backend1.eliminarOutfitGuardado(id_outfit).subscribe(() => {
        this.dataSource6 = this.dataSource6.filter(o => o.id_outfit !== id_outfit);
      });
    }

    // Se ejecuta al hacer click en "Quitar de guardados" sobre un post en la
    // pestaña de "guardados". Pide al backend eliminar el guardado y, al
    // terminar, lo saca localmente de "dataSource4".
    unsaveGuardado(post: number) {
      const id_new = localStorage.getItem('ids');
      if (!id_new) return;
      const navegante = parseInt(id_new);
      this.backend1.eliminarSave(post, navegante).subscribe(() => {
        localStorage.removeItem(`saveState_${post}`);
        this.dataSource4 = this.dataSource4.filter(p => p.id_post !== post);
      });
    }

    // Se ejecuta al hacer click en "Quitar de guardados" sobre un artículo
    // guardado. Pide al backend eliminar el guardado (método "...A") y, al
    // terminar, lo saca localmente de "dataSource5".
    unsaveArticulo(post: number) {
      const id_new = localStorage.getItem('ids');
      if (!id_new) return;
      const navegante = parseInt(id_new);
      this.backend1.eliminarSaveA(post, navegante).subscribe(() => {
        this.dataSource5 = this.dataSource5.filter(p => p.id_post !== post);
      });
    }

    // Función auxiliar usada en el HTML para decidir si un archivo es imagen o video (por su extensión).
    isImage(fileName: string): boolean {
      return fileName.match(/\.(jpeg|jpg|gif|png)$/) != null;
    }

    // Se ejecuta al hacer click en el botón "Leer más"/"Leer menos" de un
    // artículo. Alterna el estado de expansión de ese artículo (por índice).
    toggleLeerMas(index: number): void {
      this.mostrarMas[index] = !this.mostrarMas[index];
    }
}
