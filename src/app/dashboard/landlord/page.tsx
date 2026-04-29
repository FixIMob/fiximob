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

export default function LandlordPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [selectedProp, setSelectedProp] = useState<any>(null);
  const [propPayments, setPropPayments] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);
      // Find properties where user is landlord (by id, email in landlord_email, or landlord_email_alt)
      const { data: props } = await supabase.from("properties").select("*").or(`landlord_id.eq.${user.id},landlord_email.eq.${p?.email},landlord_email_alt.eq.${p?.email}`);
      setProperties(props || []);
      // Update landlord_id if matched by email
      if (props && props.length > 0) {
        for (const prop of props) {
          if (!prop.landlord_id && (prop.landlord_email === p?.email || prop.landlord_email_alt === p?.email)) {
            await supabase.from("properties").update({ landlord_id: user.id }).eq("id", prop.id);
          }
        }
        // Load all payments for all properties
        const propIds = props.map(pr => pr.id);
        const { data: pays } = await supabase.from("rental_payments").select("*").in("property_id", propIds).order("created_at", { ascending: false });
        setAllPayments(pays || []);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const loadPropDetail = async (prop: any) => {
    setSelectedProp(prop);
    const { data: pays } = await supabase.from("rental_payments").select("*").eq("property_id", prop.id).order("created_at", { ascending: false });
    setPropPayments(pays || []);
    const { data: cts } = await supabase.from("contracts").select("*").eq("property_id", prop.id);
    setContracts(cts || []);
  };

  const confirmReceived = async (payId: string) => {
    await supabase.from("rental_payments").update({ landlord_confirmed: true }).eq("id", payId);
    setPropPayments(prev => prev.map(p => p.id === payId ? { ...p, landlord_confirmed: true } : p));
    setAllPayments(prev => prev.map(p => p.id === payId ? { ...p, landlord_confirmed: true } : p));
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ textAlign:"center" }}><div style={{ width:48,height:48,borderRadius:12,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:900,fontSize:20,margin:"0 auto 16px" }}>FX</div><div style={{ color:"#1A1A1A" }}>Carregando...</div></div>
    </div>
  );

  // No properties
  if (properties.length === 0) return (
    <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
        <button onClick={() => router.push("/dashboard")} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}><path d="M15 19l-7-7 7-7"/></svg></button>
        <div style={{ fontSize:17,fontWeight:700 }}>Meus Imóveis</div>
      </div>
      <div style={{ maxWidth:500,margin:"0 auto",padding:24,textAlign:"center" }}>
        <div style={{ fontSize:48,marginBottom:16 }}>🏠</div>
        <div style={{ fontSize:18,fontWeight:800,color:"#1A1A1A",marginBottom:8 }}>Nenhum imóvel vinculado</div>
        <div style={{ fontSize:14,color:"#333",lineHeight:1.6,marginBottom:24 }}>Você ainda não está vinculado como proprietário de nenhum imóvel. Peça para sua imobiliária adicionar seu email como proprietário.</div>
        <button onClick={() => router.push("/dashboard")} style={{ padding:"14px 28px",borderRadius:10,background:C.dark,color:C.primary,border:"none",fontSize:14,fontWeight:700,cursor:"pointer" }}>Voltar ao início</button>
      </div>
    </div>
  );

  // Calculations
  const totalReceived = allPayments.filter(p => p.landlord_confirmed).reduce((a, b) => a + (b.total_amount || 0), 0);
  const totalPending = allPayments.filter(p => !p.landlord_confirmed).reduce((a, b) => a + (b.total_amount || 0), 0);
  const pendingCount = allPayments.filter(p => !p.landlord_confirmed).length;

  // ═══ PROPERTY DETAIL ═══
  if (selectedProp) {
    const activeContract = contracts.find(c => c.status === "signed" || c.status === "sent" || c.status === "tenant_signed");
    return (
      <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg,display:"flex",flexDirection:"column" }}>
        <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={() => setSelectedProp(null)} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}><path d="M15 19l-7-7 7-7"/></svg></button>
          <div><div style={{ fontSize:17,fontWeight:700 }}>{selectedProp.unit || selectedProp.address.split(",")[0]}</div><div style={{ fontSize:11,opacity:.6 }}>{selectedProp.address}</div></div>
        </div>

        <div style={{ flex:1,overflow:"auto" }}>
          <div style={{ maxWidth:700,margin:"0 auto",padding:20 }}>

            {/* Property info */}
            <div style={{ background:C.dark,borderRadius:14,padding:16,marginBottom:16 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div><div style={{ fontSize:10,color:C.textTer,textTransform:"uppercase" }}>Aluguel</div><div style={{ fontSize:20,fontWeight:800,color:C.primary,marginTop:2 }}>R$ {selectedProp.rent_amount?.toLocaleString("pt-BR")}</div></div>
                <div><div style={{ fontSize:10,color:C.textTer,textTransform:"uppercase" }}>Condomínio</div><div style={{ fontSize:20,fontWeight:800,color:C.text,marginTop:2 }}>R$ {(selectedProp.condo_amount||0).toLocaleString("pt-BR")}</div></div>
              </div>
              <div style={{ display:"flex",gap:12,marginTop:12,fontSize:12 }}>
                <span style={{ color:C.textSec }}>Status: <strong style={{ color:selectedProp.status==="occupied"?C.green:C.amber }}>{selectedProp.status==="occupied"?"Ocupado":"Vago"}</strong></span>
                {selectedProp.tenant_name && <span style={{ color:C.textSec }}>Inquilino: <strong style={{ color:C.text }}>{selectedProp.tenant_name}</strong></span>}
              </div>
            </div>

            {/* Contract */}
            {activeContract && (
              <div style={{ background:C.dark,borderRadius:14,padding:16,marginBottom:16 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                  <span style={{ fontSize:14,fontWeight:700,color:C.text }}>Contrato</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:activeContract.status==="signed"?C.greenLight:C.amberLight,color:activeContract.status==="signed"?C.green:C.amber }}>
                    {activeContract.status==="signed"?"✓ Assinado":"Pendente"}
                  </span>
                </div>
                <div style={{ fontSize:12,color:C.textSec,lineHeight:1.8 }}>
                  <div>Locatário: <strong style={{ color:C.text }}>{activeContract.tenant_name}</strong></div>
                  <div>Vigência: {activeContract.start_date} a {activeContract.end_date}</div>
                </div>
                {activeContract.status === "tenant_signed" && (
                  <div style={{ marginTop:12 }}>
                    <div style={{ padding:10,background:C.primaryLight,borderRadius:8,fontSize:12,color:C.primary,marginBottom:8 }}>O locatário já assinou. Sua assinatura é necessária para concluir.</div>
                    <button onClick={async () => {
                      const now = new Date().toISOString();
                      await supabase.from("contracts").update({ status:"signed", signed_at:now }).eq("id", activeContract.id);
                      setContracts(prev => prev.map(c => c.id === activeContract.id ? { ...c, status:"signed", signed_at:now } : c));
                    }} style={{ width:"100%",padding:"12px 0",borderRadius:8,background:C.primary,color:C.primaryText,border:"none",fontSize:14,fontWeight:700,cursor:"pointer" }}>
                      Li e concordo — Assinar contrato
                    </button>
                  </div>
                )}
                {activeContract.signed_at && <div style={{ marginTop:10,fontSize:11,color:C.green }}>✓ Assinado em {new Date(activeContract.signed_at).toLocaleDateString("pt-BR")}</div>}
              </div>
            )}

            {/* Payments */}
            <div style={{ fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:10 }}>Histórico de Recebimentos</div>
            {propPayments.length === 0 ? <div style={{ textAlign:"center",padding:30,color:"#555",fontSize:13 }}>Nenhum recebimento registrado</div>
            : propPayments.map(p => (
              <div key={p.id} style={{ background:C.dark,borderRadius:12,padding:14,marginBottom:8 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontSize:14,fontWeight:700,color:C.text }}>{p.month_ref}</span>
                  <span style={{ fontSize:14,fontWeight:800,color:C.primary }}>R$ {p.total_amount?.toLocaleString("pt-BR")}</span>
                </div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:8 }}>
                  <span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,background:p.tenant_confirmed?C.greenLight:C.amberLight,color:p.tenant_confirmed?C.green:C.amber }}>Locatário {p.tenant_confirmed?"✓":"⏳"}</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,background:p.agency_confirmed?C.greenLight:C.amberLight,color:p.agency_confirmed?C.green:C.amber }}>Imobiliária {p.agency_confirmed?"✓":"⏳"}</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:5,background:p.landlord_confirmed?C.greenLight:C.amberLight,color:p.landlord_confirmed?C.green:C.amber }}>Você {p.landlord_confirmed?"✓":"⏳"}</span>
                </div>
                {!p.landlord_confirmed && (
                  <button onClick={() => confirmReceived(p.id)} style={{ width:"100%",padding:"10px 0",borderRadius:8,background:C.primary,color:C.primaryText,border:"none",fontSize:13,fontWeight:700,cursor:"pointer" }}>
                    Confirmar recebimento ✓
                  </button>
                )}
                {p.landlord_confirmed && (
                  <div style={{ fontSize:11,color:C.green }}>✓ Recebimento confirmado</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══ HOME ═══
  return (
    <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg,display:"flex",flexDirection:"column" }}>
      <div style={{ padding:"18px 20px 14px",background:C.dark,color:"#fff" }}>
        <div style={{ maxWidth:700,margin:"0 auto" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <div style={{ width:32,height:32,borderRadius:8,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:900,fontSize:13 }}>FX</div>
              <div><div style={{ fontSize:11,opacity:.6 }}>Olá, {profile?.full_name?.split(" ")[0]}</div><div style={{ fontSize:16,fontWeight:800 }}>Fix<span style={{ color:C.primary }}>IMOB</span></div></div>
            </div>
            <button onClick={() => router.push("/dashboard")} style={{ padding:"6px 14px",borderRadius:8,background:"rgba(255,255,255,.1)",color:"#fff",border:"1px solid rgba(255,255,255,.2)",fontSize:12,fontWeight:600,cursor:"pointer" }}>← Menu</button>
          </div>

          {/* KPIs */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
            <div style={{ background:"rgba(242,183,5,.12)",borderRadius:10,padding:"10px 8px",textAlign:"center" }}>
              <div style={{ fontSize:16,fontWeight:800,color:C.primary }}>{properties.length}</div>
              <div style={{ fontSize:9.5,opacity:.6 }}>{properties.length === 1 ? "Imóvel" : "Imóveis"}</div>
            </div>
            <div style={{ background:"rgba(102,187,106,.15)",borderRadius:10,padding:"10px 8px",textAlign:"center" }}>
              <div style={{ fontSize:14,fontWeight:800,color:C.green }}>R$ {(totalReceived/1000).toFixed(1)}k</div>
              <div style={{ fontSize:9.5,opacity:.6 }}>Recebido</div>
            </div>
            <div style={{ background:pendingCount > 0 ? "rgba(239,83,80,.12)" : "rgba(102,187,106,.15)",borderRadius:10,padding:"10px 8px",textAlign:"center" }}>
              <div style={{ fontSize:14,fontWeight:800,color:pendingCount > 0 ? C.red : C.green }}>{pendingCount > 0 ? `R$ ${(totalPending/1000).toFixed(1)}k` : "✓"}</div>
              <div style={{ fontSize:9.5,opacity:.6 }}>{pendingCount > 0 ? "Pendente" : "Em dia"}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex:1,overflow:"auto" }}>
        <div style={{ maxWidth:700,margin:"0 auto",padding:"16px 20px" }}>

          {/* Pending confirmations */}
          {pendingCount > 0 && (
            <>
              <div style={{ fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:10 }}>Confirmar recebimentos ({pendingCount})</div>
              {allPayments.filter(p => !p.landlord_confirmed).map(p => {
                const prop = properties.find(pr => pr.id === p.property_id);
                return (
                  <div key={p.id} style={{ background:C.dark,borderRadius:12,padding:14,marginBottom:8 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                      <div>
                        <div style={{ fontSize:13,fontWeight:700,color:C.text }}>{prop?.unit || prop?.address?.split(",")[0] || "Imóvel"}</div>
                        <div style={{ fontSize:11,color:C.textSec }}>{p.month_ref} • {p.tenant_name || "Locatário"}</div>
                      </div>
                      <div style={{ fontSize:16,fontWeight:800,color:C.primary }}>R$ {p.total_amount?.toLocaleString("pt-BR")}</div>
                    </div>
                    <div style={{ display:"flex",gap:6,marginTop:6,marginBottom:8 }}>
                      <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:p.tenant_confirmed?C.greenLight:C.amberLight,color:p.tenant_confirmed?C.green:C.amber }}>Locatário {p.tenant_confirmed?"✓":"⏳"}</span>
                      <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:p.agency_confirmed?C.greenLight:C.amberLight,color:p.agency_confirmed?C.green:C.amber }}>Imobiliária {p.agency_confirmed?"✓":"⏳"}</span>
                    </div>
                    <button onClick={() => confirmReceived(p.id)} style={{ width:"100%",padding:"10px 0",borderRadius:8,background:C.primary,color:C.primaryText,border:"none",fontSize:13,fontWeight:700,cursor:"pointer" }}>
                      Confirmar recebimento ✓
                    </button>
                  </div>
                );
              })}
            </>
          )}

          {/* Properties list */}
          <div style={{ fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:10,marginTop:pendingCount > 0 ? 16 : 0 }}>Meus Imóveis</div>
          {properties.map(pr => {
            const prPays = allPayments.filter(p => p.property_id === pr.id);
            const prReceived = prPays.filter(p => p.landlord_confirmed).reduce((a, b) => a + (b.total_amount || 0), 0);
            const prPending = prPays.filter(p => !p.landlord_confirmed).length;
            return (
              <button key={pr.id} onClick={() => loadPropDetail(pr)} style={{ display:"block",width:"100%",textAlign:"left",padding:16,background:C.dark,borderRadius:14,marginBottom:10,cursor:"pointer",border:"none" }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontSize:14,fontWeight:700,color:C.text }}>{pr.unit || pr.address.split(",")[0]}</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:pr.status==="occupied"?C.greenLight:C.amberLight,color:pr.status==="occupied"?C.green:C.amber }}>{pr.status==="occupied"?"Ocupado":"Vago"}</span>
                </div>
                <div style={{ fontSize:12,color:C.textSec,marginBottom:6 }}>{pr.address}</div>
                <div style={{ display:"flex",gap:16,fontSize:12 }}>
                  <span style={{ color:C.primary,fontWeight:700 }}>R$ {pr.rent_amount?.toLocaleString("pt-BR")}/mês</span>
                  {pr.tenant_name && <span style={{ color:C.textSec }}>Inquilino: {pr.tenant_name}</span>}
                </div>
                <div style={{ display:"flex",gap:12,marginTop:8,fontSize:11 }}>
                  <span style={{ color:C.green }}>Recebido: R$ {prReceived.toLocaleString("pt-BR")}</span>
                  {prPending > 0 && <span style={{ color:C.amber }}>{prPending} pendência(s)</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}