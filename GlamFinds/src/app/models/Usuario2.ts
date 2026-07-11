export class Usuario2{
    id:number;
    usuario: string;
    nombre: string;
    apellido: string;
    edad: string;
    sexo:string;
    correo: string;
    contrase:string;
    imagen:string;
    descripcion:string;

    constructor(id:number , usuario: string,nombre: string,apellido: string,edad: string,sexo:string,correo: string,contrase:string,imagen:string,descripcion:string){
        this.id = id;
        this.usuario=usuario;
        this.nombre= nombre;
        this.apellido= apellido;
        this.edad= edad;
        this.sexo=sexo;
        this.correo=correo;
        this.contrase=contrase;
        this.imagen=imagen;
        this.descripcion=descripcion;
    }
}
