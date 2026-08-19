import { Component } from '@angular/core';
import { ChatService, ResponseMessage } from 'src/app/services/chat.service';

// Componente de la página "/asistente": un chat con un asistente de IA.
// Muestra una conversación tipo burbujas (usuario / asistente) y permite
// enviar mensajes de texto que se responden a través de ChatService.
@Component({
  selector: 'app-asistente',
  templateUrl: './asistente.component.html',
  styleUrls: ['./asistente.component.scss']
})
export class AsistenteComponent {
  // Historial de la conversación. Cada mensaje tiene el texto y si fue
  // escrito por el usuario (true) o por el asistente (false).
  // Empieza con un mensaje de bienvenida del asistente.
  messages: { text: string; isUser: boolean }[] = [
    { text: '¡Hola! Soy el Asistente GlamFinds. ¿En qué puedo ayudarte hoy?', isUser: false }
  ];
  // Texto que el usuario está escribiendo en el input (ngModel del campo de texto).
  input = '';
  // Indica si se está esperando la respuesta del asistente (para mostrar un
  // indicador de "cargando" y deshabilitar el envío mientras tanto).
  loading = false;
  // Identificador del proyecto/bot que se envía junto con cada mensaje al backend del chat.
  projectId = '64ed8331-71ea-4719-9dd8-8aef4ceecbe7';

  constructor(private chatService: ChatService) {}

  // Se ejecuta cuando el usuario hace click en el botón de "enviar" (o presiona Enter, ver onKeyDown).
  // 1) Valida que el mensaje no esté vacío.
  // 2) Agrega el mensaje del usuario al historial y limpia el input.
  // 3) Llama al ChatService para obtener la respuesta del asistente.
  // 4) Al recibir la respuesta (o un error), la agrega al historial y apaga el indicador de carga.
  send(): void {
    const msg = this.input.trim();
    if (!msg) return;
    this.messages.push({ text: msg, isUser: true });
    this.input = '';
    this.loading = true;
    this.chatService.sendMessage(this.projectId, msg).subscribe({
      next: (res: ResponseMessage) => {
        this.messages.push({ text: res.response, isUser: false });
        this.loading = false;
      },
      error: () => {
        this.messages.push({ text: 'Lo siento, no pude conectarme en este momento. Por favor intenta de nuevo.', isUser: false });
        this.loading = false;
      }
    });
  }

  // Se ejecuta con cada tecla presionada dentro del input de texto.
  // Si la tecla es "Enter" y no se está presionando Shift (para permitir
  // saltos de línea con Shift+Enter), evita el comportamiento por defecto
  // del input y envía el mensaje llamando a send().
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }
}
