"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const C = {
  primary: "#F2B705", primaryLight: "#FFF8E1",
  dark: "#1A1A1A", text: "#1A1A1A", textSec: "#5A5A5A",
  border: "#E5E5E5", card: "#FFFFFF", surface: "#F8F8F6",
  green: "#2E7D32", greenLight: "#E8F5E9",
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif", background: C.surface }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", color: C.dark, fontWeight: 900, fontSize: 20, margin: "0 auto 16px" }}>FX</div>
          <div style={{ color: C.textSec, fontSize: 14 }}>Carregando...</div>
        </div>
      </div>
    );
  }

  const typeLabel = profile?.user_type === "user" ? "Usuário" : profile?.user_type === "provider" ? "Prestador" : "Imobiliária";
  const typeIcon = profile?.user_type === "user" ? "👤" : profile?.user_type === "provider" ? "🔧" : "🏢";

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Outfit', sans-serif", background: C.surface }}>
      <nav style={{ background: C.dark, padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", color: C.dark, fontWeight: 900, fontSize: 15 }}>FX</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Fix<span style={{ color: C.primary }}>IMOB</span></span>
        </div>
        <button onClick={handleLogout} style={{ padding: "8px 20px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Sair</button>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <div style={{ background: C.card, borderRadius: 18, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.04)", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>{typeIcon}</div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>Olá, {profile?.full_name}!</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <span style={{ fontSize: 13, color: C.textSec }}>{typeLabel}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.greenLight, padding: "2px 8px", borderRadius: 6 }}>✓ Verificado</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { label: "Email", value: profile?.email },
              { label: "Telefone", value: profile?.phone || "Não informado" },
              { label: "Tipo de conta", value: typeLabel },
              { label: "Membro desde", value: new Date(profile?.created_at).toLocaleDateString("pt-BR") },
            ].map((item, i) => (
              <div key={i} style={{ padding: 16, background: C.surface, borderRadius: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: 18, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 16 }}>Próximos passos</h2>
          <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.8 }}>
            <div style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: C.primary, fontSize: 18 }}>🚧</span> Marketplace de prestadores (em breve)
            </div>
            <div style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: C.primary, fontSize: 18 }}>🏢</span> Gestão imobiliária (em breve)
            </div>
            <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: C.primary, fontSize: 18 }}>💬</span> Chat com prestadores (em breve)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}