import { Posts } from "./Posts";

export class Response2{
    id: number;
    mensajes: string;
    datos : Array<Posts>;
    constructor(id: number, mensajes: string, datos:Array<Posts>){
        this.id = id;
        this.mensajes = mensajes;
        this.datos = datos;
        
    }
}