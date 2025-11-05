"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Send } from "lucide-react";

// Определяем тип для сообщений для большей надежности
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function DeepsekChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Автоматическая прокрутка вниз при появлении новых сообщений
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Ошибка сервера: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';
      const assistantMessageId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantResponse += chunk;

        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId ? { ...msg, content: assistantResponse } : msg
        ));
      }
    } catch (error) {
      console.error("Ошибка при получении ответа от AI:", error);
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: 'Извините, произошла ошибка.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#01032C] text-[#91B1C0] font-mono">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-[#01032C]/50 backdrop-blur-lg p-4 border-b border-[#91B1C0]/20 flex items-center gap-3"
      >
        <div className="p-2 bg-[#A1CCB0] rounded-lg">
          <Bot className="w-6 h-6 text-[#01032C]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#A1CCB0]">Deepsek Chat</h1>
          <p className="text-sm text-[#91B1C0]">Ваш AI-гид по онлайн-безопасности</p>
        </div>
      </motion.header>

      {/* Chat Messages */}
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <AnimatePresence>
          {messages.length > 0 ? (
            messages.map((m, index) => {
              const isLastMessage = index === messages.length - 1;
              const isStreaming = isLoading && isLastMessage && m.role === 'assistant';

              return (
                <motion.div
                  layout
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`flex items-start gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="p-2 bg-[#91B1C0]/20 rounded-full flex-shrink-0"
                    >
                      <Bot className="w-5 h-5 text-[#A1CCB0]" />
                    </motion.div>
                  )}
                  <div className={`max-w-xl p-4 rounded-xl whitespace-pre-wrap ${m.role === 'user' ? 'bg-[#A1CCB0] text-[#01032C] font-semibold' : 'bg-[#91B1C0]/10 text-[#91B1C0]'}`}>
                    {m.content}
                    {isStreaming && <span className="inline-block w-2 h-5 bg-[#A1CCB0] animate-pulse ml-1 rounded-sm" />}
                  </div>
                  {m.role === 'user' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="p-2 bg-[#91B1C0]/20 rounded-full flex-shrink-0"
                    >
                      <User className="w-5 h-5 text-[#A1CCB0]" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center text-[#91B1C0]/70 pt-10"
            >
              <p>Задайте вопрос о безопасности в интернете.</p>
              <p className="text-sm mt-2">Например: "Мне пришло письмо о выигрыше в лотерею, это безопасно?"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Chat Input Form */}
      <motion.footer 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="p-4 bg-[#01032C] border-t border-[#91B1C0]/20"
      >
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Опишите ситуацию или задайте вопрос..."
              rows={1}
              className="w-full p-4 pr-20 bg-[#91B1C0]/10 text-[#A1CCB0] border-2 border-[#91B1C0]/30 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#A1CCB0] focus:border-[#A1CCB0] transition-all placeholder-[#91B1C0]/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const form = e.target as HTMLTextAreaElement;
                  form.closest('form')?.requestSubmit();
                }
              }}
            />
            <motion.button
              type="submit"
              disabled={isLoading || !input.trim()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#A1CCB0] text-[#01032C] rounded-lg hover:bg-[#A1CCB0]/80 disabled:bg-[#91B1C0]/20 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-[#01032C] rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </form>
      </motion.footer>
    </div>
  );
}