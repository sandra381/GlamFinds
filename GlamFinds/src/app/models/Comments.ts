export class Comments{
   post:number;
   navegante:number;
   comments:string;
   constructor(post:number, navegante:number,comments:string){
       this.post = post;
       this.navegante = navegante;
       this.comments = comments;
    }
}