
import { Stay } from "../types";

// Client-side wrapper: routes a request through our backend to keep API key server-side.
export const getAiResponse = async (stay: Stay, userMessage: string): Promise<string> => {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stay, message: userMessage }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('AI chat error:', data);
      return "I'm having a little trouble connecting to my brain right now! Try again in a second.";
    }

    return data.text || "I'm here to help, but I didn't quite catch that. Could you ask again?";
  } catch (error) {
    console.error('Client AI call error:', error);
    return "I'm having a little trouble connecting to my brain right now! Try again in a second.";
  }
};

export const generateListingDescription = async (stayName: string, experience: string): Promise<string> => {
  try {
    const res = await fetch('/api/ai/description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stayName, experience }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('AI description error:', data);
      return "";
    }

    return data.text || "";
  } catch (error) {
    console.error('Client AI description error:', error);
    return "";
  }
};
