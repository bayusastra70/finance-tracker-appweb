"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { aiApi, ChatMessage } from "@/lib/ai-api";

export default function AIAssistantPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !token || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiApi.chat(token, input, sessionId);
      setSessionId(response.session_id);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Berapa total saldo saya?",
    "Tampilkan ringkasan keuangan bulan ini",
    "Kategori apa yang paling banyak pengeluaran?",
    "Tampilkan 5 transaksi terakhir",
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">AI Assistant</h1>
        <p className="mt-1 text-zinc-400">Tanya apapun tentang keuanganmu</p>
      </div>

      {/* Chat Container */}
      <Card variant="glass" className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-lg">Financial Assistant</CardTitle>
              <p className="text-sm text-zinc-500">Powered by Agno AI</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
                  <svg className="h-10 w-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Halo! Saya Financial Assistant</h3>
                <p className="mb-6 max-w-md text-zinc-400">
                  Saya bisa membantu kamu melihat ringkasan keuangan, menganalisis pengeluaran, dan memberikan insight.
                </p>
                
                {/* Quick Questions */}
                <div className="flex flex-wrap justify-center gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="rounded-full border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-emerald-500 text-white"
                          : "bg-zinc-800 text-zinc-100"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-emerald-400 prose-headings:font-semibold prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-emerald-300">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <p className={`mt-2 text-xs ${msg.role === "user" ? "text-emerald-200" : "text-zinc-500"}`}>
                        {msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-zinc-800 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "0ms" }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "150ms" }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-zinc-800 p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                type="text"
                placeholder="Ketik pertanyaanmu..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={!input.trim() || isLoading}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

