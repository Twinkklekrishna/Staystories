import { getAuthHeader } from './authService';

interface ChatMessage {
  id?: string;
  stay_id: string;
  user_message: string;
  ai_response: string;
}

const API_URL = 'http://localhost:4000/api';

/**
 * Get chat history for a specific stay
 */
export async function getChatHistory(stayId: string): Promise<ChatMessage[]> {
  try {
    const response = await fetch(`${API_URL}/chat-history/${stayId}`);
    if (!response.ok) throw new Error('Failed to fetch chat history');
    return await response.json();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

/**
 * Save a chat message exchange
 */
export async function saveChatMessage(
  stayId: string,
  userMessage: string,
  aiResponse: string
): Promise<ChatMessage | null> {
  try {
    const response = await fetch(`${API_URL}/chat-history`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        stay_id: stayId,
        user_message: userMessage,
        ai_response: aiResponse
      })
    });
    if (!response.ok) throw new Error('Failed to save chat message');
    return await response.json();
  } catch (error) {
    console.error('Error saving chat message:', error);
    return null;
  }
}
