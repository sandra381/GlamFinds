import { Comments4 } from "./Comments4";
export class Response51{
    id: number;
    mensajes: string;
    datos : Array<Comments4>;
    constructor(id: number, mensajes: string, datos:Array<Comments4>){
        this.id = id;
        this.mensajes = mensajes;
        this.datos = datos
    }
}
