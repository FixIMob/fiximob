"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const C = {
  primary: "#F2B705", primaryLight: "#FFF8E1",
  dark: "#1A1A1A", text: "#1A1A1A", textSec: "#5A5A5A", textTer: "#9A9A9A",
  border: "#E5E5E5", card: "#FFFFFF", surface: "#F8F8F6",
  red: "#C62828", green: "#2E7D32",
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email ou senha incorretos."
          : authError.message === "Email not confirmed"
          ? "Confirme seu email antes de entrar. Verifique sua caixa de entrada."
          : authError.message
      );
      setLoading(false);
      return;
    }

    if (data.user) {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Outfit', sans-serif", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420, background: C.card, borderRadius: 18, padding: 32, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", color: C.dark, fontWeight: 900, fontSize: 16 }}>FX</div>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Fix<span style={{ color: C.primary }}>IMOB</span></span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 8, textAlign: "center" }}>Entrar</h1>
        <p style={{ fontSize: 14, color: C.textSec, textAlign: "center", marginBottom: 28 }}>Bem-vindo de volta ao FixIMOB</p>

        <form onSubmit={handleLogin}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Email</label>
          <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="seu@email.com"
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" }} />

          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Senha</label>
          <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Sua senha"
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, marginBottom: 8, outline: "none", boxSizing: "border-box" }} />

          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <a href="#" style={{ fontSize: 13, color: C.primary, textDecoration: "none", fontWeight: 600 }}>Esqueci minha senha</a>
          </div>

          {error && <div style={{ padding: 12, background: "#FFEBEE", color: C.red, borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</div>}

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "14px 0", borderRadius: 10, background: loading ? C.textTer : C.primary, color: C.dark, border: "none", fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer", marginBottom: 16 }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: 13, color: C.textSec }}>
          Não tem conta? <a href="/signup" style={{ color: C.primary, fontWeight: 700, textDecoration: "none" }}>Criar conta</a>
        </div>
      </div>
    </div>
  );
}