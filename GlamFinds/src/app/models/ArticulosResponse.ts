import { Articulos } from "./Articulos";


export class ArticulosResponse{
  id: number;
  mensajes: string;
  datos : Array<Articulos>;
  constructor(id: number, mensajes: string, datos:Array<Articulos>){
      this.id = id;
      this.mensajes = mensajes;
      this.datos = datos;

  }
}
