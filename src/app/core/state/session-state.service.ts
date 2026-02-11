import { Injectable } from '@angular/core';

import { UsersSidebarFacade } from '../../features/chat/application/users-sidebar.facade';
import { ChatShellFacade } from '../../features/chat/application/facades/chat-shell.facade';
import { LiveChatFacade } from '../../features/chat/application/live-chat.facade';
import { AiAssistantFacade } from '../../features/chat/application/ai-assistant.facade';

/**
 * ✅ SessionStateService
 * Centraliza el reseteo de estado en memoria (signals) al perder sesión (401) o logout.
 *
 * SRP:
 * - NO maneja tokens
 * - SOLO resetea estado del frontend
 */
@Injectable({ providedIn: 'root' })
export class SessionStateService {
  constructor(
    private readonly usersSidebar: UsersSidebarFacade,
    private readonly chatShell: ChatShellFacade,
    private readonly liveChat: LiveChatFacade,
    private readonly aiAssistant: AiAssistantFacade,
  ) {}

  clearAll(): void {
    this.usersSidebar.resetState();
    this.chatShell.resetState();
    this.liveChat.resetState();
    this.aiAssistant.resetState();
  }
}
