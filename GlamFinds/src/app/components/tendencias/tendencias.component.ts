import { Component, Renderer2, ViewChild, ElementRef, OnInit, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Comments } from 'src/app/models/Comments';
import { Comments2 } from 'src/app/models/Comments2';
import { Likes } from 'src/app/models/Likes';
import { Posts } from 'src/app/models/Posts';
import { Save } from 'src/app/models/Save';
import { BackendService } from 'src/app/services/backend.service';
import { Likes_cant } from 'src/app/models/Likes_cant';
import { MatDialog } from '@angular/material/dialog';
import { AgregarPubUComponent } from '../agregar-pub-u/agregar-pub-u.component';
import { Usuario } from 'src/app/models/Usuario';
import { Usuario2 } from 'src/app/models/Usuario2';
import { ModificarCommComponent } from '../modificar-comm/modificar-comm.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Filter } from 'bad-words';
import { ImagecolorComponent } from '../imagecolor/imagecolor.component';
import { MoodboardComponent } from '../moodboard/moodboard.component';
import { RandlookComponent } from '../randlook/randlook.component';
import { TryOnComponent } from '../try-on/try-on.component';
import { WidgetComponent } from '../widget/widget.component';

// Tono de color con nombre en español y su equivalente RGB (usado para filtrar por color).
interface ColorShade {
  name: string;
  rgb: [number, number, number];
}
// Nombre de una prenda usada para filtrar los posts por tipo de artículo.
interface Prenda {
  name: string;
}
// Zona del rostro donde se detectó (o no) maquillaje, con su color y el
// link de producto sugerido (si corresponde).
interface MakeupZone {
  zone: string;
  has_makeup: boolean;
  distance_to_skin: number;
  color_name: string | null;
  product_link: string | null;
  colors: {
    vibrant: number[];
    muted: number[];
    third: number[];
  };
}

// Componente del feed PRINCIPAL "Tendencias" (ruta "/feed"), el más
// completo de todos los feeds del proyecto. Además de likes, comentarios,
// guardado y filtros por color/prenda, muestra sobre cada imagen botones de
// "comprar" posicionados según las prendas y zonas de maquillaje que la IA
// detectó en la foto (bounding boxes), tiene selector de emojis para
// comentarios, chips de categoría, y al dar like también actualiza las
// preferencias del usuario (para alimentar el feed "Para ti").
@Component({
  selector: 'app-tendencias',
  templateUrl: './tendencias.component.html',
  styleUrls: ['./tendencias.component.scss']
})
export class TendenciasComponent implements OnInit {
  // Todos los posts de tendencias obtenidos del backend, sin filtrar.
  dataSource: Array<Posts> = new Array<Posts>();
  // Posts que se muestran actualmente en pantalla (tras aplicar filtros de color/prenda/categoría).
  filteredItems: Array<Posts> = [];
  filteredItem: Array<Posts> = [];

  // Controla si se muestra el widget lateral (actualmente sin uso visible en el feed).
  showWidget: boolean = true;

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

  showShortDesciption = true;
  // Id del usuario actualmente logueado, leído de localStorage.
  usuariolog = Number(localStorage.getItem('ids'));

  // Variable del usuario logueado (si se usa en el template)
  user: any = {
    id_user: 0,
    usuario: '',
    nombre: '',
    apellido: '',
    edad: '',
    sexo: '',
    correo: '',
    contrase: '',
    imagen: ''
  };

  status = 'Enable';
  variable: string = "";
  id_new: number;
  id_likes: 0;
  cant_like: 0;


  // Propiedades para modales y emojis
  // Controla si el modal de filtro por color está abierto.
  isModalOpen: boolean = false;
  // Controla si el modal de filtro por prenda está abierto.
  isModalOpen2: boolean = false;
  // Controla, por id_post, si el selector de emojis de ese post está abierto.
  showEmojiPicker: { [key: number]: boolean } = {};

  // Filtro por categoría (para los chips)
  // Lista de categorías disponibles (cargada del backend) para los chips de filtro.
  categorias: any[] = [];
  // Chip de categoría actualmente activo (por defecto "Todo").
  activeChip: string = 'Todo';

  // Propiedades para posicionamiento de etiquetas
  // Dimensiones reales (en píxeles) que quedó la imagen renderizada de cada
  // post, indexadas por id_post. Se usan para calcular la posición de los
  // botones de "comprar" sobre las prendas/zonas detectadas.
  imagenDimensiones: { [key: number]: { width: number, height: number } } = {};

  constructor(
    private router: Router,
    private backend1: BackendService,
    private activateRouter: ActivatedRoute,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private renderer?: Renderer2,
    private ngZone?: NgZone
  ) { }

  // Se ejecuta automáticamente al crear el componente.
  // 1) Carga las categorías (para los chips).
  // 2) Pide al backend todos los posts de tendencias y los copia también a
  //    "filteredItems" (sin filtrar todavía).
  // 3) Por cada post: inicializa su campo de comentario vacío y sus estados
  //    de like/guardado en false; luego carga en orden los comentarios, el
  //    conteo de likes y el perfil del autor de cada post.
  // 4) Al terminar, restaura desde localStorage el estado de like/guardado
  //    de visitas anteriores.
  ngOnInit(): void {
    this.cargarCategorias();
    this.backend1.obtenerTendencias().subscribe(async x => {
      this.dataSource = x.datos;
      console.log('Datos recibidos:', this.dataSource); // <-- VERIFICAR EN CONSOLA

      // ========== DEBUG: Verificar que llegue makeup_zones ==========
      this.dataSource.forEach(post => {
        if (post.makeup_zones && post.makeup_zones.length) {
          console.log(`Post ${post.id_post} tiene maquillaje:`, post.makeup_zones);
          post.makeup_zones.forEach(zone => {
            console.log(`  Zona: ${zone.zone}, product_link: ${zone.product_link}`);
          });
        }
      });

      this.filteredItems = [...this.dataSource];

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
    });
  }


  // Pide al backend la lista de categorías disponibles y la guarda en
  // "categorias" para renderizar los chips de filtro.
  cargarCategorias() {
        this.backend1.obtenerCategorias().subscribe(
            data => {
                // Asumiendo que la respuesta es { status: 1, datos: [...] }
                this.categorias = data.datos || data;
            },
            error => console.error('Error cargando categorías', error)
        );
    }

  // Pide al backend los comentarios de un post puntual y los guarda en "comentarios[id_com]".
  async obtenerComentariosAsync(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.obtenerComentarios(id_com).subscribe(async z => {
        this.comentarios[id_com] = z.datos;
        resolve();
      });
    });
  }

  // Pide al backend la cantidad de likes de un post puntual y la guarda en "likes[id_com]".
  async countLikeAsync(id_com: number) {
    return new Promise<void>(resolve => {
      this.backend1.countLike(id_com).subscribe(y => {
        this.likes[id_com] = y.datos[0];
        resolve();
      });
    });
  }

  // Pide al backend los datos de perfil (foto, usuario) de un autor puntual y los guarda en "perfil[id_us]".
  async obtenerPerfilAsync(id_us: number) {
    return new Promise<void>(resolve => {
      this.backend1.obtenerUsuario(id_us).subscribe(async a => {
        this.perfil[id_us] = a.datos[0];
        resolve();
      });
    });
  }

  // Se ejecuta al hacer click en el botón/ícono de "like" de un post.
  // Si ya tenía like, lo quita (baja el contador, sin bajar de 0); si no,
  // lo agrega (sube el contador) y ADEMÁS avisa al backend
  // (actualizarPreferencias) para registrar que al usuario le gustan las
  // prendas de ese post, alimentando así el feed "Para ti". Actualiza
  // localStorage para recordar el estado.
  like(post: number, index: number) {
    var id_new = localStorage.getItem('ids');
    if (id_new) {
      var navegante = parseInt(id_new);
      if (this.toggle[index]) {
        this.backend1.eliminarLike(post, navegante).subscribe(y => {
          this.toggle[index] = false;
          if (!this.likes[post]) this.likes[post] = { cantidad: 0 } as any;
          if (this.likes[post].cantidad > 0) this.likes[post].cantidad--;
          this.actualizarEstadoLocalStorage();
        });
      } else {
        let listadoLikes = new Likes(post, navegante);
        this.backend1.guardarLikes(listadoLikes).subscribe(y => {

          this.backend1.actualizarPreferencias(post).subscribe(res => {
            console.log("Preferencias:", res);
          });
          this.toggle[index] = true;
          if (!this.likes[post]) this.likes[post] = { cantidad: 0 } as any;
          this.likes[post].cantidad++;
          this.actualizarEstadoLocalStorage();
        });
      }
    }
  }

  // Se ejecuta al hacer click en el botón "Publicar" comentario de un post
  // (o al presionar Enter en el input de comentario).
  // 1) Valida que el texto no esté vacío.
  // 2) Filtra palabras inapropiadas en español (bad-words); si detecta una,
  //    muestra un aviso, limpia el input y cierra el selector de emojis, sin publicar.
  // 3) Si es válido, lo envía al backend; si tiene éxito, muestra un aviso
  //    de "Comentario publicado", limpia el input, cierra el selector de
  //    emojis y recarga solo los comentarios de ese post (sin recargar toda
  //    la página, a diferencia de los demás feeds). Si falla, muestra un aviso de error.
  comment(post: number) {
    const comentarioTexto = this.comentario[post];
    if (comentarioTexto.trim() === '') {
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
      "soplapollas", "tetas grandes", "tetas", "tía buena", "travesti", "trio", "verga",
      "vete a la mierda", "vulva", "pene", "coito", "pito", "culito", "panochon", "culear", "culiar"
    ];
    filter.addWords(...spanishBadWords);

    if (filter.isProfane(comentarioTexto)) {
      this.snackBar.open('¡Comentario inapropiado! 😠🚫', 'Cerrar', {
        duration: 4000,
        panelClass: ['mensaje-error']
      });
      this.comentario[post] = '';
      this.showEmojiPicker[post] = false;
      return;
    }

    var id_new = localStorage.getItem('ids');
    if (id_new) {
      var navegante = parseInt(id_new);
      let listadocoment = new Comments(post, navegante, comentarioTexto);
      this.backend1.guardarComentarios(listadocoment).subscribe(() => {
        this.snackBar.open('Comentario publicado 🚀', 'Cerrar', {
          duration: 3000
        });
        this.comentario[post] = '';
        this.showEmojiPicker[post] = false;
        this.obtenerComentariosAsync(post);
      }, (error) => {
        console.error('Error:', error);
        this.snackBar.open('¡Oops! No se pudo ingresar. 😞🚫', 'Cerrar', {
          duration: 4000,
          panelClass: ['mensaje-error']
        });
      });
    }
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

  // ========== MÉTODOS DE DIÁLOGOS ==========
  // Se ejecuta al hacer click en "Publicar" de la barra superior; abre el diálogo para crear una publicación.
  openAgregar() {
    const dialogRef = this.dialog.open(AgregarPubUComponent, { restoreFocus: false, id: 'agregar' });
  }
  // Se ejecuta al hacer click en la herramienta de extracción de color; abre su diálogo.
  open() {
    const dialogRef = this.dialog.open(ImagecolorComponent, { restoreFocus: false, id: 'color' });
  }
  // Se ejecuta al hacer click en la herramienta de moodboard; abre su diálogo.
  openMood() {
    const dialogRef = this.dialog.open(MoodboardComponent, { restoreFocus: false, id: 'board' });
  }
  // Se ejecuta al hacer click en la herramienta de look aleatorio; abre su diálogo.
  openRand() {
    const dialogRef = this.dialog.open(RandlookComponent, { restoreFocus: false, id: 'look' });
  }
  // Se ejecuta al hacer click en la herramienta de armario virtual (try-on); abre su diálogo.
  openTryOn() {
    const dialogRef = this.dialog.open(TryOnComponent, { restoreFocus: false, id: 'tryon' });
  }
  // Se ejecuta al hacer click en "Editar" sobre un comentario propio; abre
  // el diálogo de edición pasándole el post, el usuario y el comentario a editar.
  openMod(postid: number, id_comment: number) {
    var id_new = localStorage.getItem('ids');
    if (id_new) {
      var navegante = parseInt(id_new);
      const dialogRef = this.dialog.open(ModificarCommComponent, { restoreFocus: false, id: 'mod', data: { id: postid, nav: navegante, comm: id_comment } });
    }
  }

  // Se ejecuta al hacer click en "Eliminar" sobre un comentario propio; lo borra en el backend y recarga la página.
  deleteComment(post: number, id_comment: number) {
    const id_new = localStorage.getItem('ids');
    if (id_new) {
      const navegante = parseInt(id_new);
      this.backend1.eliminarComentario(post, navegante, id_comment).subscribe(
        () => {
          location.reload();
        },
        error => {
          console.error("Error al eliminar comentario:", error);
        }
      );
    }
  }

  // ========== FILTROS DE COLOR Y PRENDA (USANDO PRENDAS) ==========
  // Se ejecuta al elegir un color en el modal de filtro por color.
  // A diferencia de otros feeds, este método usa el array "prendas"
  // detectado por IA (con getColorName) en lugar de los campos antiguos
  // vibrant_class/muted_class. Filtra "dataSource" dejando en
  // "filteredItems" solo los posts que tengan al menos una prenda cuyo
  // color vibrante coincida con algún tono del color elegido.
  seleccionarPorRango(colorGeneral: string) {
    this.selectedColorTones = this.colorShades[colorGeneral.toLowerCase()];
    if (!this.selectedColorTones || this.selectedColorTones.length === 0) {
      console.error('No se encontraron tonos para el color seleccionado');
      return;
    }

    this.filteredItems = this.dataSource.filter(articulo => {
      if (!articulo.prendas || articulo.prendas.length === 0) return false;
      return articulo.prendas.some(prenda => {
        const colorName = this.getColorName(prenda.colors.vibrant);
        return this.selectedColorTones.some(shade => shade.name.toLowerCase() === colorName.toLowerCase());
      });
    });
    this.isModalOpen = false;
  }

  // Se ejecuta al elegir un tipo de prenda en el modal de filtro por
  // prenda. Filtra "dataSource" (usando el array "prendas" de IA, buscando
  // por coincidencia parcial en la etiqueta) dejando en "filteredItems"
  // solo los posts que tengan esa prenda.
  seleccionarPorRopa(prenda: string) {
    this.selectedClothes = this.clothes[prenda.toLowerCase()] || [];
    if (!this.selectedClothes || this.selectedClothes.length === 0) {
      console.error('No se encontraron prendas para la categoría seleccionada');
      return;
    }

    this.filteredItems = this.dataSource.filter(articulo => {
      if (!articulo.prendas || articulo.prendas.length === 0) return false;
      return articulo.prendas.some(p =>
        this.selectedClothes.some(cloth => p.label.toLowerCase().includes(cloth.name.toLowerCase()))
      );
    });
    this.isModalOpen2 = false;
  }

  // Se ejecuta al hacer click en "Limpiar filtro"; restaura "filteredItems"
  // a todos los posts y cierra ambos modales de filtro.
  limpiarFiltro(): void {
    this.filteredItems = [...this.dataSource];
    this.isModalOpen = false;
    this.isModalOpen2 = false;
  }

  // ========== FILTRO POR CATEGORÍA (CHIPS) ==========
  // Se ejecuta al hacer click en un chip de categoría. Si es "Todo" muestra
  // todos los posts; si no, filtra "dataSource" dejando solo los posts cuya
  // categoría coincida con el chip elegido.
  filtrarChip(categoria: string) {
    this.activeChip = categoria;
    if (categoria === 'Todo') {
      this.filteredItems = [...this.dataSource];
    } else {
      this.filteredItems = this.dataSource.filter(
        (p: any) => p.name_categoria?.toLowerCase() === categoria.toLowerCase()
      );
    }
  }

  // ========== UTILIDADES PARA PRENDAS ==========
  // Recibe un color RGB detectado por la IA y busca en "colorShades" el
  // nombre de tono en español más cercano (por distancia euclidiana en el
  // espacio RGB). Si la distancia mínima es demasiado grande (>100), en vez
  // del nombre exacto del tono devuelve el nombre de la categoría general de color.
  getColorName(rgb: number[]): string {
    const [r, g, b] = rgb;
    const distance = (c1: number[], c2: number[]): number => {
      return Math.sqrt(
        Math.pow(c1[0] - c2[0], 2) +
        Math.pow(c1[1] - c2[1], 2) +
        Math.pow(c1[2] - c2[2], 2)
      );
    };

    let bestMatch = {
      name: `rgb(${r},${g},${b})`,
      distance: Infinity,
      category: ''
    };

    for (const category in this.colorShades) {
      const shades = this.colorShades[category];
      for (const shade of shades) {
        const dist = distance(rgb, shade.rgb);
        if (dist < bestMatch.distance) {
          bestMatch = {
            name: shade.name,
            distance: dist,
            category: category
          };
        }
      }
    }

    if (bestMatch.distance > 100) {
      return bestMatch.category || `rgb(${r},${g},${b})`;
    }
    return bestMatch.name;
  }

  // Genera la URL a la que lleva el botón de "comprar" sobre una prenda
  // detectada. Si la prenda ya trae un link de producto (product_link, caso
  // de zonas de maquillaje), lo usa directamente; si no, arma una búsqueda
  // de imágenes de Google combinando la etiqueta de la prenda y su color
  // más cercano en español.
  getSearchUrl(prenda: any, articulo: any): string {
    if (prenda.zone && prenda.product_link) {
      return prenda.product_link;
    }
    const colorName = this.getColorName(prenda.colors.vibrant);
    const query = `${prenda.label} ${colorName}`;
    return `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
  }


  // Devuelve el nombre de clase CSS a aplicar al botón de "comprar" según
  // el tipo de prenda detectado (top, pantalón, vestido, bolso, zapato,
  // accesorio o un estilo por defecto), para pintarlo con un color/ícono distinto.
  getButtonClass(label: string): string {
    const lower = label.toLowerCase();
    if (lower.includes('top') || lower.includes('shirt') || lower.includes('blouse') || lower.includes('hoodie') || lower.includes('sweater')) {
      return 'top-button';
    } else if (lower.includes('pants') || lower.includes('trousers') || lower.includes('shorts') || lower.includes('jeans') || lower.includes('skirt')) {
      return 'pants-button';
    } else if (lower.includes('dress')) {
      return 'dress-button';
    } else if (lower.includes('bag') || lower.includes('backpack')) {
      return 'bag-button';
    } else if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('boots') || lower.includes('heels')) {
      return 'shoes-button';
    } else if (lower.includes('hat') || lower.includes('scarf') || lower.includes('belt') || lower.includes('sunglasses')) {
      return 'accesorios-button';
    } else {
      return 'default-button';
    }
  }

  // ========== POSICIONAMIENTO DE ETIQUETAS ==========
  // Se ejecuta cuando la imagen de un post termina de cargar en el
  // navegador (evento "load" de la etiqueta <img>). Guarda el ancho/alto
  // real con el que quedó renderizada esa imagen, necesario para calcular
  // la posición de los botones de "comprar" sobre las prendas detectadas.
  onImageLoad(event: any, articulo: any) {
    this.imagenDimensiones[articulo.id_post] = {
      width: event.target.offsetWidth,
      height: event.target.offsetHeight
    };
  }

  // Calcula la posición vertical (en %) donde debe ubicarse el botón de
  // "comprar" de una prenda, a partir del bounding box detectado por la IA
  // (bbox) y el tamaño real de la imagen ya renderizada en pantalla.
  getTopPosition(bbox: number[], articulo: any): string {
    const dims = this.imagenDimensiones[articulo.id_post];
    if (!dims) return '0%';
    const topPixel = bbox[1] * (dims.height / articulo.image_height);
    return (topPixel / dims.height * 100) + '%';
  }

  // Calcula la posición horizontal (en %) donde debe ubicarse el botón de
  // "comprar" de una prenda, a partir del bounding box detectado por la IA
  // (bbox) y el tamaño real de la imagen ya renderizada en pantalla.
  getLeftPosition(bbox: number[], articulo: any): string {
    const dims = this.imagenDimensiones[articulo.id_post];
    if (!dims) return '0%';
    const leftPixel = bbox[0] * (dims.width / articulo.image_width);
    return (leftPixel / dims.width * 100) + '%';
  }

  // ========== NUEVOS MÉTODOS PARA MAQUILLAJE ==========

  /**
   * Genera URL de búsqueda para maquillaje usando el product_link si existe,
   * o crea una búsqueda con el nombre de la zona y el color vibrante.
   */
  getMakeupSearchUrl(zone: any, articulo: any): string {
    if (zone.product_link) {
      return zone.product_link;
    }
    const colorName = this.getColorName(zone.colors.vibrant);
    const query = `${zone.zone} maquillaje ${colorName}`;
    return `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
  }

  /**
   * Devuelve la posición vertical (top en %) para el botón de maquillaje.
   * Usa un mapeo por zona porque no tenemos bbox.
   */
  getMakeupTopPosition(zone: any, articulo: any): string {
    const zonePositions: { [key: string]: string } = {
      'labios': '75%',
      'ojos': '25%',
      'cejas': '15%',
      'mejillas': '45%',
      'frente': '10%',
      'barbilla': '80%',
      'nariz': '40%',
      'párpados': '30%',
      'pestañas': '20%',
      'delineado': '25%'
    };
    const zoneLower = zone.zone.toLowerCase();
    for (const key in zonePositions) {
      if (zoneLower.includes(key)) {
        return zonePositions[key];
      }
    }
    // Si no hay mapeo, usar posición basada en índice
    const index = articulo.makeup_zones.indexOf(zone);
    const defaultPositions = ['10%', '30%', '50%', '70%', '20%', '60%'];
    return defaultPositions[index % defaultPositions.length];
  }

  /**
   * Devuelve la posición horizontal (left en %) para el botón de maquillaje.
   */
  getMakeupLeftPosition(zone: any, articulo: any): string {
    const zonePositions: { [key: string]: string } = {
      'labios': '50%',
      'ojos': '30%',
      'cejas': '35%',
      'mejillas': '20%',
      'frente': '50%',
      'barbilla': '50%',
      'nariz': '50%',
      'párpados': '30%',
      'pestañas': '30%',
      'delineado': '30%'
    };
    const zoneLower = zone.zone.toLowerCase();
    for (const key in zonePositions) {
      if (zoneLower.includes(key)) {
        return zonePositions[key];
      }
    }
    const index = articulo.makeup_zones.indexOf(zone);
    const defaultPositions = ['20%', '40%', '60%', '80%', '10%', '90%'];
    return defaultPositions[index % defaultPositions.length];
  }

  // ========== MÉTODOS DE MODALES Y EMOJIS ==========
  // Se ejecuta al hacer click en el botón que abre/cierra el modal de filtro por color.
  toggleModal() { this.isModalOpen = !this.isModalOpen; }
  // Se ejecuta al hacer click en el botón que abre/cierra el modal de filtro por prenda.
  toggleModal2() { this.isModalOpen2 = !this.isModalOpen2; }

  // Se ejecuta al hacer click en el ícono de emoji dentro del input de
  // comentario de un post. Alterna la visibilidad del selector de emojis de ese post.
  toggleEmojiPicker(postId: number) {
    this.showEmojiPicker[postId] = !this.showEmojiPicker[postId];
  }

  // Se ejecuta al hacer click en un emoji dentro del selector. Lo agrega al
  // final del texto del comentario de ese post y cierra el selector.
  insertEmoji(emoji: string, postId: number) {
    this.comentario[postId] = (this.comentario[postId] || '') + emoji;
    this.showEmojiPicker[postId] = false;
  }

  // Se ejecuta al hacer click en "Responder" sobre el nombre de usuario de
  // un comentario. Precarga el input de comentario con "@usuario " y le da
  // foco al final del texto, para facilitar responderle a esa persona.
  replyTo(username: string, postId: number) {
    this.comentario[postId] = '@' + username + ' ';
    setTimeout(() => {
      const el = document.getElementById('comment-input-' + postId) as HTMLInputElement;
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    }, 0);
  }

  // Se ejecuta al hacer click en cualquier parte de la ventana; si el click
  // fue sobre el fondo del modal de color, lo cierra.
  onWindowClick(event: Event) {
    const modal = document.getElementById('colorModal');
    if (event.target === modal) {
      this.isModalOpen = false;
    }
  }

  // Función auxiliar usada en el HTML para decidir si un archivo es imagen o video (por su extensión).
  isImage(fileName: string): boolean {
    return fileName.match(/\.(jpeg|jpg|gif|png)$/) != null;
  }

  // Función auxiliar usada en el HTML para obtener la clase CSS del
  // "badge" (etiqueta) de categoría de un post, a partir de su nombre.
  getBadgeClass(categoria: string): string {
    if (!categoria) return 'badge--default';
    const categoriaSlug = categoria.toLowerCase().replace(/ /g, '-');
    return `badge--${categoriaSlug}`;
  }

  // Propiedades para filtros
  // Tonos de color seleccionados actualmente para filtrar (según el color general elegido).
  selectedColorTones: ColorShade[] = [];
  // Prendas seleccionadas actualmente para filtrar.
  selectedClothes: Prenda[] = [];

  // Diccionario de tipos de prenda disponibles para filtrar (clave = nombre en inglés usado por la IA).
  clothes: { [key: string]: Prenda[] } = {
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
    watch: [{ name: 'watch' }]
  };

  // Paleta grande de tonos de color en español (nombre + RGB), agrupados
  // por color general. Se usa en getColorName() y seleccionarPorRango()
  // para encontrar el tono más cercano al color detectado por la IA.
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
      { name: 'rojo sangre', rgb: [150, 7, 38] }
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

}
