import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Tool definitions for AI function calling ──
const tools = [
  {
    type: "function",
    function: {
      name: "add_expense",
      description: "إضافة مصروف جديد إلى قاعدة البيانات",
      parameters: {
        type: "object",
        properties: {
          total_amount: { type: "number", description: "المبلغ الإجمالي للمصروف" },
          expense_type_name: { type: "string", description: "اسم نوع المصروف (مثل: مواد، رواتب، إيجار)" },
          purchase_date: { type: "string", description: "تاريخ الشراء بصيغة YYYY-MM-DD" },
          notes: { type: "string", description: "ملاحظات إضافية (اختياري)" },
        },
        required: ["total_amount", "expense_type_name", "purchase_date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_case",
      description: "إضافة حالة أسنان جديدة",
      parameters: {
        type: "object",
        properties: {
          patient_name: { type: "string", description: "اسم المريض" },
          work_type: { type: "string", description: "نوع العمل (مثل: زيركون، بورسلين)" },
          doctor_name: { type: "string", description: "اسم الطبيب" },
          teeth_count: { type: "number", description: "عدد الأسنان" },
          price: { type: "number", description: "السعر" },
          shade: { type: "string", description: "اللون/الشيد" },
          tooth_number: { type: "string", description: "رقم السن" },
          submission_date: { type: "string", description: "تاريخ الاستلام YYYY-MM-DD" },
          delivery_date: { type: "string", description: "تاريخ التسليم YYYY-MM-DD" },
          notes: { type: "string", description: "ملاحظات" },
        },
        required: ["patient_name", "work_type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_doctor_payment",
      description: "تسجيل دفعة مالية لطبيب",
      parameters: {
        type: "object",
        properties: {
          doctor_name: { type: "string", description: "اسم الطبيب" },
          amount: { type: "number", description: "المبلغ" },
          transaction_date: { type: "string", description: "تاريخ الدفعة YYYY-MM-DD" },
          payment_method: { type: "string", description: "طريقة الدفع (نقدي أو شيك)", enum: ["نقدي", "شيك"] },
          notes: { type: "string", description: "ملاحظات" },
        },
        required: ["doctor_name", "amount", "transaction_date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_case_status",
      description: "تحديث حالة/ستاتس حالة أسنان معينة",
      parameters: {
        type: "object",
        properties: {
          patient_name: { type: "string", description: "اسم المريض للبحث عن الحالة" },
          new_status: { type: "string", description: "الحالة الجديدة", enum: ["في الانتظار", "قيد التنفيذ", "جاهز", "تم التسليم"] },
        },
        required: ["patient_name", "new_status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_expense",
      description: "حذف مصروف بناءً على وصفه أو تاريخه",
      parameters: {
        type: "object",
        properties: {
          expense_id: { type: "string", description: "معرف المصروف UUID" },
        },
        required: ["expense_id"],
      },
    },
  },
];

// ── Tool execution ──
async function executeTool(supabase: any, name: string, args: any): Promise<string> {
  try {
    switch (name) {
      case "add_expense": {
        // Find or inform about expense type
        const { data: types } = await supabase.from("expense_types").select("id, name");
        const found = (types || []).find((t: any) =>
          t.name === args.expense_type_name || t.name.includes(args.expense_type_name) || args.expense_type_name.includes(t.name)
        );
        if (!found) {
          const available = (types || []).map((t: any) => t.name).join("، ");
          return `❌ لم يتم العثور على نوع مصروف باسم "${args.expense_type_name}". الأنواع المتاحة: ${available}. يرجى إعادة المحاولة باسم صحيح.`;
        }
        const { error } = await supabase.from("expenses").insert({
          total_amount: args.total_amount,
          expense_type_id: found.id,
          purchase_date: args.purchase_date,
          notes: args.notes || null,
        });
        if (error) return `❌ خطأ: ${error.message}`;
        // Update capital and distribute
        await supabase.rpc("update_company_capital");
        await supabase.rpc("distribute_profits_to_partners");
        return `✅ تم إضافة مصروف بقيمة ${args.total_amount} (${found.name}) بتاريخ ${args.purchase_date} بنجاح.`;
      }

      case "add_case": {
        let doctor_id = null;
        if (args.doctor_name) {
          const { data: doctors } = await supabase.from("doctors").select("id, name");
          const doc = (doctors || []).find((d: any) =>
            d.name === args.doctor_name || d.name.includes(args.doctor_name) || args.doctor_name.includes(d.name)
          );
          if (!doc) {
            const available = (doctors || []).map((d: any) => d.name).join("، ");
            return `❌ لم يتم العثور على طبيب باسم "${args.doctor_name}". الأطباء المتاحون: ${available}`;
          }
          doctor_id = doc.id;
        }
        const { error } = await supabase.from("cases").insert({
          patient_name: args.patient_name,
          work_type: args.work_type,
          doctor_id,
          teeth_count: args.teeth_count || 1,
          price: args.price || null,
          shade: args.shade || null,
          tooth_number: args.tooth_number || null,
          submission_date: args.submission_date || new Date().toISOString().split("T")[0],
          delivery_date: args.delivery_date || null,
          notes: args.notes || null,
        });
        if (error) return `❌ خطأ: ${error.message}`;
        return `✅ تم إضافة حالة للمريض "${args.patient_name}" (${args.work_type}) بنجاح.`;
      }

      case "add_doctor_payment": {
        const { data: doctors } = await supabase.from("doctors").select("id, name");
        const doc = (doctors || []).find((d: any) =>
          d.name === args.doctor_name || d.name.includes(args.doctor_name) || args.doctor_name.includes(d.name)
        );
        if (!doc) {
          const available = (doctors || []).map((d: any) => d.name).join("، ");
          return `❌ لم يتم العثور على طبيب باسم "${args.doctor_name}". الأطباء المتاحون: ${available}`;
        }
        const { error } = await supabase.from("doctor_transactions").insert({
          doctor_id: doc.id,
          amount: args.amount,
          transaction_date: args.transaction_date,
          transaction_type: "دفعة",
          payment_method: args.payment_method || "نقدي",
          notes: args.notes || null,
        });
        if (error) return `❌ خطأ: ${error.message}`;
        await supabase.rpc("update_company_capital");
        await supabase.rpc("distribute_profits_to_partners");
        return `✅ تم تسجيل دفعة بقيمة ${args.amount} للطبيب ${doc.name} بتاريخ ${args.transaction_date} بنجاح.`;
      }

      case "update_case_status": {
        const { data: cases } = await supabase.from("cases").select("id, patient_name, status")
          .ilike("patient_name", `%${args.patient_name}%`).limit(5);
        if (!cases || cases.length === 0) return `❌ لم يتم العثور على حالة للمريض "${args.patient_name}"`;
        if (cases.length > 1) {
          const list = cases.map((c: any) => `- ${c.patient_name} (${c.status})`).join("\n");
          // Update the most recent one
        }
        const targetCase = cases[0];
        const { error } = await supabase.from("cases").update({ status: args.new_status }).eq("id", targetCase.id);
        if (error) return `❌ خطأ: ${error.message}`;
        return `✅ تم تحديث حالة المريض "${targetCase.patient_name}" من "${targetCase.status}" إلى "${args.new_status}" بنجاح.`;
      }

      case "delete_expense": {
        const { error } = await supabase.from("expenses").delete().eq("id", args.expense_id);
        if (error) return `❌ خطأ: ${error.message}`;
        await supabase.rpc("update_company_capital");
        await supabase.rpc("distribute_profits_to_partners");
        return `✅ تم حذف المصروف بنجاح.`;
      }

      default:
        return `❌ أداة غير معروفة: ${name}`;
    }
  } catch (e) {
    return `❌ خطأ غير متوقع: ${e instanceof Error ? e.message : String(e)}`;
  }
}

// ── Fetch lab data for context ──
async function fetchLabData(supabase: any) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

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

  const totalRevenue = (transactions || []).filter((t: any) => t.transaction_type === "دفعة").reduce((s: number, t: any) => s + (t.amount || 0), 0);
  const totalExp = (expenses || []).reduce((s: number, e: any) => s + (e.total_amount || 0), 0);
  const monthRevenue = (transactions || []).filter((t: any) => t.transaction_type === "دفعة" && t.transaction_date >= thisMonthStart).reduce((s: number, t: any) => s + (t.amount || 0), 0);
  const monthExpTotal = (monthExpenses || []).reduce((s: number, e: any) => s + (e.total_amount || 0), 0);
  const totalTeeth = (cases || []).reduce((s: number, c: any) => s + (c.teeth_count || 0), 0);
  const monthTeeth = (monthCases || []).reduce((s: number, c: any) => s + (c.teeth_count || 0), 0);

  const doctorDebts = (doctors || []).map((doc: any) => {
    const docCases = (cases || []).filter((c: any) => c.doctor_id === doc.id);
    const docTotal = docCases.reduce((s: number, c: any) => s + (c.price || 0), 0);
    const docPaid = (transactions || []).filter((t: any) => t.doctor_id === doc.id && t.transaction_type === "دفعة").reduce((s: number, t: any) => s + (t.amount || 0), 0);
    return { name: doc.name, total: docTotal, paid: docPaid, debt: docTotal - docPaid, casesCount: docCases.length };
  }).filter((d: any) => d.casesCount > 0);

  const statusCounts: Record<string, number> = {};
  (cases || []).forEach((c: any) => { statusCounts[c.status || "غير محدد"] = (statusCounts[c.status || "غير محدد"] || 0) + 1; });

  const workTypeCounts: Record<string, number> = {};
  (cases || []).forEach((c: any) => { workTypeCounts[c.work_type] = (workTypeCounts[c.work_type] || 0) + 1; });

  const expenseBreakdown: Record<string, number> = {};
  (expenses || []).forEach((e: any) => { const n = e.expense_types?.name || "غير مصنف"; expenseBreakdown[n] = (expenseBreakdown[n] || 0) + (e.total_amount || 0); });

  const pendingChecks = (checks || []).filter((c: any) => c.status === "مستلم");
  const totalChecksAmt = pendingChecks.reduce((s: number, c: any) => s + (c.amount || 0), 0);

  return `
=== بيانات المختبر (${now.toLocaleDateString("ar-EG")}) ===
📊 ملخص: حالات ${totalCases || 0} | أسنان ${totalTeeth} | إيرادات ${totalRevenue.toLocaleString()} | مصاريف ${totalExp.toLocaleString()} | ربح ${(totalRevenue - totalExp).toLocaleString()} | أطباء ${(doctors || []).length} | شركاء ${(partners || []).length}
📅 الشهر: حالات ${monthCasesCount || 0} | أسنان ${monthTeeth} | إيرادات ${monthRevenue.toLocaleString()} | مصاريف ${monthExpTotal.toLocaleString()}
👨‍⚕️ أطباء:\n${doctorDebts.map((d: any) => `- ${d.name}: إجمالي ${d.total.toLocaleString()} | مدفوع ${d.paid.toLocaleString()} | متبقي ${d.debt.toLocaleString()} | حالات ${d.casesCount}`).join("\n")}
📋 حالات: ${Object.entries(statusCounts).map(([s, c]) => `${s}:${c}`).join(" | ")}
🔧 عمل: ${Object.entries(workTypeCounts).map(([w, c]) => `${w}:${c}`).join(" | ")}
💰 مصاريف: ${Object.entries(expenseBreakdown).map(([n, a]) => `${n}:${(a as number).toLocaleString()}`).join(" | ")}
🏦 شيكات معلقة: ${pendingChecks.length} بقيمة ${totalChecksAmt.toLocaleString()}
👥 شركاء: ${(partners || []).map((p: any) => `${p.name} ${p.partnership_percentage}%`).join(" | ")}
أنواع العمل: ${(workTypes || []).map((w: any) => w.name).join("، ")}
أنواع المصاريف: ${(expenseTypes || []).map((e: any) => e.name).join("، ")}`;
}

// ── Main handler ──
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    let labDataContext = "";
    try { labDataContext = await fetchLabData(supabase); } catch (err) {
      console.error("Failed to fetch lab data:", err);
      labDataContext = "\n(لم يتم تحميل بيانات المختبر)\n";
    }

    const systemPrompt = `أنت مساعد ذكي متخصص في إدارة مختبرات الأسنان. اسمك "مساعد المختبر الذكي".

لديك وصول مباشر لبيانات المختبر:
${labDataContext}

لديك القدرة على تنفيذ العمليات التالية على قاعدة البيانات:
1. **إضافة مصروف** (add_expense): أضف مصاريف جديدة مع تحديد النوع والمبلغ والتاريخ
2. **إضافة حالة** (add_case): أضف حالة أسنان جديدة مع بيانات المريض والطبيب
3. **تسجيل دفعة طبيب** (add_doctor_payment): سجل دفعة مالية لطبيب
4. **تحديث حالة** (update_case_status): غيّر حالة/ستاتس حالة أسنان
5. **حذف مصروف** (delete_expense): احذف مصروف محدد

قواعد مهمة:
- عند طلب إضافة بيانات، استخدم الأدوات المتاحة لتنفيذ العملية مباشرة.
- إذا نقص معلومة مطلوبة، اسأل المستخدم عنها قبل التنفيذ.
- استخدم تاريخ اليوم كافتراضي إذا لم يحدد المستخدم تاريخاً.
- عند السؤال عن بيانات، استخدم الأرقام الفعلية من البيانات أعلاه.
- تحدث بالعربية بلغة مهنية ودودة. استخدم markdown عند الحاجة.
- بعد تنفيذ أي عملية، أخبر المستخدم بالنتيجة بوضوح.`;

    const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const aiHeaders = { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" };

    // First call: non-streaming with tools
    const firstResp = await fetch(AI_URL, {
      method: "POST",
      headers: aiHeaders,
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools,
        stream: false,
      }),
    });

    if (!firstResp.ok) {
      const status = firstResp.status;
      if (status === 429) return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "يرجى إضافة رصيد لحساب Lovable AI." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await firstResp.text();
      console.error("AI error:", status, t);
      return new Response(JSON.stringify({ error: "خطأ في خدمة الذكاء الاصطناعي" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const firstResult = await firstResp.json();
    const choice = firstResult.choices?.[0];
    const toolCalls = choice?.message?.tool_calls;

    // If no tool calls, stream the content back as SSE
    if (!toolCalls || toolCalls.length === 0) {
      const content = choice?.message?.content || "";
      // Make a streaming call for better UX on regular responses
      const streamResp = await fetch(AI_URL, {
        method: "POST",
        headers: aiHeaders,
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
        }),
      });
      if (!streamResp.ok || !streamResp.body) {
        // Fallback: send the non-streamed content as SSE
        const body = `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`;
        return new Response(body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }
      return new Response(streamResp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
    }

    // Execute tool calls
    const toolResults = [];
    for (const tc of toolCalls) {
      const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
      const result = await executeTool(supabase, tc.function.name, args);
      toolResults.push({ tool_call_id: tc.id, role: "tool" as const, content: result });
    }

    // Second call: streaming with tool results
    const secondResp = await fetch(AI_URL, {
      method: "POST",
      headers: aiHeaders,
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          choice.message,
          ...toolResults,
        ],
        stream: true,
      }),
    });

    if (!secondResp.ok || !secondResp.body) {
      // Fallback: return tool results as text
      const summary = toolResults.map((r) => r.content).join("\n");
      const body = `data: ${JSON.stringify({ choices: [{ delta: { content: summary } }] })}\n\ndata: [DONE]\n\n`;
      return new Response(body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
    }

    return new Response(secondResp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
