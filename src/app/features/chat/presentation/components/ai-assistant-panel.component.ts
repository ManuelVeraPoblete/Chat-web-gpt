import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ✅ Panel Asistente IA (columna derecha).
 */
@Component({
  selector: 'app-ai-assistant-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card">
      <header class="panel-header">
        <div class="panel-title">Asistente IA</div>
      </header>

      <div class="messages">
        <div class="bubble left">¡Hola! ¿En qué puedo ayudarte hoy?</div>
        <div class="bubble right">Necesito un resumen del informe de ventas.</div>
        <div class="bubble left">
          Claro, aquí tienes el resumen:
          Las ventas fueron de $15,000 con un aumento del 25% respecto a ayer.
        </div>
      </div>

      <div class="composer">
        <input class="input" placeholder="Escribe tu pregunta..." />
        <button class="send">Enviar</button>
      </div>
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

    .messages {
      flex: 1;
      padding: 12px 4px;
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bubble {
      max-width: 78%;
      padding: 10px 12px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.35;
    }
    .left { background: #eef2f7; align-self: flex-start; }
    .right { background: #0b2a55; color: #fff; align-self: flex-end; }

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
  `],
})
export class AiAssistantPanelComponent {}
