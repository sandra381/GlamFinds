

import { Likes_cant } from "./Likes_cant";
export class Response6{
    id: number;
    mensajes: string;
    datos : Array<Likes_cant>;
    constructor(id: number, mensajes: string, datos:Array<Likes_cant>){
        this.id = id;
        this.mensajes = mensajes;
        this.datos = datos 
    }
}