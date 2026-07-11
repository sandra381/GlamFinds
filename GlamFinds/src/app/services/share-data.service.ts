import { Injectable, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Usuario_ver } from '../models/Usuario_ver';
import { Posts } from '../models/Posts';



@Injectable({
  providedIn: 'root'
})
export class ShareDataService {
  private listadoTendencias = new BehaviorSubject<Array<Posts>>([]);
  currentListadoTendencias = this.listadoTendencias.asObservable();
  private users = new BehaviorSubject<Usuario_ver>(new Usuario_ver(0," "," "));
  currentuser= this.users.asObservable();


  constructor() { }
  setNewUser(usuario: Usuario_ver){
    this.users.next(usuario);
  }

  setListadoTendencias(listado: Array<Posts>){
    this.listadoTendencias.next(listado);
  }
}
