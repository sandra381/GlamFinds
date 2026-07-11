export class Publicidad_post{
   id_post: number;
   descripcion: string;
   imagen: string;
   usuario: string;
   id_categoria: number;
   name_categoria:string;
   link:string;
   constructor(id_post: number,descripcion: string, imagen: string,usuario: string,id_categoria: number,name_categoria:string,link:string){
      this.id_post = id_post;
      this.descripcion = descripcion;
      this.imagen = imagen;
      this.usuario = usuario;
      this.id_categoria = id_categoria;
      this.name_categoria = name_categoria;
      this.link =link;
   }
   }