"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const C = {
  primary:"#F2B705",primaryLight:"#FFF8E1",primaryText:"#1A1A1A",
  dark:"#1A1A1A",bg:"#F5F5F3",card:"#FFFFFF",
  text:"#1A1A1A",textSec:"#5A5A5A",textTer:"#9A9A9A",
  border:"#E5E5E5",divider:"#EFEFEF",
  green:"#2E7D32",greenLight:"#E8F5E9",
  red:"#C62828",redLight:"#FFEBEE",
  amber:"#E65100",amberLight:"#FFF3E0",
};

const CHECKLIST_ITEMS = ["Pintura das paredes","Piso e revestimentos","Portas e janelas","Instalações elétricas","Instalações hidráulicas","Fechaduras e chaves","Vidros e espelhos","Área externa/varanda"];

export default function AgencyPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("home");
  const [properties, setProperties] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [rentalPayments, setRentalPayments] = useState<any[]>([]);
  const [selectedProp, setSelectedProp] = useState<any>(null);
  const [propTab, setPropTab] = useState("payments");

  // Forms
  const [showAddProp, setShowAddProp] = useState(false);
  const [propForm, setPropForm] = useState({ address:"",unit:"",type:"Apartamento",area:"",rent:"",condo:"",landlordName:"",landlordPhone:"",landlordEmail:"",paymentMode:"via_agency" });
  const [showAddContract, setShowAddContract] = useState(false);
  const [contractForm, setContractForm] = useState({ tenantName:"",tenantCpf:"",rent:"",condo:"",startDate:"",endDate:"",paymentMode:"via_agency" });
  const [showAddInspection, setShowAddInspection] = useState(false);
  const [inspForm, setInspForm] = useState({ type:"Entrada",checklist:CHECKLIST_ITEMS.map(i=>({item:i,ok:false})),notes:"" });
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({ title:"",description:"",priority:"medium" });
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [payForm, setPayForm] = useState({ monthRef:"",method:"pix" });
  const [saving, setSaving] = useState(false);
  const [viewContract, setViewContract] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (p?.user_type !== "agency") { router.push("/dashboard"); return; }
      const { data: props } = await supabase.from("properties").select("*").eq("agency_id", user.id).order("created_at",{ascending:false});
      setProperties(props || []);
      const { data: cts } = await supabase.from("contracts").select("*").eq("agency_id", user.id);
      setContracts(cts || []);
      const { data: insp } = await supabase.from("inspections").select("*").eq("agency_id", user.id);
      setInspections(insp || []);
      const { data: tix } = await supabase.from("maintenance_tickets").select("*").eq("agency_id", user.id);
      setTickets(tix || []);
      const { data: rp } = await supabase.from("rental_payments").select("*").eq("agency_id", user.id);
      setRentalPayments(rp || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const loadPropertyData = async (propId: string) => {
    const { data: cts } = await supabase.from("contracts").select("*").eq("property_id", propId);
    setContracts(cts || []);
    const { data: insp } = await supabase.from("inspections").select("*").eq("property_id", propId);
    setInspections(insp || []);
    const { data: tix } = await supabase.from("maintenance_tickets").select("*").eq("property_id", propId);
    setTickets(tix || []);
    const { data: rp } = await supabase.from("rental_payments").select("*").eq("property_id", propId);
    setRentalPayments(rp || []);
  };

  const handleAddProperty = async () => {
    setSaving(true);
    const { data } = await supabase.from("properties").insert({
      agency_id:userId, address:propForm.address, unit:propForm.unit, property_type:propForm.type,
      area_m2:Number(propForm.area), rent_amount:Number(propForm.rent), condo_amount:Number(propForm.condo||0),
      landlord_name:propForm.landlordName, landlord_phone:propForm.landlordPhone, landlord_email:propForm.landlordEmail,
      payment_mode:propForm.paymentMode, status:"vacant",
    }).select().single();
    if (data) setProperties(prev => [data, ...prev]);
    setSaving(false); setShowAddProp(false);
    setPropForm({ address:"",unit:"",type:"Apartamento",area:"",rent:"",condo:"",landlordName:"",landlordPhone:"",landlordEmail:"",paymentMode:"via_agency" });
  };

  const handleAddContract = async () => {
    if (!selectedProp) return;
    setSaving(true);
    const { data } = await supabase.from("contracts").insert({
      property_id:selectedProp.id, agency_id:userId, tenant_name:contractForm.tenantName,
      tenant_cpf:contractForm.tenantCpf, landlord_name:selectedProp.landlord_name, rent_amount:Number(contractForm.rent||selectedProp.rent_amount),
      condo_amount:Number(contractForm.condo||selectedProp.condo_amount), start_date:contractForm.startDate,
      end_date:contractForm.endDate, payment_mode:contractForm.paymentMode, status:"draft",
    }).select().single();
    if (data) {
      setContracts(prev => [...prev, data]);
      await loadPropertyData(selectedProp.id);
    }
    await supabase.from("properties").update({ status:"occupied", tenant_name:contractForm.tenantName }).eq("id", selectedProp.id);
    setSelectedProp({...selectedProp, status:"occupied", tenant_name:contractForm.tenantName});
    setProperties(prev => prev.map(p => p.id === selectedProp.id ? {...p, status:"occupied", tenant_name:contractForm.tenantName} : p));
    setSaving(false); setShowAddContract(false);
    setContractForm({ tenantName:"",tenantCpf:"",rent:"",condo:"",startDate:"",endDate:"",paymentMode:"via_agency" });
  };

  const handleAddInspection = async () => {
    if (!selectedProp) return;
    setSaving(true);
    const issues = inspForm.checklist.filter(c => !c.ok).length;
    const { data } = await supabase.from("inspections").insert({
      property_id:selectedProp.id, agency_id:userId, inspection_type:inspForm.type,
      checklist:inspForm.checklist, issues_count:issues, notes:inspForm.notes, status:"completed", completed_at:new Date().toISOString(),
    }).select().single();
    if (data) setInspections(prev => [...prev, data]);
    setSaving(false); setShowAddInspection(false);
    setInspForm({ type:"Entrada",checklist:CHECKLIST_ITEMS.map(i=>({item:i,ok:false})),notes:"" });
  };

  const handleAddTicket = async () => {
    if (!selectedProp) return;
    setSaving(true);
    const { data } = await supabase.from("maintenance_tickets").insert({
      property_id:selectedProp.id, agency_id:userId, opened_by:userId, opened_by_name:"Imobiliária",
      title:ticketForm.title, description:ticketForm.description, priority:ticketForm.priority, status:"open",
    }).select().single();
    if (data) setTickets(prev => [...prev, data]);
    setSaving(false); setShowAddTicket(false);
    setTicketForm({ title:"",description:"",priority:"medium" });
  };

  const handleAddPayment = async () => {
    if (!selectedProp) return;
    setSaving(true);
    const total = selectedProp.rent_amount + (selectedProp.condo_amount||0);
    const { data } = await supabase.from("rental_payments").insert({
      property_id:selectedProp.id, agency_id:userId, tenant_name:selectedProp.tenant_name,
      month_ref:payForm.monthRef, rent_amount:selectedProp.rent_amount, condo_amount:selectedProp.condo_amount||0,
      total_amount:total, payment_method:payForm.method, status:"paid", paid_at:new Date().toISOString(),
      tenant_confirmed:true, agency_confirmed:true, landlord_confirmed:false,
    }).select().single();
    if (data) setRentalPayments(prev => [...prev, data]);
    setSaving(false); setShowAddPayment(false);
    setPayForm({ monthRef:"",method:"pix" });
  };

  const confirmLandlord = async (payId: string) => {
    await supabase.from("rental_payments").update({ landlord_confirmed:true }).eq("id", payId);
    setRentalPayments(prev => prev.map(p => p.id === payId ? {...p, landlord_confirmed:true} : p));
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ textAlign:"center" }}><div style={{ width:48,height:48,borderRadius:12,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:900,fontSize:20,margin:"0 auto 16px" }}>FX</div><div style={{ color:C.textSec }}>Carregando...</div></div>
    </div>
  );

  const occ = properties.filter(p=>p.status==="occupied").length;
  const vac = properties.filter(p=>p.status==="vacant").length;
  const openTix = tickets.filter(t=>t.status==="open").length;
  const pendingPay = rentalPayments.filter(p=>!p.landlord_confirmed).length;
  // ═══ PROPERTY DETAIL ═══
  if (selectedProp) {
    const propContracts = contracts.filter(c => c.property_id === selectedProp.id);
    const propInspections = inspections.filter(i => i.property_id === selectedProp.id);
    const propTickets = tickets.filter(t => t.property_id === selectedProp.id);
    const propPayments = rentalPayments.filter(p => p.property_id === selectedProp.id);

    return (
      <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
        <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={() => { setSelectedProp(null); setPropTab("payments"); }} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div><div style={{ fontSize:17,fontWeight:700 }}>{selectedProp.unit || selectedProp.address.split(",")[0]}</div><div style={{ fontSize:11,opacity:.6 }}>{selectedProp.address}</div></div>
        </div>

        <div style={{ display:"flex",background:C.card,borderBottom:`1px solid ${C.border}`,overflowX:"auto" }}>
          {[{k:"payments",l:"Pagamentos"},{k:"tickets",l:"Chamados"},{k:"contracts",l:"Contratos"},{k:"inspections",l:"Vistorias"}].map(t => (
            <button key={t.k} onClick={() => setPropTab(t.k)} style={{ flex:1,padding:"10px 6px",background:"none",border:"none",borderBottom:propTab===t.k?`3px solid ${C.primary}`:"3px solid transparent",color:propTab===t.k?C.primary:C.textTer,fontSize:11,fontWeight:propTab===t.k?700:500,cursor:"pointer",whiteSpace:"nowrap" }}>{t.l}</button>
          ))}
        </div>

        <div style={{ maxWidth:700,margin:"0 auto",padding:20 }}>
          {/* PAYMENTS TAB */}
          {propTab === "payments" && <>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16 }}>
              <div style={{ background:C.primaryLight,borderRadius:12,padding:14 }}><div style={{ fontSize:11,color:"#7a6000" }}>Aluguel</div><div style={{ fontSize:20,fontWeight:800,color:C.primaryText,marginTop:4 }}>R$ {selectedProp.rent_amount?.toLocaleString("pt-BR")}</div></div>
              <div style={{ background:C.greenLight,borderRadius:12,padding:14 }}><div style={{ fontSize:11,color:C.green }}>Condomínio</div><div style={{ fontSize:20,fontWeight:800,color:C.green,marginTop:4 }}>R$ {(selectedProp.condo_amount||0).toLocaleString("pt-BR")}</div></div>
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}><span style={{ fontSize:14,fontWeight:700,color:C.text }}>Histórico</span>
              {selectedProp.status==="occupied" && <button onClick={() => setShowAddPayment(true)} style={{ padding:"6px 14px",borderRadius:8,background:C.primary,color:C.primaryText,border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>+ Registrar</button>}
            </div>
            {propPayments.length === 0 ? <div style={{ textAlign:"center",padding:30,color:C.textTer,fontSize:13 }}>Nenhum pagamento registrado</div>
            : propPayments.map(p => (
              <div key={p.id} style={{ background:C.card,borderRadius:12,padding:14,border:`1px solid ${C.border}`,marginBottom:8 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}><span style={{ fontSize:14,fontWeight:700,color:C.text }}>{p.month_ref}</span><span style={{ fontSize:13,fontWeight:800,color:C.primary }}>R$ {p.total_amount?.toLocaleString("pt-BR")}</span></div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginTop:8 }}>
                  <span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,background:p.tenant_confirmed?C.greenLight:C.amberLight,color:p.tenant_confirmed?C.green:C.amber }}>Locatário {p.tenant_confirmed?"✓":"⏳"}</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,background:p.agency_confirmed?C.greenLight:C.amberLight,color:p.agency_confirmed?C.green:C.amber }}>Imobiliária {p.agency_confirmed?"✓":"⏳"}</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,background:p.landlord_confirmed?C.greenLight:C.amberLight,color:p.landlord_confirmed?C.green:C.amber }}>Proprietário {p.landlord_confirmed?"✓":"⏳"}</span>
                </div>
                {!p.landlord_confirmed && <button onClick={() => confirmLandlord(p.id)} style={{ width:"100%",marginTop:8,padding:"8px 0",borderRadius:8,background:C.green,color:"#fff",border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>Confirmar repasse ao proprietário</button>}
              </div>
            ))}
          </>}

          {/* TICKETS TAB */}
          {propTab === "tickets" && <>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}><span style={{ fontSize:14,fontWeight:700,color:C.text }}>Chamados</span>
              <button onClick={() => setShowAddTicket(true)} style={{ padding:"6px 14px",borderRadius:8,background:C.amber,color:"#fff",border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>+ Novo</button>
            </div>
            {propTickets.length === 0 ? <div style={{ textAlign:"center",padding:30,color:C.textTer,fontSize:13 }}>Nenhum chamado</div>
            : propTickets.map(t => (
              <div key={t.id} style={{ background:C.card,borderRadius:12,padding:14,border:`1px solid ${t.priority==="high"?C.red:C.border}`,marginBottom:8 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}><span style={{ fontSize:13,fontWeight:700,color:C.text }}>{t.title}</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:t.status==="open"?C.redLight:t.status==="in_progress"?C.amberLight:C.greenLight,color:t.status==="open"?C.red:t.status==="in_progress"?C.amber:C.green }}>{t.status==="open"?"Aberto":t.status==="in_progress"?"Em andamento":"Resolvido"}</span>
                </div>
                {t.description && <div style={{ fontSize:12,color:C.textSec,marginTop:4,lineHeight:1.5 }}>{t.description}</div>}
                <div style={{ fontSize:11,color:C.textTer,marginTop:6 }}>{new Date(t.created_at).toLocaleDateString("pt-BR")} • Prioridade: {t.priority==="high"?"Alta":t.priority==="medium"?"Média":"Baixa"}</div>
                {t.status==="open" && <div style={{ display:"flex",gap:6,marginTop:8 }}>
                  <button onClick={async () => { await supabase.from("maintenance_tickets").update({status:"in_progress"}).eq("id",t.id); setTickets(prev=>prev.map(x=>x.id===t.id?{...x,status:"in_progress"}:x)); }} style={{ flex:1,padding:"7px 0",borderRadius:8,background:C.amber,color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer" }}>Iniciar</button>
                  <button onClick={() => router.push("/dashboard")} style={{ flex:1,padding:"7px 0",borderRadius:8,background:C.primary,color:C.primaryText,border:"none",fontSize:11,fontWeight:700,cursor:"pointer" }}>Buscar prestador</button>
                </div>}
                {t.status==="in_progress" && <button onClick={async () => { await supabase.from("maintenance_tickets").update({status:"resolved",resolved_at:new Date().toISOString()}).eq("id",t.id); setTickets(prev=>prev.map(x=>x.id===t.id?{...x,status:"resolved"}:x)); }} style={{ width:"100%",marginTop:8,padding:"7px 0",borderRadius:8,background:C.green,color:"#fff",border:"none",fontSize:11,fontWeight:700,cursor:"pointer" }}>Marcar resolvido</button>}
              </div>
            ))}
          </>}

          {/* CONTRACTS TAB */}
          {propTab === "contracts" && !viewContract && <>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}><span style={{ fontSize:14,fontWeight:700,color:C.text }}>Contratos</span>
              <button onClick={() => { setContractForm({...contractForm,rent:String(selectedProp.rent_amount),condo:String(selectedProp.condo_amount||0)}); setShowAddContract(true); }} style={{ padding:"6px 14px",borderRadius:8,background:C.green,color:"#fff",border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>+ Criar</button>
            </div>
            {propContracts.length === 0 ? <div style={{ textAlign:"center",padding:30,color:C.textTer,fontSize:13 }}>Nenhum contrato</div>
            : propContracts.map(c => (
              <div key={c.id} style={{ background:C.card,borderRadius:12,padding:14,border:`1px solid ${C.border}`,marginBottom:8 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontSize:14,fontWeight:700,color:C.text }}>Contrato de Locação</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:c.status==="signed"?C.greenLight:c.status==="tenant_signed"?"#E3F2FD":c.status==="sent"?C.amberLight:C.divider,color:c.status==="signed"?C.green:c.status==="tenant_signed"?"#1565C0":c.status==="sent"?C.amber:C.textTer }}>
                    {c.status==="signed"?"✓ Assinado":c.status==="tenant_signed"?"Locatário assinou":c.status==="sent"?"Aguardando assinatura":"Rascunho"}
                  </span>
                </div>
                <div style={{ fontSize:12,color:C.textSec,lineHeight:1.8 }}>
                  <div>Locatário: <strong style={{ color:C.text }}>{c.tenant_name}</strong></div>
                  <div>Proprietário: <strong style={{ color:C.text }}>{selectedProp.landlord_name}</strong></div>
                  <div>Vigência: {c.start_date} a {c.end_date}</div>
                  <div>Valor: <strong style={{ color:C.primary }}>R$ {c.rent_amount?.toLocaleString("pt-BR")}/mês</strong>{c.condo_amount > 0 && ` + R$ ${c.condo_amount?.toLocaleString("pt-BR")} cond.`}</div>
                </div>
                <div style={{ display:"flex",gap:6,marginTop:10 }}>
                  <button onClick={() => setViewContract(c)} style={{ flex:1,padding:"8px 0",borderRadius:8,background:C.primaryLight,color:"#7a6000",border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>Ver contrato</button>
                  {c.status==="draft" && <button onClick={async () => { await supabase.from("contracts").update({status:"sent"}).eq("id",c.id); setContracts(prev=>prev.map(x=>x.id===c.id?{...x,status:"sent"}:x)); }} style={{ flex:1,padding:"8px 0",borderRadius:8,background:C.primary,color:C.primaryText,border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>Enviar para assinatura</button>}
                  {c.status==="tenant_signed" && <button onClick={async () => { await supabase.from("contracts").update({status:"signed",signed_at:new Date().toISOString()}).eq("id",c.id); setContracts(prev=>prev.map(x=>x.id===c.id?{...x,status:"signed",signed_at:new Date().toISOString()}:x)); }} style={{ flex:1,padding:"8px 0",borderRadius:8,background:C.green,color:"#fff",border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>Confirmar assinatura locador</button>}
                </div>
                {c.signed_at && <div style={{ marginTop:8,fontSize:11,color:C.green }}>✓ Assinado em {new Date(c.signed_at).toLocaleDateString("pt-BR")} às {new Date(c.signed_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>}
              </div>
            ))}
          </>}

          {/* CONTRACT DETAIL VIEW */}
          {propTab === "contracts" && viewContract && (
            <>
              <button onClick={() => setViewContract(null)} style={{ background:"none",border:"none",color:C.textSec,cursor:"pointer",fontSize:14,marginBottom:16 }}>← Voltar aos contratos</button>
              <div style={{ background:C.card,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden" }}>
                <div style={{ background:C.dark,padding:"16px 20px",color:"#fff" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                    <div style={{ width:28,height:28,borderRadius:8,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:900,fontSize:11 }}>FX</div>
                    <span style={{ fontSize:14,fontWeight:800 }}>Fix<span style={{ color:C.primary }}>IMOB</span></span>
                  </div>
                  <div style={{ fontSize:18,fontWeight:800 }}>CONTRATO DE LOCAÇÃO RESIDENCIAL</div>
                  <div style={{ fontSize:12,opacity:.6,marginTop:4 }}>Contrato nº {viewContract.id?.slice(0,8).toUpperCase()}</div>
                </div>
                <div style={{ padding:20 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:C.text,marginBottom:12,textTransform:"uppercase",letterSpacing:.5,borderBottom:`2px solid ${C.primary}`,paddingBottom:6 }}>Partes envolvidas</div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20 }}>
                    <div style={{ padding:14,background:C.bg,borderRadius:10 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.primary,textTransform:"uppercase",letterSpacing:.5,marginBottom:6 }}>Locador (Proprietário)</div>
                      <div style={{ fontSize:14,fontWeight:700,color:C.text }}>{selectedProp.landlord_name}</div>
                      {selectedProp.landlord_phone && <div style={{ fontSize:12,color:C.textSec,marginTop:2 }}>{selectedProp.landlord_phone}</div>}
                      {selectedProp.landlord_email && <div style={{ fontSize:12,color:C.textSec }}>{selectedProp.landlord_email}</div>}
                    </div>
                    <div style={{ padding:14,background:C.bg,borderRadius:10 }}>
                      <div style={{ fontSize:10,fontWeight:700,color:C.primary,textTransform:"uppercase",letterSpacing:.5,marginBottom:6 }}>Locatário (Inquilino)</div>
                      <div style={{ fontSize:14,fontWeight:700,color:C.text }}>{viewContract.tenant_name}</div>
                      {viewContract.tenant_cpf && <div style={{ fontSize:12,color:C.textSec,marginTop:2 }}>CPF: {viewContract.tenant_cpf}</div>}
                    </div>
                  </div>

                  <div style={{ fontSize:13,fontWeight:700,color:C.text,marginBottom:12,textTransform:"uppercase",letterSpacing:.5,borderBottom:`2px solid ${C.primary}`,paddingBottom:6 }}>Objeto da locação</div>
                  <div style={{ padding:14,background:C.bg,borderRadius:10,marginBottom:20 }}>
                    <div style={{ fontSize:13,color:C.textSec,lineHeight:1.8 }}>
                      <div>Endereço: <strong style={{ color:C.text }}>{selectedProp.address}</strong></div>
                      {selectedProp.unit && <div>Unidade: <strong style={{ color:C.text }}>{selectedProp.unit}</strong></div>}
                      <div>Tipo: <strong style={{ color:C.text }}>{selectedProp.property_type}</strong></div>
                      {selectedProp.area_m2 && <div>Área: <strong style={{ color:C.text }}>{selectedProp.area_m2}m²</strong></div>}
                    </div>
                  </div>

                  <div style={{ fontSize:13,fontWeight:700,color:C.text,marginBottom:12,textTransform:"uppercase",letterSpacing:.5,borderBottom:`2px solid ${C.primary}`,paddingBottom:6 }}>Condições financeiras</div>
                  <div style={{ padding:14,background:C.bg,borderRadius:10,marginBottom:20 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13,borderBottom:`1px solid ${C.divider}` }}><span style={{ color:C.textSec }}>Aluguel mensal</span><span style={{ fontWeight:700,color:C.text }}>R$ {viewContract.rent_amount?.toLocaleString("pt-BR",{minimumFractionDigits:2})}</span></div>
                    {viewContract.condo_amount > 0 && <div style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13,borderBottom:`1px solid ${C.divider}` }}><span style={{ color:C.textSec }}>Condomínio</span><span style={{ fontWeight:700,color:C.text }}>R$ {viewContract.condo_amount?.toLocaleString("pt-BR",{minimumFractionDigits:2})}</span></div>}
                    <div style={{ display:"flex",justifyContent:"space-between",padding:"8px 0 0",fontSize:14,fontWeight:800 }}><span>Total mensal</span><span style={{ color:C.primary }}>R$ {((viewContract.rent_amount||0)+(viewContract.condo_amount||0)).toLocaleString("pt-BR",{minimumFractionDigits:2})}</span></div>
                  </div>

                  <div style={{ fontSize:13,fontWeight:700,color:C.text,marginBottom:12,textTransform:"uppercase",letterSpacing:.5,borderBottom:`2px solid ${C.primary}`,paddingBottom:6 }}>Vigência</div>
                  <div style={{ padding:14,background:C.bg,borderRadius:10,marginBottom:20 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:13 }}>
                      <div><div style={{ fontSize:10,color:C.textTer }}>Início</div><div style={{ fontWeight:700,color:C.text,marginTop:2 }}>{viewContract.start_date}</div></div>
                      <div style={{ fontSize:20,color:C.border }}>→</div>
                      <div style={{ textAlign:"right" }}><div style={{ fontSize:10,color:C.textTer }}>Término</div><div style={{ fontWeight:700,color:C.text,marginTop:2 }}>{viewContract.end_date}</div></div>
                    </div>
                  </div>

                  <div style={{ fontSize:13,fontWeight:700,color:C.text,marginBottom:12,textTransform:"uppercase",letterSpacing:.5,borderBottom:`2px solid ${C.primary}`,paddingBottom:6 }}>Cláusulas</div>
                  <div style={{ fontSize:12,color:C.textSec,lineHeight:1.8,marginBottom:20 }}>
                    <p style={{ marginBottom:8 }}><strong style={{ color:C.text }}>1.</strong> O LOCATÁRIO se obriga a pagar pontualmente o aluguel e encargos até o dia 10 de cada mês, sob pena de multa de 2% e juros de 1% ao mês.</p>
                    <p style={{ marginBottom:8 }}><strong style={{ color:C.text }}>2.</strong> O imóvel deverá ser utilizado exclusivamente para fins {selectedProp.property_type === "Sala Comercial" || selectedProp.property_type === "Loja" ? "comerciais" : "residenciais"}.</p>
                    <p style={{ marginBottom:8 }}><strong style={{ color:C.text }}>3.</strong> Qualquer benfeitoria ou alteração no imóvel dependerá de autorização prévia e por escrito do LOCADOR.</p>
                    <p style={{ marginBottom:8 }}><strong style={{ color:C.text }}>4.</strong> O LOCATÁRIO deverá devolver o imóvel nas mesmas condições da vistoria de entrada, ressalvado o desgaste natural.</p>
                    <p style={{ marginBottom:8 }}><strong style={{ color:C.text }}>5.</strong> Em caso de rescisão antecipada pelo LOCATÁRIO, será devida multa proporcional ao tempo restante do contrato.</p>
                    <p style={{ marginBottom:8 }}><strong style={{ color:C.text }}>6.</strong> O LOCADOR poderá vistoriar o imóvel mediante agendamento prévio de 48 horas.</p>
                    <p style={{ marginBottom:8 }}><strong style={{ color:C.text }}>7.</strong> Este contrato é regido pela Lei do Inquilinato (Lei nº 8.245/91) e pelo Código Civil Brasileiro.</p>
                  </div>

                  <div style={{ fontSize:13,fontWeight:700,color:C.text,marginBottom:12,textTransform:"uppercase",letterSpacing:.5,borderBottom:`2px solid ${C.primary}`,paddingBottom:6 }}>Assinaturas</div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20 }}>
                    <div style={{ padding:14,borderRadius:10,border:`1px solid ${viewContract.status==="tenant_signed"||viewContract.status==="signed"?C.green:C.border}`,background:viewContract.status==="tenant_signed"||viewContract.status==="signed"?C.greenLight:"transparent" }}>
                      <div style={{ fontSize:11,fontWeight:700,color:C.textTer,marginBottom:4 }}>Locatário</div>
                      <div style={{ fontSize:13,fontWeight:700,color:C.text }}>{viewContract.tenant_name}</div>
                      {(viewContract.status==="tenant_signed"||viewContract.status==="signed") ? (
                        <div style={{ fontSize:11,color:C.green,marginTop:4 }}>✓ Assinado digitalmente</div>
                      ) : viewContract.status==="sent" ? (
                        <div style={{ fontSize:11,color:C.amber,marginTop:4 }}>⏳ Aguardando assinatura</div>
                      ) : (
                        <div style={{ fontSize:11,color:C.textTer,marginTop:4 }}>Pendente de envio</div>
                      )}
                    </div>
                    <div style={{ padding:14,borderRadius:10,border:`1px solid ${viewContract.status==="signed"?C.green:C.border}`,background:viewContract.status==="signed"?C.greenLight:"transparent" }}>
                      <div style={{ fontSize:11,fontWeight:700,color:C.textTer,marginBottom:4 }}>Locador</div>
                      <div style={{ fontSize:13,fontWeight:700,color:C.text }}>{selectedProp.landlord_name}</div>
                      {viewContract.status==="signed" ? (
                        <div style={{ fontSize:11,color:C.green,marginTop:4 }}>✓ Assinado digitalmente</div>
                      ) : (
                        <div style={{ fontSize:11,color:C.textTer,marginTop:4 }}>{viewContract.status==="tenant_signed"?"Aguardando assinatura":"Pendente"}</div>
                      )}
                    </div>
                  </div>

                  {viewContract.signed_at && (
                    <div style={{ padding:14,background:C.greenLight,borderRadius:10,marginBottom:16 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:700,color:C.green }}>✓ Contrato assinado por ambas as partes</div>
                      <div style={{ fontSize:11,color:C.green,marginTop:4 }}>Data: {new Date(viewContract.signed_at).toLocaleDateString("pt-BR")} às {new Date(viewContract.signed_at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  {viewContract.status === "draft" && (
                    <button onClick={async () => { await supabase.from("contracts").update({status:"sent"}).eq("id",viewContract.id); setViewContract({...viewContract,status:"sent"}); setContracts(prev=>prev.map(x=>x.id===viewContract.id?{...x,status:"sent"}:x)); }}
                      style={{ width:"100%",padding:"14px 0",borderRadius:10,background:C.primary,color:C.primaryText,border:"none",fontSize:15,fontWeight:700,cursor:"pointer" }}>
                      Enviar para assinatura
                    </button>
                  )}

                  {viewContract.status === "sent" && (
                    <div>
                      <div style={{ padding:12,background:C.amberLight,borderRadius:10,marginBottom:12,fontSize:12,color:C.amber,lineHeight:1.5 }}>
                        Aguardando assinatura do locatário. Quando o locatário acessar o app, ele poderá visualizar e assinar este contrato.
                      </div>
                      <button onClick={async () => { await supabase.from("contracts").update({status:"tenant_signed"}).eq("id",viewContract.id); setViewContract({...viewContract,status:"tenant_signed"}); setContracts(prev=>prev.map(x=>x.id===viewContract.id?{...x,status:"tenant_signed"}:x)); }}
                        style={{ width:"100%",padding:"14px 0",borderRadius:10,background:"#1565C0",color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:"pointer" }}>
                        Simular: Locatário assinou ✓
                      </button>
                    </div>
                  )}

                  {viewContract.status === "tenant_signed" && (
                    <div>
                      <div style={{ padding:12,background:"#E3F2FD",borderRadius:10,marginBottom:12,fontSize:12,color:"#1565C0",lineHeight:1.5 }}>
                        ✓ Locatário assinou. Falta a assinatura do locador (proprietário) para concluir o contrato.
                      </div>
                      <button onClick={async () => { const now = new Date().toISOString(); await supabase.from("contracts").update({status:"signed",signed_at:now}).eq("id",viewContract.id); setViewContract({...viewContract,status:"signed",signed_at:now}); setContracts(prev=>prev.map(x=>x.id===viewContract.id?{...x,status:"signed",signed_at:now}:x)); }}
                        style={{ width:"100%",padding:"14px 0",borderRadius:10,background:C.green,color:"#fff",border:"none",fontSize:15,fontWeight:700,cursor:"pointer" }}>
                        Locador assinar contrato ✓
                      </button>
                    </div>
                  )}

                  {viewContract.status === "signed" && (
                    <div style={{ textAlign:"center",padding:10 }}>
                      <div style={{ fontSize:14,fontWeight:700,color:C.green,marginBottom:8 }}>✓ Contrato finalizado</div>
                      <div style={{ fontSize:12,color:C.textSec }}>Todas as partes assinaram. O contrato está em vigor.</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
            {/* INSPECTIONS TAB */}
          {propTab === "inspections" && <>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}><span style={{ fontSize:14,fontWeight:700,color:C.text }}>Vistorias</span>
              <button onClick={() => setShowAddInspection(true)} style={{ padding:"6px 14px",borderRadius:8,background:C.amber,color:"#fff",border:"none",fontSize:12,fontWeight:700,cursor:"pointer" }}>+ Nova</button>
            </div>
            {propInspections.length === 0 ? <div style={{ textAlign:"center",padding:30,color:C.textTer,fontSize:13 }}>Nenhuma vistoria</div>
            : propInspections.map(ins => {
              const cl = typeof ins.checklist === "string" ? JSON.parse(ins.checklist) : ins.checklist;
              return (
                <div key={ins.id} style={{ background:C.card,borderRadius:12,padding:14,border:`1px solid ${C.border}`,marginBottom:8 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                    <span style={{ fontSize:14,fontWeight:700,color:C.text }}>Vistoria de {ins.inspection_type}</span>
                    <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:C.greenLight,color:C.green }}>Concluída</span>
                  </div>
                  <div style={{ fontSize:12,color:C.textSec,marginBottom:8 }}>{new Date(ins.created_at).toLocaleDateString("pt-BR")} • {ins.issues_count} pendência(s)</div>
                  {Array.isArray(cl) && cl.map((c:any,i:number) => (
                    <div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"4px 0",fontSize:12 }}>
                      <span style={{ color:c.ok?C.green:C.red }}>{c.ok?"✓":"✗"}</span>
                      <span style={{ color:c.ok?C.textSec:C.red }}>{c.item}</span>
                    </div>
                  ))}
                  {ins.notes && <div style={{ marginTop:8,padding:10,background:C.bg,borderRadius:8,fontSize:12,color:C.textSec }}>{ins.notes}</div>}
                </div>
              );
            })}
          </>}
        </div>

        {/* ═══ MODALS ═══ */}
        {showAddPayment && <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:50,display:"flex",alignItems:"flex-end",justifyContent:"center" }}><div style={{ background:C.card,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:500,maxHeight:"80vh",overflow:"auto",padding:24 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:16 }}><span style={{ fontSize:16,fontWeight:700 }}>Registrar Pagamento</span><button onClick={() => setShowAddPayment(false)} style={{ background:"none",border:"none",cursor:"pointer",fontSize:18 }}>✕</button></div>
          <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6 }}>Mês referência *</label>
          <input value={payForm.monthRef} onChange={e => setPayForm({...payForm,monthRef:e.target.value})} placeholder="Ex: Abr/2026" style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:12,outline:"none",boxSizing:"border-box" }} />
          <div style={{ background:C.bg,borderRadius:10,padding:12,marginBottom:12 }}>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:13 }}><span style={{ color:C.textSec }}>Aluguel</span><span style={{ fontWeight:700 }}>R$ {selectedProp.rent_amount?.toLocaleString("pt-BR")}</span></div>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginTop:4 }}><span style={{ color:C.textSec }}>Condomínio</span><span style={{ fontWeight:700 }}>R$ {(selectedProp.condo_amount||0).toLocaleString("pt-BR")}</span></div>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:800,marginTop:8,paddingTop:8,borderTop:`1px solid ${C.divider}` }}><span>Total</span><span style={{ color:C.primary }}>R$ {(selectedProp.rent_amount+(selectedProp.condo_amount||0)).toLocaleString("pt-BR")}</span></div>
          </div>
          <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6 }}>Método</label>
          <select value={payForm.method} onChange={e => setPayForm({...payForm,method:e.target.value})} style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:16,background:C.card }}>
            <option value="pix">PIX</option><option value="boleto">Boleto</option><option value="credit">Crédito</option><option value="debit">Débito</option>
          </select>
          <button onClick={handleAddPayment} disabled={!payForm.monthRef||saving} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:payForm.monthRef&&!saving?C.green:C.textTer,color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:payForm.monthRef&&!saving?"pointer":"default" }}>{saving?"Salvando...":"Confirmar pagamento"}</button>
        </div></div>}

        {showAddTicket && <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:50,display:"flex",alignItems:"flex-end",justifyContent:"center" }}><div style={{ background:C.card,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:500,maxHeight:"80vh",overflow:"auto",padding:24 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:16 }}><span style={{ fontSize:16,fontWeight:700 }}>Novo Chamado</span><button onClick={() => setShowAddTicket(false)} style={{ background:"none",border:"none",cursor:"pointer",fontSize:18 }}>✕</button></div>
          <input value={ticketForm.title} onChange={e => setTicketForm({...ticketForm,title:e.target.value})} placeholder="Título do problema" style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:12,outline:"none",boxSizing:"border-box" }} />
          <textarea value={ticketForm.description} onChange={e => setTicketForm({...ticketForm,description:e.target.value})} placeholder="Descreva o problema..." style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:12,outline:"none",boxSizing:"border-box",minHeight:60,resize:"vertical",fontFamily:"inherit" }} />
          <select value={ticketForm.priority} onChange={e => setTicketForm({...ticketForm,priority:e.target.value})} style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:16,background:C.card }}>
            <option value="low">Prioridade: Baixa</option><option value="medium">Prioridade: Média</option><option value="high">Prioridade: Alta</option>
          </select>
          <button onClick={handleAddTicket} disabled={!ticketForm.title||saving} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:ticketForm.title&&!saving?C.amber:C.textTer,color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:ticketForm.title&&!saving?"pointer":"default" }}>{saving?"Salvando...":"Abrir chamado"}</button>
        </div></div>}

        {showAddContract && <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:50,display:"flex",alignItems:"flex-end",justifyContent:"center" }}><div style={{ background:C.card,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:500,maxHeight:"85vh",overflow:"auto",padding:24 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:16 }}><span style={{ fontSize:16,fontWeight:700 }}>Criar Contrato</span><button onClick={() => setShowAddContract(false)} style={{ background:"none",border:"none",cursor:"pointer",fontSize:18 }}>✕</button></div>
          <input value={contractForm.tenantName} onChange={e => setContractForm({...contractForm,tenantName:e.target.value})} placeholder="Nome do locatário" style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:10,outline:"none",boxSizing:"border-box" }} />
          <input value={contractForm.tenantCpf} onChange={e => setContractForm({...contractForm,tenantCpf:e.target.value})} placeholder="CPF do locatário" style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:10,outline:"none",boxSizing:"border-box" }} />
          <input value={contractForm.rent} onChange={e => setContractForm({...contractForm,rent:e.target.value})} placeholder="Valor aluguel" type="number" style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:10,outline:"none",boxSizing:"border-box" }} />
          <input value={contractForm.condo} onChange={e => setContractForm({...contractForm,condo:e.target.value})} placeholder="Valor condomínio" type="number" style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:10,outline:"none",boxSizing:"border-box" }} />
          <div style={{ display:"flex",gap:8,marginBottom:10 }}><input value={contractForm.startDate} onChange={e => setContractForm({...contractForm,startDate:e.target.value})} type="date" style={{ flex:1,padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13 }} /><input value={contractForm.endDate} onChange={e => setContractForm({...contractForm,endDate:e.target.value})} type="date" style={{ flex:1,padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13 }} /></div>
          <select value={contractForm.paymentMode} onChange={e => setContractForm({...contractForm,paymentMode:e.target.value})} style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:16,background:C.card }}>
            <option value="via_agency">Pagamento via imobiliária</option><option value="direct">Pagamento direto</option>
          </select>
          <button onClick={handleAddContract} disabled={!contractForm.tenantName||!contractForm.startDate||!contractForm.endDate||saving} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:contractForm.tenantName&&contractForm.startDate&&!saving?C.green:C.textTer,color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:"pointer" }}>{saving?"Salvando...":"Criar contrato"}</button>
        </div></div>}

        {showAddInspection && <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:50,display:"flex",alignItems:"flex-end",justifyContent:"center" }}><div style={{ background:C.card,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:500,maxHeight:"85vh",overflow:"auto",padding:24 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:16 }}><span style={{ fontSize:16,fontWeight:700 }}>Nova Vistoria</span><button onClick={() => setShowAddInspection(false)} style={{ background:"none",border:"none",cursor:"pointer",fontSize:18 }}>✕</button></div>
          <select value={inspForm.type} onChange={e => setInspForm({...inspForm,type:e.target.value})} style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:12,background:C.card }}>
            <option>Entrada</option><option>Saída</option><option>Periódica</option>
          </select>
          <div style={{ fontSize:13,fontWeight:700,color:C.text,marginBottom:8 }}>Checklist</div>
          {inspForm.checklist.map((c,i) => (
            <label key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${C.divider}`,fontSize:13,color:C.text,cursor:"pointer" }}>
              <input type="checkbox" checked={c.ok} onChange={() => { const n = [...inspForm.checklist]; n[i] = {...n[i],ok:!n[i].ok}; setInspForm({...inspForm,checklist:n}); }} style={{ accentColor:C.primary,width:18,height:18 }} />{c.item}
            </label>
          ))}
          <textarea value={inspForm.notes} onChange={e => setInspForm({...inspForm,notes:e.target.value})} placeholder="Observações (opcional)" style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginTop:12,marginBottom:16,outline:"none",boxSizing:"border-box",minHeight:60,resize:"vertical",fontFamily:"inherit" }} />
          <button onClick={handleAddInspection} disabled={saving} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:saving?C.textTer:C.amber,color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:saving?"default":"pointer" }}>{saving?"Salvando...":"Salvar vistoria"}</button>
        </div></div>}
      </div>
    );
  }

  // ═══ ADD PROPERTY FORM ═══
  if (showAddProp) return (
    <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
        <button onClick={() => setShowAddProp(false)} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}><path d="M15 19l-7-7 7-7"/></svg></button>
        <div style={{ fontSize:17,fontWeight:700 }}>Cadastrar Imóvel</div>
      </div>
      <div style={{ maxWidth:500,margin:"0 auto",padding:20 }}>
        {[{l:"Endereço *",k:"address",ph:"R. Conselheiro Nébias, 432"},{l:"Unidade",k:"unit",ph:"Apto 71"},{l:"Área (m²)",k:"area",ph:"68",t:"number"},{l:"Aluguel (R$) *",k:"rent",ph:"2800",t:"number"},{l:"Condomínio (R$)",k:"condo",ph:"650",t:"number"},{l:"Nome do proprietário *",k:"landlordName",ph:"Maria Helena"},{l:"Telefone proprietário",k:"landlordPhone",ph:"(13) 99999-0000"},{l:"Email proprietário",k:"landlordEmail",ph:"email@email.com"}].map(f => (
          <div key={f.k}>
            <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6 }}>{f.l}</label>
            <input value={(propForm as any)[f.k]} onChange={e => setPropForm({...propForm,[f.k]:e.target.value})} placeholder={f.ph} type={f.t||"text"} style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:12,outline:"none",boxSizing:"border-box" }} />
          </div>
        ))}
        <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6 }}>Tipo de imóvel</label>
        <select value={propForm.type} onChange={e => setPropForm({...propForm,type:e.target.value})} style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:12,background:C.card }}>
          <option>Apartamento</option><option>Casa</option><option>Sala Comercial</option><option>Kitnet</option><option>Loja</option>
        </select>
        <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6 }}>Fluxo de pagamento</label>
        <select value={propForm.paymentMode} onChange={e => setPropForm({...propForm,paymentMode:e.target.value})} style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,marginBottom:20,background:C.card }}>
          <option value="via_agency">Via imobiliária (repasse ao proprietário)</option><option value="direct">Direto (split automático)</option>
        </select>
        <button onClick={handleAddProperty} disabled={!propForm.address||!propForm.rent||!propForm.landlordName||saving} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:propForm.address&&propForm.rent&&propForm.landlordName&&!saving?C.primary:C.textTer,color:C.primaryText,border:"none",fontSize:15,fontWeight:700,cursor:"pointer" }}>{saving?"Salvando...":"Cadastrar imóvel"}</button>
      </div>
    </div>
  );

  // ═══ HOME ═══
  return (
    <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ padding:"18px 20px 14px",background:C.dark,color:"#fff" }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}><div style={{ width:32,height:32,borderRadius:8,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:900,fontSize:13 }}>FX</div><div><div style={{ fontSize:11,opacity:.6 }}>Painel administrativo</div><div style={{ fontSize:16,fontWeight:800 }}>Fix<span style={{ color:C.primary }}>IMOB</span></div></div></div>
            <button onClick={() => router.push("/dashboard")} style={{ padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,.1)",color:"#fff",border:"1px solid rgba(255,255,255,.2)",fontSize:12,fontWeight:600,cursor:"pointer" }}>← Voltar</button>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8 }}>
            {[{v:properties.length,l:"Imóveis",bg:"rgba(242,183,5,.12)"},{v:occ,l:"Ocupados",bg:"rgba(46,125,50,.15)"},{v:pendingPay,l:"Pendentes",bg:"rgba(198,40,40,.12)"},{v:openTix,l:"Chamados",bg:"rgba(230,81,0,.12)"}].map((s,i) => (
              <div key={i} style={{ background:s.bg,borderRadius:10,padding:"10px 8px",textAlign:"center" }}><div style={{ fontSize:18,fontWeight:800,color:C.primary }}>{s.v}</div><div style={{ fontSize:9.5,opacity:.6 }}>{s.l}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth:900,margin:"0 auto",padding:"16px 20px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
          <span style={{ fontSize:16,fontWeight:700,color:C.text }}>Imóveis</span>
          <button onClick={() => setShowAddProp(true)} style={{ padding:"8px 16px",borderRadius:8,background:C.primary,color:C.primaryText,border:"none",fontSize:13,fontWeight:700,cursor:"pointer" }}>+ Cadastrar imóvel</button>
        </div>
        {properties.length === 0 ? (
          <div style={{ textAlign:"center",padding:40,background:C.card,borderRadius:14,border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:28,marginBottom:10 }}>🏢</div><div style={{ fontSize:16,fontWeight:700,color:C.text,marginBottom:6 }}>Nenhum imóvel cadastrado</div><div style={{ fontSize:13,color:C.textSec }}>Cadastre seu primeiro imóvel para começar a gerenciar.</div>
          </div>
        ) : (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",gap:10 }}>
            {properties.map(pr => (
              <button key={pr.id} onClick={() => { setSelectedProp(pr); loadPropertyData(pr.id); setPropTab("payments"); }} style={{ textAlign:"left",padding:16,background:C.card,border:`1px solid ${C.border}`,borderRadius:14,cursor:"pointer",width:"100%" }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontSize:14,fontWeight:700,color:C.text }}>{pr.unit || pr.address.split(",")[0]}</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:pr.status==="occupied"?C.greenLight:C.amberLight,color:pr.status==="occupied"?C.green:C.amber }}>{pr.status==="occupied"?"Ocupado":"Vago"}</span>
                </div>
                <div style={{ fontSize:12,color:C.textSec,marginBottom:6 }}>{pr.address}</div>
                <div style={{ display:"flex",gap:12,fontSize:12,color:C.textSec }}>
                  <span style={{ fontWeight:700,color:C.primary }}>R$ {pr.rent_amount?.toLocaleString("pt-BR")}/mês</span>
                  {pr.condo_amount > 0 && <span>+ R$ {pr.condo_amount?.toLocaleString("pt-BR")} cond.</span>}
                </div>
                {pr.tenant_name && <div style={{ fontSize:11,color:C.textTer,marginTop:6 }}>Inquilino: {pr.tenant_name} | Proprietário: {pr.landlord_name}</div>}
                <div style={{ marginTop:6 }}><span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:C.primaryLight,color:"#7a6000" }}>{pr.payment_mode==="via_agency"?"Via imobiliária":"Direto"}</span></div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}