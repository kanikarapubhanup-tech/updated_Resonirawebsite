import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Shield, Sparkles } from 'lucide-react';

function MessageContent({ text }) {
  // Minimal formatter: paragraphs and hyphen bullets
  const lines = String(text).split(/\r?\n/);
  const blocks = [];
  let currentList = null;
  const linkify = (s) => {
    const urlRe = /(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/gi;
    const parts = String(s).split(urlRe);
    return parts.map((part, idx) => {
      if (!part) return null;
      const isUrl = /^(https?:\/\/|www\.)/i.test(part);
      if (!isUrl) return <span key={idx}>{part}</span>;
      const href = part.startsWith('http') ? part : `https://${part}`;
      return (
        <a
          key={idx}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 dark:text-primary-400 underline break-words"
        >
          {part}
        </a>
      );
    });
  };
  const flushList = () => {
    if (currentList && currentList.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-1">
          {currentList.map((item, idx) => (
            <li key={idx} className="text-sm leading-relaxed">{linkify(item)}</li>
          ))}
        </ul>
      );
      currentList = null;
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      blocks.push(<div key={`br-${blocks.length}`} className="h-2" />);
      continue;
    }
    if (line.startsWith('- ')) {
      if (!currentList) currentList = [];
      currentList.push(line.slice(2));
    } else if (line.startsWith('* ')) {
      if (!currentList) currentList = [];
      currentList.push(line.slice(2));
    } else {
      flushList();
      blocks.push(
        <p key={`p-${blocks.length}`} className="text-sm leading-relaxed whitespace-pre-line">{linkify(line)}</p>
      );
    }
  }
  flushList();
  return <>{blocks}</>;
}

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm your assistant. I can answer questions about this company only. Ask away!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (isOpen && el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    const userMsg = { id: String(Date.now()), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const res = await fetch('/.netlify/functions/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })) }),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setMessages((prev) => ([...prev, { id: `${Date.now()}-assistant`, role: 'assistant', content: data.answer }]));
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: 'assistant',
          content:
            'Sorry, I had trouble answering that. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const themeClasses = useMemo(
    () => ({
      container: 'fixed z-50 right-4 bottom-4',
      button:
        'flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors',
      panel:
        'w-[360px] max-w-[92vw] h-[560px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col',
      header:
        'px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-primary-500 to-secondary-500',
      title: 'text-white font-semibold',
      body: 'flex-1 overflow-y-auto px-4 py-3 space-y-3 relative',
      footer: 'p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2',
      input:
        'flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500',
      send:
        'px-3 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed',
      bubbleUser:
        'self-end bg-primary-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%] shadow',
      bubbleAssistant:
        'self-start bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-bl-sm px-3 py-2 max-w-[80%] shadow',
      meta: 'mt-1 text-[11px] text-gray-500 dark:text-gray-400',
      guard: 'flex items-center gap-1 text-[11px] text-white/90',
    }),
    []
  );

  return (
    <div className={themeClasses.container}>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            aria-label="Open chat"
            className={themeClasses.button}
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <MessageCircle className="w-5 h-5" /> Chat
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={themeClasses.panel}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
          >
            <div className={themeClasses.header}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className={themeClasses.title}>Company Assistant</span>
              </div>
              <div className={themeClasses.guard}>
                <Shield className="w-4 h-4" />
                <span>Company-only answers</span>
              </div>
              <button
                aria-label="Close chat"
                onClick={() => setIsOpen(false)}
                className="ml-auto p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div ref={scrollRef} className={themeClasses.body}>
              {messages.map((m) => (
                <div key={m.id} className="flex flex-col">
                  <div className={m.role === 'user' ? themeClasses.bubbleUser : themeClasses.bubbleAssistant}>
                    <MessageContent text={m.content} />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-xs text-gray-500 dark:text-gray-400">Thinking…</div>
              )}
            </div>

            <div className={themeClasses.footer}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder="Ask about our services, portfolio, contact…"
                className={themeClasses.input}
              />
              <button className={themeClasses.send} onClick={handleSend} disabled={isLoading}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatbotWidget;


