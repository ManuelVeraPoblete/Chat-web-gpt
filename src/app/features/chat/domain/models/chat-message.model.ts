/**
 *ChatMessage (Dashboard)
 * Forma real según tu backend (chat.service.ts -> toApiMessage)
 */
export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  role: 'user' | 'assistant';
  text: string;

  attachments: Array<{
    id: string;
    kind: 'IMAGE' | 'FILE' | 'LOCATION';
    url?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    width?: number | null;
    height?: number | null;
    latitude?: number;
    longitude?: number;
    label?: string | null;
  }>;

  createdAt: string; // ISO (Nest serializa Date -> string)
};
