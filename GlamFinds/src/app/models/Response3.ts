import { Likes } from "./Likes";

export class Response3{
    id: number;
    mensajes: string;
    datos : Array<Likes>;
    constructor(id: number, mensajes: string, datos:Array<Likes>){
        this.id = id;
        this.mensajes = mensajes;
        this.datos = datos;
        
    }
}