import { Publicidad } from "./Publicidad";
import { Publicidad_post } from "./Publicidad_post";

export class PublicidadResponse2{
  id: number;
  mensajes: string;
  datos : Array<Publicidad_post>;
  constructor(id: number, mensajes: string, datos:Array<Publicidad_post>){
      this.id = id;
      this.mensajes = mensajes;
      this.datos = datos;

  }
}
