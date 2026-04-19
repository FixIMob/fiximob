"use client";

const C = {
  primary: "#F2B705", dark: "#1A1A1A", text: "#1A1A1A",
  textSec: "#5A5A5A", card: "#FFFFFF", surface: "#F8F8F6",
};

export default function VerifyPage() {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Outfit', sans-serif", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480, background: C.card, borderRadius: 18, padding: 40, boxShadow: "0 8px 30px rgba(0,0,0,0.06)", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "#E8F5E9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36 }}>✉️</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 8 }}>Verifique seu email</h1>
        <p style={{ fontSize: 15, color: C.textSec, lineHeight: 1.7, marginBottom: 24 }}>
          Enviamos um link de confirmação para o seu email. Clique no link para ativar sua conta.
        </p>
        <div style={{ padding: 16, background: C.surface, borderRadius: 12, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>
            Não recebeu? Verifique a pasta de spam ou aguarde alguns minutos.
          </p>
        </div>
        <a href="/login" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, background: C.primary, color: C.dark, textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
          Ir para login
        </a>
      </div>
    </div>
  );
}