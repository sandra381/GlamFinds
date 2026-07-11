
import { Comments } from "./Comments";
export class Response4{
    id: number;
    mensajes: string;
    datos : Array<Comments>;
    constructor(id: number, mensajes: string, datos:Array<Comments>){
        this.id = id;
        this.mensajes = mensajes;
        this.datos = datos 
    }
}