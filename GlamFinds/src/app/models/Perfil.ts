export class Perfil{
   id_user:number;
  descripcion: string;
  imagen: string;
  usuario: string;

  constructor(id_user:number,descripcion: string, imagen: string,usuario: string){
      this.id_user = id_user;
     this.descripcion = descripcion;
     this.imagen = imagen;
     this.usuario = usuario;
  }
  }
