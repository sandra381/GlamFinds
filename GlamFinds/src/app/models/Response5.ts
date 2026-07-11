import { Save } from "./Save";

export class Response5{
    id: number;
    mensajes: string;
    datos : Array<Save>;
    constructor(id: number, mensajes: string, datos:Array<Save>){
        this.id = id;
        this.mensajes = mensajes;
        this.datos = datos;
        
    }
}