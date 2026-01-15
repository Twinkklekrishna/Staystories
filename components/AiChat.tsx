
import React, { useState, useRef, useEffect } from 'react';
import { Stay } from '../types';
import { getAiResponse } from '../services/geminiService';
import { saveChatMessage, getChatHistory } from '../services/chatService';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AiChat: React.FC<{ stay: Stay }> = ({ stay }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, [stay.id]);

  const loadChatHistory = async () => {
    setLoadingHistory(true);
    const history = await getChatHistory(stay.id);
    
    if (history.length > 0) {
      // Reconstruct messages from history
      const reconstructed: Message[] = [];
      history.forEach(msg => {
        reconstructed.push({ role: 'user', text: msg.user_message });
        reconstructed.push({ role: 'ai', text: msg.ai_response });
      });
      setMessages(reconstructed);
    } else {
      // First visit to this stay
      setMessages([
        { role: 'ai', text: `Hi there! I'm your assistant for ${stay.name}. Looking for a ${stay.experience.toLowerCase()} getaway? Ask me anything!` }
      ]);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await getAiResponse(stay, userText);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      
      // Save to database
      await saveChatMessage(stay.id, userText, response);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl overflow-hidden flex flex-col h-[550px] shadow-2xl border border-slate-800">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-xl">✨</div>
        <div>
          <h4 className="font-bold text-sm">Stay Agent</h4>
          <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {loadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-slate-400 text-sm">Loading chat history...</p>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none animate-pulse text-slate-400 text-xs italic">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      <div className="p-4 bg-slate-900/80 border-t border-slate-800">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about vibes, locations..."
            disabled={loadingHistory}
            className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={loading || loadingHistory}
            className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
