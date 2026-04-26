"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const C = {
  primary:"#F2B705",primaryLight:"#FFF8E1",primaryText:"#1A1A1A",
  dark:"#1A1A1A",bg:"#F5F5F3",card:"#FFFFFF",
  text:"#1A1A1A",textSec:"#5A5A5A",textTer:"#9A9A9A",
  border:"#E5E5E5",green:"#2E7D32",greenLight:"#E8F5E9",
  amber:"#E65100",amberLight:"#FFF3E0",
};

const SVC_LIST = ["Arquiteto","Engenheiro","Elétrica","Hidráulica","Pedreiro","Climatização","Pintor","Marceneiro","Vidraceiro","Gesseiro","Pré Moldados"];

async function generateCode(): Promise<string> {
  const { data } = await supabase.from("public_requests").select("code").order("created_at", { ascending: false }).limit(1);
  if (!data || data.length === 0) return "AA00001";
  const last = data[0].code;
  const letters = last.slice(0, 2);
  const num = parseInt(last.slice(2)) + 1;
  if (num > 99999) {
    const l1 = letters[0];
    const l2 = letters[1];
    if (l2 === "Z") return String.fromCharCode(l1.charCodeAt(0) + 1) + "A00001";
    return l1 + String.fromCharCode(l2.charCodeAt(0) + 1) + "00001";
  }
  return letters + String(num).padStart(5, "0");
}

export default function PublicRequestPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"form"|"done"|"list">("list");
  const [requests, setRequests] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [form, setForm] = useState({ area:"", services:new Set<string>(), timeline:"", buildingType:"", dumpster:null as boolean|null, description:"", city:"" });
  const [createdCode, setCreatedCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);
      const { data: reqs } = await supabase.from("public_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setRequests(reqs || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const loadResponses = async (reqId: string) => {
    const { data } = await supabase.from("request_responses").select("*").eq("request_id", reqId).order("created_at", { ascending: true });
    setResponses(data || []);
  };

  const toggleService = (s: string) => { const n = new Set(form.services); n.has(s)?n.delete(s):n.add(s); setForm({...form, services:n}); };
  const formValid = form.area && form.services.size > 0 && form.timeline && form.buildingType && form.dumpster !== null;

  const handleSubmit = async () => {
    if (!formValid || !profile) return;
    setSubmitting(true);
    const code = await generateCode();
    const { data, error } = await supabase.from("public_requests").insert({
      user_id: profile.id,
      user_name: profile.full_name,
      code,
      area_m2: Number(form.area),
      services: Array.from(form.services),
      timeline: form.timeline,
      building_type: form.buildingType,
      include_dumpster: form.dumpster,
      description: form.description,
      city: form.city || "Santos, SP",
      status: "open",
    }).select().single();
    if (data) {
      setRequests(prev => [data, ...prev]);
      setCreatedCode(code);
      setStep("done");
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ color:C.textSec,fontSize:14 }}>Carregando...</div>
    </div>
  );

  // ═══ SUCCESS SCREEN ═══
  if (step === "done") return (
    <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff" }}>
        <div style={{ maxWidth:600,margin:"0 auto",fontSize:17,fontWeight:700 }}>Orçamento Criado</div>
      </div>
      <div style={{ maxWidth:500,margin:"0 auto",padding:24,textAlign:"center" }}>
        <div style={{ width:72,height:72,borderRadius:36,background:C.greenLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"40px auto 20px",fontSize:32 }}>✅</div>
        <div style={{ fontSize:22,fontWeight:800,color:C.text,marginBottom:8 }}>Solicitação publicada!</div>
        <div style={{ fontSize:14,color:C.textSec,marginBottom:24 }}>Prestadores das categorias selecionadas poderão responder sua solicitação.</div>
        <div style={{ background:C.primaryLight,borderRadius:14,padding:20,marginBottom:24 }}>
          <div style={{ fontSize:12,color:C.textSec,marginBottom:6 }}>Código do orçamento</div>
          <div style={{ fontSize:32,fontWeight:900,color:C.primaryText,letterSpacing:3 }}>{createdCode}</div>
          <div style={{ fontSize:12,color:C.textSec,marginTop:8 }}>Compartilhe este código com prestadores para que eles enviem propostas.</div>
        </div>
        <button onClick={() => { setStep("list"); setForm({ area:"",services:new Set(),timeline:"",buildingType:"",dumpster:null,description:"",city:"" }); }}
          style={{ width:"100%",padding:"14px 0",borderRadius:10,background:C.primary,color:C.primaryText,border:"none",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:10 }}>
          Ver minhas solicitações
        </button>
        <button onClick={() => router.push("/dashboard")}
          style={{ width:"100%",padding:"14px 0",borderRadius:10,background:"transparent",color:C.primary,border:`2px solid ${C.primary}`,fontSize:15,fontWeight:700,cursor:"pointer" }}>
          Voltar ao início
        </button>
      </div>
    </div>
  );

  // ═══ REQUEST DETAIL ═══
  if (selectedReq) return (
    <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
        <button onClick={() => { setSelectedReq(null); setResponses([]); }} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div><div style={{ fontSize:17,fontWeight:700 }}>Solicitação {selectedReq.code}</div><div style={{ fontSize:11,opacity:.6 }}>{Array.isArray(selectedReq.services)?selectedReq.services.join(", "):""}</div></div>
      </div>
      <div style={{ maxWidth:600,margin:"0 auto",padding:20 }}>
        <div style={{ background:C.card,borderRadius:14,padding:20,border:`1px solid ${C.border}`,marginBottom:16 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:12 }}>
            <span style={{ fontSize:16,fontWeight:800,color:C.text }}>Detalhes</span>
            <span style={{ fontSize:11,fontWeight:700,color:selectedReq.status==="open"?C.green:C.textTer,background:selectedReq.status==="open"?C.greenLight:C.bg,padding:"2px 10px",borderRadius:6 }}>{selectedReq.status==="open"?"Aberto":"Encerrado"}</span>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
            {[{l:"Área",v:`${selectedReq.area_m2}m²`},{l:"Prazo",v:selectedReq.timeline},{l:"Imóvel",v:selectedReq.building_type},{l:"Caçamba",v:selectedReq.include_dumpster?"Sim":"Não"}].map((d,i) => (
              <div key={i} style={{ padding:10,background:C.bg,borderRadius:8 }}><div style={{ fontSize:10,color:C.textTer,textTransform:"uppercase" }}>{d.l}</div><div style={{ fontSize:13,fontWeight:700,color:C.text,marginTop:2 }}>{d.v}</div></div>
            ))}
          </div>
          {selectedReq.description && <div style={{ marginTop:12,fontSize:13,color:C.textSec,lineHeight:1.6 }}>{selectedReq.description}</div>}
        </div>

        <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:10 }}>Propostas recebidas ({responses.length})</div>
        {responses.length === 0 ? (
          <div style={{ textAlign:"center",padding:30,background:C.card,borderRadius:14,border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:28,marginBottom:10 }}>⏳</div>
            <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:4 }}>Aguardando propostas</div>
            <div style={{ fontSize:13,color:C.textSec }}>Prestadores que atendem suas categorias serão notificados.</div>
          </div>
        ) : responses.map(r => (
          <div key={r.id} style={{ background:C.card,borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:40,height:40,borderRadius:20,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:700,fontSize:14 }}>{r.provider_name?.split(" ").map((w:string)=>w[0]).join("").slice(0,2)}</div>
                <div><div style={{ fontSize:14,fontWeight:700,color:C.text }}>{r.provider_name}</div><div style={{ fontSize:11,color:C.textSec }}>{r.execution_months} {r.execution_months===1?"mês":"meses"} de prazo</div></div>
              </div>
              <div style={{ textAlign:"right" }}><div style={{ fontSize:18,fontWeight:800,color:C.primary }}>R$ {r.total_amount?.toLocaleString("pt-BR")}</div></div>
            </div>
            {r.message && <div style={{ fontSize:13,color:C.textSec,lineHeight:1.5,marginBottom:10,padding:10,background:C.bg,borderRadius:8 }}>{r.message}</div>}
            <div style={{ display:"flex",gap:8 }}>
              <button style={{ flex:1,padding:"10px 0",borderRadius:8,background:C.green,color:"#fff",border:"none",fontSize:13,fontWeight:700,cursor:"pointer" }}>✓ Aceitar</button>
              <button style={{ flex:1,padding:"10px 0",borderRadius:8,background:"transparent",color:C.textSec,border:`1.5px solid ${C.border}`,fontSize:13,fontWeight:700,cursor:"pointer" }}>Recusar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══ FORM ═══
  if (step === "form") return (
    <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
        <button onClick={() => setStep("list")} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ fontSize:17,fontWeight:700 }}>Nova Solicitação Geral</div>
      </div>
      <div style={{ maxWidth:500,margin:"0 auto",padding:20 }}>
        <div style={{ background:C.primaryLight,borderRadius:12,padding:14,marginBottom:18,display:"flex",gap:10 }}>
          <span style={{ fontSize:18 }}>📢</span>
          <div style={{ fontSize:12,color:"#7a6000",lineHeight:1.6 }}>Solicitação pública. Você pode selecionar múltiplas categorias. Um código será gerado para prestadores responderem.</div>
        </div>

        <label style={{ display:"block",fontSize:13,fontWeight:700,color:C.text,marginBottom:6 }}>Área (m²) *</label>
        <input type="number" value={form.area} onChange={e => setForm({...form,area:e.target.value})} placeholder="Ex: 45"
          style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:16,outline:"none",boxSizing:"border-box",background:C.card,color:C.text }} />

        <label style={{ display:"block",fontSize:13,fontWeight:700,color:C.text,marginBottom:8 }}>Categorias desejadas * (selecione múltiplas)</label>
        <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:16 }}>
          {SVC_LIST.map(s => (
            <button key={s} onClick={() => toggleService(s)} style={{ padding:"8px 14px",borderRadius:8,border:`1.5px solid ${form.services.has(s)?C.primary:C.border}`,background:form.services.has(s)?C.primaryLight:C.card,cursor:"pointer",fontSize:12,fontWeight:600,color:form.services.has(s)?"#7a6000":C.textSec }}>
              {form.services.has(s) ? "✓ " : ""}{s}
            </button>
          ))}
        </div>

        <label style={{ display:"block",fontSize:13,fontWeight:700,color:C.text,marginBottom:6 }}>Prazo desejado *</label>
        <select value={form.timeline} onChange={e => setForm({...form,timeline:e.target.value})} style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:16,background:C.card,color:form.timeline?C.text:C.textTer }}>
          <option value="">Selecione...</option><option>Até 15 dias</option><option>Até 1 mês</option><option>Até 2 meses</option><option>Até 3 meses</option><option>Até 6 meses</option><option>Sem urgência</option>
        </select>

        <label style={{ display:"block",fontSize:13,fontWeight:700,color:C.text,marginBottom:8 }}>Tipo de imóvel *</label>
        <div style={{ display:"flex",gap:10,marginBottom:16 }}>
          {[{e:"🏠",l:"Casa"},{e:"🏢",l:"Prédio/Apto"}].map(o => (
            <button key={o.l} onClick={() => setForm({...form,buildingType:o.l})} style={{ flex:1,padding:14,borderRadius:10,border:`1.5px solid ${form.buildingType===o.l?C.primary:C.border}`,background:form.buildingType===o.l?C.primaryLight:C.card,cursor:"pointer",textAlign:"center" }}>
              <div style={{ fontSize:28,marginBottom:4 }}>{o.e}</div>
              <div style={{ fontSize:12,fontWeight:600,color:form.buildingType===o.l?"#7a6000":C.textSec }}>{o.l}</div>
            </button>
          ))}
        </div>

        <label style={{ display:"block",fontSize:13,fontWeight:700,color:C.text,marginBottom:8 }}>Incluir caçamba? *</label>
        <div style={{ display:"flex",gap:10,marginBottom:16 }}>
          {[{l:"Sim",v:true},{l:"Não",v:false}].map(o => (
            <button key={String(o.v)} onClick={() => setForm({...form,dumpster:o.v})} style={{ flex:1,padding:12,borderRadius:10,border:`1.5px solid ${form.dumpster===o.v?(o.v?C.green:C.amber):C.border}`,background:form.dumpster===o.v?(o.v?C.greenLight:C.amberLight):C.card,cursor:"pointer",fontSize:12,fontWeight:600,color:form.dumpster===o.v?(o.v?C.green:C.amber):C.textSec }}>{o.l}</button>
          ))}
        </div>

        <label style={{ display:"block",fontSize:13,fontWeight:700,color:C.text,marginBottom:6 }}>Descreva o serviço (opcional)</label>
        <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Ex: Preciso reformar 2 banheiros e trocar toda a fiação elétrica..."
          style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:16,outline:"none",boxSizing:"border-box",background:C.card,color:C.text,minHeight:80,resize:"vertical",fontFamily:"inherit" }} />

        <label style={{ display:"block",fontSize:13,fontWeight:700,color:C.text,marginBottom:6 }}>Cidade</label>
        <input value={form.city} onChange={e => setForm({...form,city:e.target.value})} placeholder="Ex: Santos, SP"
          style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:20,outline:"none",boxSizing:"border-box",background:C.card,color:C.text }} />

        <button onClick={handleSubmit} disabled={!formValid||submitting} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:formValid&&!submitting?C.primary:C.textTer,color:C.primaryText,border:"none",fontSize:15,fontWeight:700,cursor:formValid&&!submitting?"pointer":"default" }}>
          {submitting ? "Publicando..." : "Publicar solicitação"}
        </button>
      </div>
    </div>
  );

  // ═══ LIST ═══
  return (
    <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
        <button onClick={() => router.push("/dashboard")} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ flex:1,fontSize:17,fontWeight:700 }}>Meus Orçamentos</div>
        <button onClick={() => setStep("form")} style={{ padding:"6px 14px",borderRadius:8,background:C.primary,color:C.primaryText,border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>+ Novo</button>
      </div>
      <div style={{ maxWidth:600,margin:"0 auto",padding:20 }}>
        {requests.length === 0 ? (
          <div style={{ textAlign:"center",padding:40 }}>
            <div style={{ width:64,height:64,borderRadius:18,background:C.primaryLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28 }}>📢</div>
            <div style={{ fontSize:16,fontWeight:700,color:C.text,marginBottom:6 }}>Nenhuma solicitação</div>
            <div style={{ fontSize:13,color:C.textSec,lineHeight:1.6,marginBottom:20 }}>Crie uma solicitação geral para receber propostas de múltiplos prestadores.</div>
            <button onClick={() => setStep("form")} style={{ padding:"12px 28px",borderRadius:10,background:C.primary,color:C.primaryText,border:"none",fontSize:14,fontWeight:700,cursor:"pointer" }}>Criar solicitação</button>
          </div>
        ) : requests.map(r => (
          <button key={r.id} onClick={() => { setSelectedReq(r); loadResponses(r.id); }}
            style={{ display:"block",width:"100%",textAlign:"left",padding:16,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,marginBottom:10,cursor:"pointer" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ fontSize:16,fontWeight:800,color:C.primary,letterSpacing:1 }}>{r.code}</span>
                  <span style={{ fontSize:11,fontWeight:700,color:r.status==="open"?C.green:C.textTer,background:r.status==="open"?C.greenLight:C.bg,padding:"2px 8px",borderRadius:5 }}>{r.status==="open"?"Aberto":"Encerrado"}</span>
                </div>
                <div style={{ fontSize:12,color:C.textSec,marginTop:4 }}>{Array.isArray(r.services)?r.services.join(", "):""}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:12,color:C.textTer }}>{new Date(r.created_at).toLocaleDateString("pt-BR")}</div>
                <div style={{ fontSize:12,color:C.textSec,marginTop:2 }}>{r.area_m2}m² • {r.building_type}</div>
              </div>
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ fontSize:12,color:C.textSec }}>{r.timeline}</span>
              <span style={{ fontSize:12,color:C.primary,fontWeight:600 }}>Ver propostas →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}