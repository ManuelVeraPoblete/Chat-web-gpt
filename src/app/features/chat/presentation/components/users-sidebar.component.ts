import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ✅ Sidebar usuarios y estados.
 */
@Component({
  selector: 'app-users-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="card">
      <h3 class="title">Chats</h3>

      <div class="tabs">
        <button class="tab active">Usuarios</button>
        <button class="tab">Chat IA</button>
      </div>

      <div class="section">
        <h4 class="subtitle">Estados</h4>
        <ul class="status-list">
          <li><span class="dot green"></span> Conectado</li>
          <li><span class="dot yellow"></span> En pausa</li>
          <li><span class="dot orange"></span> En almuerzo</li>
          <li><span class="dot gray"></span> Desconectado</li>
        </ul>
      </div>

      <div class="section">
        <h4 class="subtitle">Usuarios en línea</h4>

        <div class="user">
          <div class="avatar"></div>
          <div class="meta">
            <div class="name">Ana</div>
            <div class="state"><span class="dot green"></span> Conectado</div>
          </div>
        </div>

        <div class="user">
          <div class="avatar"></div>
          <div class="meta">
            <div class="name">Javier</div>
            <div class="state"><span class="dot yellow"></span> En pausa</div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .card {
      background: #fff;
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
      height: 100%;
      overflow: auto;
    }
    .title { margin: 0 0 10px; font-size: 18px; }
    .tabs { display: flex; gap: 8px; margin-bottom: 12px; }
    .tab {
      flex: 1;
      border: 0;
      border-radius: 10px;
      padding: 8px 10px;
      background: #eef2f7;
      cursor: pointer;
      font-weight: 600;
      color: #1f2a37;
    }
    .tab.active { background: #0b2a55; color: #fff; }
    .section { margin-top: 14px; }
    .subtitle { margin: 0 0 8px; font-size: 14px; color: #374151; }
    .status-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 8px; }
    .green { background: #1ea97c; }
    .yellow { background: #f4c542; }
    .orange { background: #f28c28; }
    .gray { background: #6b7280; }

    .user { display: flex; gap: 10px; align-items: center; padding: 10px; border-radius: 12px; background: #f8fafc; margin-bottom: 10px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: #dbe4f0; }
    .name { font-weight: 700; }
    .state { font-size: 12px; color: #4b5563; margin-top: 2px; display: flex; align-items: center; }
  `],
})
export class UsersSidebarComponent {}
