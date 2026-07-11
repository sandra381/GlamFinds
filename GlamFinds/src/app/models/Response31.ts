import { Likes } from "./Likes";
import { Likes2 } from "./Likes2";

export class Response31{
    id: number;
    mensajes: string;
    datos : Array<Likes2>;
    constructor(id: number, mensajes: string, datos:Array<Likes2>){
        this.id = id;
        this.mensajes = mensajes;
        this.datos = datos;
        
    }
}