import { Component } from '@angular/core';
import { ChatService, ResponseMessage } from 'src/app/services/chat.service';

@Component({
  selector: 'app-asistente',
  templateUrl: './asistente.component.html',
  styleUrls: ['./asistente.component.scss']
})
export class AsistenteComponent {
  messages: { text: string; isUser: boolean }[] = [
    { text: '¡Hola! Soy el Asistente GlamFinds. ¿En qué puedo ayudarte hoy?', isUser: false }
  ];
  input = '';
  loading = false;
  projectId = '64ed8331-71ea-4719-9dd8-8aef4ceecbe7';

  constructor(private chatService: ChatService) {}

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

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }
}
