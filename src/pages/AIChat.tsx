import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Trash2, Bot, Lightbulb, BarChart3, FileText, HelpCircle } from "lucide-react";
import { useAIChat } from "@/hooks/useAIChat";
import ReactMarkdown from "react-markdown";

const features = [
  { icon: BarChart3, title: "تحليل الأداء المالي", desc: "اسأل عن كيفية تحسين أرباحك وتقليل المصاريف", color: "text-blue-500" },
  { icon: FileText, title: "إدارة الحالات", desc: "نصائح لتنظيم العمل وتتبع الحالات بكفاءة", color: "text-green-500" },
  { icon: Lightbulb, title: "نصائح مهنية", desc: "معلومات عن أنواع التركيبات والمواد المستخدمة", color: "text-amber-500" },
  { icon: HelpCircle, title: "دعم فني", desc: "مساعدة في استخدام النظام وحل المشاكل", color: "text-purple-500" },
];

const suggestedQuestions = [
  "كيف أحسن إدارة حسابات الأطباء؟",
  "ما الفرق بين أنواع الزيركون؟",
  "نصائح لتقليل مصاريف المختبر",
  "كيف أتابع ديون الأطباء بفعالية؟",
  "ما هي أفضل طريقة لتسعير الأعمال؟",
  "كيف أستخدم تقارير النظام؟",
];

const AIChat = () => {
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Bot className="w-8 h-8 text-primary" />
          مساعد المختبر الذكي
        </h1>
        <p className="text-muted-foreground">مدعوم بالذكاء الاصطناعي لمساعدتك في إدارة المختبر</p>
      </div>

      {/* Features Grid - show when no messages */}
      {messages.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-start gap-3 p-4" dir="rtl">
                <f.icon className={`w-8 h-8 ${f.color} shrink-0 mt-1`} />
                <div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chat Area */}
      <Card className="min-h-[500px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            المحادثة
          </CardTitle>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearMessages}>
              <Trash2 className="w-4 h-4 ml-1" />
              مسح
            </Button>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" dir="rtl">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-8 space-y-4">
                <Bot className="w-16 h-16 mx-auto opacity-20" />
                <p>ابدأ محادثة مع المساعد الذكي</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-sm px-4 py-2 rounded-full border border-border hover:bg-accent transition-colors text-right"
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
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
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
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <span className="animate-pulse text-muted-foreground">جارٍ التفكير...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border" dir="rtl">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
              <Button size="lg" onClick={handleSend} disabled={isLoading || !input.trim()} className="rounded-xl px-6">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChat;
