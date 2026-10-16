import { useState } from 'react';
import api from '../lib/api';
import type { ChatMessage } from '../domain/chat';

/**
 * Hook del chatbot: mantiene la conversación y envía cada turno
 * con la historia completa al backend (Groq la continúa).
 */
export default function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const history = [...messages, { role: 'user' as const, content: trimmed }];
    setMessages(history);
    setSending(true);

    try {
      const response = await api.post('/ia/chat', { messages: history }, { timeout: 30000 });
      setMessages([...history, { role: 'assistant', content: response.data.answer }]);
    } catch (e) {
      console.error(e);
      setMessages([
        ...history,
        { role: 'assistant', content: 'No pude responder ahora. Intentá de nuevo en unos segundos.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const clear = () => setMessages([]);

  return { messages, sending, send, clear };
}
