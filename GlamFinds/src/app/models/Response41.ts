import { Comments2 } from "./Comments2";
export class Response41{
    id: number;
    mensajes: string;
    datos : Array<Comments2>;
    constructor(id: number, mensajes: string, datos:Array<Comments2>){
        this.id = id;
        this.mensajes = mensajes;
        this.datos = datos
    }
}
