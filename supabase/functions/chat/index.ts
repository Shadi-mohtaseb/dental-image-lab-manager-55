import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `أنت مساعد ذكي متخصص في إدارة مختبرات الأسنان. اسمك "مساعد المختبر الذكي".

مهامك الأساسية:
1. **تحليل البيانات والتقارير**: تساعد المستخدم في فهم أداء المختبر المالي، تحليل الأرباح والمصاريف، ومراجعة ديون الأطباء.
2. **المساعدة في إدخال البيانات**: تشرح كيفية إضافة حالات جديدة، تسجيل مصاريف، وإدارة حسابات الشركاء.
3. **الإجابة على الأسئلة العامة**: تجيب على أي استفسارات تتعلق بإدارة المختبر أو طب الأسنان.
4. **تقديم النصائح**: تقدم نصائح لتحسين أداء المختبر وزيادة الأرباح.

أنت تتحدث بالعربية بشكل أساسي وتستخدم لغة مهنية ودودة.
إذا سُئلت عن بيانات محددة (مثل الأرباح أو عدد الحالات)، اشرح أنك لا تملك وصولاً مباشراً للبيانات حالياً ولكن يمكنك مساعدة المستخدم في فهم كيفية قراءة التقارير الموجودة في النظام.

اجعل إجاباتك مختصرة ومفيدة. استخدم تنسيق markdown عند الحاجة.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد لحساب Lovable AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "خطأ في خدمة الذكاء الاصطناعي" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
