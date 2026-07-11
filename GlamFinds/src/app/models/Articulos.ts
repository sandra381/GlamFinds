export class Articulos {
  id_post: number;
  titulo: string;
  contenido: string;
  imagen: string;
  id_user: number;
  usuario: string;
  id_categoria: number;
  name_categoria: string;
  constructor(id_post: number,titulo: string,contenido: string,imagen: string,id_user: number,usuario: string,id_categoria: number,name_categoria: string) {
    this.id_post = id_post;
    this.titulo= titulo;
    this.contenido= contenido;
    this.imagen = imagen;
    this.id_user = id_user;
    this.usuario = usuario;
    this.id_categoria = id_categoria;
    this.name_categoria = name_categoria;
  }
}
