import { Publicidad } from "./Publicidad";

export class PublicidadResponse{
  id: number;
  mensajes: string;
  datos : Array<Publicidad>;
  constructor(id: number, mensajes: string, datos:Array<Publicidad>){
      this.id = id;
      this.mensajes = mensajes;
      this.datos = datos;

  }
}
