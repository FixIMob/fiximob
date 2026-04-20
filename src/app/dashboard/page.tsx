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
  red:"#C62828",
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
};
function Ic({name,size=20,color=C.textSec}:{name:string;size?:number;color?:string}){
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]||""}/></svg>;
}

const CATS = ["Todos","Arquiteto","Engenheiro","Elétrica","Hidráulica","Pedreiro","Climatização","Pintor","Marceneiro","Vidraceiro","Gesseiro"];

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("home");
  const [providers, setProviders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);
      setEditForm({ phone: p?.phone || "", email: p?.email || "" });
      const { data: provs } = await supabase.from("providers").select("*").order("rating", { ascending: false });
      setProviders(provs || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  const handleSaveProfile = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ phone: editForm.phone, email: editForm.email }).eq("id", user.id);
      setProfile({ ...profile, phone: editForm.phone, email: editForm.email });
    }
    setSaving(false);
    setEditMode(false);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",background:C.bg }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:48,height:48,borderRadius:12,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:900,fontSize:20,margin:"0 auto 16px" }}>FX</div>
        <div style={{ color:C.textSec,fontSize:14 }}>Carregando...</div>
      </div>
    </div>
  );

  const filteredProviders = providers.filter(p => {
    const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = activeCategory === "Todos" || p.category === activeCategory;
    return matchQuery && matchCat;
  });

  const typeLabel = profile?.user_type === "user" ? "Usuário" : profile?.user_type === "provider" ? "Prestador" : "Imobiliária";
  const typeIcon = profile?.user_type === "user" ? "👤" : profile?.user_type === "provider" ? "🔧" : "🏢";

  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",background:C.bg,fontFamily:"'Outfit',sans-serif" }}>

      {/* ═══ HOME ═══ */}
      {tab === "home" && !selectedProvider && (
        <div style={{ flex:1,overflow:"auto",paddingBottom:70 }}>
          <div style={{ padding:"18px 20px 14px",background:C.dark,color:"#fff" }}>
            <div style={{ maxWidth:900,margin:"0 auto" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ width:32,height:32,borderRadius:8,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:900,fontSize:13 }}>FX</div>
                  <div><div style={{ fontSize:11,opacity:.6 }}>Olá, {profile?.full_name?.split(" ")[0]}</div><div style={{ fontSize:16,fontWeight:800 }}>Fix<span style={{ color:C.primary }}>IMOB</span></div></div>
                </div>
                <div style={{ position:"relative",cursor:"pointer" }}><Ic name="bell" size={22} color="#fff"/><div style={{ position:"absolute",top:-2,right:-2,width:8,height:8,borderRadius:4,background:C.primary }}/></div>
              </div>
              <div style={{ background:"rgba(255,255,255,.08)",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:8,cursor:"pointer" }} onClick={() => setTab("search")}>
                <Ic name="search" size={16} color="rgba(255,255,255,.4)"/><span style={{ fontSize:13,color:"rgba(255,255,255,.4)" }}>Buscar prestadores...</span>
              </div>
            </div>
          </div>

          <div style={{ maxWidth:900,margin:"0 auto",padding:"16px 20px" }}>
            <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:10 }}>Categorias</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(72px, 1fr))",gap:8,marginBottom:20 }}>
              {[{e:"📐",l:"Arquiteto"},{e:"🏗️",l:"Engenheiro"},{e:"⚡",l:"Elétrica"},{e:"🔧",l:"Hidráulica"},{e:"🧱",l:"Pedreiro"},{e:"❄️",l:"Clima"},{e:"🎨",l:"Pintor"},{e:"🪵",l:"Marceneiro"}].map((c,i) => (
                <button key={i} onClick={() => { setActiveCategory(c.l === "Clima" ? "Climatização" : c.l); setTab("search"); }} style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 2px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer" }}>
                  <span style={{ fontSize:20 }}>{c.e}</span>
                  <span style={{ fontSize:10,color:C.textSec,fontWeight:500 }}>{c.l}</span>
                </button>
              ))}
            </div>

            <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:10 }}>Destaques</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",gap:10 }}>
              {providers.filter(p => p.verified).slice(0, 6).map(p => (
                <button key={p.id} onClick={() => setSelectedProvider(p)} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,cursor:"pointer",width:"100%",textAlign:"left" }}>
                  <div style={{ width:46,height:46,borderRadius:23,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:700,fontSize:15,flexShrink:0 }}>{p.avatar_initials}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                      <span style={{ fontSize:13,fontWeight:700,color:C.text }}>{p.name}</span>
                      <Ic name="check" size={14} color={C.green}/>
                    </div>
                    <div style={{ fontSize:11.5,color:C.textSec,marginTop:2 }}>{p.role}</div>
                    <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:4 }}>
                      <Ic name="star" size={12} color={C.primary}/><span style={{ fontSize:11.5,fontWeight:700,color:C.text }}>{p.rating}</span>
                      <span style={{ fontSize:11,color:C.textTer }}>({p.reviews}) • {p.city}</span>
                    </div>
                  </div>
                  <Ic name="chevRight" size={18} color={C.textTer}/>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ PROVIDER DETAIL ═══ */}
      {selectedProvider && (
        <div style={{ flex:1,overflow:"auto",paddingBottom:70 }}>
          <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff",display:"flex",alignItems:"center",gap:10 }}>
            <button onClick={() => setSelectedProvider(null)} style={{ background:"none",border:"none",cursor:"pointer",padding:2 }}><Ic name="back" size={22} color="#fff"/></button>
            <div style={{ flex:1,fontSize:17,fontWeight:700 }}>{selectedProvider.name}</div>
          </div>
          <div style={{ maxWidth:700,margin:"0 auto",padding:20 }}>
            <div style={{ display:"flex",gap:16,marginBottom:20,flexWrap:"wrap" }}>
              <div style={{ width:80,height:80,borderRadius:20,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:800,fontSize:28,flexShrink:0 }}>{selectedProvider.avatar_initials}</div>
              <div style={{ flex:1,minWidth:200 }}>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6 }}>
                  {selectedProvider.verified && <span style={{ fontSize:11,fontWeight:700,color:C.green,background:C.greenLight,padding:"2px 8px",borderRadius:5 }}>✓ Verificado</span>}
                  <span style={{ fontSize:11,color:C.primaryText,background:C.primary,padding:"2px 8px",borderRadius:5,fontWeight:700 }}>{selectedProvider.category}</span>
                </div>
                <div style={{ fontSize:15,color:C.textSec }}>{selectedProvider.role}</div>
                <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:6 }}><Ic name="location" size={14} color={C.textTer}/><span style={{ fontSize:13,color:C.textSec }}>{selectedProvider.city}</span></div>
                <div style={{ display:"flex",gap:24,marginTop:12 }}>
                  <div><div style={{ fontSize:22,fontWeight:800,color:C.text }}>{selectedProvider.rating}</div><div style={{ fontSize:10,color:C.textTer }}>Nota</div></div>
                  <div><div style={{ fontSize:22,fontWeight:800,color:C.text }}>{selectedProvider.reviews}</div><div style={{ fontSize:10,color:C.textTer }}>Avaliações</div></div>
                </div>
              </div>
            </div>

            <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:8 }}>Sobre</div>
            <div style={{ fontSize:14,color:C.textSec,lineHeight:1.7,marginBottom:24,padding:16,background:C.card,borderRadius:12,border:`1px solid ${C.border}` }}>{selectedProvider.bio}</div>

            <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
              <button style={{ flex:1,minWidth:200,padding:"14px 0",borderRadius:12,background:C.primary,color:C.primaryText,border:"none",fontSize:15,fontWeight:700,cursor:"pointer" }}>Solicitar orçamento</button>
              <button style={{ flex:1,minWidth:200,padding:"14px 0",borderRadius:12,background:"transparent",color:C.primary,border:`2px solid ${C.primary}`,fontSize:15,fontWeight:700,cursor:"pointer" }}>Enviar mensagem</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SEARCH ═══ */}
      {tab === "search" && !selectedProvider && (
        <div style={{ flex:1,overflow:"auto",paddingBottom:70 }}>
          <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff" }}>
            <div style={{ maxWidth:900,margin:"0 auto",fontSize:17,fontWeight:700 }}>Buscar Prestadores</div>
          </div>
          <div style={{ maxWidth:900,margin:"0 auto" }}>
            <div style={{ padding:"12px 20px 6px" }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Nome, profissão..."
                style={{ width:"100%",padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,outline:"none",background:C.card,color:C.text,boxSizing:"border-box" }} />
            </div>
            <div style={{ padding:"8px 20px",display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none" }}>
              {CATS.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding:"6px 14px",borderRadius:18,border:activeCategory===cat?"none":`1px solid ${C.border}`,background:activeCategory===cat?C.primary:C.card,color:activeCategory===cat?C.primaryText:C.textSec,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0 }}>{cat}</button>
              ))}
            </div>
            <div style={{ padding:"8px 20px 20px" }}>
              <div style={{ fontSize:12,color:C.textTer,marginBottom:8 }}>{filteredProviders.length} resultado{filteredProviders.length !== 1 && "s"}</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",gap:10 }}>
                {filteredProviders.map(p => (
                  <button key={p.id} onClick={() => setSelectedProvider(p)} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,cursor:"pointer",width:"100%",textAlign:"left" }}>
                    <div style={{ width:46,height:46,borderRadius:23,background:p.verified?C.primary:"#888",display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryText,fontWeight:700,fontSize:15,flexShrink:0 }}>{p.avatar_initials}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                        <span style={{ fontSize:13,fontWeight:700,color:C.text }}>{p.name}</span>
                        {p.verified && <Ic name="check" size={14} color={C.green}/>}
                      </div>
                      <div style={{ fontSize:11.5,color:C.textSec,marginTop:2 }}>{p.role}</div>
                      <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:4 }}>
                        <Ic name="star" size={12} color={C.primary}/><span style={{ fontSize:11.5,fontWeight:700,color:C.text }}>{p.rating}</span>
                        <span style={{ fontSize:11,color:C.textTer }}>({p.reviews}) • {p.city}</span>
                      </div>
                    </div>
                    <Ic name="chevRight" size={18} color={C.textTer}/>
                  </button>
                ))}
              </div>
              {filteredProviders.length === 0 && <div style={{ textAlign:"center",padding:40,color:C.textTer,fontSize:13 }}>Nenhum prestador encontrado</div>}
            </div>
          </div>
        </div>
      )}

      {/* ═══ CHAT ═══ */}
      {tab === "chat" && !selectedProvider && (
        <div style={{ flex:1,overflow:"auto",paddingBottom:70 }}>
          <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff" }}><div style={{ maxWidth:900,margin:"0 auto",fontSize:17,fontWeight:700 }}>Mensagens</div></div>
          <div style={{ maxWidth:900,margin:"0 auto",padding:20,textAlign:"center" }}>
            <div style={{ width:64,height:64,borderRadius:18,background:C.primaryLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"40px auto 16px",fontSize:28 }}>💬</div>
            <div style={{ fontSize:16,fontWeight:700,color:C.text,marginBottom:6 }}>Nenhuma conversa ainda</div>
            <div style={{ fontSize:13,color:C.textSec,lineHeight:1.6 }}>Quando você solicitar um orçamento, a conversa aparecerá aqui.</div>
          </div>
        </div>
      )}

      {/* ═══ PROFILE ═══ */}
      {tab === "profile" && !selectedProvider && (
        <div style={{ flex:1,overflow:"auto",paddingBottom:70 }}>
          <div style={{ padding:"14px 16px 12px",background:C.dark,color:"#fff" }}><div style={{ maxWidth:900,margin:"0 auto",fontSize:17,fontWeight:700 }}>Meu Perfil</div></div>
          <div style={{ maxWidth:600,margin:"0 auto",padding:20 }}>

            <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:24 }}>
              <div style={{ width:64,height:64,borderRadius:18,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0 }}>{typeIcon}</div>
              <div>
                <div style={{ fontSize:18,fontWeight:700,color:C.text }}>{profile?.full_name}</div>
                <div style={{ fontSize:13,color:C.textSec }}>{typeLabel}</div>
                <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:4 }}>
                  <Ic name="shield" size={13} color={C.green}/><span style={{ fontSize:11,color:C.green,fontWeight:600 }}>Verificado</span>
                </div>
              </div>
            </div>

            {!editMode ? (
              <>
                {[
                  { label:"Editar perfil",icon:"edit",action:() => setEditMode(true),highlight:true },
                  { label:"Indique e Ganhe",icon:"gift" },
                  { label:"Assinatura",icon:"shield" },
                  { label:"Termos de uso",icon:"flag" },
                  { label:"Ajuda e suporte",icon:"flag" },
                ].map((item,i) => (
                  <button key={i} onClick={item.action || (() => {})} style={{ display:"flex",alignItems:"center",gap:12,width:"100%",padding:"14px 0",background:"none",border:"none",borderBottom:`1px solid ${C.divider}`,cursor:"pointer",textAlign:"left" }}>
                    <div style={{ width:38,height:38,borderRadius:10,background:item.highlight?C.primaryLight:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <Ic name={item.icon} size={16} color={item.highlight?C.primary:C.textSec}/>
                    </div>
                    <div style={{ flex:1 }}><div style={{ fontSize:14,fontWeight:600,color:item.highlight?C.primary:C.text }}>{item.label}</div></div>
                    <Ic name="chevRight" size={16} color={C.textTer}/>
                  </button>
                ))}

                <button onClick={handleLogout} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:14,marginTop:24,background:"none",border:"none",cursor:"pointer" }}>
                  <Ic name="logout" size={18} color={C.red}/><span style={{ fontSize:14,fontWeight:700,color:C.red }}>Sair da conta</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditMode(false)} style={{ background:"none",border:"none",color:C.textSec,cursor:"pointer",fontSize:14,marginBottom:20 }}>← Voltar</button>

                <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6 }}>Nome completo</label>
                <div style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:6,background:"#F0F0F0",color:C.textTer,boxSizing:"border-box" }}>{profile?.full_name}</div>
                <div style={{ fontSize:11,color:C.textTer,marginBottom:16 }}>O nome não pode ser alterado. Entre em contato com o suporte.</div>

                <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6 }}>Email</label>
                <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:16,outline:"none",boxSizing:"border-box" }} />

                <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6 }}>Telefone</label>
                <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="(11) 99999-9999"
                  style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:16,outline:"none",boxSizing:"border-box" }} />

                <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6 }}>Tipo de conta</label>
                <div style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:6,background:"#F0F0F0",color:C.textTer,boxSizing:"border-box" }}>{typeLabel}</div>
                <div style={{ fontSize:11,color:C.textTer,marginBottom:16 }}>O tipo de conta não pode ser alterado.</div>

                <label style={{ display:"block",fontSize:13,fontWeight:600,color:C.text,marginBottom:6 }}>Membro desde</label>
                <div style={{ width:"100%",padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,marginBottom:24,background:"#F0F0F0",color:C.textTer,boxSizing:"border-box" }}>{new Date(profile?.created_at).toLocaleDateString("pt-BR")}</div>

                <button onClick={handleSaveProfile} disabled={saving}
                  style={{ width:"100%",padding:"14px 0",borderRadius:10,background:saving?C.textTer:C.primary,color:C.primaryText,border:"none",fontSize:15,fontWeight:700,cursor:saving?"default":"pointer" }}>
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ TAB BAR ═══ */}
      {!selectedProvider && (
        <div style={{ position:"fixed",bottom:0,left:0,right:0,display:"flex",borderTop:`1px solid ${C.border}`,background:C.card,padding:"6px 0 10px",zIndex:50 }}>
          <div style={{ display:"flex",width:"100%",maxWidth:900,margin:"0 auto" }}>
            {[
              { key:"home",icon:"home",label:"Início" },
              { key:"search",icon:"search",label:"Buscar" },
              { key:"chat",icon:"chat",label:"Chat" },
              { key:"profile",icon:"user",label:"Perfil" },
            ].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setSelectedProvider(null); setActiveCategory("Todos"); setSearchQuery(""); }}
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