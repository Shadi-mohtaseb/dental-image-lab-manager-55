import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchLabData(supabase: any) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const thisYearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];

  const [
    { data: cases, count: totalCases },
    { data: monthCases, count: monthCasesCount },
    { data: doctors },
    { data: expenses },
    { data: monthExpenses },
    { data: transactions },
    { data: partners },
    { data: expenseTypes },
    { data: workTypes },
    { data: checks },
  ] = await Promise.all([
    supabase.from("cases").select("*", { count: "exact" }),
    supabase.from("cases").select("*", { count: "exact" }).gte("submission_date", thisMonthStart),
    supabase.from("doctors").select("*"),
    supabase.from("expenses").select("*, expense_types(name)"),
    supabase.from("expenses").select("*").gte("purchase_date", thisMonthStart),
    supabase.from("doctor_transactions").select("*, doctors(name)"),
    supabase.from("partners").select("*"),
    supabase.from("expense_types").select("*"),
    supabase.from("work_types").select("*"),
    supabase.from("checks").select("*, doctors(name)"),
  ]);

  // Calculate summaries
  const totalRevenue = (transactions || [])
    .filter((t: any) => t.transaction_type === "دفعة")
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

  const totalExpenses = (expenses || [])
    .reduce((sum: number, e: any) => sum + (e.total_amount || 0), 0);

  const monthRevenue = (transactions || [])
    .filter((t: any) => t.transaction_type === "دفعة" && t.transaction_date >= thisMonthStart)
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

  const monthExpenseTotal = (monthExpenses || [])
    .reduce((sum: number, e: any) => sum + (e.total_amount || 0), 0);

  const totalTeeth = (cases || [])
    .reduce((sum: number, c: any) => sum + (c.teeth_count || 0), 0);

  const monthTeeth = (monthCases || [])
    .reduce((sum: number, c: any) => sum + (c.teeth_count || 0), 0);

  // Doctor debts
  const doctorDebts = (doctors || []).map((doc: any) => {
    const docCases = (cases || []).filter((c: any) => c.doctor_id === doc.id);
    const docTotal = docCases.reduce((sum: number, c: any) => sum + (c.price || 0), 0);
    const docPaid = (transactions || [])
      .filter((t: any) => t.doctor_id === doc.id && t.transaction_type === "دفعة")
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    return { name: doc.name, total: docTotal, paid: docPaid, debt: docTotal - docPaid, casesCount: docCases.length };
  }).filter((d: any) => d.casesCount > 0);

  // Cases by status
  const statusCounts: Record<string, number> = {};
  (cases || []).forEach((c: any) => {
    const s = c.status || "غير محدد";
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  // Cases by work type
  const workTypeCounts: Record<string, number> = {};
  (cases || []).forEach((c: any) => {
    workTypeCounts[c.work_type] = (workTypeCounts[c.work_type] || 0) + 1;
  });

  // Expense breakdown
  const expenseBreakdown: Record<string, number> = {};
  (expenses || []).forEach((e: any) => {
    const name = e.expense_types?.name || "غير مصنف";
    expenseBreakdown[name] = (expenseBreakdown[name] || 0) + (e.total_amount || 0);
  });

  // Checks summary
  const pendingChecks = (checks || []).filter((c: any) => c.status === "مستلم");
  const totalChecksAmount = pendingChecks.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

  return `
=== بيانات المختبر الحالية (تاريخ اليوم: ${now.toLocaleDateString('ar-EG')}) ===

📊 ملخص عام:
- إجمالي الحالات: ${totalCases || 0}
- إجمالي الأسنان: ${totalTeeth}
- إجمالي الإيرادات (المدفوعات): ${totalRevenue.toLocaleString()} 
- إجمالي المصاريف: ${totalExpenses.toLocaleString()}
- صافي الربح: ${(totalRevenue - totalExpenses).toLocaleString()}
- عدد الأطباء: ${(doctors || []).length}
- عدد الشركاء: ${(partners || []).length}

📅 هذا الشهر:
- حالات الشهر: ${monthCasesCount || 0}
- أسنان الشهر: ${monthTeeth}
- إيرادات الشهر: ${monthRevenue.toLocaleString()}
- مصاريف الشهر: ${monthExpenseTotal.toLocaleString()}

👨‍⚕️ حسابات الأطباء:
${doctorDebts.map((d: any) => `- ${d.name}: إجمالي ${d.total.toLocaleString()} | مدفوع ${d.paid.toLocaleString()} | متبقي ${d.debt.toLocaleString()} | حالات: ${d.casesCount}`).join("\n")}

📋 الحالات حسب الحالة:
${Object.entries(statusCounts).map(([s, c]) => `- ${s}: ${c}`).join("\n")}

🔧 الحالات حسب نوع العمل:
${Object.entries(workTypeCounts).map(([w, c]) => `- ${w}: ${c}`).join("\n")}

💰 تفصيل المصاريف:
${Object.entries(expenseBreakdown).map(([n, a]) => `- ${n}: ${(a as number).toLocaleString()}`).join("\n")}

🏦 الشيكات المعلقة: ${pendingChecks.length} شيك بقيمة ${totalChecksAmount.toLocaleString()}

👥 الشركاء:
${(partners || []).map((p: any) => `- ${p.name}: نسبة ${p.partnership_percentage}% | رصيد شخصي: ${(p.personal_balance || 0).toLocaleString()} | حصة: ${(p.total_amount || 0).toLocaleString()}`).join("\n")}

أنواع العمل المتاحة: ${(workTypes || []).map((w: any) => w.name).join("، ")}
أنواع المصاريف: ${(expenseTypes || []).map((e: any) => e.name).join("، ")}
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get user token from Authorization header
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    // Create authenticated Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Fetch lab data
    let labDataContext = "";
    try {
      labDataContext = await fetchLabData(supabase);
    } catch (err) {
      console.error("Failed to fetch lab data:", err);
      labDataContext = "\n(لم يتم تحميل بيانات المختبر - قد يكون المستخدم غير مسجل دخول)\n";
    }

    const systemPrompt = `أنت مساعد ذكي متخصص في إدارة مختبرات الأسنان. اسمك "مساعد المختبر الذكي".

لديك وصول مباشر لبيانات المختبر التالية:
${labDataContext}

مهامك الأساسية:
1. **تحليل البيانات والتقارير**: استخدم البيانات أعلاه للإجابة على أسئلة المستخدم حول الأرباح، المصاريف، ديون الأطباء، عدد الحالات، وغيرها.
2. **المساعدة في إدخال البيانات**: تشرح كيفية إضافة حالات جديدة، تسجيل مصاريف، وإدارة حسابات الشركاء.
3. **الإجابة على الأسئلة العامة**: تجيب على أي استفسارات تتعلق بإدارة المختبر أو طب الأسنان.
4. **تقديم النصائح**: بناءً على البيانات الفعلية، قدم نصائح لتحسين أداء المختبر وزيادة الأرباح.

قواعد مهمة:
- عند السؤال عن بيانات محددة، استخدم الأرقام الفعلية من البيانات أعلاه.
- قدم تحليلات ذكية ومقارنات عند الإمكان.
- أنت تتحدث بالعربية بشكل أساسي وتستخدم لغة مهنية ودودة.
- اجعل إجاباتك مختصرة ومفيدة. استخدم تنسيق markdown عند الحاجة.`;

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
