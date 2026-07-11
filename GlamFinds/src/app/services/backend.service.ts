import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Usuario } from '../models/Usuario';
import { Usuario_ver } from '../models/Usuario_ver';
import { Response1 } from '../models/Response1';
import { Posts } from '../models/Posts';
import { Response2 } from '../models/Response2';
import { Likes } from '../models/Likes';
import { Response3 } from '../models/Response3';
import { Comments } from '../models/Comments';
import { Response4 } from '../models/Response4';
import { Save } from '../models/Save';
import { Response5 } from '../models/Response5';
import { Response41 } from '../models/Response41';
import { Response6 } from '../models/Response6';
import { PostGeneralesResponse } from '../models/PostGeneralesResponse';
import { PostsGenerales } from '../models/PostsGenerales';
import { Publicidad } from '../models/Publicidad';
import { PublicidadResponse2 } from '../models/PublicidadResponse2';
import { Response7 } from '../models/Response7';
import { Response8 } from '../models/Response8';
import { PublicidadResponse } from '../models/PublicidadResponse';
import { PerfilResponse } from '../models/PerfilResponse';
import { TextMessage } from '../models/text-message.model';
import { ResponseMessage } from '../models/response-message.model';
import { Observable } from 'rxjs';
import { ArticulosResponse } from '../models/ArticulosResponse';
import { Articulos } from '../models/Articulos';
import { Response2A } from '../models/Response2A';
import { Response51 } from '../models/Response51';
const be_api = environment.api_backend;
const hhtoption = {headers: new HttpHeaders().set('Content-Type','application/json')};


export interface Image {
  url_imagen: string;
}


@Injectable({
  providedIn: 'root'
})
export class BackendService {
  projectId: any;
  constructor(private hhtclient : HttpClient) { }


  /*------------USUARIO-----------*/

  ingresarMenu(user: Usuario_ver){
    console.log(be_api +'/verificar');
    console.log(user);
    return this.hhtclient.post<Response1>(be_api +'/verificar',user,hhtoption);
  }
  guardarUsuarioConImagen(formData: FormData, userData: any): Observable<any> {
    const url = `${be_api}/login`;
    formData.append('usuario', userData.usuario);
    formData.append('nombre', userData.nombre);
    formData.append('apellido', userData.apellido);
    formData.append('edad', userData.edad);
    formData.append('sexo', userData.sexo);
    formData.append('correo', userData.correo);
    formData.append('contrase', userData.contrase);
    formData.append('descripcion', userData.descripcion);
    return this.hhtclient.post(url, formData);
  }
  obtenerUsuario(id_user:number){
    return this.hhtclient.get<Response7>(be_api+ '/user'+id_user,hhtoption);
  }
  getdescripcion(id_user:number){
    console.log(be_api +'/getdescripcion');
    return this.hhtclient.get<PerfilResponse>(be_api+'/getdescripcion'+id_user,hhtoption);
  }
  getSave(id_user:number){
    console.log(be_api +'/getsave');
    return this.hhtclient.get<Response2>(be_api+'/getsave'+id_user,hhtoption);
  }
  PostDes(id_user:number){
    console.log(be_api +'/PostDes');
    return this.hhtclient.get<Response2>(be_api+'/PostDes'+id_user,hhtoption);
  }
  PostPerfil(id_user:number){
    console.log(be_api +'/PostPerfil');
    return this.hhtclient.get<Response2>(be_api+'/PostPerfil'+id_user,hhtoption);
  }
  editarPosts2(id:number,formData: FormData){
    return  this.hhtclient.post<Response2>(be_api+ '/update2/'+id,formData);
  }



  /*-----------POST GENERALES------------*/

  insertarPosts(formData: FormData, userData: any): Observable<any>{
    const url = `${be_api}/agregarPost`;
    console.log(be_api +'/agregarPost');
    formData.append('descripcion',userData.descripcion);
    formData.append('autor',userData.autor);
    formData.append('categoria',userData.categoria);
    return this.hhtclient.post<PostGeneralesResponse>(url,formData);
  }
  guardarLikes(likes: Likes){
    console.log(be_api +'/likes');
    console.log(likes);
    return this.hhtclient.post<Response3>(be_api +'/likes',likes,hhtoption);
  }
  guardarComentarios(comment:Comments){
    console.log(be_api +'/comments');
    console.log(comment);
    return this.hhtclient.post<Response4>(be_api +'/comments',comment,hhtoption);
  }
  guardarFavoritos(save:Save){
    console.log(be_api + '/save');
    console.log(save);
    return this.hhtclient.post<Response5>(be_api +'/save',save,hhtoption);
  }
  obtenerRopa(){
    console.log(be_api +'/getRopa');
    return this.hhtclient.get<Response2>(be_api+'/getRopa',hhtoption);
  }
  obtenerTendencias(){
    console.log(be_api +'/obtener');
    return this.hhtclient.get<Response2>(be_api+'/obtener',hhtoption);
  }
  obtenerZapatos(){
    console.log(be_api +'/getZapatos');
    return this.hhtclient.get<Response2>(be_api+'/getZapatos',hhtoption);
  }
  obtenerMaquillaje(){
    console.log(be_api +'/getMaquillaje');
    return this.hhtclient.get<Response2>(be_api+'/getMaquillaje',hhtoption);
  }
  obtenerAccesorios(){
    console.log(be_api +'/getAccesorios');
    return this.hhtclient.get<Response2>(be_api+'/getAccesorios',hhtoption);
  }
  obtenerComentarios(id_post:number){
    console.log(be_api +'/getComentarios');
    return this.hhtclient.get<Response41>(be_api+'/getComentarios'+id_post,hhtoption);
  }
  countLike(id_post:number){
    console.log(be_api +'/countLike');
    return this.hhtclient.get<Response6>(be_api+'/countLike'+id_post,hhtoption);
  }
  //NUEVO AGREGADO

  eliminarLike(postId: number , navegante: number){
    return this.hhtclient.delete<Posts>(be_api +'/borrarLikes/'+postId+'/'+navegante,hhtoption);
  }

  eliminarSave(postId: number , navegante: number){
    return this.hhtclient.delete<Posts>(be_api +'/borrarSaves/'+postId+'/'+navegante,hhtoption);
  }
  modificarComentario(id_comment:number,comentario: Comments){
    return this.hhtclient.post<Response2>(be_api +'/updateCom/'+id_comment,comentario);
  }

  eliminarComentario(postId: number , navegante: number,id_comment:number){
    return this.hhtclient.delete<Posts>(be_api +'/borrarComment/'+postId+'/'+navegante+'/'+id_comment,hhtoption);
  }

  obtenerComentarioUser(postId: number , navegante: number,id_comment:number){
    return this.hhtclient.get<Response7>(be_api+ '/getComment/'+postId+'/'+navegante+'/'+id_comment,hhtoption);
  }


  /*-----------POST PUBLICACIONES------------*/
  insertarPostsP(formData: FormData, userData: any): Observable<any>{
    const url = `${be_api}/agregarPostP`;
    console.log(be_api +'/agregarPostP');
    formData.append('descripcion',userData.descripcion);
    formData.append('autor',userData.autor);
    formData.append('link',userData.link);
    formData.append('categoria',userData.categoria);
    return this.hhtclient.post<PublicidadResponse>(url,formData);
  }
  obtenerDups(){
    console.log(be_api +'/getDups');
    return this.hhtclient.get<PublicidadResponse>(be_api+'/getDups',hhtoption);
  }
  obtenerDescuentos(){
    console.log(be_api +'/getDescuentos');
    return this.hhtclient.get<PublicidadResponse>(be_api+'/getDescuentos',hhtoption);
  }
  obtenerComentarioP(id_post:number){
    console.log(be_api +'/getCommentsP');
    return this.hhtclient.get<Response41>(be_api+'/getCommentsP'+id_post,hhtoption);
  }
  countLikeP(id_post:number){
    console.log(be_api +'/countLikeP');
    return this.hhtclient.get<Response6>(be_api+'/countLikeP'+id_post,hhtoption);
  }
  guardarComentariosP(comment:Comments){
    console.log(be_api +'/commentsP');
    console.log(comment);
    return this.hhtclient.post<Response4>(be_api +'/commentsP',comment,hhtoption);
  }
  guardarLikesP(likes: Likes){
    console.log(be_api +'/likesP');
    console.log(likes);
    return this.hhtclient.post<Response3>(be_api +'/likesP',likes,hhtoption);
  }
  guardarFavoritosP(save:Save){
    console.log(be_api + '/saveP');
    console.log(save);
    return this.hhtclient.post<Response5>(be_api +'/saveP',save,hhtoption);
  }

  //NUEVO AGREGADO

  eliminarLikeP(postId: number , navegante: number){
    return this.hhtclient.delete<Posts>(be_api +'/borrarLikesP/'+postId+'/'+navegante,hhtoption);
  }

  eliminarSaveP(postId: number , navegante: number){
    return this.hhtclient.delete<Posts>(be_api +'/borrarSavesP/'+postId+'/'+navegante,hhtoption);
  }
  modificarComentarioP(id_comment:number,comentario: Comments){
    return this.hhtclient.post<Response2>(be_api +'/updateComP/'+id_comment,comentario);
  }

  eliminarComentarioP(postId: number , navegante: number,id_comment:number){
    return this.hhtclient.delete<Posts>(be_api +'/borrarCommentP/'+postId+'/'+navegante+'/'+id_comment,hhtoption);
  }

  obtenerComentarioUserP(postId: number , navegante: number,id_comment:number){
    return this.hhtclient.get<Response7>(be_api+ '/getCommentP/'+postId+'/'+navegante+'/'+id_comment,hhtoption);
  }
  ////////ADMIN

  borrarTendencia(tendencias:number){
    return this.hhtclient.delete<Posts>(be_api +'/borrarPosts/'+tendencias,hhtoption);
  }
  insertarPubli(users: Publicidad){
    console.log(be_api +'/agregarPubli');
     return this.hhtclient.post<Response2>(be_api +'/agregarPubli',users,hhtoption);
  }
  obtenerGeneral(id:number){
    console.log(be_api +'/modificar1');
    return this.hhtclient.get<Response2>(be_api+'/modificar1/' + id, hhtoption);
  }
  editarPosts(id:number,posts:Posts){
    return  this.hhtclient.post<PostGeneralesResponse>(be_api+ '/update1/'+id,posts);
  }

// extraer colores
  getColors(imageUrl: string): Observable<any> {
    return this.hhtclient.post<any>(be_api+ '/extract-colors', { imageUrl });
  }
  generarLookAleatorio(): Observable<any> {
    return this.hhtclient.get<Response2>(be_api+'/generar-look', hhtoption);
  }
  generarLookAleatorioM(): Observable<any> {
    return this.hhtclient.get<Response2>(be_api+'/generar-lookM', hhtoption);
  }
  obtenerPrenda(){
    console.log(be_api +'/obtenerprenda');
    return this.hhtclient.get<any>(be_api+'/obtenerprenda',hhtoption);
  }
  Prenda(): Observable<any>{
    console.log(be_api +'/prendas');
    return this.hhtclient.get<Response2>(be_api+'/prendas',hhtoption);
  }

  //Articulos

  insertarArticulos(formData: FormData, userData: any): Observable<any>{
    const url = `${be_api}/agregarART`;
    console.log(be_api +'/agregarART');
    formData.append('titulo',userData.titulo);
    formData.append('contenido',userData.contenido);
    formData.append('autor',userData.autor);
    formData.append('categoria',userData.categoria);
    return this.hhtclient.post<ArticulosResponse>(url,formData);
  }
  obtenerArticulos(){
    console.log(be_api +'/obtenerART');
    return this.hhtclient.get<ArticulosResponse>(be_api+'/obtenerART',hhtoption);
  }
  guardarLikesA(likes: Likes){
    console.log(be_api +'/likesART');
    console.log(likes);
    return this.hhtclient.post<Response3>(be_api +'/likesART',likes,hhtoption);
  }
  guardarComentariosA(comment:Comments){
    console.log(be_api +'/commentsART');
    console.log(comment);
    return this.hhtclient.post<Response4>(be_api +'/commentsART',comment,hhtoption);
  }
  guardarFavoritosA(save:Save){
    console.log(be_api + '/saveART');
    console.log(save);
    return this.hhtclient.post<Response5>(be_api +'/saveART',save,hhtoption);
  }
  obtenerComentariosA(id_post:number){
    console.log(be_api +'/getComentariosART');
    return this.hhtclient.get<Response51>(be_api+'/getComentariosART/'+id_post,hhtoption);
  }
  countLikeA(id_post:number){
    console.log(be_api +'/countLikeART');
    return this.hhtclient.get<Response6>(be_api+'/countLikeART/'+id_post,hhtoption);
  }
  eliminarLikeA(postId: number , navegante: number){
    return this.hhtclient.delete<Articulos>(be_api +'/borrarLikesART/'+postId+'/'+navegante,hhtoption);
  }
  eliminarSaveA(postId: number , navegante: number){
    return this.hhtclient.delete<Articulos>(be_api +'/borrarSavesART/'+postId+'/'+navegante,hhtoption);
  }
  modificarComentarioA(id_comment:number,comentario: Comments){
    return this.hhtclient.post<Response2A>(be_api +'/updateComART/'+id_comment,comentario);
  }
  eliminarComentarioA(postId: number , navegante: number,id_comment:number){
    return this.hhtclient.delete<Articulos>(be_api +'/borrarCommentART/'+postId+'/'+navegante+'/'+id_comment,hhtoption);
  }
  obtenerComentarioUserA(postId: number , navegante: number,id_comment:number){
    return this.hhtclient.get<Response7>(be_api+ '/getCommentART/'+postId+'/'+navegante+'/'+id_comment,hhtoption);
  }
  getSaveA(id_user:number){
    console.log(be_api +'/getsaveA');
    return this.hhtclient.get<Response2A>(be_api+'/getsaveA/'+id_user,hhtoption);
  }
  getTrends(): Observable<any[]> {
    return this.hhtclient.get<any[]>(be_api+'/api-fashion-trends',hhtoption);
  }

  //-----------------Nuevas funciones -----------------
  getUserStats(userId: number): Observable<any> {
    return this.hhtclient.get<any>(be_api + '/user-stats/' + userId, hhtoption);
  }
  obtenerFeedTendencias(): Observable<any> {
    return this.hhtclient.get<any>(be_api + '/trending', hhtoption);
  }
  obtenerFeedSiguiendo(userId: number): Observable<any> {
    return this.hhtclient.get<any>(be_api + '/feed/' + userId, hhtoption);
  }
  obtenerCategorias(): Observable<any> {
    return this.hhtclient.get<any>(be_api + '/categorias', hhtoption);
  }

  actualizarPreferencias(id_post: number){
    const id_user = Number(localStorage.getItem('ids'));
    return this.hhtclient.post(be_api + "/actualizarPreferencias",{id_user,id_post},hhtoption);
  }

  obtenerFeedParaTi(userId: number): Observable<any> {
    return this.hhtclient.get<any>( be_api + '/parati/' + userId, hhtoption);
  }

  //outfit del dia con ia
  generarOutfitIA(ocasion: string, clima: string, colores: string[]): Observable<any> {
    return this.hhtclient.post<any>(be_api + '/outfit-ia/generar', { ocasion, clima, colores }, hhtoption);
  }
  guardarOutfitIA(id_usuario: number, jsonGenerado: any): Observable<any> {
    return this.hhtclient.post<any>(be_api + '/outfit-ia/guardar', { id_usuario, json_generado: jsonGenerado }, hhtoption);
  }
  obtenerOutfitsGuardados(id_usuario: number): Observable<any> {
    return this.hhtclient.get<any>(be_api + '/outfit-ia/guardados/' + id_usuario, hhtoption);
  }
  eliminarOutfitGuardado(id_outfit: number): Observable<any> {
    return this.hhtclient.delete<any>(be_api + '/outfit-ia/eliminar/' + id_outfit, hhtoption);
  }




}
