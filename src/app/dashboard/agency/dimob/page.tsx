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

export default function DimobPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [viewReport, setViewReport] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (p?.user_type !== "agency") { router.push("/dashboard"); return; }
      setProfile(p);
      const { data: props } = await supabase.from("properties").select("*").eq("agency_id", user.id);
      setProperties(props || []);
      const { data: pays } = await supabase.from("rental_payments").select("*").eq("agency_id", user.id);
      setPayments(pays || []);
      const { data: reps } = await supabase.from("dimob_reports").select("*").eq("agency_id", user.id).order("created_at", { ascending: false });
      setReports(reps || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const generateDimob = async () => {
    setGenerating(true);

    // Filter payments for selected year
    const yearPayments = payments.filter(p => {
      const d = new Date(p.paid_at || p.created_at);
      return d.getFullYear() === selectedYear;
    });

    // Group by property
    const propMap: Record<string, any> = {};
    for (const pay of yearPayments) {
      const propId = pay.property_id;
      if (!propMap[propId]) {
        const prop = properties.find(p => p.id === propId);
        propMap[propId] = {
          property_id: propId,
          address: prop?.address || "",
          unit: prop?.unit || "",
          tenant_name: pay.tenant_name || prop?.tenant_name || "",
          landlord_name: prop?.landlord_name || "",
          landlord_email: prop?.landlord_email || "",
          monthly_payments: {},
          total_rent: 0,
          total_condo: 0,
          total_amount: 0,
        };
      }
      const monthNum = new Date(pay.paid_at || pay.created_at).getMonth() + 1;
      const monthKey = String(monthNum).padStart(2, "0");
      propMap[propId].monthly_payments[monthKey] = {
        rent: pay.rent_amount || 0,
        condo: pay.condo_amount || 0,
        total: pay.total_amount || 0,
        method: pay.payment_method || "",
        ref: pay.month_ref || "",
      };
      propMap[propId].total_rent += (pay.rent_amount || 0);
      propMap[propId].total_condo += (pay.condo_amount || 0);
      propMap[propId].total_amount += (pay.total_amount || 0);
    }

    const snapshot = Object.values(propMap);
    const totalRent = snapshot.reduce((a: number, b: any) => a + b.total_rent, 0);
    const totalCondo = snapshot.reduce((a: number, b: any) => a + b.total_condo, 0);
    const commission = totalRent * 0.10; // 10% estimated commission
    const uniqueTenants = new Set(snapshot.map((s: any) => s.tenant_name)).size;

    const { data, error } = await supabase.from("dimob_reports").insert({
      agency_id: userId,
      calendar_year: selectedYear,
      status: "generated",
      total_properties: snapshot.length,
      total_tenants: uniqueTenants,
      total_rent_received: totalRent,
      total_condo: totalCondo,
      total_commission: commission,
      data_snapshot: snapshot,
    }).select().single();

    if (data) {
      setReports(prev => [data, ...prev]);
      setGeneratedReport(data);
    }
    setGenerating(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ textAlign:"center" }}><div style={{ width:48,height:48,borderRadius:12,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:900,fontSize:20,margin:"0 auto 16px" }}>FX</div><div style={{ color:"#1A1A1A" }}>Carregando...</div></div>
    </div>
  );

  // ═══ REPORT DETAIL ═══
  if (viewReport) {
    const snapshot = typeof viewReport.data_snapshot === "string" ? JSON.parse(viewReport.data_snapshot) : viewReport.data_snapshot;
    const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

    return (
      <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
        <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={() => setViewReport(null)} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div><div style={{ fontSize:17,fontWeight:700 }}>DIMOB {viewReport.calendar_year}</div><div style={{ fontSize:11,opacity:.6 }}>Declaração de Informações sobre Atividades Imobiliárias</div></div>
        </div>

        <div style={{ maxWidth:800,margin:"0 auto",padding:20 }}>
          {/* Header card */}
          <div style={{ background:C.dark,borderRadius:16,overflow:"hidden",marginBottom:16 }}>
            <div style={{ padding:20,borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                <div style={{ width:28,height:28,borderRadius:8,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:900,fontSize:11 }}>FX</div>
                <span style={{ fontSize:14,fontWeight:800,color:C.text }}>Fix<span style={{ color:C.primary }}>IMOB</span></span>
                <span style={{ fontSize:11,color:C.textTer,marginLeft:"auto" }}>Gerado em {new Date(viewReport.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
              <div style={{ fontSize:18,fontWeight:800,color:C.text }}>DIMOB — Ano-calendário {viewReport.calendar_year}</div>
              <div style={{ fontSize:12,color:C.textSec,marginTop:4 }}>Declaração de Informações sobre Atividades Imobiliárias</div>
              <div style={{ fontSize:11,color:C.textTer,marginTop:4 }}>Instrução Normativa RFB nº 1.115/2010</div>
            </div>

            {/* Agency info */}
            <div style={{ padding:16,borderBottom:`1px solid ${C.border}` }}>
              <div style={{ fontSize:12,fontWeight:700,color:C.primary,textTransform:"uppercase",letterSpacing:.5,marginBottom:8 }}>Declarante</div>
              <div style={{ fontSize:14,fontWeight:700,color:C.text }}>{profile?.full_name}</div>
              <div style={{ fontSize:12,color:C.textSec,marginTop:2 }}>{profile?.email}</div>
            </div>

            {/* Summary KPIs */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))",gap:1,background:C.border }}>
              {[
                { l:"Imóveis", v:viewReport.total_properties },
                { l:"Locatários", v:viewReport.total_tenants },
                { l:"Aluguéis", v:`R$ ${viewReport.total_rent_received?.toLocaleString("pt-BR",{minimumFractionDigits:2})}` },
                { l:"Condomínios", v:`R$ ${viewReport.total_condo?.toLocaleString("pt-BR",{minimumFractionDigits:2})}` },
                { l:"Comissão (est.)", v:`R$ ${viewReport.total_commission?.toLocaleString("pt-BR",{minimumFractionDigits:2})}` },
              ].map((kpi,i) => (
                <div key={i} style={{ background:C.card,padding:14,textAlign:"center" }}>
                  <div style={{ fontSize:10,color:C.textTer,textTransform:"uppercase",marginBottom:4 }}>{kpi.l}</div>
                  <div style={{ fontSize:16,fontWeight:800,color:typeof kpi.v === "number" ? C.primary : C.text }}>{kpi.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Per property breakdown */}
          <div style={{ fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:10 }}>Detalhamento por Imóvel</div>
          {Array.isArray(snapshot) && snapshot.map((prop: any, idx: number) => (
            <div key={idx} style={{ background:C.dark,borderRadius:14,padding:16,marginBottom:12,border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:14,fontWeight:700,color:C.text }}>{prop.unit || prop.address?.split(",")[0]}</div>
                  <div style={{ fontSize:12,color:C.textSec }}>{prop.address}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:16,fontWeight:800,color:C.primary }}>R$ {prop.total_amount?.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
                  <div style={{ fontSize:10,color:C.textTer }}>Total no ano</div>
                </div>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10 }}>
                <div style={{ padding:10,background:"#2A2A2A",borderRadius:8 }}>
                  <div style={{ fontSize:10,color:C.textTer }}>Locatário</div>
                  <div style={{ fontSize:13,fontWeight:700,color:C.text,marginTop:2 }}>{prop.tenant_name || "—"}</div>
                </div>
                <div style={{ padding:10,background:"#2A2A2A",borderRadius:8 }}>
                  <div style={{ fontSize:10,color:C.textTer }}>Proprietário</div>
                  <div style={{ fontSize:13,fontWeight:700,color:C.text,marginTop:2 }}>{prop.landlord_name || "—"}</div>
                </div>
              </div>

              {/* Monthly breakdown */}
              <div style={{ fontSize:12,fontWeight:700,color:C.textSec,marginBottom:6 }}>Rendimentos mensais</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(70px, 1fr))",gap:4 }}>
                {months.map((m, mi) => {
                  const key = String(mi + 1).padStart(2, "0");
                  const data = prop.monthly_payments?.[key];
                  return (
                    <div key={mi} style={{ padding:"6px 4px",background:data?"#2A2A2A":"#1E1E1E",borderRadius:6,textAlign:"center",border:data?`1px solid ${C.primary}`:"1px solid #2A2A2A" }}>
                      <div style={{ fontSize:9,color:C.textTer }}>{m}</div>
                      {data ? (
                        <div style={{ fontSize:11,fontWeight:700,color:C.primary,marginTop:2 }}>R$ {(data.rent/1000).toFixed(1)}k</div>
                      ) : (
                        <div style={{ fontSize:11,color:"#444",marginTop:2 }}>—</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display:"flex",justifyContent:"space-between",marginTop:10,fontSize:12,padding:"8px 0 0",borderTop:`1px solid ${C.border}` }}>
                <span style={{ color:C.textSec }}>Aluguéis: <strong style={{ color:C.text }}>R$ {prop.total_rent?.toLocaleString("pt-BR",{minimumFractionDigits:2})}</strong></span>
                <span style={{ color:C.textSec }}>Cond: <strong style={{ color:C.text }}>R$ {prop.total_condo?.toLocaleString("pt-BR",{minimumFractionDigits:2})}</strong></span>
              </div>
            </div>
          ))}

          {/* Instructions */}
          <div style={{ background:C.dark,borderRadius:14,padding:16,marginTop:8 }}>
            <div style={{ fontSize:14,fontWeight:700,color:C.primary,marginBottom:8 }}>Como entregar à Receita Federal</div>
            <div style={{ fontSize:12,color:C.textSec,lineHeight:1.8 }}>
              <div style={{ marginBottom:6 }}>1. Baixe o PGD DIMOB no site da Receita Federal</div>
              <div style={{ marginBottom:6 }}>2. Importe os dados acima no programa (ou digite manualmente)</div>
              <div style={{ marginBottom:6 }}>3. Valide a declaração no PGD</div>
              <div style={{ marginBottom:6 }}>4. Transmita via Receitanet até o último dia útil de fevereiro</div>
              <div style={{ padding:10,background:C.amberLight,borderRadius:8,marginTop:8,color:C.amber,fontSize:11 }}>
                ⚠️ Multa por atraso: R$ 500 a R$ 1.500 por mês de atraso.
              </div>
            </div>
          </div>

          <button onClick={() => setViewReport(null)} style={{ width:"100%",marginTop:16,padding:"14px 0",borderRadius:10,background:C.dark,color:C.primary,border:`1px solid ${C.primary}`,fontSize:14,fontWeight:700,cursor:"pointer" }}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  // ═══ SUCCESS ═══
  if (generatedReport) {
    return (
      <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
        <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff" }}>
          <div style={{ fontSize:17,fontWeight:700 }}>DIMOB Gerada</div>
        </div>
        <div style={{ maxWidth:500,margin:"0 auto",padding:24,textAlign:"center" }}>
          <div style={{ width:72,height:72,borderRadius:36,background:C.greenLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"40px auto 20px",fontSize:32 }}>✅</div>
          <div style={{ fontSize:22,fontWeight:800,color:"#1A1A1A",marginBottom:8 }}>DIMOB {selectedYear} gerada!</div>
          <div style={{ fontSize:14,color:"#333",marginBottom:24,lineHeight:1.6 }}>
            A declaração foi gerada com {generatedReport.total_properties} imóvel(is) e {generatedReport.total_tenants} locatário(s). Total de aluguéis: R$ {generatedReport.total_rent_received?.toLocaleString("pt-BR",{minimumFractionDigits:2})}.
          </div>
          <button onClick={() => { setViewReport(generatedReport); setGeneratedReport(null); }} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:C.dark,color:C.primary,border:"none",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:10 }}>
            Ver relatório completo
          </button>
          <button onClick={() => setGeneratedReport(null)} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:"transparent",color:"#1A1A1A",border:"2px solid #1A1A1A",fontSize:15,fontWeight:700,cursor:"pointer" }}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // ═══ HOME ═══
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const yearPayments = payments.filter(p => new Date(p.paid_at || p.created_at).getFullYear() === selectedYear);
  const yearTotal = yearPayments.reduce((a, b) => a + (b.total_amount || 0), 0);
  const yearProps = new Set(yearPayments.map(p => p.property_id)).size;

  return (
    <div style={{ minHeight:"100vh",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
        <button onClick={() => router.push("/dashboard/agency")} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8}><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div><div style={{ fontSize:17,fontWeight:700 }}>DIMOB</div><div style={{ fontSize:11,opacity:.6 }}>Declaração de Atividades Imobiliárias</div></div>
      </div>

      <div style={{ maxWidth:600,margin:"0 auto",padding:20 }}>
        {/* Gold check */}
        <div style={{ background:C.dark,borderRadius:14,padding:16,marginBottom:16,display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:44,height:44,borderRadius:12,background:C.primaryLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>👑</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14,fontWeight:700,color:C.primary }}>Recurso exclusivo Gold</div>
            <div style={{ fontSize:12,color:C.textSec }}>Gere a DIMOB automaticamente com os dados do app.</div>
          </div>
        </div>

        {/* Year selector */}
        <div style={{ fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:10 }}>Ano-calendário</div>
        <div style={{ display:"flex",gap:8,marginBottom:16 }}>
          {years.map(y => (
            <button key={y} onClick={() => setSelectedYear(y)} style={{ flex:1,padding:"12px 0",borderRadius:10,background:selectedYear===y?C.dark:C.card,color:selectedYear===y?C.primary:C.text,border:selectedYear===y?`2px solid ${C.primary}`:`1px solid ${C.border}`,fontSize:14,fontWeight:700,cursor:"pointer" }}>{y}</button>
          ))}
        </div>

        {/* Preview */}
        <div style={{ background:C.dark,borderRadius:14,padding:16,marginBottom:16 }}>
          <div style={{ fontSize:13,fontWeight:700,color:C.textSec,marginBottom:10,textTransform:"uppercase",letterSpacing:.5 }}>Prévia {selectedYear}</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
            <div style={{ textAlign:"center" }}><div style={{ fontSize:22,fontWeight:800,color:C.primary }}>{yearProps}</div><div style={{ fontSize:10,color:C.textTer }}>Imóveis</div></div>
            <div style={{ textAlign:"center" }}><div style={{ fontSize:22,fontWeight:800,color:C.text }}>{yearPayments.length}</div><div style={{ fontSize:10,color:C.textTer }}>Pagamentos</div></div>
            <div style={{ textAlign:"center" }}><div style={{ fontSize:16,fontWeight:800,color:C.green }}>R$ {(yearTotal/1000).toFixed(1)}k</div><div style={{ fontSize:10,color:C.textTer }}>Total</div></div>
          </div>
        </div>

        <button onClick={generateDimob} disabled={generating || yearPayments.length === 0} style={{ width:"100%",padding:"14px 0",borderRadius:10,background:yearPayments.length > 0 && !generating ? C.dark : C.textTer,color:yearPayments.length > 0 && !generating ? C.primary : "#888",border:"none",fontSize:15,fontWeight:700,cursor:yearPayments.length > 0 && !generating ? "pointer" : "default",marginBottom:10 }}>
          {generating ? "Gerando..." : yearPayments.length === 0 ? "Sem dados para este ano" : `Gerar DIMOB ${selectedYear}`}
        </button>

        {yearPayments.length === 0 && (
          <div style={{ padding:12,background:C.dark,borderRadius:10,fontSize:12,color:C.textSec,textAlign:"center",lineHeight:1.6 }}>
            Não há pagamentos registrados em {selectedYear}. Registre pagamentos no painel de imóveis para gerar a DIMOB.
          </div>
        )}

        {/* Previous reports */}
        {reports.length > 0 && (
          <>
            <div style={{ fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:10,marginTop:20 }}>Relatórios anteriores</div>
            {reports.map(r => (
              <button key={r.id} onClick={() => setViewReport(r)} style={{ display:"block",width:"100%",textAlign:"left",padding:14,background:C.dark,borderRadius:12,marginBottom:8,cursor:"pointer",border:"none" }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <span style={{ fontSize:14,fontWeight:700,color:C.text }}>DIMOB {r.calendar_year}</span>
                  <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,background:C.greenLight,color:C.green }}>Gerado</span>
                </div>
                <div style={{ fontSize:12,color:C.textSec }}>
                  {r.total_properties} imóvel(is) • R$ {r.total_rent_received?.toLocaleString("pt-BR")} em aluguéis
                </div>
                <div style={{ fontSize:11,color:C.textTer,marginTop:4 }}>
                  Gerado em {new Date(r.created_at).toLocaleDateString("pt-BR")}
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}