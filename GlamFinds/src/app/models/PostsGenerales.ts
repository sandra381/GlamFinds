export class PostsGenerales{
    id_post: number;
    descripcion: string;
    imagen: string;
    autor: string;
    categoria: number;
  
    constructor(id_post: number,descripcion: string, imagen: string, autor: string,categoria: number){
       this.id_post = id_post;
       this.descripcion = descripcion;
       this.imagen = imagen;
       this.autor = autor;
       this.categoria = categoria;
    }
  }
  