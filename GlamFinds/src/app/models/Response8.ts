import { Usuario2 } from "./Usuario2";

export class Response8{
    id: number;
    mensajes: string;
    datos: Array<Usuario2>;
    constructor(id: number, mensajes: string, datos:Array<Usuario2>){
        this.id = id;
        this.mensajes = mensajes;
        this.datos = datos;    
    }
}