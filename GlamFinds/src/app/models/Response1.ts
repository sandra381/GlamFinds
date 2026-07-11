import { Usuario } from "./Usuario";
import { Usuario_ver } from "./Usuario_ver";

export class Response1{
    id: number;
    mensajes: string;
    datos : Array<Usuario_ver>;
    constructor(id: number, mensajes: string, datos:Array<Usuario_ver>){
        this.id = id;
        this.mensajes = mensajes;
        this.datos = datos;
        
    }
}