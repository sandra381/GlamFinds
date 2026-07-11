import { Articulos } from "./Articulos";
import { Posts } from "./Posts";

export class Response2A{
    id: number;
    mensajes: string;
    datos : Array<Articulos>;
    constructor(id: number, mensajes: string, datos:Array<Articulos>){
        this.id = id;
        this.mensajes = mensajes;
        this.datos = datos;

    }
}
