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

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})

export class PerfilComponent  implements OnInit {
  dataSource: Array<Posts> = new Array<Posts>();
  dataSource2: Array<Usuario> = new Array<Usuario>();
  dataSource4: Array<Posts> = new Array<Posts>();
  dataSource5: Array<Articulos> = new Array<Articulos>();
  comentarios: Array<Comments2[]> = [];
  perfil: Array<Usuario2> = [];
  likes: Array<Likes_cant> = [];
  id_com: number;
  comentario: { [key: number]: string } = {};
  toggle: boolean[] = [];
  toggle1: boolean[] = [];
  id_lik: number;
  valores: Likes;
  id_us: number;
  mostrarMas: boolean[] = [];
  dataSource6: any[] = [];

  usuariolog = Number(localStorage.getItem('ids'));
  constructor(private router:Router,private backend1: BackendService,private activateRouter:ActivatedRoute,public dialog: MatDialog){
    this.dataSource.forEach((articulo, index) => {
      this.mostrarMas[index] = false;
    });
  }
  showShortDesciption = true
  descripcion:any={
    descripcion:'',
    usuarios:'',
  }
  articulo: any={
    id_post:0,
    descripcion:'',
    imagen:'',
    id_user:0,
    usuario:'',
    id_categoria:0,
    name_categoria:'',
  }
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
  activeTab = 'posts';
  status = 'Enable';
  variable: string = "";
  id_new: number;
  id_likes:0;
  cant_like:0;
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
  async obtenerComentariosAsyncA(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.obtenerComentariosA(id_com).subscribe(async z => {
        this.comentarios[id_com] = z.datos;
        console.log(z.datos);
        resolve();
      });
    });
  }

  async countLikeAsyncA(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.countLikeA(id_com).subscribe(y => {
        this.likes[id_com] = y.datos[0];
        console.log(y.datos);
        resolve();
      });
    });

  }

  async obtenerComentariosAsync(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.obtenerComentarios(id_com).subscribe(async z => {
        this.comentarios[id_com] = z.datos;
        console.log(z.datos);
        resolve();
      });
    });
  }

  async countLikeAsync(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.countLike(id_com).subscribe(y => {
        this.likes[id_com] = y.datos[0];
        console.log(y.datos);
        resolve();
      });
    });

  }
  async obtenerPerfilAsync(id_us: number) {
    return new Promise<void>(resolve => {
      this.backend1.obtenerUsuario(id_us).subscribe(async a => {
        this.perfil[id_us] = a.datos[0];
        console.log(a.datos);
        resolve();
      });
    });
  }
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
  isSaved(post: number): boolean {
    return localStorage.getItem(`saveState_${post}`) === 'true';
  }
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

  private actualizarEstadoLocalStorage() {
      for (let i = 0; i < this.dataSource.length; i++) {
        const post = this.dataSource[i].id_post;
        localStorage.setItem(`likeState_${post}`, JSON.stringify(this.toggle[i]));
        localStorage.setItem(`saveState_${post}`, JSON.stringify(this.toggle1[i]));
      }
    }
    openMod(postid:number,id_comment:number){
      var id_new = localStorage.getItem('ids');
      if (id_new) {
      var navegante = parseInt(id_new);
      const dialogRef = this.dialog.open(ModificarCommComponent, {restoreFocus: false,id: 'mod',data:{id:postid,nav:navegante,comm:id_comment}} );}
    }

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
    unsavePost(post: number) {
      const id_new = localStorage.getItem('ids');
      if (!id_new) return;
      const navegante = parseInt(id_new);
      this.backend1.eliminarSave(post, navegante).subscribe(() => {
        localStorage.removeItem(`saveState_${post}`);
        this.dataSource = this.dataSource.filter(p => p.id_post !== post);
      });
    }

    unsaveOutfit(id_outfit: number) {
      this.backend1.eliminarOutfitGuardado(id_outfit).subscribe(() => {
        this.dataSource6 = this.dataSource6.filter(o => o.id_outfit !== id_outfit);
      });
    }

    unsaveGuardado(post: number) {
      const id_new = localStorage.getItem('ids');
      if (!id_new) return;
      const navegante = parseInt(id_new);
      this.backend1.eliminarSave(post, navegante).subscribe(() => {
        localStorage.removeItem(`saveState_${post}`);
        this.dataSource4 = this.dataSource4.filter(p => p.id_post !== post);
      });
    }

    unsaveArticulo(post: number) {
      const id_new = localStorage.getItem('ids');
      if (!id_new) return;
      const navegante = parseInt(id_new);
      this.backend1.eliminarSaveA(post, navegante).subscribe(() => {
        this.dataSource5 = this.dataSource5.filter(p => p.id_post !== post);
      });
    }

    isImage(fileName: string): boolean {
      return fileName.match(/\.(jpeg|jpg|gif|png)$/) != null;
    }
    toggleLeerMas(index: number): void {
      this.mostrarMas[index] = !this.mostrarMas[index];
    }
}
