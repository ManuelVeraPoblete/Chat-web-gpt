import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ✅ Panel de chat principal (columna central).
 */
@Component({
  selector: 'app-live-chat-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card">
      <header class="panel-header">
        <div class="panel-title">Chat en Vivo</div>
        <div class="panel-subtitle">Chat con Javier</div>
      </header>

      <div class="messages">
        <div class="bubble left">Hola Carlos, ¿cómo va todo?</div>
        <div class="bubble right">Hola Javier, todo bien. ¿Y tú qué tal?</div>
        <div class="bubble left">Estoy preparando el informe de ventas de hoy.</div>
      </div>

      <div class="composer">
        <input class="input" placeholder="Escribe un mensaje..." />
        <button class="send">Enviar</button>
      </div>

      <footer class="statusbar">
        <div class="current">
          <span class="dot green"></span> Estado actual: <strong>Conectado</strong>
        </div>
        <div class="actions">
          <button class="action">Nuevo chat</button>
          <button class="action">Llamada</button>
        </div>
      </footer>
    </section>
  `,
  styles: [`
    .card {
      background: #fff;
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .panel-header { padding-bottom: 10px; border-bottom: 1px solid #eef2f7; }
    .panel-title { font-weight: 800; font-size: 18px; }
    .panel-subtitle { color: #64748b; margin-top: 4px; font-size: 13px; }

    .messages {
      flex: 1;
      padding: 12px 4px;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bubble {
      max-width: 70%;
      padding: 10px 12px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.35;
    }
    .left { background: #eef2f7; align-self: flex-start; }
    .right { background: #1ea97c; color: #fff; align-self: flex-end; }

    .composer {
      display: flex;
      gap: 10px;
      padding-top: 10px;
      border-top: 1px solid #eef2f7;
    }
    .input {
      flex: 1;
      height: 40px;
      border-radius: 12px;
      border: 1px solid #dbe4f0;
      padding: 0 12px;
      outline: none;
    }
    .send {
      height: 40px;
      padding: 0 16px;
      border: 0;
      border-radius: 12px;
      background: #0b2a55;
      color: #fff;
      cursor: pointer;
      font-weight: 700;
    }

    .statusbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #eef2f7;
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 8px; }
    .green { background: #1ea97c; }
    .current { color: #334155; display: flex; align-items: center; gap: 6px; }
    .actions { display: flex; gap: 8px; }
    .action {
      border: 0;
      border-radius: 12px;
      padding: 10px 12px;
      cursor: pointer;
      background: #eef2f7;
      font-weight: 700;
    }
  `],
})
export class LiveChatPanelComponent {}
