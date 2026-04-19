"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const C = {
  bg: "#FFFFFF", card: "#FFFFFF", surface: "#F8F8F6",
  primary: "#F2B705", primaryLight: "#FFF8E1",
  dark: "#1A1A1A", text: "#1A1A1A", textSec: "#5A5A5A", textTer: "#9A9A9A",
  border: "#E5E5E5", green: "#2E7D32", red: "#C62828",
};

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"type" | "form">("type");
  const [userType, setUserType] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const profiles = [
    { key: "user", icon: "👤", title: "Usuário", desc: "Contratar serviços, gerenciar imóvel como locatário ou locador." },
    { key: "provider", icon: "🔧", title: "Prestador", desc: "Empresa ou freelancer. Receber solicitações e propostas." },
    { key: "agency", icon: "🏢", title: "Imobiliária", desc: "Gestão completa: contratos, vistorias, cobranças, DIMOB." },
  ];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (form.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        user_type: userType,
      });

      if (profileError) {
        setError("Erro ao salvar perfil: " + profileError.message);
        setLoading(false);
        return;
      }

      router.push("/verify");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Outfit', sans-serif", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480, background: C.card, borderRadius: 18, padding: 32, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", color: C.dark, fontWeight: 900, fontSize: 16 }}>FX</div>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Fix<span style={{ color: C.primary }}>IMOB</span></span>
        </div>

        {step === "type" && (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 8, textAlign: "center" }}>Criar conta</h1>
            <p style={{ fontSize: 14, color: C.textSec, textAlign: "center", marginBottom: 24 }}>Como você deseja utilizar o app?</p>
            {profiles.map(p => (
              <button key={p.key} onClick={() => { setUserType(p.key); setStep("form"); }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.card, cursor: "pointer", width: "100%", textAlign: "left", marginBottom: 10, transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{p.desc}</div>
                </div>
                <span style={{ color: C.textTer }}>→</span>
              </button>
            ))}
            <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.textSec }}>
              Já tem conta? <a href="/login" style={{ color: C.primary, fontWeight: 700, textDecoration: "none" }}>Entrar</a>
            </div>
          </>
        )}

        {step === "form" && (
          <>
            <button onClick={() => setStep("type")} style={{ background: "none", border: "none", color: C.textSec, cursor: "pointer", fontSize: 14, marginBottom: 16 }}>← Voltar</button>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 4 }}>
              Cadastro de {userType === "user" ? "Usuário" : userType === "provider" ? "Prestador" : "Imobiliária"}
            </h1>
            <p style={{ fontSize: 14, color: C.textSec, marginBottom: 24 }}>Preencha seus dados</p>

            <form onSubmit={handleSignup}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Nome completo</label>
              <input type="text" required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, marginBottom: 14, outline: "none", boxSizing: "border-box" }} />

              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, marginBottom: 14, outline: "none", boxSizing: "border-box" }} />

              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Telefone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, marginBottom: 14, outline: "none", boxSizing: "border-box" }} />

              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Senha</label>
              <input type="password" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${form.password.length > 0 && form.password.length < 6 ? C.red : C.border}`, fontSize: 14, marginBottom: 14, outline: "none", boxSizing: "border-box" }} />

              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Confirmar senha</label>
              <input type="password" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Digite a senha novamente"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${form.confirmPassword.length > 0 && form.password !== form.confirmPassword ? C.red : form.confirmPassword.length > 0 && form.password === form.confirmPassword ? C.green : C.border}`, fontSize: 14, marginBottom: 6, outline: "none", boxSizing: "border-box" }} />

              {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
                <div style={{ fontSize: 12, color: C.red, marginBottom: 14 }}>As senhas não coincidem</div>
              )}
              {form.confirmPassword.length > 0 && form.password === form.confirmPassword && (
                <div style={{ fontSize: 12, color: C.green, marginBottom: 14 }}>✓ Senhas coincidem</div>
              )}
              {form.confirmPassword.length === 0 && <div style={{ marginBottom: 14 }} />}

              {error && <div style={{ padding: 12, background: "#FFEBEE", color: C.red, borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</div>}

              <button type="submit" disabled={loading || form.password !== form.confirmPassword}
                style={{ width: "100%", padding: "14px 0", borderRadius: 10, background: loading || form.password !== form.confirmPassword ? C.textTer : C.primary, color: C.dark, border: "none", fontSize: 15, fontWeight: 700, cursor: loading || form.password !== form.confirmPassword ? "default" : "pointer" }}>
                {loading ? "Criando conta..." : "Criar conta"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}