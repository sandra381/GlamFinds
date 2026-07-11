import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Comments } from 'src/app/models/Comments';
import { Comments2 } from 'src/app/models/Comments2';
import { Likes } from 'src/app/models/Likes';
import { Likes_cant } from 'src/app/models/Likes_cant';
import { Posts } from 'src/app/models/Posts';
import { Publicidad } from 'src/app/models/Publicidad';
import { Publicidad_post } from 'src/app/models/Publicidad_post';
import { Save } from 'src/app/models/Save';
import { Usuario2 } from 'src/app/models/Usuario2';
import { BackendService } from 'src/app/services/backend.service';
import { AgregarPubUComponent } from '../agregar-pub-u/agregar-pub-u.component';
import { MatDialog } from '@angular/material/dialog';
import { ModificarCommPComponent } from '../modificar-comm-p/modificar-comm-p.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Filter } from 'bad-words';
@Component({
  selector: 'app-dups',
  templateUrl: './dups.component.html',
  styleUrls: ['./dups.component.scss']
})
export class DupsComponent  implements OnInit {
  dataSource: Array<Publicidad> = new Array<Publicidad>();
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
  showWidget: boolean = true;

  constructor(private router:Router,private backend1: BackendService,private activateRouter:ActivatedRoute,public dialog: MatDialog,public snackBar: MatSnackBar){ }
  showShortDesciption = true
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
  status = 'Enable';
  variable: string = "";
  id_new: number;
  id_likes:0;
  cant_like:0;
  ngOnInit(): void {
    this.backend1.obtenerDups().subscribe(async x => {
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
  }
  async obtenerComentariosAsync(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.obtenerComentarioP(id_com).subscribe(async z => {
        this.comentarios[id_com] = z.datos;
        console.log(z.datos);
        resolve();
      });
    });
  }
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
            this.backend1.eliminarLikeP(post, navegante).subscribe(() => {

                this.likes[post].cantidad--;
                this.actualizarEstadoLocalStorage();
                this.toggle[index] = false;
            });
        } else {
            let listadoLikes = new Likes(post, navegante);
            this.backend1.guardarLikesP(listadoLikes).subscribe(() => {

                this.likes[post].cantidad++;
                this.actualizarEstadoLocalStorage();
                this.toggle[index] = true;
            });
        }
    }
  }
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
    const dialogRef = this.dialog.open(ModificarCommPComponent, {restoreFocus: false,id: 'mod',data:{id:postid,nav:navegante,comm:id_comment}} );}
  }

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
