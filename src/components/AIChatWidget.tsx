import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Trash2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIChat } from "@/hooks/useAIChat";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">مساعد المختبر الذكي</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { navigate("/ai-chat"); setIsOpen(false); }} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="فتح في صفحة كاملة">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button onClick={clearMessages} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="مسح المحادثة">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" dir="rtl">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-8 space-y-3">
                <MessageCircle className="w-12 h-12 mx-auto opacity-30" />
                <p>مرحباً! أنا مساعدك الذكي 🤖</p>
                <p className="text-xs">اسألني عن أي شيء يخص المختبر</p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {["كيف أزيد أرباح المختبر؟", "ما هي أنواع التركيبات؟", "نصائح لإدارة الحسابات"].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-bl-sm"
                      : "bg-muted text-foreground rounded-br-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-2 text-sm">
                  <span className="animate-pulse">جارٍ الكتابة...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border" dir="rtl">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()} className="rounded-xl shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
