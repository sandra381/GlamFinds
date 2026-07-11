import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TextMessage } from '../models/text-message.model';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface ResponseMessage {
  query: string;
  response: string;
  intent: string;
}


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8000/api/requestText';  // URL del backend

  constructor(private http: HttpClient) { }

  sendMessage(proyectId: string, message: string): Observable<ResponseMessage> {
    return this.http.post<ResponseMessage>(this.apiUrl, {
      proyectId: proyectId,
      requestText: message
    });
  }
}
