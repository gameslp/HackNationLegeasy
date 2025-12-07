'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles, HelpCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import ReactMarkdown from 'react-markdown';

interface NavigationPrompt {
  url: string;
  title: string;
  description: string;
  targetType: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  navigationPrompt?: NavigationPrompt;
}

const SUGGESTED_QUESTIONS = [
  'Jakie ustawy są teraz w Sejmie?',
  'Jak działa proces legislacyjny?',
  'Co to jest RCL?',
  'Jakie są aktywne prekonsultacje?',
];

// Parse navigation prompts from message content
function parseNavigationPrompt(content: string): { cleanContent: string; prompt?: NavigationPrompt } {
  // Look for __navigation__ marker in response - match the full JSON object
  const navMatch = content.match(/\{"__navigation__":true,"url":"[^"]+","title":"[^"]+","description":"[^"]*","targetType":"[^"]+"\}/);
  if (navMatch) {
    try {
      const navData = JSON.parse(navMatch[0]);
      if (navData.__navigation__ && navData.url) {
        const cleanContent = content.replace(navMatch[0], '').trim();
        return {
          cleanContent,
          prompt: {
            url: navData.url,
            title: navData.title || 'Przejdź do strony',
            description: navData.description || '',
            targetType: navData.targetType,
          },
        };
      }
    } catch {
      // Ignore parsing errors
    }
  }
  return { cleanContent: content };
}

export function ChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleNavigate = (url: string) => {
    router.push(url);
    setIsOpen(false);
  };

  const handleDeclineNavigation = (messageIdx: number) => {
    // Remove the navigation prompt from that message
    setMessages(prev => prev.map((msg, idx) =>
      idx === messageIdx ? { ...msg, navigationPrompt: undefined } : msg
    ));
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.post<{ response: string }>('/chat', {
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      });

      const { cleanContent, prompt } = parseNavigationPrompt(response.response);

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: cleanContent,
          navigationPrompt: prompt,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Przepraszam, wystąpił błąd. Spróbuj ponownie później.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center group"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-3 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Asystent Legislacyjny</h3>
                  <p className="text-primary-200 text-[10px]">Zapytaj o ustawy i proces</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-primary-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">Witaj!</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Jestem asystentem, który pomoże Ci zrozumieć proces legislacyjny.
                  </p>
                  <div className="w-full space-y-1.5">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-center">
                      <HelpCircle className="w-2.5 h-2.5" />
                      Przykładowe pytania:
                    </p>
                    {SUGGESTED_QUESTIONS.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-700 transition-colors border border-gray-100 hover:border-primary-200"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex gap-1.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3 h-3 text-primary-600" />
                        </div>
                      )}
                      <div className="flex flex-col gap-2 max-w-[85%]">
                        {message.content && (
                          <div
                            className={`px-3 py-2 rounded-xl ${
                              message.role === 'user'
                                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            }`}
                          >
                            {message.role === 'assistant' ? (
                              <div className="text-xs prose prose-xs max-w-none [&_p]:text-xs [&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:pl-4 [&_li]:text-xs [&_li]:my-0.5 [&_h1]:text-sm [&_h1]:font-semibold [&_h1]:my-1.5 [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:my-1 [&_h3]:text-xs [&_h3]:font-medium [&_h3]:my-1 [&_strong]:text-xs [&_a]:text-xs [&_a]:text-primary-600 [&_br]:block">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-xs">{message.content}</p>
                            )}
                          </div>
                        )}

                        {/* Navigation Confirmation Prompt */}
                        {message.navigationPrompt && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-3 space-y-2"
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                                <ExternalLink className="w-4 h-4 text-primary-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900">
                                  Czy chcesz przejść do strony?
                                </p>
                                <p className="text-xs font-semibold text-primary-700 mt-0.5">
                                  {message.navigationPrompt.title}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  {message.navigationPrompt.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleNavigate(message.navigationPrompt!.url)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors"
                              >
                                <span>Tak, przejdź</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeclineNavigation(idx)}
                                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                              >
                                Nie
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-gray-600" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-1.5 justify-start"
                    >
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-primary-600" />
                      </div>
                      <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-bl-sm">
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 text-primary-600 animate-spin" />
                          <span className="text-xs text-gray-500">Szukam...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Zadaj pytanie..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none text-xs transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[9px] text-gray-400 text-center mt-1.5">
                Asystent AI - odpowiedzi mogą zawierać błędy
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
