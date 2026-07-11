import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Comments } from 'src/app/models/Comments';
import { Comments2 } from 'src/app/models/Comments2';
import { Likes } from 'src/app/models/Likes';
import { Likes_cant } from 'src/app/models/Likes_cant';
import { Posts } from 'src/app/models/Posts';
import { Save } from 'src/app/models/Save';
import { Usuario2 } from 'src/app/models/Usuario2';
import { BackendService } from 'src/app/services/backend.service';
import { AgregarPubUComponent } from '../agregar-pub-u/agregar-pub-u.component';
import { ModificarCommComponent } from '../modificar-comm/modificar-comm.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Filter } from 'bad-words';
import { ImagecolorComponent } from '../imagecolor/imagecolor.component';
import { MoodboardComponent } from '../moodboard/moodboard.component';
import { RandlookComponent } from '../randlook/randlook.component';
import { TryOnComponent } from '../try-on/try-on.component';
interface ColorShade{
  name: string;
  rgb: [number, number, number];
}
interface Prenda{
  name: string;
}
@Component({
  selector: 'app-zapatos',
  templateUrl: './zapatos.component.html',
  styleUrls: ['./zapatos.component.scss']
})
export class ZapatosComponent implements OnInit {
  dataSource: Array<Posts> = new Array<Posts>();
  filteredItems: Array<Posts> = [];  // Almacena los artículos filtrados por color
  filteredItem: Array<Posts> = [];  // Almacena los artículos filtrados por prenda

  showWidget: boolean = true;

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

  constructor(private router:Router,private backend1: BackendService,private activateRouter:ActivatedRoute,public dialog: MatDialog,public snackBar: MatSnackBar){ }
  showShortDesciption = true
  usuariolog = Number(localStorage.getItem('ids'));
  articulo: any={
    id_post:0,
    descripcion:'',
    imagen:'',
    id_user:0,
    usuario:'',
    id_categoria:0,
    name_categoria:'',
    prenda1:'',
    prenda2:'',
    prenda3:'',
    prenda4:'',
    prenda5:'',
    prenda6:'',
    link1:'',
    link2:'',
    link3:'',
    link4:'',
    link5:'',
    link6:'',
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


  selectedColorTones: ColorShade[] = [];

  selectedClothes: Prenda[] = [];

  clothes: {[key:string]:Prenda[]} = {
    bag: [{ name: 'bag' }],
    belt: [{ name: 'belt' }],
    bowtie: [{ name: 'bowtie' }],
    bracelet: [{ name: 'bracelet' }],
    dress: [{ name: 'dress' }],
    earrings: [{ name: 'earrings' }],
    glasses: [{ name: 'glasses' }],
    gloves: [{ name: 'gloves' }],
    "hair clip": [{ name: 'hair clip' }],
    hat: [{ name: 'hat' }],
    headband: [{ name: 'headband' }],
    hosiery: [{ name: 'hosiery' }],
    jumpsuit: [{ name: 'jumpsuit' }],
    mittens: [{ name: 'mittens' }],
    necklace: [{ name: 'necklace' }],
    necktie: [{ name: 'necktie' }],
    outerwear: [{ name: 'outerwear' }],
    pants: [{ name: 'pants' }],
    "pin/brooch": [{ name: 'pin/brooch' }],
    "pocket square": [{ name: 'pocket square' }],
    ring: [{ name: 'ring' }],
    romper: [{ name: 'romper' }],
    scarf: [{ name: 'scarf' }],
    shoes: [{ name: 'shoes' }],
    shorts: [{ name: 'shorts' }],
    skirt: [{ name: 'skirt' }],
    socks: [{ name: 'socks' }],
    sunglasses: [{ name: 'sunglasses' }],
    suspenders: [{ name: 'suspenders' }],
    swimwear: [{ name: 'swimwear' }],
    "tie clip": [{ name: 'tie clip' }],
    top: [{ name: 'top' }],
    vest: [{ name: 'vest' }],
    watch: [{ name: 'watch' }]}


  colorShades: { [key: string]: ColorShade[] } = {
        amarillo: [
          { name: 'almendra', rgb: [239, 222, 205] },
          { name: 'amarillo mostaza', rgb: [208, 166, 35] },
          { name: 'arena', rgb: [194, 178, 128] },
          { name: 'amarillo brillante', rgb: [255, 255, 0] },
          { name: 'amarillo palido', rgb: [255, 255, 153] },
          { name: 'amarillo dorado', rgb: [255, 223, 0] },
          { name: 'amarillo limon', rgb: [255, 247, 0] },
          { name: 'amarillo pastel', rgb: [255, 239, 170] },
          { name: 'amarillo oscuro', rgb: [204, 204, 0] },
          { name: 'dorado', rgb: [210, 180, 120] },
          { name: 'amarillo camel', rgb: [193, 154, 107] },
      ],
      azul: [
          { name: 'azul acero', rgb: [70, 130, 180] },
          { name: 'azul claro', rgb: [173, 216, 230] },
          { name: 'azul celeste', rgb: [135, 206, 235] },
          { name: 'azul cobalto', rgb: [61, 89, 171] },
          { name: 'azul marino', rgb: [0, 0, 128] },
          { name: 'azul marino', rgb: [0, 25, 57] },
          { name: 'azul oscuro', rgb: [23, 29, 48] },
          { name: 'azul oscuro', rgb: [0, 0, 139] },
          { name: 'azul rey', rgb: [65, 105, 225] },
          { name: 'azul turquesa', rgb: [64, 224, 208] },
          { name: 'azul grisaceo', rgb: [0, 128, 189] },
          { name: 'azul cielo', rgb: [135, 206, 235] },
          { name: 'azul real', rgb: [65, 105, 225] },
          { name: 'azul zafiro', rgb: [15, 82, 186] },
          { name: 'azul cobalto', rgb: [0, 71, 171] },
          { name: 'azul rey', rgb: [72, 61, 139] },
          { name: 'azul indigo', rgb: [75, 0, 130] },
          { name: 'azul vaquero', rgb: [33, 67, 95] },
          { name: 'azul petroleo', rgb: [0, 99, 126] },
          { name: 'azul aqua', rgb: [127, 255, 212] },
          { name: 'azul genciana', rgb: [30, 144, 255] },
          { name: 'azul denim', rgb: [21, 96, 189] },
          { name: 'azul noche', rgb: [25, 25, 112] },
          { name: 'azul electrico', rgb: [44, 117, 255] },
          { name: 'azul pastel', rgb: [174, 198, 207] },
          { name: 'azul lavanda', rgb: [230, 230, 250] },
          { name: 'azul hielo', rgb: [173, 216, 230] },
          { name: 'azul ceruleo', rgb: [42, 82, 190] },
          { name: 'azul Mediterraneo', rgb: [0, 121, 191] },
          { name: 'azul grisáceo', rgb: [96, 130, 182] },
          { name: 'azul cobalto oscuro', rgb: [61, 89, 171] },
          { name: 'azul pastel suave', rgb: [189, 183, 107] },
          { name: 'azul cian', rgb: [0, 255, 255] },
          { name: 'celeste', rgb: [153, 172, 182] },
          { name: 'azul oscuro', rgb: [39, 39, 48] },
          { name: 'azul turquesa clarito', rgb: [57, 85, 97] },
          { name: 'azul oscuro grisoso', rgb: [54, 69, 79] },
          { name: 'azul obscuro celeste', rgb: [112, 128, 144] },
      ],
      beige: [
          { name: 'beige', rgb: [183, 166, 149] },
          { name: 'beige claro', rgb: [245, 245, 220] },
          { name: 'beige claro', rgb: [230, 188, 137] },
          { name: 'beige grisaceo', rgb: [190, 187, 185] },
          { name: 'beige oscuro', rgb: [210, 180, 140] },
          { name: 'beige oscuro', rgb: [167, 116, 81] },
          { name: 'beige arenoso', rgb: [222, 202, 170] },
          { name: 'beige palido', rgb: [245, 245, 200] },
          { name: 'beige dorado', rgb: [210, 180, 120] },
          { name: 'beige intenso', rgb: [126, 116, 100] },
      ],
      blanco: [
          { name: 'blanco', rgb: [255, 255, 255] },
          { name: 'blanco hueso', rgb: [255, 250, 240] },
          { name: 'blanco perla', rgb: [252, 244, 248] },
          { name: 'blanco nieve', rgb: [255, 250, 250] },
          { name: 'blanco marfil', rgb: [255, 255, 240] },
          { name: 'blanco roto', rgb: [245, 245, 245] },
          { name: 'blanco suave', rgb: [225, 220, 219] },
          { name: 'blanco hueso gris', rgb: [214, 210, 212] },
      ],
      gris: [
          { name: 'gris', rgb: [197, 196, 196] },
          { name: 'gris azulado claro', rgb: [202, 206, 217] },
          { name: 'gris claro', rgb: [220, 225, 228] },
          { name: 'gris claro', rgb: [211, 211, 211] },
          { name: 'gris oscuro', rgb: [169, 169, 169] },
          { name: 'gris oscuro', rgb: [71, 65, 127] },
          { name: 'gris plata', rgb: [192, 192, 192] },
      ],

      marron: [
          { name: 'marron', rgb: [148, 134, 119] },
          { name: 'marron camel', rgb: [193, 154, 107] },
          { name: 'marron claro', rgb: [210, 180, 140] },
          { name: 'marron grisaceo', rgb: [139, 114, 103] },
          { name: 'marron oscuro', rgb: [139, 69, 19] },
          { name: 'marron palido', rgb: [189, 176, 185] },
          { name: 'marron rojizo', rgb: [57, 32, 26] },
          { name: 'marron terracota', rgb: [166, 104, 70] },
          { name: 'marron cobre', rgb: [184, 115, 51] },
          { name: 'marron castaño', rgb: [139, 69, 19] },
          { name: 'marron nuez', rgb: [150, 75, 0] },
          { name: 'marron tierra', rgb: [222, 184, 135] },
          { name: 'marron caramelo', rgb: [175, 111, 71] },
          { name: 'marron miel', rgb: [201, 140, 70] },
          { name: 'cafe', rgb: [165, 42, 42] },
          { name: 'chocolate', rgb: [210, 105, 30] },
          { name: 'marron camel', rgb: [193, 154, 107] },
          { name: 'marron claro', rgb: [210, 180, 140] },
          { name: 'marron grisaceo', rgb: [139, 114, 103] },
          { name: 'marron oscuro', rgb: [139, 69, 19] },
          { name: 'marron rojizo', rgb: [57, 32, 26] },
          { name: 'marron terracota', rgb: [166, 104, 70] },
          { name: 'marron cobre', rgb: [184, 115, 51] },
          { name: 'marron castaño', rgb: [139, 69, 19] },
          { name: 'marron nuez', rgb: [150, 75, 0] },
          { name: 'marron caoba', rgb: [128, 0, 0] },
          { name: 'marron caramelo', rgb: [175, 111, 71] },
          { name: 'marron miel', rgb: [201, 140, 70] },
          { name: 'marron tierra', rgb: [222, 184, 135] },
          { name: 'marron grisaceo', rgb: [105, 65, 62] },
          { name: 'marron suave', rgb: [192, 183, 173] },
          { name: 'marron arcilla', rgb: [198, 156, 109] },
          { name: 'cafe chocolate', rgb: [66, 59, 51] },
          { name: 'cafe apagado', rgb: [58, 38, 27] },
          { name: 'cafe clarito', rgb: [71, 67, 63] },
          { name: 'cafe medio', rgb: [86, 74, 81] },
          { name: 'cafe verdoso', rgb: [111, 105, 119] },

      ],
      morado: [
          { name: 'morado', rgb: [128, 0, 128] },
          { name: 'morado noche', rgb: [64, 0, 64] },
          { name: 'morado oscuro', rgb: [75, 0, 130] },
          { name: 'morado pastel', rgb: [218, 112, 214] },
          { name: 'morado real', rgb: [102, 51, 153] },
          { name: 'morado intenso', rgb: [30, 34, 48] },
          { name: 'morado lavanda', rgb: [230, 230, 250] },
          { name: 'morado ciruela', rgb: [142, 69, 133] },
          { name: 'morado berenjena', rgb: [97, 49, 103] },
          { name: 'lavanda', rgb: [230, 230, 250] },
          { name: 'lila', rgb: [200, 162, 200] },
          { name: 'lila suave', rgb: [217, 210, 215] },
          { name: 'lila', rgb: [188, 180, 196] },
          { name: 'malva', rgb: [224, 176, 255] },
          { name: 'violeta', rgb: [238, 130, 238] },
          { name: 'violeta claro', rgb: [199, 21, 133] },
          { name: 'violeta medio', rgb: [138, 43, 226] },
          { name: 'violeta oscuro', rgb: [148, 0, 211] },
          { name: 'violeta intenso', rgb: [110, 47, 145] },
          { name: 'orquidea media', rgb: [186, 85, 211] },
          { name: 'orquidea oscuro', rgb: [153, 50, 204] },
          { name: 'purpura', rgb: [128, 0, 128] },
          { name: 'purpura claro', rgb: [147, 112, 219] },
          { name: 'purpura oscuro', rgb: [104, 34, 139] },
          { name: 'purpura profundo', rgb: [102, 2, 60] },
          { name: 'purpura intenso', rgb: [71, 12, 107] }

      ],
      naranja: [
          { name: 'naranja', rgb: [215, 70, 11] },
          { name: 'naranja oscuro', rgb: [215, 115, 50] },
          { name: 'naranja brillante', rgb: [255, 165, 0] },
          { name: 'naranja pastel', rgb: [255, 195, 160] },
          { name: 'naranja quemado', rgb: [204, 85, 0] },
          { name: 'naranja mandarina', rgb: [255, 140, 0] },
          { name: 'naranja coral', rgb: [255, 127, 80] },
          { name: 'terracota', rgb: [198, 104, 70] }
      ],
      negro: [
          { name: 'negro', rgb: [0, 0, 0] },
          { name: 'negro suave', rgb: [26, 24, 23] },
          { name: 'negro carbon', rgb: [54, 69, 79] },
          { name: 'negro azabache', rgb: [0, 0, 0] },
          { name: 'negro onix', rgb: [36, 36, 36] }
      ],
      rojo: [
          { name: 'rojo brillante', rgb: [255, 0, 0] },
          { name: 'rojo carmesi', rgb: [220, 20, 60] },
          { name: 'rojo coral', rgb: [255, 127, 80] },
          { name: 'rojo oscuro', rgb: [139, 0, 0] },
          { name: 'rojo oscuro', rgb: [97, 21, 38] },
          { name: 'rojo ladrillo', rgb: [178, 34, 34] },
          { name: 'rojo oxido', rgb: [165, 42, 42] },
          { name: 'rojo sangre', rgb: [150, 7, 38] }
      ],
      rosa: [
          { name: 'rosa bebe', rgb: [255, 192, 203] },
          { name: 'rosa claro', rgb: [255, 182, 193] },
          { name: 'rosa claro', rgb: [225, 198, 231] },
          { name: 'rosa fuerte', rgb: [255, 20, 147] },
          { name: 'rosa intenso', rgb: [255, 105, 180] },
          { name: 'rosa mexicano', rgb: [226, 0, 116] },
          { name: 'rosa muy pálido', rgb: [255, 240, 245] },
          { name: 'rosa pastel', rgb: [255, 174, 185] },
          { name: 'rosa polvo', rgb: [219, 112, 147] },
          { name: 'rosa palido', rgb: [233, 225, 219] },
          { name: 'rosa viejo', rgb: [188, 143, 143] },
          { name: 'rosado palido', rgb: [200, 177, 176] },
          { name: 'rosa palido blanco', rgb: [214, 214, 215] },
      ],
      verde: [
          { name: 'verde azulado', rgb: [112, 96, 82] },
          { name: 'verde botella', rgb: [0, 106, 78] },
          { name: 'verde claro', rgb: [183, 232, 164] },
          { name: 'verde claro', rgb: [144, 238, 144] },
          { name: 'verde esmeralda', rgb: [80, 200, 120] },
          { name: 'verde intenso', rgb: [30, 34, 48] },
          { name: 'verde lima', rgb: [50, 205, 50] },
          { name: 'verde menta', rgb: [152, 251, 152] },
          { name: 'verde menta', rgb: [203, 219, 178] },
          { name: 'verde musgo', rgb: [85, 107, 47] },
          { name: 'verde musgo', rgb: [47, 39, 53] },
          { name: 'verde oliva', rgb: [163, 159, 141] },
          { name: 'verde oliva', rgb: [126, 88, 166] },
          { name: 'verde oliva claro', rgb: [203, 183, 187] },
          { name: 'verde oliva oscuro', rgb: [50, 40, 28] },
          { name: 'verde oliva oscuro', rgb: [180, 170, 157] },
          { name: 'verde seco', rgb: [140, 143, 100] },
          { name: 'verde azulado', rgb: [60, 55, 42] },
          { name: 'verde cafe', rgb: [53, 52, 46] },
      ]
    };
  ngOnInit(): void {
    this.backend1.obtenerZapatos().subscribe(async x => {
      this.dataSource = x.datos;
      console.log(x.datos);
      console.log(this.filteredItems);
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
          this.likes[post].cantidad--;
          this.actualizarEstadoLocalStorage();
        });
      } else {
        let listadoLikes = new Likes(post, navegante);
        this.backend1.guardarLikes(listadoLikes).subscribe(y => {
          this.toggle[index] = true;
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
    this.backend1.guardarComentarios(listadocoment).subscribe(y => {
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
            this.backend1.eliminarSave(post, navegante).subscribe(y => {
                localStorage.removeItem(`saveState_${post}`);
                this.toggle1[index] = false;
            }, error => {
                console.error('Error al eliminar el guardado:', error);
            });
        } else {
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
  openAgregar(){
    const dialogRef = this.dialog.open(AgregarPubUComponent, {restoreFocus: false,id: 'agregar'} );
  }
  open(){
    const dialogRef = this.dialog.open(ImagecolorComponent, {restoreFocus: false,id: 'color'} );
  }
  openMood(){
    const dialogRef = this.dialog.open(MoodboardComponent, {restoreFocus: false,id: 'board'} );
  }
  openRand(){
    const dialogRef = this.dialog.open(RandlookComponent, {restoreFocus: false,id: 'look'} );
  }
  openTryOn(){
    const dialogRef = this.dialog.open(TryOnComponent, {restoreFocus: false,id: 'tryon'} );
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

  seleccionarPorRango(colorGeneral: string) {
    this.selectedColorTones = this.colorShades[colorGeneral.toLowerCase()];
    if (!this.selectedColorTones || this.selectedColorTones.length === 0) {
        console.error('No se encontraron tonos para el color seleccionado');
        return;
    }

    let itemVibrantClass = null;
    let itemMutedClass = null;
    let itemThirdClass = null;
    this.filteredItems = this.dataSource.filter((item: any) => {
      const relevantShades = this.selectedColorTones.map((shade: ColorShade) => shade.name.toLowerCase());
      itemVibrantClass = item.vibrant_class ? item.vibrant_class.toLowerCase() : '';
      itemMutedClass = item.muted_class ? item.muted_class.toLowerCase() : '';
      itemThirdClass = item.third_class ? item.third_class.toLowerCase() : '';
      return (relevantShades.includes(itemVibrantClass) ||relevantShades.includes(itemMutedClass) ||relevantShades.includes(itemThirdClass));
    });
   this.isModalOpen = false;
  }
  seleccionarPorRopa(prenda: string) {
    this.selectedClothes = this.clothes[prenda.toLowerCase()] || [];
    if (!this.selectedClothes || this.selectedClothes.length === 0) {
      console.error('No se encontraron prendas para la categoría seleccionada');
      return;
    }
    let prenda1 = null;
    let prenda2 = null;
    let prenda3 = null;
    let prenda4 = null;
    let prenda5 = null;
    let prenda6 = null;

    this.filteredItems = this.dataSource.filter((item: any) => {
      const relevantClothes = this.selectedClothes.map((prenda: Prenda) => prenda.name.toLowerCase());
      prenda1 = item.prenda1 ? item.prenda1.toLowerCase() : '';
      prenda2 = item.prenda2 ? item.prenda2.toLowerCase() : '';
      prenda3 = item.prenda3 ? item.prenda3.toLowerCase() : '';
      prenda4 = item.prenda4 ? item.prenda4.toLowerCase() : '';
      prenda5 = item.prenda5 ? item.prenda5.toLowerCase() : '';
      prenda6 = item.prenda6 ? item.prenda6.toLowerCase() : '';
      return (relevantClothes.includes(prenda1) ||relevantClothes.includes(prenda2) ||relevantClothes.includes(prenda3) ||relevantClothes.includes(prenda4) ||relevantClothes.includes(prenda5) ||relevantClothes.includes(prenda6));
    });
    this.isModalOpen2 = false;
  }
  limpiarFiltro(): void {
    this.filteredItems = this.dataSource;
  }
  isImage(fileName: string): boolean {
    return fileName.match(/\.(jpeg|jpg|gif|png)$/) != null;
  }
  isModalOpen: boolean = false;
  isModalOpen2: boolean = false;
  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }
  toggleModal2() {
    this.isModalOpen2 = !this.isModalOpen2;
  }
  onWindowClick(event: Event) {
    const modal = document.getElementById('colorModal');
    if (event.target === modal) {
      this.isModalOpen = false;
    }
  }
}
