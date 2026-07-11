export class Usuario_ver{
    id_user:number;
    usuario: string;
    contrase:string;

    constructor(id_user:number,usuario:string,contrase:string){
        this.id_user=id_user;
        this.usuario= usuario;
        this.contrase=contrase;
    }
}