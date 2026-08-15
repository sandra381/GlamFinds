export class Posts {
  id_post: number;
  descripcion: string;
  imagen: string;
  id_user: number;
  usuario: string;
  id_categoria: number;
  name_categoria: string;

  // ==========================================
  // CAMPOS ANTIGUOS
  // ==========================================

  color_vibrant?: string;
  color_muted?: string;
  thirdColor?: string;

  vibrant_class?: string;
  muted_class?: string;
  third_class?: string;

  prenda1?: string;
  prenda2?: string;
  prenda3?: string;
  prenda4?: string;
  prenda5?: string;
  prenda6?: string;

  link1?: string;
  link2?: string;
  link3?: string;
  link4?: string;
  link5?: string;
  link6?: string;


  // ==========================================
  // DIMENSIONES DE LA IMAGEN
  // ==========================================

  image_width?: number;
  image_height?: number;


  // ==========================================
  // INFORMACIÓN DEL ROSTRO
  // ==========================================

  face_detected?: boolean;

  skin_reference_color?: number[];


  // ==========================================
  // PRENDAS DETECTADAS POR IA
  // ==========================================

  prendas?: Array<{
    label: string;
    label_id: number;
    confidence: number;

    bbox: number[];

    colors: {
      vibrant: number[];
      muted: number[];
      third: number[];
    };

    mask_b64?: string;
  }>;


  // ==========================================
  // MAQUILLAJE DETECTADO POR IA
  // ==========================================

  makeup_zones?: Array<{
    id: number;

    zone: string;

    has_makeup: boolean;

    distance_to_skin: number;

    color_name?: string;

    product_link?: string;

    colors: {
      vibrant: number[];
      muted: number[];
      third: number[];
    };
  }>;


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    id_post: number,
    descripcion: string,
    imagen: string,
    id_user: number,
    usuario: string,
    id_categoria: number,
    name_categoria: string,

    // Campos antiguos
    color_vibrant?: string,
    color_muted?: string,
    thirdColor?: string,

    vibrant_class?: string,
    muted_class?: string,
    third_class?: string,

    prenda1?: string,
    prenda2?: string,
    prenda3?: string,
    prenda4?: string,
    prenda5?: string,
    prenda6?: string,

    link1?: string,
    link2?: string,
    link3?: string,
    link4?: string,
    link5?: string,
    link6?: string,

    // Nuevos campos
    image_width?: number,
    image_height?: number,

    prendas?: Array<{
      label: string;
      label_id: number;
      confidence: number;
      bbox: number[];
      colors: {
        vibrant: number[];
        muted: number[];
        third: number[];
      };
      mask_b64?: string;
    }>,

    // Rostro
    face_detected?: boolean,
    skin_reference_color?: number[],

    // Maquillaje
    makeup_zones?: Array<{
      id: number;
      zone: string;
      has_makeup: boolean;
      distance_to_skin: number;
      color_name?: string;
      product_link?: string;
      colors: {
        vibrant: number[];
        muted: number[];
        third: number[];
      };
    }>
  ) {

    // ==========================================
    // DATOS PRINCIPALES
    // ==========================================

    this.id_post = id_post;
    this.descripcion = descripcion;
    this.imagen = imagen;
    this.id_user = id_user;
    this.usuario = usuario;
    this.id_categoria = id_categoria;
    this.name_categoria = name_categoria;


    // ==========================================
    // CAMPOS ANTIGUOS
    // ==========================================

    this.color_vibrant = color_vibrant;
    this.color_muted = color_muted;
    this.thirdColor = thirdColor;

    this.vibrant_class = vibrant_class;
    this.muted_class = muted_class;
    this.third_class = third_class;

    this.prenda1 = prenda1;
    this.prenda2 = prenda2;
    this.prenda3 = prenda3;
    this.prenda4 = prenda4;
    this.prenda5 = prenda5;
    this.prenda6 = prenda6;

    this.link1 = link1;
    this.link2 = link2;
    this.link3 = link3;
    this.link4 = link4;
    this.link5 = link5;
    this.link6 = link6;


    // ==========================================
    // DIMENSIONES
    // ==========================================

    this.image_width = image_width;
    this.image_height = image_height;


    // ==========================================
    // PRENDAS
    // ==========================================

    this.prendas = prendas;


    // ==========================================
    // ROSTRO
    // ==========================================

    this.face_detected = face_detected;
    this.skin_reference_color = skin_reference_color;


    // ==========================================
    // MAQUILLAJE
    // ==========================================

    this.makeup_zones = makeup_zones;
  }
}
