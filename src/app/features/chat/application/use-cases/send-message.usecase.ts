import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Envía mensajes al backend.
 */
@Injectable({ providedIn: 'root' })
export class SendMessageUseCase {
  constructor(private http: HttpClient) {}

  execute(peerId: string, content: string) {
    return this.http.post(`/chat/${peerId}/messages`, {
      content,
    });
  }
}
