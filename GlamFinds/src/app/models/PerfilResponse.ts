import { Perfil } from "./Perfil";

export class PerfilResponse{
  id: number;
  mensajes: string;
  datos : Array<Perfil>;
  constructor(id: number, mensajes: string, datos:Array<Perfil>){
      this.id = id;
      this.mensajes = mensajes;
      this.datos = datos;

  }
}
