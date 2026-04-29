"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const C = {
  primary:"#F2B705",primaryLight:"#332B00",primaryText:"#1A1A1A",
  dark:"#1A1A1A",bg:"#F2B705",card:"#1A1A1A",
  text:"#F0F0F0",textSec:"#CCCCCC",textTer:"#888888",
  border:"#333333",divider:"#2A2A2A",
  green:"#66BB6A",greenLight:"#1B3A1D",
  red:"#EF5350",redLight:"#3A1A1A",
  amber:"#FFB74D",amberLight:"#3A2A00",
};

export default function TenantPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [tab, setTab] = useState("home");
  const [showPay, setShowPay] = useState(false);
  const [payMethod, setPayMethod] = useState("pix");
  const [payMonth, setPayMonth] = useState("");
  const [paying, setPaying] = useState(false);
  const [payDone, setPayDone] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({ title:"", description:"", priority:"medium" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);
      // Find property where user is tenant (by email or id)
      const { data: props } = await supabase.from("properties").select("*").or(`tenant_id.eq.${user.id},tenant_email.eq.${p?.email}`);
      if (!props || props.length === 0) { setLoading(false); return; }
      const prop = props[0];
      setProperty(prop);
      // Update tenant_id if matched by email
      if (!prop.tenant_id && prop.tenant_email === p?.email) {
        await supabase.from("properties").update({ tenant_id: user.id, tenant_name: p?.full_name }).eq("id", prop.id);
      }
      const { data: pays } = await supabase.from("rental_payments").select("*").eq("property_id", prop.id).order("created_at", { ascending: false });
      setPayments(pays || []);
      const { data: tix } = await supabase.from("maintenance_tickets").select("*").eq("property_id", prop.id).order("created_at", { ascending: false });
      setTickets(tix || []);
      const { data: cts } = await supabase.from("contracts").select("*").eq("property_id", prop.id);
      setContracts(cts || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const handlePay = async () => {
    if (!property || !payMonth) return;
    setPaying(true);
    const total = property.rent_amount + (property.condo_amount || 0);
    const { data } = await supabase.from("rental_payments").insert({
      property_id: property.id, agency_id: property.agency_id, tenant_id: userId,
      tenant_name: profile?.full_name, month_ref: payMonth,
      rent_amount: property.rent_amount, condo_amount: property.condo_amount || 0,
      total_amount: total, payment_method: payMethod, status: "paid",
      paid_at: new Date().toISOString(), tenant_confirmed: true, agency_confirmed: false, landlord_confirmed: false,
    }).select().single();
    if (data) setPayments(prev => [data, ...prev]);
    setPaying(false);
    setPayDone(true);
  };

  const handleTicket = async () => {
    if (!property || !ticketForm.title) return;
    setSaving(true);
    const { data } = await supabase.from("maintenance_tickets").insert({
      property_id: property.id, agency_id: property.agency_id, opened_by: userId,
      opened_by_name: profile?.full_name, title: ticketForm.title,
      description: ticketForm.description, priority: ticketForm.priority, status: "open",
    }).select().single();
    if (data) setTickets(prev => [data, ...prev]);
    setSaving(false);
    setShowTicket(false);
    setTicketForm({ title:"", description:"", priority:"medium" });
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ textAlign:"center" }}><div style={{ width:48,height:48,borderRadius:12,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:900,fontSize:20,margin:"0 auto 16px" }}>FX</div><div style={{ color:"#1A1A1A" }}>Carregando...</div></div>
    </div>
  );

  if (!property) return (
    <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
        <button onClick={() => router.push("/dashboard")} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}><path d="M15 19l-7-7 7-7"/></svg></button>
        <div style={{ fontSize:17,fontWeight:700 }}>Meu Imóvel</div>
      </div>
      <div style={{ maxWidth:500,margin:"0 auto",padding:24,textAlign:"center" }}>
        <div style={{ fontSize:48,marginBottom:16 }}>🏠</div>
        <div style={{ fontSize:18,fontWeight:800,color:"#1A1A1A",marginBottom:8 }}>Nenhum imóvel vinculado</div>
        <div style={{ fontSize:14,color:"#333",lineHeight:1.6,marginBottom:24 }}>Você ainda não está vinculado como locatário de nenhum imóvel. Peça para sua imobiliária adicionar seu email.</div>
        <button onClick={() => router.push("/dashboard")} style={{ padding:"14px 28px",borderRadius:10,background:C.dark,color:C.primary,border:"none",fontSize:14,fontWeight:700,cursor:"pointer" }}>Voltar ao início</button>
      </div>
    </div>
  );

  const total = property.rent_amount + (property.condo_amount || 0);
  const activeContract = contracts.find(c => c.status === "signed" || c.status === "sent" || c.status === "tenant_signed");

  // ═══ PAYMENT SUCCESS ═══
  if (payDone) return (
    <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg,display:"flex",flexDirection:"column" }}>
      <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff" }}><div style={{ fontSize:17,fontWeight:700 }}>Pagamento</div></div>
      <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
        <div style={{ textAlign:"center",maxWidth:400 }}>
          <div style={{ width:72,height:72,borderRadius:36,background:C.greenLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",fontSize:32 }}>✅</div>
          <div style={{ fontSize:22,fontWeight:800,color:"#1A1A1A",marginBottom:6 }}>Pagamento Confirmado!</div>
          <div style={{ fontSize:16,fontWeight:700,color:"#1A1A1A" }}>R$ {total.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
          <div style={{ fontSize:13,color:"#333",marginTop:8,marginBottom:24 }}>Referente a {payMonth}. Sua imobiliária e proprietário serão notificados.</div>
          <button onClick={() => { setPayDone(false); setShowPay(false); setPayMonth(""); }} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:C.dark,color:C.primary,border:"none",fontSize:15,fontWeight:700,cursor:"pointer" }}>Voltar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg,display:"flex",flexDirection:"column" }}>

      {/* HEADER */}
      <div style={{ padding:"18px 20px 14px",background:C.dark,color:"#fff" }}>
        <div style={{ maxWidth:700,margin:"0 auto" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:32,height:32,borderRadius:8,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:900,fontSize:13 }}>FX</div>
              <div><div style={{ fontSize:11,opacity:.6 }}>Olá, {profile?.full_name?.split(" ")[0]}</div><div style={{ fontSize:16,fontWeight:800 }}>Fix<span style={{ color:C.primary }}>IMOB</span></div></div>
            </div>
            <button onClick={() => router.push("/dashboard")} style={{ padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,.1)",color:"#fff",border:"1px solid rgba(255,255,255,.2)",fontSize:12,fontWeight:600,cursor:"pointer" }}>← Menu</button>
          </div>
          <div style={{ background:"rgba(255,255,255,.06)",borderRadius:12,padding:14 }}>
            <div style={{ fontSize:11,opacity:.5 }}>Seu imóvel</div>
            <div style={{ fontSize:15,fontWeight:700,marginTop:2 }}>{property.address}</div>
            {property.unit && <div style={{ fontSize:12,opacity:.6,marginTop:2 }}>{property.unit}</div>}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:"flex",background:C.dark,borderBottom:"1px solid #333" }}>
        <div style={{ display:"flex",maxWidth:700,margin:"0 auto",width:"100%" }}>
          {[{k:"home",l:"Resumo"},{k:"payments",l:"Pagamentos"},{k:"tickets",l:"Chamados"},{k:"contract",l:"Contrato"}].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{ flex:1,padding:"10px 6px",background:"none",border:"none",borderBottom:tab===t.k?`3px solid ${C.primary}`:"3px solid transparent",color:tab===t.k?C.primary:C.textTer,fontSize:12,fontWeight:tab===t.k?700:500,cursor:"pointer" }}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={{ flex:1,overflow:"auto",paddingBottom:20 }}>
        <div style={{ maxWidth:700,margin:"0 auto",padding:20 }}>

          {/* ═══ HOME TAB ═══ */}
          {tab === "home" && <>
            {/* Next payment card */}
            {(() => {
              const now = new Date();
              const lastPay = payments.length > 0 ? payments[0] : null;
              const lastPayDate = lastPay ? new Date(lastPay.paid_at) : null;
              const diffHours = lastPayDate ? (now.getTime() - lastPayDate.getTime()) / (1000*60*60) : 999;
              const paid = lastPay && diffHours < 720;
              return (
                <div style={{ background:C.dark,borderRadius:16,padding:20,marginBottom:16 }}>
                  {paid ? (<>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                      <div style={{ width:28,height:28,borderRadius:14,background:C.greenLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>✓</div>
                      <div style={{ fontSize:14,fontWeight:700,color:C.green }}>Aluguel deste mês pago!</div>
                    </div>
                    <div style={{ fontSize:12,color:C.textSec,marginBottom:4 }}>Ref: {lastPay.month_ref} • {lastPay.payment_method?.toUpperCase()}</div>
                    <div style={{ fontSize:22,fontWeight:800,color:C.primary }}>R$ {lastPay.total_amount?.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
                    <div style={{ display:"flex",gap:6,marginTop:10 }}>
                      <span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,background:lastPay.tenant_confirmed?C.greenLight:C.amberLight,color:lastPay.tenant_confirmed?C.green:C.amber }}>Você ✓</span>
                      <span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,background:lastPay.agency_confirmed?C.greenLight:C.amberLight,color:lastPay.agency_confirmed?C.green:C.amber }}>Imob {lastPay.agency_confirmed?"✓":"⏳"}</span>
                      <span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,background:lastPay.landlord_confirmed?C.greenLight:C.amberLight,color:lastPay.landlord_confirmed?C.green:C.amber }}>Prop {lastPay.landlord_confirmed?"✓":"⏳"}</span>
                    </div>
                  </>) : (<>
                    <div style={{ fontSize:12,color:C.textTer,marginBottom:4 }}>Próximo pagamento</div>
                    <div style={{ fontSize:32,fontWeight:800,color:C.primary }}>R$ {total.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
                    <div style={{ display:"flex",gap:16,marginTop:10,fontSize:12 }}>
                      <div><span style={{ color:C.textTer }}>Aluguel: </span><span style={{ color:C.text,fontWeight:700 }}>R$ {property.rent_amount?.toLocaleString("pt-BR")}</span></div>
                      {property.condo_amount > 0 && <div><span style={{ color:C.textTer }}>Cond: </span><span style={{ color:C.text,fontWeight:700 }}>R$ {property.condo_amount?.toLocaleString("pt-BR")}</span></div>}
                    </div>
                    <button onClick={() => setShowPay(true)} style={{ width:"100%",marginTop:16,padding:"14px 0",borderRadius:10,background:C.primary,color:C.primaryText,border:"none",fontSize:15,fontWeight:700,cursor:"pointer" }}>Pagar agora</button>
                  </>)}
                </div>
              );
            })()}

            {/* Quick actions */}
            <div style={{ fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:10 }}>Ações rápidas</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20 }}>
              {[
                {icon:"🔧",label:"Abrir chamado",action:() => { setTab("tickets"); setShowTicket(true); }},
                {icon:"📄",label:"Ver contrato",action:() => setTab("contract")},
                {icon:"💬",label:"Chat imobiliária",action:() => router.push("/dashboard")},
                {icon:"🏗️",label:"Marketplace",action:() => router.push("/dashboard")},
              ].map((a,i) => (
                <button key={i} onClick={a.action} style={{ padding:16,background:C.dark,borderRadius:12,border:"none",cursor:"pointer",textAlign:"center" }}>
                  <div style={{ fontSize:24,marginBottom:6 }}>{a.icon}</div>
                  <div style={{ fontSize:12,fontWeight:700,color:C.primary }}>{a.label}</div>
                </button>
              ))}
            </div>

            {/* Recent activity */}
            <div style={{ fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:10 }}>Últimos pagamentos</div>
            {payments.length === 0 ? <div style={{ textAlign:"center",padding:20,color:"#555",fontSize:13 }}>Nenhum pagamento registrado</div>
            : payments.slice(0,3).map(p => (
              <div key={p.id} style={{ background:C.dark,borderRadius:12,padding:14,marginBottom:8 }}>
                <div style={{ display:"flex",justifyContent:"space-between" }}>
                  <span style={{ fontSize:13,fontWeight:700,color:C.text }}>{p.month_ref}</span>
                  <span style={{ fontSize:13,fontWeight:800,color:C.primary }}>R$ {p.total_amount?.toLocaleString("pt-BR")}</span>
                </div>
                <div style={{ display:"flex",gap:6,marginTop:8 }}>
                  <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:p.tenant_confirmed?C.greenLight:C.amberLight,color:p.tenant_confirmed?C.green:C.amber }}>Você {p.tenant_confirmed?"✓":"⏳"}</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:p.agency_confirmed?C.greenLight:C.amberLight,color:p.agency_confirmed?C.green:C.amber }}>Imob {p.agency_confirmed?"✓":"⏳"}</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:p.landlord_confirmed?C.greenLight:C.amberLight,color:p.landlord_confirmed?C.green:C.amber }}>Prop {p.landlord_confirmed?"✓":"⏳"}</span>
                </div>
              </div>
            ))}
          </>}

          {/* ═══ PAYMENTS TAB ═══ */}
          {tab === "payments" && <>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:12 }}>
              <span style={{ fontSize:14,fontWeight:700,color:"#1A1A1A" }}>Pagamentos</span>
              <button onClick={() => setShowPay(true)} style={{ padding:"6px 14px",borderRadius:8,background:C.dark,color:C.primary,border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>+ Pagar</button>
            </div>
            {payments.length === 0 ? <div style={{ textAlign:"center",padding:30,color:"#555",fontSize:13 }}>Nenhum pagamento</div>
            : payments.map(p => (
              <div key={p.id} style={{ background:C.dark,borderRadius:12,padding:14,marginBottom:8 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontSize:14,fontWeight:700,color:C.text }}>{p.month_ref}</span>
                  <span style={{ fontSize:14,fontWeight:800,color:C.primary }}>R$ {p.total_amount?.toLocaleString("pt-BR")}</span>
                </div>
                <div style={{ display:"flex",gap:8,fontSize:12,color:C.textSec,marginBottom:8 }}>
                  <span>Aluguel: R$ {p.rent_amount?.toLocaleString("pt-BR")}</span>
                  {p.condo_amount > 0 && <span>Cond: R$ {p.condo_amount?.toLocaleString("pt-BR")}</span>}
                </div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  <span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,background:p.tenant_confirmed?C.greenLight:C.amberLight,color:p.tenant_confirmed?C.green:C.amber }}>Locatário {p.tenant_confirmed?"✓":"⏳"}</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,background:p.agency_confirmed?C.greenLight:C.amberLight,color:p.agency_confirmed?C.green:C.amber }}>Imobiliária {p.agency_confirmed?"✓":"⏳"}</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,background:p.landlord_confirmed?C.greenLight:C.amberLight,color:p.landlord_confirmed?C.green:C.amber }}>Proprietário {p.landlord_confirmed?"✓":"⏳"}</span>
                </div>
                <div style={{ fontSize:11,color:C.textTer,marginTop:8 }}>{p.payment_method?.toUpperCase()} • {new Date(p.paid_at).toLocaleDateString("pt-BR")}</div>
              </div>
            ))}
          </>}

          {/* ═══ TICKETS TAB ═══ */}
          {tab === "tickets" && <>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:12 }}>
              <span style={{ fontSize:14,fontWeight:700,color:"#1A1A1A" }}>Chamados</span>
              <button onClick={() => setShowTicket(true)} style={{ padding:"6px 14px",borderRadius:8,background:C.dark,color:C.primary,border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>+ Novo</button>
            </div>
            {tickets.length === 0 ? <div style={{ textAlign:"center",padding:30,color:"#555",fontSize:13 }}>Nenhum chamado aberto</div>
            : tickets.map(t => (
              <div key={t.id} style={{ background:C.dark,borderRadius:12,padding:14,marginBottom:8 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <span style={{ fontSize:13,fontWeight:700,color:C.text }}>{t.title}</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:t.status==="open"?C.redLight:t.status==="in_progress"?C.amberLight:C.greenLight,color:t.status==="open"?C.red:t.status==="in_progress"?C.amber:C.green }}>
                    {t.status==="open"?"Aberto":t.status==="in_progress"?"Em andamento":"Resolvido"}
                  </span>
                </div>
                {t.description && <div style={{ fontSize:12,color:C.textSec,marginTop:4,lineHeight:1.5 }}>{t.description}</div>}
                <div style={{ fontSize:11,color:C.textTer,marginTop:6 }}>
                  {new Date(t.created_at).toLocaleDateString("pt-BR")} • Prioridade: {t.priority==="high"?"Alta":t.priority==="medium"?"Média":"Baixa"}
                </div>
              </div>
            ))}
          </>}

          {/* ═══ CONTRACT TAB ═══ */}
          {tab === "contract" && <>
            <div style={{ fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:12 }}>Contrato</div>
            {!activeContract ? <div style={{ textAlign:"center",padding:30,color:"#555",fontSize:13 }}>Nenhum contrato ativo</div>
            : (
              <div style={{ background:C.dark,borderRadius:16,overflow:"hidden" }}>
                <div style={{ padding:20 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:12 }}>
                    <span style={{ fontSize:16,fontWeight:800,color:C.text }}>Contrato de Locação</span>
                    <span style={{ fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:6,background:activeContract.status==="signed"?C.greenLight:C.amberLight,color:activeContract.status==="signed"?C.green:C.amber }}>
                      {activeContract.status==="signed"?"✓ Assinado":activeContract.status==="tenant_signed"?"Você assinou":activeContract.status==="sent"?"Aguardando assinatura":"Rascunho"}
                    </span>
                  </div>
                  <div style={{ fontSize:13,color:C.textSec,lineHeight:1.8 }}>
                    <div>Locador: <strong style={{ color:C.text }}>{activeContract.landlord_name}</strong></div>
                    <div>Locatário: <strong style={{ color:C.text }}>{activeContract.tenant_name}</strong></div>
                    <div>Vigência: <strong style={{ color:C.text }}>{activeContract.start_date} a {activeContract.end_date}</strong></div>
                    <div>Aluguel: <strong style={{ color:C.primary }}>R$ {activeContract.rent_amount?.toLocaleString("pt-BR")}/mês</strong></div>
                    {activeContract.condo_amount > 0 && <div>Condomínio: <strong style={{ color:C.text }}>R$ {activeContract.condo_amount?.toLocaleString("pt-BR")}/mês</strong></div>}
                  </div>

                  {activeContract.status === "sent" && (
                    <div style={{ marginTop:16 }}>
                      <div style={{ padding:12,background:C.primaryLight,borderRadius:10,marginBottom:12,fontSize:12,color:C.primary,lineHeight:1.6 }}>
                        Leia os termos do contrato acima. Ao clicar em "Assinar", você declara que leu e concorda com todas as cláusulas.
                      </div>
                      <button onClick={async () => {
                        await supabase.from("contracts").update({ status:"tenant_signed" }).eq("id", activeContract.id);
                        setContracts(prev => prev.map(c => c.id === activeContract.id ? {...c, status:"tenant_signed"} : c));
                      }} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:C.primary,color:C.primaryText,border:"none",fontSize:15,fontWeight:700,cursor:"pointer" }}>
                        Li e concordo — Assinar contrato
                      </button>
                    </div>
                  )}

                  {activeContract.status === "tenant_signed" && (
                    <div style={{ marginTop:16,padding:12,background:C.primaryLight,borderRadius:10,fontSize:12,color:C.primary,lineHeight:1.6 }}>
                      ✓ Você assinou este contrato. Aguardando assinatura do proprietário.
                    </div>
                  )}

                  {activeContract.status === "signed" && activeContract.signed_at && (
                    <div style={{ marginTop:16,padding:12,background:C.greenLight,borderRadius:10,fontSize:12,color:C.green,lineHeight:1.6 }}>
                      ✓ Contrato assinado por ambas as partes em {new Date(activeContract.signed_at).toLocaleDateString("pt-BR")}.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>}
        </div>
      </div>

      {/* ═══ PAY MODAL ═══ */}
      {showPay && <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:50,display:"flex",alignItems:"flex-end",justifyContent:"center" }}>
        <div style={{ background:C.dark,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:500,maxHeight:"80vh",overflow:"auto",padding:24 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:16 }}>
            <span style={{ fontSize:16,fontWeight:700,color:C.text }}>Pagar aluguel</span>
            <button onClick={() => setShowPay(false)} style={{ background:"none",border:"none",cursor:"pointer",color:C.textTer,fontSize:18 }}>✕</button>
          </div>
          <div style={{ background:C.primaryLight,borderRadius:12,padding:14,marginBottom:16 }}>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:C.textSec,marginBottom:4 }}><span>Aluguel</span><span style={{ fontWeight:700,color:C.text }}>R$ {property.rent_amount?.toLocaleString("pt-BR")}</span></div>
            {property.condo_amount > 0 && <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:C.textSec,marginBottom:4 }}><span>Condomínio</span><span style={{ fontWeight:700,color:C.text }}>R$ {property.condo_amount?.toLocaleString("pt-BR")}</span></div>}
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:800,color:C.primary,paddingTop:8,borderTop:"1px solid #444" }}><span>Total</span><span>R$ {total.toLocaleString("pt-BR",{minimumFractionDigits:2})}</span></div>
          </div>
          <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6 }}>Mês referência *</label>
          <input value={payMonth} onChange={e => setPayMonth(e.target.value)} placeholder="Ex: Mai/2026" style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:12,outline:"none",background:"#2A2A2A",color:"#F0F0F0",boxSizing:"border-box" }} />
          <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:8 }}>Método</label>
          {[{k:"pix",l:"PIX",i:"⚡"},{k:"credit",l:"Crédito",i:"💳"},{k:"debit",l:"Débito",i:"💳"},{k:"boleto",l:"Boleto",i:"📄"}].map(m => (
            <button key={m.k} onClick={() => setPayMethod(m.k)} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:payMethod===m.k?C.primaryLight:"#2A2A2A",border:`1.5px solid ${payMethod===m.k?C.primary:"#444"}`,borderRadius:10,marginBottom:6,cursor:"pointer",width:"100%",textAlign:"left" }}>
              <span style={{ fontSize:18 }}>{m.i}</span>
              <span style={{ fontSize:13,fontWeight:700,color:payMethod===m.k?C.primary:C.text }}>{m.l}</span>
            </button>
          ))}
          <button onClick={handlePay} disabled={!payMonth||paying} style={{ width:"100%",marginTop:12,padding:"14px 0",borderRadius:10,background:payMonth&&!paying?C.primary:C.textTer,color:C.primaryText,border:"none",fontSize:15,fontWeight:700,cursor:payMonth&&!paying?"pointer":"default" }}>
            {paying ? "Processando..." : `Pagar R$ ${total.toLocaleString("pt-BR",{minimumFractionDigits:2})}`}
          </button>
        </div>
      </div>}

      {/* ═══ TICKET MODAL ═══ */}
      {showTicket && <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:50,display:"flex",alignItems:"flex-end",justifyContent:"center" }}>
        <div style={{ background:C.dark,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:500,maxHeight:"80vh",overflow:"auto",padding:24 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:16 }}>
            <span style={{ fontSize:16,fontWeight:700,color:C.text }}>Novo Chamado</span>
            <button onClick={() => setShowTicket(false)} style={{ background:"none",border:"none",cursor:"pointer",color:C.textTer,fontSize:18 }}>✕</button>
          </div>
          <input value={ticketForm.title} onChange={e => setTicketForm({...ticketForm,title:e.target.value})} placeholder="Título do problema"
            style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:10,outline:"none",background:"#2A2A2A",color:"#F0F0F0",boxSizing:"border-box" }} />
          <textarea value={ticketForm.description} onChange={e => setTicketForm({...ticketForm,description:e.target.value})} placeholder="Descreva o problema..."
            style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:10,outline:"none",background:"#2A2A2A",color:"#F0F0F0",boxSizing:"border-box",minHeight:60,resize:"vertical",fontFamily:"inherit" }} />
          <select value={ticketForm.priority} onChange={e => setTicketForm({...ticketForm,priority:e.target.value})}
            style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:16,background:"#2A2A2A",color:"#F0F0F0" }}>
            <option value="low">Prioridade: Baixa</option><option value="medium">Prioridade: Média</option><option value="high">Prioridade: Alta</option>
          </select>
          <button onClick={handleTicket} disabled={!ticketForm.title||saving} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:ticketForm.title&&!saving?C.primary:C.textTer,color:C.primaryText,border:"none",fontSize:14,fontWeight:700,cursor:ticketForm.title&&!saving?"pointer":"default" }}>
            {saving ? "Salvando..." : "Abrir chamado"}
          </button>
        </div>
      </div>}
    </div>
  );
}