import { Usuario } from "./Usuario";

export class Response7{
    id: number;
    mensajes: string;
    datos: Array<Usuario>;
    constructor(id: number, mensajes: string, datos:Array<Usuario>){
        this.id = id;
        this.mensajes = mensajes;
        this.datos = datos;    
    }
}