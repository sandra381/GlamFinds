export class Descuentos{
   id_descuentos: number;
    descripcion: string;
    imagen: string;
    link: string;
    constructor(id_descuentos: number,descripcion: string, imagen: string,link: string){
       this.id_descuentos = id_descuentos;
       this.descripcion = descripcion;
       this.imagen = imagen;
       this.link = link;
    }
    }