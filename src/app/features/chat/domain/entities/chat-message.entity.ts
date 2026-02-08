/**
 * Mensaje del chat.
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}
