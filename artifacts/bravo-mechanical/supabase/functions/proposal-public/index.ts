import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Public proposal endpoint. No JWT: the customer is not a logged-in user.
// Access is gated by an unguessable share_token and all DB access uses the
// service role, scoped to the single estimate matching the token.
// Deployed with verify_jwt = false.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let token = new URL(req.url).searchParams.get("token") || "";
  let action = "";
  let signerName = "";
  let declineReason = "";
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({} as Record<string, string>));
    token = body.token || token;
    action = body.action || "";
    signerName = (body.signerName || "").trim();
    declineReason = (body.declineReason || "").trim();
  }
  if (!token) return json({ error: "Missing token" }, 400);

  const { data: est, error } = await admin
    .from("estimates").select("*").eq("share_token", token).maybeSingle();
  if (error || !est) return json({ error: "Proposal not found" }, 404);

  const today = new Date(new Date().toISOString().slice(0, 10));
  const expired = !!est.expiration_date && new Date(est.expiration_date) < today;
  const open = est.status === "sent" || est.status === "viewed";

  if (req.method === "GET") {
    if (est.status === "sent") {
      await admin.from("estimates")
        .update({ status: "viewed", viewed_at: new Date().toISOString() })
        .eq("id", est.id);
      est.status = "viewed";
    }
    const { data: items } = await admin
      .from("estimate_line_items")
      .select("description,item_type,quantity,unit_price,total,sort_order")
      .eq("estimate_id", est.id).order("sort_order");
    const { data: cust } = await admin
      .from("customers").select("name,first_name,last_name,email")
      .eq("id", est.customer_id).maybeSingle();
    const customerName = cust?.name ||
      [cust?.first_name, cust?.last_name].filter(Boolean).join(" ") || "";
    return json({
      proposal: {
        estimate_number: est.estimate_number,
        status: est.status,
        scope_of_work: est.scope_of_work,
        customer_notes: est.customer_notes,
        subtotal: est.subtotal,
        tax_rate: est.tax_rate,
        tax_amount: est.tax_amount,
        discount_amount: est.discount_amount,
        total: est.total,
        expiration_date: est.expiration_date,
        terms_and_conditions: est.terms_and_conditions,
        approved_at: est.approved_at,
        declined_at: est.declined_at,
        signed_at: est.signed_at,
        signer: est.customer_signature_url,
        decline_reason: est.decline_reason,
        expired,
        customer_name: customerName,
      },
      line_items: items || [],
    });
  }

  if (action === "accept") {
    if (!signerName) return json({ error: "Please type your full name to sign." }, 400);
    if (!open) return json({ error: `This proposal can no longer be accepted (status: ${est.status}).` }, 409);
    if (expired) return json({ error: "This proposal has expired. Please contact us for an updated quote." }, 409);
    await admin.from("estimates").update({
      status: "approved",
      approved_at: new Date().toISOString(),
      signed_at: new Date().toISOString(),
      customer_signature_url: signerName,
    }).eq("id", est.id);
    return json({ ok: true, status: "approved" });
  }

  if (action === "decline") {
    if (!open) return json({ error: `This proposal can no longer be declined (status: ${est.status}).` }, 409);
    await admin.from("estimates").update({
      status: "declined",
      declined_at: new Date().toISOString(),
      decline_reason: declineReason || null,
    }).eq("id", est.id);
    return json({ ok: true, status: "declined" });
  }

  return json({ error: "Unknown action" }, 400);
});
