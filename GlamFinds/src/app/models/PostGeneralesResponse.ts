import { PostsGenerales } from "./PostsGenerales";

export class PostGeneralesResponse{
  id: number;
  mensajes: string;
  datos : Array<PostsGenerales>;
  constructor(id: number, mensajes: string, datos:Array<PostsGenerales>){
      this.id = id;
      this.mensajes = mensajes;
      this.datos = datos;

  }
}
