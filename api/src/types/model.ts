export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GeminiMessage {
  role: 'user' | 'model' | 'system';
  parts: { text: string }[];
}

export interface ChatRequest {
  messages: ChatMessage[];
  userId?: string; // For patient context
}
