/** Un mensaje de la conversación del chatbot. */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
