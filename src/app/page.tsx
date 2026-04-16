"use client";
import { useState } from "react";

const LIGHT = {
  bg:"#FFFFFF",card:"#FFFFFF",surface:"#F8F8F6",
  primary:"#F2B705",primaryDark:"#D9A004",primaryLight:"#FFF8E1",
  dark:"#1A1A1A",darkSoft:"#2A2A2A",
  text:"#1A1A1A",textSec:"#5A5A5A",textTer:"#9A9A9A",
  border:"#E5E5E5",divider:"#F0F0F0",
  green:"#2E7D32",greenLight:"#E8F5E9",
  heroGradient:"linear-gradient(160deg, #1A1A1A 0%, #2A2A2A 60%, #3A3A3A 100%)",
  navBg:"rgba(255,255,255,0.95)",
};
const DARK = {
  bg:"#121212",card:"#1E1E1E",surface:"#252525",
  primary:"#F2B705",primaryDark:"#D9A004",primaryLight:"#3A3000",
  dark:"#1A1A1A",darkSoft:"#2A2A2A",
  text:"#F0F0F0",textSec:"#B0B0B0",textTer:"#707070",
  border:"#333333",divider:"#2A2A2A",
  green:"#4CAF50",greenLight:"#1B3A1D",
  heroGradient:"linear-gradient(160deg, #0A0A0A 0%, #1A1A1A 60%, #222 100%)",
  navBg:"rgba(18,18,18,0.95)",
};

export default function Home() {
  const [dark, setDark] = useState(false);
  const C = dark ? DARK : LIGHT;

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", color: C.text, background: C.bg, transition: "background 0.3s" }}>
      {/* NAVBAR */}
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,background:C.navBg,backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:1100,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:"#1A1A1A",fontWeight:900,fontSize:15 }}>FX</div>
            <span style={{ fontSize:20,fontWeight:800,color:C.text }}>Fix<span style={{ color:C.primary }}>IMOB</span></span>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:20 }}>
            <button onClick={() => setDark(!dark)} style={{ width:36,height:36,borderRadius:8,background:C.surface,border:`1px solid ${C.border}`,cursor:"pointer",fontSize:16 }}>{dark ? "☀️" : "🌙"}</button>
            <button style={{ padding:"10px 24px",borderRadius:10,background:C.primary,color:"#1A1A1A",border:"none",fontSize:14,fontWeight:700,cursor:"pointer" }}>Começar grátis</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop:120,paddingBottom:80,background:C.heroGradient,position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-80,right:-80,width:350,height:350,borderRadius:"50%",background:"rgba(242,183,5,0.06)" }} />
        <div style={{ maxWidth:1100,margin:"0 auto",padding:"0 24px",display:"flex",flexWrap:"wrap",alignItems:"center",gap:48 }}>
          <div style={{ flex:"1 1 500px",color:"#fff" }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:20,background:"rgba(242,183,5,0.15)",fontSize:13,fontWeight:600,marginBottom:20,border:"1px solid rgba(242,183,5,0.25)",color:C.primary }}>
              ⚡ Marketplace + Gestão Imobiliária
            </div>
            <h1 style={{ fontSize:48,fontWeight:800,lineHeight:1.1,margin:"0 0 20px",letterSpacing:-1.5 }}>
              Obras, reformas e<br /><span style={{ color:C.primary }}>locações</span> em um<br />só lugar.
            </h1>
            <p style={{ fontSize:18,opacity:0.65,lineHeight:1.7,maxWidth:480,margin:"0 0 32px" }}>
              Prestadores verificados. Pagamento protegido por escrow. Contratos digitais, vistorias e DIMOB automática para imobiliárias.
            </p>
            <div style={{ display:"flex",flexWrap:"wrap",gap:14 }}>
              <button style={{ padding:"16px 32px",borderRadius:12,background:C.primary,color:"#1A1A1A",border:"none",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 24px rgba(242,183,5,0.35)" }}>Criar conta grátis</button>
              <button style={{ padding:"16px 32px",borderRadius:12,background:"rgba(255,255,255,0.08)",color:"#fff",border:"1.5px solid rgba(255,255,255,0.2)",fontSize:16,fontWeight:700,cursor:"pointer" }}>Ver como funciona</button>
            </div>
            <div style={{ display:"flex",gap:36,marginTop:40 }}>
              {[{v:"11",l:"categorias"},{v:"100%",l:"escrow seguro"},{v:"3 partes",l:"confirmação"}].map((s,i) => (
                <div key={i}><div style={{ fontSize:28,fontWeight:800,color:C.primary }}>{s.v}</div><div style={{ fontSize:12,opacity:0.5 }}>{s.l}</div></div>
              ))}
            </div>
          </div>
          <div style={{ flex:"1 1 380px",display:"flex",justifyContent:"center" }}>
            <div style={{ width:260,height:480,borderRadius:28,background:"rgba(242,183,5,0.06)",border:"1px solid rgba(242,183,5,0.12)",padding:14 }}>
              <div style={{ borderRadius:20,background:"#1E1E1E",height:"100%",overflow:"hidden" }}>
                <div style={{ padding:"14px 14px 10px",background:"#1A1A1A",borderBottom:"1px solid #333" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:10 }}>
                    <div style={{ width:22,height:22,borderRadius:6,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:"#1A1A1A",fontWeight:900,fontSize:8 }}>FX</div>
                    <span style={{ fontSize:13,fontWeight:800,color:"#fff" }}>Fix<span style={{ color:C.primary }}>IMOB</span></span>
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.08)",borderRadius:8,padding:"7px 10px" }}>
                    <span style={{ fontSize:10,color:"rgba(255,255,255,0.4)" }}>🔍 Buscar prestadores...</span>
                  </div>
                </div>
                <div style={{ padding:10 }}>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:10 }}>
                    {["📐","🏗️","⚡","🔧","🧱","❄️","🎨","🪵"].map((e,i) => (
                      <div key={i} style={{ background:"#252525",border:"1px solid #333",borderRadius:6,padding:"6px 2px",textAlign:"center",fontSize:13 }}>{e}</div>
                    ))}
                  </div>
                  {[{n:"Carlos H.",r:"Pedreiro",s:"4.9"},{n:"Ana Paula",r:"Arquiteta",s:"4.8"}].map((p,i) => (
                    <div key={i} style={{ display:"flex",alignItems:"center",gap:7,padding:"6px 8px",background:"#252525",border:"1px solid #333",borderRadius:8,marginBottom:5 }}>
                      <div style={{ width:26,height:26,borderRadius:13,background:i===0?C.primary:"#666",display:"flex",alignItems:"center",justifyContent:"center",color:"#1A1A1A",fontSize:8,fontWeight:700 }}>{p.n.split(" ").map(w=>w[0]).join("")}</div>
                      <div style={{ flex:1 }}><div style={{ fontSize:10,fontWeight:700,color:"#fff" }}>{p.n}</div><div style={{ fontSize:8,color:"#888" }}>{p.r}</div></div>
                      <span style={{ fontSize:9,fontWeight:700,color:C.primary }}>★ {p.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 PERFIS */}
      <section style={{ padding:"80px 24px",background:C.surface }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:48 }}>
            <div style={{ fontSize:13,fontWeight:700,color:C.primary,textTransform:"uppercase",letterSpacing:2,marginBottom:8 }}>Para quem</div>
            <h2 style={{ fontSize:36,fontWeight:800,color:C.text,margin:"0 0 12px" }}>3 perfis, uma plataforma</h2>
            <p style={{ fontSize:17,color:C.textSec,maxWidth:500,margin:"0 auto" }}>Cada tipo de usuário tem sua experiência personalizada.</p>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:20 }}>
            {[
              {icon:"👤",title:"Usuários",desc:"Contratar serviços de obras e reformas. Podem ser adicionados como proprietários ou locatários por imobiliárias."},
              {icon:"🔧",title:"Prestadores",desc:"Empresas (CNPJ) ou freelancers (CPF). Recebem solicitações, enviam propostas e gerenciam carteira."},
              {icon:"🏢",title:"Imobiliárias",desc:"Gestão completa: contratos digitais, vistorias, chamados, cobranças com split e DIMOB automática."},
            ].map((p,i) => (
              <div key={i} style={{ background:C.card,borderRadius:18,padding:32,border:`2px solid ${i!==1?C.primary:C.border}`,textAlign:"center",cursor:"pointer",transition:"transform 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                <div style={{ width:64,height:64,borderRadius:18,background:C.primaryLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:32 }}>{p.icon}</div>
                <div style={{ fontSize:22,fontWeight:800,color:i!==1?C.primary:C.text,marginBottom:10 }}>{p.title}</div>
                <div style={{ fontSize:14,color:C.textSec,lineHeight:1.7 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ padding:"80px 24px",background:C.bg }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:48 }}>
            <div style={{ fontSize:13,fontWeight:700,color:C.primary,textTransform:"uppercase",letterSpacing:2,marginBottom:8 }}>Como funciona</div>
            <h2 style={{ fontSize:36,fontWeight:800,color:C.text }}>Simples, seguro, transparente</h2>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:20 }}>
            {[
              {n:"01",title:"Cadastre-se",desc:"Escolha seu perfil e verifique identidade em 2 etapas.",icon:"📋"},
              {n:"02",title:"Encontre ou publique",desc:"Busque prestadores ou cadastre imóveis para gestão.",icon:"🔍"},
              {n:"03",title:"Negocie no chat",desc:"Checklist, propostas formais, tudo dentro do app.",icon:"💬"},
              {n:"04",title:"Pague com segurança",desc:"PIX, cartão 12x ou boleto. Escrow protege seu dinheiro.",icon:"🔒"},
            ].map((s,i) => (
              <div key={i} style={{ position:"relative",padding:28,background:C.card,borderRadius:16,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.primary}` }}>
                <div style={{ position:"absolute",top:14,right:18,fontSize:44,fontWeight:900,color:C.divider }}>{s.n}</div>
                <div style={{ fontSize:32,marginBottom:14 }}>{s.icon}</div>
                <div style={{ fontSize:17,fontWeight:800,color:C.text,marginBottom:8 }}>{s.title}</div>
                <div style={{ fontSize:13,color:C.textSec,lineHeight:1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"80px 24px",background:C.surface }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:48 }}>
            <div style={{ fontSize:13,fontWeight:700,color:C.primary,textTransform:"uppercase",letterSpacing:2,marginBottom:8 }}>Funcionalidades</div>
            <h2 style={{ fontSize:36,fontWeight:800,color:C.text }}>Tudo que você precisa</h2>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))",gap:16 }}>
            {[
              {icon:"🏗️",title:"11 categorias",desc:"Arquiteto, engenheiro, pedreiro, eletricista e mais."},
              {icon:"💰",title:"Escrow protegido",desc:"Pagamento custodiado. Repasse no dia 28 via Asaas."},
              {icon:"📄",title:"Contratos digitais",desc:"Crie, envie e assine contratos direto pelo app."},
              {icon:"📸",title:"Vistorias com fotos",desc:"Checklist de 8 itens + fotos por cômodo."},
              {icon:"🔧",title:"Chamados manutenção",desc:"Locatário abre, imobiliária encaminha ao marketplace."},
              {icon:"🧾",title:"DIMOB automática",desc:"Gere a declaração em 1 clique. Exclusivo plano Gold."},
              {icon:"🤖",title:"Orçamento por IA",desc:"Estimativas baseadas na sua localização e serviço."},
              {icon:"✅",title:"Confirmação 3 partes",desc:"Locatário, imobiliária e proprietário notificados."},
            ].map((f,i) => (
              <div key={i} style={{ padding:24,background:C.card,borderRadius:14,border:`1px solid ${C.border}`,cursor:"pointer",transition:"border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div style={{ fontSize:28,marginBottom:10 }}>{f.icon}</div>
                <div style={{ fontSize:15,fontWeight:700,color:C.text,marginBottom:6 }}>{f.title}</div>
                <div style={{ fontSize:13,color:C.textSec,lineHeight:1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section style={{ padding:"80px 24px",background:C.bg }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>
          <div style={{ textAlign:"center",marginBottom:48 }}>
            <div style={{ fontSize:13,fontWeight:700,color:C.primary,textTransform:"uppercase",letterSpacing:2,marginBottom:8 }}>Planos</div>
            <h2 style={{ fontSize:36,fontWeight:800,color:C.text }}>Comece grátis, cresça conosco</h2>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))",gap:20 }}>
            {[
              {name:"Gratuito",price:"R$ 0",period:"para sempre",features:["Busca ilimitada","Chat ilimitado","1 orçamento IA/mês","Até 5 imóveis (imob.)"],cta:"Começar grátis",outline:true},
              {name:"Silver",price:"R$ 29,90",period:"/mês",features:["Tudo do Gratuito","5 orçamentos/mês","Suporte prioritário","Selo Silver"],cta:"Assinar Silver"},
              {name:"Gold",price:"R$ 79,90",period:"/mês",features:["Tudo do Silver","20 orçamentos/mês","Topo das buscas","DIMOB automática"],cta:"Assinar Gold",featured:true},
            ].map((p,i) => (
              <div key={i} style={{ padding:28,background:p.featured?"#1A1A1A":C.card,borderRadius:18,border:p.featured?`2px solid ${C.primary}`:`1px solid ${C.border}`,position:"relative",boxShadow:p.featured?"0 8px 30px rgba(242,183,5,0.2)":"none" }}>
                {p.featured && <div style={{ position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:C.primary,color:"#1A1A1A",fontSize:11,fontWeight:700,padding:"4px 14px",borderRadius:8 }}>MAIS POPULAR</div>}
                <div style={{ fontSize:18,fontWeight:800,color:p.featured?C.primary:C.text,marginBottom:4 }}>{p.name}</div>
                <div style={{ display:"flex",alignItems:"baseline",gap:4,marginBottom:20 }}>
                  <span style={{ fontSize:36,fontWeight:800,color:p.featured?"#fff":C.text }}>{p.price}</span>
                  <span style={{ fontSize:14,color:p.featured?"rgba(255,255,255,0.5)":C.textTer }}>{p.period}</span>
                </div>
                {p.features.map((f,fi) => (
                  <div key={fi} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 0",fontSize:13,color:p.featured?"rgba(255,255,255,0.7)":C.textSec }}>
                    <span style={{ color:C.primary }}>✓</span>{f}
                  </div>
                ))}
                <button style={{ width:"100%",padding:"14px 0",borderRadius:10,background:p.outline?"transparent":C.primary,color:p.outline?C.text:"#1A1A1A",border:p.outline?`2px solid ${C.border}`:"none",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:20 }}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding:"80px 24px",background:"#1A1A1A",textAlign:"center",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle, rgba(242,183,5,0.08) 0%, transparent 70%)" }} />
        <div style={{ maxWidth:600,margin:"0 auto",position:"relative",zIndex:1 }}>
          <h2 style={{ fontSize:36,fontWeight:800,color:"#fff",margin:"0 0 16px" }}>Pronto para <span style={{ color:C.primary }}>começar</span>?</h2>
          <p style={{ fontSize:17,color:"rgba(255,255,255,0.6)",lineHeight:1.7,marginBottom:32 }}>Cadastre-se gratuitamente. Encontre profissionais, gerencie imóveis, receba pagamentos.</p>
          <div style={{ display:"flex",justifyContent:"center",gap:14,flexWrap:"wrap" }}>
            <button style={{ padding:"16px 36px",borderRadius:12,background:C.primary,color:"#1A1A1A",border:"none",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 24px rgba(242,183,5,0.35)" }}>Criar conta grátis</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:"48px 24px 24px",background:"#111" }}>
        <div style={{ maxWidth:1100,margin:"0 auto",display:"flex",flexWrap:"wrap",gap:40,justifyContent:"space-between" }}>
          <div style={{ flex:"1 1 250px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
              <div style={{ width:32,height:32,borderRadius:8,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",color:"#1A1A1A",fontWeight:800,fontSize:13 }}>FX</div>
              <span style={{ fontSize:18,fontWeight:800,color:"#fff" }}>Fix<span style={{ color:C.primary }}>IMOB</span></span>
            </div>
            <p style={{ fontSize:13,color:"rgba(255,255,255,0.4)",lineHeight:1.6 }}>Marketplace de obras, reformas e gestão imobiliária com pagamento seguro.</p>
          </div>
          {[
            {title:"Plataforma",links:["Para usuários","Para prestadores","Para imobiliárias"]},
            {title:"Empresa",links:["Sobre nós","Blog","Contato"]},
            {title:"Legal",links:["Termos de uso","Privacidade","LGPD"]},
          ].map((col,i) => (
            <div key={i}>
              <div style={{ fontSize:12,fontWeight:700,color:C.primary,marginBottom:12,textTransform:"uppercase",letterSpacing:1 }}>{col.title}</div>
              {col.links.map((l,li) => <div key={li}><a href="#" style={{ fontSize:13,color:"rgba(255,255,255,0.4)",textDecoration:"none",lineHeight:2 }}>{l}</a></div>)}
            </div>
          ))}
        </div>
        <div style={{ maxWidth:1100,margin:"32px auto 0",paddingTop:20,borderTop:"1px solid rgba(255,255,255,0.08)",textAlign:"center" }}>
          <span style={{ fontSize:12,color:"rgba(255,255,255,0.25)" }}>© 2026 FixIMOB. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}