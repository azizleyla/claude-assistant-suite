'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import AppSwitcher from '../components/AppSwitcher';
import type { ChatMessage } from '@/lib/types';

export default function TasksPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim()) return;

    setError('');
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (data.error) {
        setError('Xəta: ' + data.error);
        setLoading(false);
        return;
      }

      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError('Xəta baş verdi: ' + (err instanceof Error ? err.message : String(err)));
    }

    setLoading(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-10 px-4">
      <div className="mx-auto w-full max-w-2xl">
        {/* App switcher */}
        <AppSwitcher />

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white shadow-lg shadow-emerald-600/30">
            🛠️
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Tapşırıq Köməkçisi
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Danışaraq todo-larını əlavə et, gör və sil
            </p>
          </div>
        </div>

        {/* Chat card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Messages */}
          <div className="flex min-h-[340px] flex-col gap-4 p-5">
            {messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                <span className="text-3xl">💬</span>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Sınaq üçün: “Alış-veriş etməyi todo-ya əlavə et” yaz
                </p>
              </div>
            )}

            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm dark:bg-emerald-950">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isUser
                        ? 'rounded-br-sm bg-emerald-600 text-white'
                        : 'rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm dark:bg-slate-700">
                      🧑
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm dark:bg-emerald-950">
                  🤖
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-3 mb-1 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
              <span>⚠️</span>
              <span className="flex-1">{error}</span>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600"
                aria-label="Bağla"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajını yaz..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Göndər
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
