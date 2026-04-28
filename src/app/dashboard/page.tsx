"use client";
import { useEffect, useState, useRef } from "react";
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

const paths: Record<string,string> = {
  home:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1",
  search:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  chat:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  user:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  star:"M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  check:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  shield:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  chevRight:"M9 5l7 7-7 7",
  back:"M15 19l-7-7 7-7",
  edit:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  location:"M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
  bell:"M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  flag:"M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9",
  gift:"M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7",
  logout:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  send:"M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
  lock:"M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  clipboard:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
};
function Ic({name,size=20,color=C.textSec}:{name:string;size?:number;color?:string}){
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]||""}/></svg>;
}

const CATS = ["Todos","Arquiteto","Engenheiro","Elétrica","Hidráulica","Pedreiro","Climatização","Pintor","Marceneiro","Vidraceiro","Gesseiro"];
const SVC_LIST = ["Arquiteto","Engenheiro","Elétrica","Hidráulica","Pedreiro","Climatização","Pintor","Marceneiro","Vidraceiro","Gesseiro","Pré Moldados"];

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("home");
  const [providers, setProviders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ phone:"", email:"" });
  const [saving, setSaving] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvo, setActiveConvo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  // Checklist & Proposal
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklist, setChecklist] = useState({ area:"", services:new Set<string>(), timeline:"", buildingType:"", dumpster:null as boolean|null });
  const [proposals, setProposals] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeProposal, setActiveProposal] = useState<any>(null);
  const [payMethod, setPayMethod] = useState("pix");
  const [negotiatingId, setNegotiatingId] = useState<string|null>(null);
  const [counterOffer, setCounterOffer] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [payDone, setPayDone] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);
      setEditForm({ phone: p?.phone || "", email: p?.email || "" });
      const { data: provs } = await supabase.from("providers").select("*").order("rating", { ascending: false });
      setProviders(provs || []);
      const { data: convos } = await supabase.from("conversations").select("*").eq("user_id", user.id).order("last_message_at", { ascending: false });
      setConversations(convos || []);
      const { data: props } = await supabase.from("proposals").select("*").eq("client_id", user.id);
      setProposals(props || []);
      setLoading(false);
    }
    load();
  }, [router]);

  useEffect(() => {
    if (!activeConvo) return;
    const channel = supabase.channel(`msgs-${activeConvo.id}`)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:`conversation_id=eq.${activeConvo.id}`},
        (payload) => { setMessages(prev => [...prev, payload.new]); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvo]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };
  const handleSaveProfile = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { await supabase.from("profiles").update({ phone:editForm.phone, email:editForm.email }).eq("id", user.id); setProfile({...profile, phone:editForm.phone, email:editForm.email}); }
    setSaving(false); setEditMode(false);
  };

  const openConversation = async (convo: any) => {
    setActiveConvo(convo); setTab("chat"); setSelectedProvider(null); setShowChecklist(false);
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", convo.id).order("created_at", { ascending: true });
    setMessages(data || []);
    const { data: freshProps } = await supabase.from("proposals").select("*").eq("client_id", userId);
    setProposals(freshProps || []);
  };

  const sendMessage = async () => {
    if (!msgInput.trim() || !activeConvo || sendingMsg) return;
    setSendingMsg(true); const msg = msgInput.trim(); setMsgInput("");
    await supabase.from("messages").insert({ conversation_id:activeConvo.id, sender_id:userId, sender_name:profile?.full_name||"Você", content:msg });
    await supabase.from("conversations").update({ last_message:msg, last_message_at:new Date().toISOString() }).eq("id", activeConvo.id);
    setConversations(prev => prev.map(c => c.id === activeConvo.id ? {...c, last_message:msg, last_message_at:new Date().toISOString()} : c));
    setSendingMsg(false);
  };

  const toggleService = (s: string) => { const n = new Set(checklist.services); n.has(s)?n.delete(s):n.add(s); setChecklist({...checklist, services:n}); };
  const checklistValid = checklist.area && checklist.timeline && checklist.buildingType && checklist.dumpster !== null;

  const submitChecklist = async () => {
    if (!selectedProvider || !checklistValid) return;
    // Create or find conversation
    const provId = String(selectedProvider.id);
    let convo = conversations.find(c => String(c.provider_id) === provId);
    if (!convo) {
      const { data, error } = await supabase.from("conversations").insert({
        user_id:userId, provider_id:provId, provider_name:selectedProvider.name,
        provider_initials:selectedProvider.avatar_initials, last_message:"Checklist enviado", last_message_at:new Date().toISOString(),
      }).select().single();
      if (error) { console.error(error); return; }
      convo = data;
      if (convo) setConversations(prev => [convo!, ...prev]);
    } else {
      await supabase.from("conversations").update({ last_message:"Checklist enviado", last_message_at:new Date().toISOString() }).eq("id", convo.id);
    }
    if (!convo) return;
    // Create service request
    const { data: sr } = await supabase.from("service_requests").insert({
      user_id:userId, provider_id:String(selectedProvider.id), provider_name:selectedProvider.name,
      conversation_id:convo.id, area_m2:Number(checklist.area), services:[selectedProvider.category],
      timeline:checklist.timeline, building_type:checklist.buildingType, include_dumpster:checklist.dumpster, status:"pending",
    }).select().single();
    // Send checklist as message
    const svcText = selectedProvider.category;
    const checkMsg = `📋 CHECKLIST ENVIADO\n• Área: ${checklist.area}m²\n• Serviços: ${svcText}\n• Prazo: ${checklist.timeline}\n• Imóvel: ${checklist.buildingType}\n• Caçamba: ${checklist.dumpster ? "Sim" : "Não"}`;
    await supabase.from("messages").insert({ conversation_id:convo.id, sender_id:userId, sender_name:profile?.full_name||"Você", content:checkMsg });
    await supabase.from("conversations").update({ last_message:"Checklist enviado", last_message_at:new Date().toISOString() }).eq("id", convo.id);
    // Auto-generate proposal (simulating provider response)
    const area = Number(checklist.area);
    const basePrice = area * (180 + Math.random()*120);
    const propItems = [
      { description: selectedProvider.category + " - Mão de obra", value: Math.round(basePrice * 0.6) },
      { description: "Material", value: Math.round(basePrice * 0.3) },
      { description: "Acabamento", value: Math.round(basePrice * 0.1) },
    ];
    const total = propItems.reduce((a,b) => a + b.value, 0);
    
    const { data: prop } = await supabase.from("proposals").insert({
      service_request_id:sr?.id, conversation_id:convo.id, provider_id:String(selectedProvider.id),
      client_id:userId, items:propItems, total_amount:total, platform_fee_pct:10, execution_months:Math.max(1, Math.ceil(area/30)), status:"sent", provider_name:selectedProvider.name, provider_initials:selectedProvider.avatar_initials, provider_category:selectedProvider.category,
    }).select().single();
    if (prop) setProposals(prev => [...prev, prop]);
    // Send proposal as message
    const propMsg = `📄 PROPOSTA ENVIADA\nValor: R$ ${total.toLocaleString("pt-BR")}\nPrazo: ${Math.max(1,Math.ceil(Number(checklist.area)/30))} meses\nTaxa plataforma: 10%\n\n[proposal_id:${prop?.id}]`;
    await supabase.from("messages").insert({ conversation_id:convo.id, sender_id:"provider", sender_name:selectedProvider.name, content:propMsg });
    setChecklist({ area:"", services:new Set(), timeline:"", buildingType:"", dumpster:null });
    setShowChecklist(false);
    await new Promise(r => setTimeout(r, 500));
    await openConversation(convo);
  };

  const handleAcceptProposal = async (prop: any) => {
    await supabase.from("proposals").update({ status:"accepted" }).eq("id", prop.id);
    setProposals(prev => prev.map(p => p.id === prop.id ? {...p, status:"accepted"} : p));
    setActiveProposal(prop);
    setShowCheckout(true);
  };

  const handleCounterOffer = async (prop: any) => {
    if (!counterOffer || !activeConvo) return;
    const value = Number(counterOffer.replace(/\D/g, ""));
    if (value <= 0) return;
    await supabase.from("messages").insert({ conversation_id:activeConvo.id, sender_id:userId, sender_name:profile?.full_name||"Você",
      content:`💰 CONTRAPROPOSTA\nValor sugerido: R$ ${value.toLocaleString("pt-BR")}\n\nAguardando resposta do prestador.` });
    await supabase.from("conversations").update({ last_message:"Contraproposta enviada", last_message_at:new Date().toISOString() }).eq("id", activeConvo.id);
    // Simulate provider accepting counter-offer after 1s
    setTimeout(async () => {
      const newItems = typeof prop.items === "string" ? JSON.parse(prop.items) : prop.items;
      const ratio = value / prop.total_amount;
      const adjusted = newItems.map((it:any) => ({ ...it, value: Math.round(it.value * ratio) }));
      await supabase.from("proposals").update({ status:"rejected" }).eq("id", prop.id);
      const { data: newProp } = await supabase.from("proposals").insert({
        service_request_id:prop.service_request_id, conversation_id:prop.conversation_id,
        provider_id:prop.provider_id, client_id:userId, items:adjusted, total_amount:value,
        platform_fee_pct:10, execution_months:prop.execution_months, status:"sent",
      }).select().single();
      if (newProp) setProposals(prev => [...prev.map(p => p.id === prop.id ? {...p, status:"rejected"} : p), newProp]);
      const provName = activeConvo?.provider_name || "Prestador";
      await supabase.from("messages").insert({ conversation_id:activeConvo!.id, sender_id:"provider", sender_name:provName,
        content:`📄 PROPOSTA ATUALIZADA\nValor: R$ ${value.toLocaleString("pt-BR")}\nPrazo: ${prop.execution_months} meses\nTaxa plataforma: 10%\n\n[proposal_id:${newProp?.id}]` });
      const { data: freshMsgs } = await supabase.from("messages").select("*").eq("conversation_id", activeConvo!.id).order("created_at", { ascending: true });
      setMessages(freshMsgs || []);
      const { data: freshProps } = await supabase.from("proposals").select("*").eq("client_id", userId);
      setProposals(freshProps || []);
    }, 1500);
    setNegotiatingId(null);
    setCounterOffer("");
  };

  const handleRejectProposal = async (prop: any) => {
    await supabase.from("proposals").update({ status:"rejected" }).eq("id", prop.id);
    setProposals(prev => prev.map(p => p.id === prop.id ? {...p, status:"rejected"} : p));
    if (activeConvo) {
      await supabase.from("messages").insert({ conversation_id:activeConvo.id, sender_id:userId, sender_name:profile?.full_name||"Você", content:"❌ Proposta recusada." });
    }
  };

  const handlePayment = async () => {
    if (!activeProposal) return;
    setPayLoading(true);
    const fee = activeProposal.total_amount * 0.10;
    await supabase.from("payments").insert({
      proposal_id:activeProposal.id, payer_id:userId, amount:activeProposal.total_amount,
      platform_fee:fee, payment_method:payMethod, status:"paid", paid_at:new Date().toISOString(),
    });
    await supabase.from("proposals").update({ status:"paid" }).eq("id", activeProposal.id);
    setProposals(prev => prev.map(p => p.id === activeProposal.id ? {...p, status:"paid"} : p));
    await supabase.from("proposals").update({ status:"paid" }).eq("id", activeProposal.id);
    setProposals(prev => prev.map(p => p.id === activeProposal.id ? {...p, status:"paid"} : p));
    if (activeConvo) {
      await supabase.from("messages").insert({ conversation_id:activeConvo.id, sender_id:userId, sender_name:profile?.full_name||"Você",
        content:`✅ PAGAMENTO CONFIRMADO\nValor: R$ ${activeProposal.total_amount.toLocaleString("pt-BR")}\nMétodo: ${payMethod.toUpperCase()}\nValor em escrow até conclusão.` });
    }
    setPayLoading(false); setPayDone(true);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ textAlign:"center" }}><div style={{ width:48,height:48,borderRadius:12,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:900,fontSize:20,margin:"0 auto 16px" }}>FX</div><div style={{ color:C.textSec,fontSize:14 }}>Carregando...</div></div>
    </div>
  );

  const filteredProviders = providers.filter(p => {
    const mQ = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.role.toLowerCase().includes(searchQuery.toLowerCase());
    const mC = activeCategory === "Todos" || p.category === activeCategory;
    return mQ && mC;
  });
  const typeLabel = profile?.user_type==="user"?"Usuário":profile?.user_type==="provider"?"Prestador":"Imobiliária";
  const typeIcon = profile?.user_type==="user"?"👤":profile?.user_type==="provider"?"🔧":"🏢";
  const timeAgo = (d:string) => { const diff=Date.now()-new Date(d).getTime(); const m=Math.floor(diff/60000); if(m<1)return"Agora"; if(m<60)return`${m}min`; const h=Math.floor(m/60); if(h<24)return`${h}h`; return`${Math.floor(h/24)}d`; };
  const getProposalForConvo = (convoId:string) => proposals.find(p => String(p.conversation_id) === String(convoId) && p.status !== "rejected");
  // ═══════ CHECKOUT SCREEN ═══════
  if (showCheckout && activeProposal) {
    if (payDone) return (
      <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
        <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ fontSize:17,fontWeight:700 }}>Pagamento</div>
        </div>
        <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
          <div style={{ textAlign:"center",maxWidth:400 }}>
            <div style={{ width:72,height:72,borderRadius:36,background:C.greenLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px" }}><Ic name="check" size={36} color={C.green}/></div>
            <div style={{ fontSize:22,fontWeight:800,color:C.text,marginBottom:6 }}>Pagamento Confirmado!</div>
            <div style={{ fontSize:14,color:C.textSec,marginBottom:6 }}>R$ {activeProposal.total_amount.toLocaleString("pt-BR")}</div>
            <div style={{ fontSize:13,color:C.green,marginBottom:24 }}>Valor em conta garantia (escrow) até conclusão do serviço.</div>
            <button onClick={() => { setShowCheckout(false); setPayDone(false); setActiveProposal(null); setTab("chat"); }} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:C.primary,color:C.primaryText,border:"none",fontSize:15,fontWeight:700,cursor:"pointer" }}>Voltar ao chat</button>
          </div>
        </div>
      </div>
    );

    let items: any[] = []; try { items = typeof activeProposal.items === "string" ? JSON.parse(activeProposal.items) : (Array.isArray(activeProposal.items) ? activeProposal.items : []); } catch { items = []; }
    return (
      <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
        <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={() => { setShowCheckout(false); setActiveProposal(null); }} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}><Ic name="back" size={22} color="#fff"/></button>
          <div style={{ fontSize:17,fontWeight:700 }}>Pagamento Seguro</div>
        </div>
        <div style={{ flex:1,overflow:"auto",padding:20 }}>
          <div style={{ maxWidth:500,margin:"0 auto" }}>
            <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:16 }}>
              <div style={{ fontSize:11,color:C.textTer,marginBottom:4 }}>Valor total</div>
              <div style={{ fontSize:28,fontWeight:800,color:C.text }}>R$ {activeProposal.total_amount.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
              <div style={{ marginTop:12 }}>
                {items.map((it:any,i:number) => (
                  <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.divider}`,fontSize:13 }}>
                    <span style={{ color:"#FFFFFF" }}>{it.description}</span>
                    <span style={{ fontWeight:700,color:C.text }}>R$ {it.value.toLocaleString("pt-BR")}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",marginTop:8,fontSize:12,color:C.textTer }}>
                <span>Taxa plataforma (10%)</span>
                <span>R$ {(activeProposal.total_amount*0.10).toLocaleString("pt-BR",{minimumFractionDigits:2})}</span>
              </div>
            </div>
            <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:10 }}>Método de pagamento</div>
            {[{k:"pix",l:"PIX",i:"⚡",d:"Instantâneo"},{k:"credit",l:"Crédito até 12x",i:"💳",d:"Aprovação imediata"},{k:"debit",l:"Débito",i:"💳",d:"Desconto direto"},{k:"boleto",l:"Boleto até 12x",i:"📄",d:"Vence em 3 dias"}].map(m => (
              <button key={m.k} onClick={() => setPayMethod(m.k)} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:payMethod===m.k?C.primaryLight:C.card,border:`1.5px solid ${payMethod===m.k?C.primary:C.border}`,borderRadius:10,marginBottom:8,cursor:"pointer",width:"100%",textAlign:"left" }}>
                <span style={{ fontSize:22 }}>{m.i}</span>
                <div style={{ flex:1 }}><div style={{ fontSize:14,fontWeight:700,color:C.text }}>{m.l}</div><div style={{ fontSize:11,color:C.textSec }}>{m.d}</div></div>
              </button>
            ))}
            <div style={{ background:C.greenLight,borderRadius:10,padding:12,marginTop:8,marginBottom:16,display:"flex",gap:8 }}>
              <Ic name="shield" size={16} color={C.green}/>
              <span style={{ fontSize:12,color:C.green,lineHeight:1.5 }}>Escrow: Seu dinheiro fica protegido até a conclusão. Repasse ao prestador no dia 28.</span>
            </div>
            <button onClick={handlePayment} disabled={payLoading} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:payLoading?C.textTer:C.dark,color:C.primary,border:"none",fontSize:15,fontWeight:700,cursor:payLoading?"default":"pointer" }}>
              {payLoading ? "Processando..." : `Confirmar R$ ${activeProposal.total_amount.toLocaleString("pt-BR",{minimumFractionDigits:2})}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════ CHECKLIST SCREEN ═══════
  if (showChecklist && selectedProvider) {
    return (
      <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
        <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={() => setShowChecklist(false)} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}><Ic name="back" size={22} color="#fff"/></button>
          <div><div style={{ fontSize:17,fontWeight:700 }}>Checklist</div><div style={{ fontSize:11,opacity:.6 }}>Para: {selectedProvider.name}</div></div>
        </div>
        <div style={{ flex:1,overflow:"auto",padding:20 }}>
          <div style={{ maxWidth:500,margin:"0 auto" }}>
            <div style={{ background:"#332B00",borderRadius:12,padding:14,marginBottom:18,display:"flex",gap:10 }}>
              <Ic name="clipboard" size={20} color={C.primary}/>
              <div style={{ fontSize:12,color:"#F2B705",lineHeight:1.6 }}>Preencha para facilitar o orçamento do prestador. Todos os campos são obrigatórios.</div>
            </div>
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:C.text,marginBottom:6 }}>Área (m²) *</label>
            <input type="number" value={checklist.area} onChange={e => setChecklist({...checklist,area:e.target.value})} placeholder="Ex: 45"
              style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:16,outline:"none",boxSizing:"border-box",background:C.card,color:C.text }} />
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:C.text,marginBottom:6 }}>Serviço</label>
            <div style={{ padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:16,background:"#2A2A2A",color:C.textSec,boxSizing:"border-box" as const }}>{selectedProvider?.category || "—"}</div>
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:C.text,marginBottom:6 }}>Prazo desejado *</label>
            <select value={checklist.timeline} onChange={e => setChecklist({...checklist,timeline:e.target.value})} style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:16,background:C.card,color:checklist.timeline?C.text:C.textTer }}>
              <option value="">Selecione...</option><option>Até 15 dias</option><option>Até 1 mês</option><option>Até 2 meses</option><option>Até 3 meses</option><option>Até 6 meses</option><option>Sem urgência</option>
            </select>
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:C.text,marginBottom:8 }}>Tipo de imóvel *</label>
            <div style={{ display:"flex",gap:10,marginBottom:16 }}>
              {[{e:"🏠",l:"Casa"},{e:"🏢",l:"Prédio/Apto"}].map(o => (
                <button key={o.l} onClick={() => setChecklist({...checklist,buildingType:o.l})} style={{ flex:1,padding:14,borderRadius:10,border:`1.5px solid ${checklist.buildingType===o.l?C.primary:C.border}`,background:checklist.buildingType===o.l?C.primaryLight:C.card,cursor:"pointer",textAlign:"center" }}>
                  <div style={{ fontSize:28,marginBottom:4 }}>{o.e}</div>
                  <div style={{ fontSize:12,fontWeight:600,color:checklist.buildingType===o.l?"#7a6000":C.textSec }}>{o.l}</div>
                </button>
              ))}
            </div>
            <label style={{ display:"block",fontSize:13,fontWeight:700,color:C.text,marginBottom:8 }}>Incluir caçamba? *</label>
            <div style={{ display:"flex",gap:10,marginBottom:20 }}>
              {[{l:"Sim",v:true},{l:"Não, providencio",v:false}].map(o => (
                <button key={String(o.v)} onClick={() => setChecklist({...checklist,dumpster:o.v})} style={{ flex:1,padding:12,borderRadius:10,border:`1.5px solid ${checklist.dumpster===o.v?(o.v?C.green:C.amber):C.border}`,background:checklist.dumpster===o.v?(o.v?C.greenLight:C.amberLight):C.card,cursor:"pointer",fontSize:12,fontWeight:600,color:checklist.dumpster===o.v?(o.v?C.green:C.amber):C.textSec }}>{o.l}</button>
              ))}
            </div>
            <button onClick={submitChecklist} disabled={!checklistValid} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:checklistValid?C.primary:C.textTer,color:C.primaryText,border:"none",fontSize:15,fontWeight:700,cursor:checklistValid?"pointer":"default" }}>
              <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}><Ic name="send" size={16} color={C.primaryText}/> Enviar e iniciar chat</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",background:C.bg,fontFamily:"'Outfit',sans-serif" }}>

      {/* ═══ HOME ═══ */}
      {tab==="home" && !selectedProvider && !activeConvo && (
        <div style={{ flex:1,overflow:"auto",paddingBottom:70 }}>
          <div style={{ padding:"18px 20px 14px",background:C.dark,color:"#fff" }}>
            <div style={{ maxWidth:900,margin:"0 auto" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}><div style={{ width:32,height:32,borderRadius:8,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:900,fontSize:13 }}>FX</div><div><div style={{ fontSize:11,opacity:.6 }}>Olá, {profile?.full_name?.split(" ")[0]}</div><div style={{ fontSize:16,fontWeight:800 }}>Fix<span style={{ color:C.primary }}>IMOB</span></div></div></div>
                <div style={{ position:"relative",cursor:"pointer" }}><Ic name="bell" size={22} color="#fff"/><div style={{ position:"absolute",top:-2,right:-2,width:8,height:8,borderRadius:4,background:C.primary }}/></div>
              </div>
              <div style={{ background:"rgba(255,255,255,.08)",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:8,cursor:"pointer" }} onClick={() => setTab("search")}><Ic name="search" size={16} color="rgba(255,255,255,.4)"/><span style={{ fontSize:13,color:"rgba(255,255,255,.4)" }}>Buscar prestadores...</span></div>
            </div>
          </div>
          <div style={{ maxWidth:900,margin:"0 auto",padding:"16px 20px" }}>
            {profile?.user_type === "agency" && <button onClick={() => router.push("/dashboard/agency")} style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:14,background:C.dark,border:"none",borderRadius:12,cursor:"pointer",marginBottom:10,textAlign:"left" }}><span style={{ fontSize:22 }}>🏢</span><div style={{ flex:1 }}><div style={{ fontSize:14,fontWeight:700,color:C.primary }}>Painel da Imobiliária</div><div style={{ fontSize:11,color:"rgba(255,255,255,.5)" }}>Imóveis, contratos, vistorias e cobranças</div></div><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth={1.8}><path d="M9 5l7 7-7 7"/></svg></button>}<button onClick={() => router.push("/dashboard/request")} style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:14,background:C.primaryLight,border:`1.5px solid ${C.primary}`,borderRadius:12,cursor:"pointer",marginBottom:16,textAlign:"left" }}><span style={{ fontSize:22 }}>📢</span><div style={{ flex:1 }}><div style={{ fontSize:14,fontWeight:700,color:"#F2B705" }}>Solicitar orçamento geral</div><div style={{ fontSize:11,color:"#FFFFFF" }}>Receba propostas de múltiplos prestadores</div></div><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.textTer} strokeWidth={1.8}><path d="M9 5l7 7-7 7"/></svg></button><div style={{ fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:10 }}>Categorias</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(72px, 1fr))",gap:8,marginBottom:20 }}>
              {[{e:"📐",l:"Arquiteto"},{e:"🏗️",l:"Engenheiro"},{e:"⚡",l:"Elétrica"},{e:"🔧",l:"Hidráulica"},{e:"🧱",l:"Pedreiro"},{e:"❄️",l:"Clima"},{e:"🎨",l:"Pintor"},{e:"🪵",l:"Marceneiro"}].map((c,i) => (
                <button key={i} onClick={() => { setActiveCategory(c.l==="Clima"?"Climatização":c.l); setTab("search"); }} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 2px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer" }}><span style={{ fontSize:20 }}>{c.e}</span><span style={{ fontSize:10,color:"#F0F0F0" }}>{c.l}</span></button>
              ))}
            </div>
            <div style={{ fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:10 }}>Destaques</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",gap:10 }}>
              {providers.filter(p => p.verified).slice(0,6).map(p => (
                <button key={p.id} onClick={() => setSelectedProvider(p)} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,cursor:"pointer",width:"100%",textAlign:"left" }}>
                  <div style={{ width:46,height:46,borderRadius:23,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:700,fontSize:15,flexShrink:0 }}>{p.avatar_initials}</div>
                  <div style={{ flex:1,minWidth:0 }}><div style={{ display:"flex",alignItems:"center",gap:5 }}><span style={{ fontSize:13,fontWeight:700,color:C.text }}>{p.name}</span><Ic name="check" size={14} color={C.green}/></div><div style={{ fontSize:11.5,color:C.textSec,marginTop:2 }}>{p.role}</div><div style={{ display:"flex",alignItems:"center",gap:6,marginTop:4 }}><Ic name="star" size={12} color={C.primary}/><span style={{ fontSize:11.5,fontWeight:700,color:C.text }}>{p.rating}</span><span style={{ fontSize:11,color:C.textTer }}>({p.reviews})</span></div></div>
                  <Ic name="chevRight" size={18} color={C.textTer}/>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ PROVIDER DETAIL ═══ */}
      {selectedProvider && !showChecklist && !activeConvo && (
        <div style={{ flex:1,overflow:"auto",paddingBottom:70 }}>
          <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
            <button onClick={() => setSelectedProvider(null)} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}><Ic name="back" size={22} color="#fff"/></button>
            <div style={{ flex:1,fontSize:17,fontWeight:700 }}>{selectedProvider.name}</div>
          </div>
          <div style={{ maxWidth:700,margin:"0 auto",padding:20 }}>
            <div style={{ display:"flex",gap:16,marginBottom:20,flexWrap:"wrap" }}>
              <div style={{ width:80,height:80,borderRadius:20,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:800,fontSize:28,flexShrink:0 }}>{selectedProvider.avatar_initials}</div>
              <div style={{ flex:1,minWidth:200 }}>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6 }}>{selectedProvider.verified && <span style={{ fontSize:11,fontWeight:700,color:C.green,background:C.greenLight,padding:"2px 8px",borderRadius:5 }}>✓ Verificado</span>}<span style={{ fontSize:11,color:C.primaryText,background:C.primary,padding:"2px 8px",borderRadius:5,fontWeight:700 }}>{selectedProvider.category}</span></div>
                <div style={{ fontSize:15,color:C.textSec }}>{selectedProvider.role}</div>
                <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:6 }}><Ic name="location" size={14} color={C.textTer}/><span style={{ fontSize:13,color:C.textSec }}>{selectedProvider.city}</span></div>
                <div style={{ display:"flex",gap:24,marginTop:12 }}><div><div style={{ fontSize:22,fontWeight:800,color:C.text }}>{selectedProvider.rating}</div><div style={{ fontSize:10,color:C.textTer }}>Nota</div></div><div><div style={{ fontSize:22,fontWeight:800,color:C.text }}>{selectedProvider.reviews}</div><div style={{ fontSize:10,color:C.textTer }}>Avaliações</div></div></div>
              </div>
            </div>
            <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:8 }}>Sobre</div>
            <div style={{ fontSize:14,color:C.textSec,lineHeight:1.7,marginBottom:24,padding:16,background:C.card,borderRadius:12,border:`1px solid ${C.border}` }}>{selectedProvider.bio}</div>
            <button onClick={() => setShowChecklist(true)} style={{ width:"100%",padding:"14px 0",borderRadius:12,background:C.primary,color:C.primaryText,border:"none",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}><Ic name="clipboard" size={18} color={C.primaryText}/> Solicitar orçamento</button>
            <button onClick={async () => { const convo = conversations.find(c => c.provider_id === String(selectedProvider.id)); if(convo) { openConversation(convo); } else { const { data } = await supabase.from("conversations").insert({ user_id:userId, provider_id:String(selectedProvider.id), provider_name:selectedProvider.name, provider_initials:selectedProvider.avatar_initials, last_message:"Conversa iniciada", last_message_at:new Date().toISOString() }).select().single(); if(data) { setConversations(prev => [data, ...prev]); openConversation(data); } } }} style={{ width:"100%",padding:"14px 0",borderRadius:12,background:"transparent",color:C.primary,border:`2px solid ${C.primary}`,fontSize:15,fontWeight:700,cursor:"pointer" }}>Enviar mensagem</button>
          </div>
        </div>
      )}

      {/* ═══ SEARCH ═══ */}
      {tab==="search" && !selectedProvider && !activeConvo && (
        <div style={{ flex:1,overflow:"auto",paddingBottom:70 }}>
          <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff" }}><div style={{ maxWidth:900,margin:"0 auto",fontSize:17,fontWeight:700 }}>Buscar Prestadores</div></div>
          <div style={{ maxWidth:900,margin:"0 auto" }}>
            <div style={{ padding:"12px 20px 6px" }}><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Nome, profissão..." style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,outline:"none",background:"#2A2A2A",color:"#F0F0F0",boxSizing:"border-box" }} /></div>
            <div style={{ padding:"8px 20px",display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none" }}>{CATS.map(cat => (<button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding:"6px 14px",borderRadius:18,border:activeCategory===cat?"none":`1px solid ${C.border}`,background:activeCategory===cat?C.primary:C.card,color:activeCategory===cat?C.primaryText:C.textSec,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0 }}>{cat}</button>))}</div>
            <div style={{ padding:"8px 20px 20px" }}>
              <div style={{ fontSize:12,color:"#1A1A1A",marginBottom:8 }}>{filteredProviders.length} resultado{filteredProviders.length!==1&&"s"}</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",gap:10 }}>
                {filteredProviders.map(p => (
                  <button key={p.id} onClick={() => setSelectedProvider(p)} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,cursor:"pointer",width:"100%",textAlign:"left" }}>
                    <div style={{ width:46,height:46,borderRadius:23,background:p.verified?C.primary:"#888",display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:700,fontSize:15,flexShrink:0 }}>{p.avatar_initials}</div>
                    <div style={{ flex:1,minWidth:0 }}><div style={{ display:"flex",alignItems:"center",gap:5 }}><span style={{ fontSize:13,fontWeight:700,color:C.text }}>{p.name}</span>{p.verified && <Ic name="check" size={14} color={C.green}/>}</div><div style={{ fontSize:11.5,color:C.textSec,marginTop:2 }}>{p.role}</div><div style={{ display:"flex",alignItems:"center",gap:6,marginTop:4 }}><Ic name="star" size={12} color={C.primary}/><span style={{ fontSize:11.5,fontWeight:700 }}>{p.rating}</span><span style={{ fontSize:11,color:C.textTer }}>({p.reviews})</span></div></div>
                    <Ic name="chevRight" size={18} color={C.textTer}/>
                  </button>
                ))}
              </div>
              {filteredProviders.length===0 && <div style={{ textAlign:"center",padding:40,color:C.textTer,fontSize:13 }}>Nenhum prestador encontrado</div>}
            </div>
          </div>
        </div>
      )}

      {/* ═══ CHAT LIST ═══ */}
      {tab==="chat" && !activeConvo && !selectedProvider && (
        <div style={{ flex:1,overflow:"auto",paddingBottom:70 }}>
          <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff" }}><div style={{ maxWidth:900,margin:"0 auto",fontSize:17,fontWeight:700 }}>Mensagens</div></div>
          <div style={{ maxWidth:900,margin:"0 auto",padding:"8px 20px" }}>
            {conversations.length===0 ? (
              <div style={{ textAlign:"center",padding:40 }}><div style={{ width:64,height:64,borderRadius:18,background:C.primaryLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28 }}>💬</div><div style={{ fontSize:16,fontWeight:700,color:"#1A1A1A",marginBottom:6 }}>Nenhuma conversa</div><div style={{ fontSize:13,color:"#333",marginBottom:20 }}>Busque um prestador e solicite um orçamento.</div><button onClick={() => setTab("search")} style={{ padding:"10px 24px",borderRadius:10,background:C.primary,color:C.primaryText,border:"none",fontSize:14,fontWeight:700,cursor:"pointer" }}>Buscar</button></div>
            ) : conversations.map(c => (
              <button key={c.id} onClick={() => openConversation(c)} style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 0",cursor:"pointer",width:"100%",textAlign:"left",background:"none",border:"none",borderBottom:`1px solid ${C.divider}` }}>
                <div style={{ width:46,height:46,borderRadius:23,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:700,fontSize:15,flexShrink:0 }}>{c.provider_initials||"?"}</div>
                <div style={{ flex:1,minWidth:0 }}><div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ fontSize:14,fontWeight:700,color:"#1A1A1A" }}>{c.provider_name}</span><span style={{ fontSize:11,color:"#555" }}>{timeAgo(c.last_message_at)}</span></div><div style={{ fontSize:12,color:"#333",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.last_message}</div></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ CHAT DETAIL ═══ */}
      {activeConvo && (
        <div style={{ flex:1,display:"flex",flexDirection:"column" }}>
          <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
            <button onClick={() => setActiveConvo(null)} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}><Ic name="back" size={22} color="#fff"/></button>
            <div style={{ width:36,height:36,borderRadius:18,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:700,fontSize:13 }}>{activeConvo.provider_initials}</div>
            <div style={{ flex:1 }}><div style={{ fontSize:15,fontWeight:700 }}>{activeConvo.provider_name}</div></div>
          </div>
          <div style={{ flex:1,overflow:"auto",padding:"12px 16px",background:C.divider }}>
            <div style={{ maxWidth:700,margin:"0 auto" }}>
              {messages.length===0 && <div style={{ textAlign:"center",padding:30 }}><div style={{ fontSize:13,color:C.textTer,background:C.card,display:"inline-block",padding:"8px 16px",borderRadius:12 }}>Conversa iniciada</div></div>}
              {messages.map((m,i) => {
                const isMe = m.sender_id === userId;
                const hasPropId = m.content?.includes("[proposal_id:");
                const propId = hasPropId ? m.content.match(/\[proposal_id:([^\]]+)\]/)?.[1] : null;
                const prop = propId ? proposals.find(p => String(p.id) === propId) : null;
                const displayContent = m.content?.replace(/\[proposal_id:[^\]]+\]/, "").trim();
                return (
                  <div key={m.id||i} style={{ display:"flex",justifyContent:isMe?"flex-end":"flex-start",marginBottom:8 }}>
                    <div style={{ maxWidth:"80%",padding:"10px 14px",borderRadius:isMe?"14px 14px 4px 14px":"14px 14px 14px 4px",background:isMe?C.primary:C.card,color:isMe?C.primaryText:C.text,fontSize:14,lineHeight:1.5,boxShadow:"0 1px 3px rgba(0,0,0,0.06)",whiteSpace:"pre-line" }}>
                      {displayContent}
                      {prop && prop.status === "sent" && negotiatingId !== prop.id && (
                        <div style={{ marginTop:10,display:"flex",gap:6 }}>
                          <button onClick={() => handleAcceptProposal(prop)} style={{ flex:1,padding:"8px 0",borderRadius:8,background:C.dark,color:C.primary,border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>✓ Aceitar</button>
                          <button onClick={() => { setNegotiatingId(prop.id); setCounterOffer(""); }} style={{ flex:1,padding:"8px 0",borderRadius:8,background:C.primary,color:C.primaryText,border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>💰 Negociar</button>
                          <button onClick={() => handleRejectProposal(prop)} style={{ flex:1,padding:"8px 0",borderRadius:8,background:"transparent",color:C.red,border:`1.5px solid ${C.red}`,fontSize:12,fontWeight:700,cursor:"pointer" }}>✗ Recusar</button>
                        </div>
                      )}
                      {prop && prop.status === "sent" && negotiatingId === prop.id && (
                        <div style={{ marginTop:10 }}>
                          <div style={{ fontSize:12,fontWeight:700,color:C.text,marginBottom:6 }}>Sua contraproposta:</div>
                          <div style={{ display:"flex",gap:6 }}>
                            <input type="number" value={counterOffer} onChange={e => setCounterOffer(e.target.value)} placeholder="Valor em R$"
                              style={{ flex:1,padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,outline:"none",boxSizing:"border-box" }} />
                            <button onClick={() => handleCounterOffer(prop)} disabled={!counterOffer} style={{ padding:"8px 14px",borderRadius:8,background:counterOffer?C.primary:C.border,color:C.primaryText,border:"none",fontSize:12,fontWeight:700,cursor:counterOffer?"pointer":"default" }}>Enviar</button>
                          </div>
                          <button onClick={() => setNegotiatingId(null)} style={{ background:"none",border:"none",color:C.textTer,fontSize:11,cursor:"pointer",marginTop:6 }}>Cancelar</button>
                        </div>
                      )}
                      {prop && prop.status === "accepted" && (
                        <div style={{ marginTop:10 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:4,marginBottom:6 }}><Ic name="check" size={14} color={C.green}/><span style={{ fontSize:12,fontWeight:700,color:C.green }}>Proposta aceita!</span></div>
                          <button onClick={() => { setActiveProposal(prop); setShowCheckout(true); setActiveConvo(activeConvo); }} style={{ width:"100%",padding:"8px 0",borderRadius:8,background:C.primary,color:C.primaryText,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4 }}><Ic name="lock" size={12} color={C.primaryText}/> Pagar agora</button>
                        </div>
                      )}
                      {prop && prop.status === "rejected" && (
                        <div style={{ marginTop:8,fontSize:12,color:C.red,fontWeight:700 }}>❌ Proposta recusada</div>
                      )}
                      <div style={{ fontSize:10,marginTop:4,opacity:.5,textAlign:"right" }}>{new Date(m.created_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef}/>
            </div>
          </div>
          <div style={{ padding:"10px 16px 14px",background:C.card,borderTop:`1px solid ${C.border}`,flexShrink:0 }}>
            <div style={{ maxWidth:700,margin:"0 auto",display:"flex",gap:8 }}>
              <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&sendMessage()} placeholder="Mensagem..."
                style={{ flex:1,padding:"10px 14px",borderRadius:20,border:`1px solid ${C.border}`,fontSize:14,outline:"none",background:"#2A2A2A",color:"#F0F0F0",boxSizing:"border-box" }} />
              <button onClick={sendMessage} disabled={!msgInput.trim()} style={{ width:42,height:42,borderRadius:21,background:msgInput.trim()?C.primary:C.border,border:"none",cursor:msgInput.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic name="send" size={18} color={msgInput.trim()?C.primaryText:C.textTer}/></button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SERVICES ═══ */}
      {tab==="services" && !selectedProvider && !activeConvo && (
        <div style={{ flex:1,overflow:"auto",paddingBottom:70 }}>
          <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff" }}><div style={{ maxWidth:900,margin:"0 auto",fontSize:17,fontWeight:700 }}>Meus Serviços</div></div>
          <div style={{ maxWidth:900,margin:"0 auto",padding:"8px 20px" }}>
            {proposals.length === 0 ? (
              <div style={{ textAlign:"center",padding:40 }}>
                <div style={{ width:64,height:64,borderRadius:18,background:C.primaryLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28 }}>📋</div>
                <div style={{ fontSize:16,fontWeight:700,color:"#1A1A1A",marginBottom:6 }}>Nenhum serviço ainda</div>
                <div style={{ fontSize:13,color:"#333",lineHeight:1.6 }}>Seus orçamentos aceitos e pagos aparecerão aqui.</div>
              </div>
            ) : (
              <>
                {["accepted","sent","rejected"].map(status => {
                  const filtered = proposals.filter(p => {
                    if (status === "accepted") return p.status === "accepted" || p.status === "paid" || p.status === "completed";
                    return p.status === status;
                  });
                  if (filtered.length === 0) return null;
                  const label = status === "accepted" ? "Aceitos / Pagos" : status === "sent" ? "Aguardando resposta" : "Recusados";
                  const color = status === "accepted" ? C.green : status === "sent" ? C.amber : C.red;
                  return (
                    <div key={status}>
                      <div style={{ fontSize:13,fontWeight:700,color:"#1A1A1A",marginBottom:8,marginTop:16 }}>{label}</div>
                      {filtered.map(p => {
                        const prov = p.provider_name ? { name: p.provider_name, avatar_initials: p.provider_initials, category: p.provider_category } : providers.find(pr => String(pr.id) === String(p.provider_id)) || { name: "Prestador", avatar_initials: "?", category: "" };
                        let items: any[] = []; try { items = typeof p.items === "string" ? JSON.parse(p.items) : (Array.isArray(p.items) ? p.items : []); } catch { items = []; }
                        const isPaid = proposals.some(pp => pp.id === p.id) && p.status === "accepted";
                        return (
                          <div key={p.id} style={{ background:C.card,borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:10 }}>
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                                <div style={{ width:42,height:42,borderRadius:21,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:700,fontSize:14,flexShrink:0 }}>{prov?.avatar_initials || "?"}</div>
                                <div>
                                  <div style={{ fontSize:14,fontWeight:700,color:C.text }}>{prov?.name || "Prestador"}</div>
                                  <div style={{ fontSize:12,color:C.textSec }}>{prov?.category || ""}</div>
                                </div>
                              </div>
                              <span style={{ fontSize:11,fontWeight:700,color,background:status==="accepted"?C.greenLight:status==="sent"?C.amberLight:C.redLight,padding:"3px 10px",borderRadius:6 }}>
                                {p.status === "paid" ? "✓ Pago" : p.status === "accepted" ? "Aceito" : p.status === "sent" ? "Pendente" : "Recusado"}
                              </span>
                            </div>
                            <div style={{ background:"#2A2A2A",borderRadius:10,padding:12,marginBottom:10 }}>
                              {items.map((it:any,idx:number) => (
                                <div key={idx} style={{ display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13,borderBottom:idx<items.length-1?`1px solid ${C.divider}`:"none" }}>
                                  <span style={{ color:"#FFFFFF" }}>{it.description}</span>
                                  <span style={{ fontWeight:700,color:"#FFFFFF" }}>R$ {it.value?.toLocaleString("pt-BR")}</span>
                                </div>
                              ))}
                              <div style={{ display:"flex",justifyContent:"space-between",padding:"8px 0 0",fontSize:14,fontWeight:800,borderTop:"1px solid #333",marginTop:4,color:"#FFFFFF" }}>
                                <span>Total</span>
                                <span style={{ color:"#FFFFFF",fontWeight:800 }}>R$ {p.total_amount?.toLocaleString("pt-BR")}</span>
                              </div>
                            </div>
                            <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSec }}>
                              <span>Prazo: {p.execution_months} {p.execution_months===1?"mês":"meses"}</span>
                              <span>Taxa: {p.platform_fee_pct}%</span>
                            </div>
                            {p.status === "accepted" && p.status !== "paid" && (
                              <button onClick={() => { setActiveProposal(p); setShowCheckout(true); }} style={{ width:"100%",padding:"10px 0",borderRadius:8,background:C.primary,color:C.primaryText,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.primaryText} strokeWidth={1.8}><path d={paths.lock}/></svg> Pagar agora
                              </button>
                            )}
                            {p.status === "sent" && (
                              <button onClick={() => { const convo = conversations.find(c => String(c.id) === String(p.conversation_id)); if(convo) openConversation(convo); }}
                                style={{ width:"100%",padding:"10px 0",borderRadius:8,background:"transparent",color:C.primary,border:`1.5px solid ${C.primary}`,fontSize:13,fontWeight:700,cursor:"pointer",marginTop:10 }}>
                                Ver no chat
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
      {tab==="profile" && !selectedProvider && !activeConvo && (
        <div style={{ flex:1,overflow:"auto",paddingBottom:70 }}>
          <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff" }}><div style={{ maxWidth:900,margin:"0 auto",fontSize:17,fontWeight:700 }}>Meu Perfil</div></div>
          <div style={{ maxWidth:600,margin:"0 auto",padding:20 }}>
            <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:24 }}>
              <div style={{ width:64,height:64,borderRadius:18,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0 }}>{typeIcon}</div>
              <div><div style={{ fontSize:18,fontWeight:700,color:"#1A1A1A" }}>{profile?.full_name}</div><div style={{ fontSize:13,color:"#333" }}>{typeLabel}</div><div style={{ display:"flex",alignItems:"center",gap:4,marginTop:4 }}><Ic name="shield" size={13} color="#2E7D32"/><span style={{ fontSize:11,color:"#2E7D32",fontWeight:600 }}>Verificado</span></div></div>
            </div>
            {!editMode ? (
              <>
                {[{label:"Editar perfil",icon:"edit",action:()=>setEditMode(true),hl:true},{label:"Indique e Ganhe",icon:"gift"},{label:"Assinatura",icon:"shield"},{label:"Termos de uso",icon:"flag"},{label:"Ajuda e suporte",icon:"flag"}].map((item,i) => (
                  <button key={i} onClick={item.action||(()=>{})} style={{ display:"flex",alignItems:"center",gap:12,width:"100%",padding:"14px 0",background:"none",border:"none",borderBottom:`1px solid ${C.divider}`,cursor:"pointer",textAlign:"left" }}>
                    <div style={{ width:38,height:38,borderRadius:10,background:item.hl?"#332B00":"#1A1A1A",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Ic name={item.icon} size={16} color={item.hl?"#F2B705":"#888"}/></div>
                    <div style={{ flex:1,fontSize:14,fontWeight:600,color:"#1A1A1A" }}>{item.label}</div>
                    <Ic name="chevRight" size={16} color="#555"/>
                  </button>
                ))}
                <button onClick={handleLogout} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:14,marginTop:24,background:"none",border:"none",cursor:"pointer" }}><Ic name="logout" size={18} color="#C62828"/><span style={{ fontSize:14,fontWeight:700,color:"#C62828" }}>Sair da conta</span></button>
              </>
            ) : (
              <>
                <button onClick={() => setEditMode(false)} style={{ background:"none",border:"none",color:"#1A1A1A",cursor:"pointer",fontSize:14,marginBottom:20 }}>← Voltar</button>
                <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#1A1A1A",marginBottom:6 }}>Nome completo</label>
                <div style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:6,background:"#2A2A2A",color:"#CCCCCC",boxSizing:"border-box" }}>{profile?.full_name}</div>
                <div style={{ fontSize:11,color:"#555",marginBottom:16 }}>O nome não pode ser alterado.</div>
                <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#1A1A1A",marginBottom:6 }}>Email</label>
                <input value={editForm.email} onChange={e => setEditForm({...editForm,email:e.target.value})} style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:16,outline:"none",boxSizing:"border-box" }} />
                <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#1A1A1A",marginBottom:6 }}>Telefone</label>
                <input value={editForm.phone} onChange={e => setEditForm({...editForm,phone:e.target.value})} placeholder="(11) 99999-9999" style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:16,outline:"none",boxSizing:"border-box" }} />
                <label style={{ display:"block",fontSize:13,fontWeight:600,color:"#1A1A1A",marginBottom:6 }}>Tipo de conta</label>
                <div style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:16,background:"#2A2A2A",color:C.textTer,boxSizing:"border-box" }}>{typeLabel}</div>
                <button onClick={handleSaveProfile} disabled={saving} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:saving?C.textTer:C.primary,color:C.primaryText,border:"none",fontSize:15,fontWeight:700,cursor:saving?"default":"pointer" }}>{saving?"Salvando...":"Salvar alterações"}</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ TAB BAR ═══ */}
      {!selectedProvider && !activeConvo && !showChecklist && (
        <div style={{ position:"fixed",bottom:0,left:0,right:0,display:"flex",borderTop:"1px solid #333",background:"#1A1A1A",padding:"6px 0 10px",zIndex:50 }}>
          <div style={{ display:"flex",width:"100%",maxWidth:900,margin:"0 auto" }}>
            {[{key:"home",icon:"home",label:"Início"},{key:"search",icon:"search",label:"Buscar"},{key:"chat",icon:"chat",label:"Chat"},{key:"services",icon:"clipboard",label:"Serviços"},{key:"profile",icon:"user",label:"Perfil"}].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setSelectedProvider(null); setActiveConvo(null); setActiveCategory("Todos"); setSearchQuery(""); }}
                style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"4px 0" }}>
                <Ic name={t.icon} size={22} color={tab===t.key?C.primary:C.textTer}/>
                <span style={{ fontSize:10,fontWeight:tab===t.key?700:500,color:tab===t.key?C.primary:C.textTer }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}