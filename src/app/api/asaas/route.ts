import { NextRequest, NextResponse } from "next/server";

const API_KEY = "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjlmNjFhYjljLWM3OGQtNDdmMC05YTUyLWJjODVjNTdjMmYwZjo6JGFhY2hfYWU2N2RiYTItNWMxMS00Mzk2LTljNzMtNjVlYWQ0MDFiZGQw";
const API_URL = process.env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3";



const headers = {
  "Content-Type": "application/json",
  "access_token": API_KEY,
};

// POST — handles all Asaas operations
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data } = body;

    // ═══ CREATE CUSTOMER ═══
    if (action === "create_customer") {
      const res = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          cpfCnpj: data.cpfCnpj || undefined,
          phone: data.phone || undefined,
        }),
      });
      const result = await res.json();
      return NextResponse.json(result);
    }

    // ═══ CREATE SUB-ACCOUNT (for providers) ═══
    if (action === "create_subaccount") {
      const res = await fetch(`${API_URL}/accounts`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          cpfCnpj: data.cpfCnpj,
          companyType: data.companyType || "LIMITED",
          phone: data.phone || undefined,
        }),
      });
      const result = await res.json();
      return NextResponse.json(result);
    }

    // ═══ CREATE PAYMENT (PIX) ═══
    if (action === "create_pix") {
      const res = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          customer: data.customerId,
          billingType: "PIX",
          value: data.value,
          dueDate: data.dueDate || new Date().toISOString().split("T")[0],
          description: data.description || "Pagamento FixIMOB",
          externalReference: data.externalReference || undefined,
          split: data.split || undefined,
        }),
      });
      const payment = await res.json();

      // Get PIX QR code
      if (payment.id) {
        const qrRes = await fetch(`${API_URL}/payments/${payment.id}/pixQrCode`, {
          method: "GET",
          headers,
        });
        const qrData = await qrRes.json();
        return NextResponse.json({ ...payment, pix: qrData });
      }
      return NextResponse.json(payment);
    }

    // ═══ CREATE PAYMENT (BOLETO) ═══
    if (action === "create_boleto") {
      const res = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          customer: data.customerId,
          billingType: "BOLETO",
          value: data.value,
          dueDate: data.dueDate || (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split("T")[0]; })(),
          description: data.description || "Pagamento FixIMOB",
          externalReference: data.externalReference || undefined,
          split: data.split || undefined,
        }),
      });
      const result = await res.json();
      return NextResponse.json(result);
    }

    // ═══ CREATE PAYMENT (CREDIT CARD) ═══
    if (action === "create_credit") {
      const res = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          customer: data.customerId,
          billingType: "CREDIT_CARD",
          value: data.value,
          dueDate: new Date().toISOString().split("T")[0],
          description: data.description || "Pagamento FixIMOB",
          installmentCount: data.installments || 1,
          installmentValue: data.installments ? Math.ceil(data.value / data.installments * 100) / 100 : undefined,
          externalReference: data.externalReference || undefined,
          split: data.split || undefined,
          creditCard: data.creditCard ? {
            holderName: data.creditCard.holderName,
            number: data.creditCard.number,
            expiryMonth: data.creditCard.expiryMonth,
            expiryYear: data.creditCard.expiryYear,
            ccv: data.creditCard.ccv,
          } : undefined,
          creditCardHolderInfo: data.creditCardHolderInfo ? {
            name: data.creditCardHolderInfo.name,
            email: data.creditCardHolderInfo.email,
            cpfCnpj: data.creditCardHolderInfo.cpfCnpj,
            postalCode: data.creditCardHolderInfo.postalCode,
            addressNumber: data.creditCardHolderInfo.addressNumber,
            phone: data.creditCardHolderInfo.phone,
          } : undefined,
        }),
      });
      const result = await res.json();
      return NextResponse.json(result);
    }

    // ═══ CREATE PAYMENT (DEBIT - uses UNDEFINED for bank transfer) ═══
    if (action === "create_debit") {
      const res = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          customer: data.customerId,
          billingType: "PIX",
          value: data.value,
          dueDate: new Date().toISOString().split("T")[0],
          description: data.description || "Pagamento FixIMOB (Débito via PIX)",
          externalReference: data.externalReference || undefined,
          split: data.split || undefined,
        }),
      });
      const payment = await res.json();
      if (payment.id) {
        const qrRes = await fetch(`${API_URL}/payments/${payment.id}/pixQrCode`, { method: "GET", headers });
        const qrData = await qrRes.json();
        return NextResponse.json({ ...payment, pix: qrData });
      }
      return NextResponse.json(payment);
    }

    // ═══ CREATE PIX KEY ═══
    if (action === "create_pix_key") {
      const res = await fetch(`${API_URL}/pix/addressKeys`, {
        method: "POST",
        headers,
        body: JSON.stringify({ type: "EVP" }),
      });
      const result = await res.json();
      return NextResponse.json(result);
    }
    if (action === "get_payment") {
      const res = await fetch(`${API_URL}/payments/${data.paymentId}`, {
        method: "GET",
        headers,
      });
      const result = await res.json();
      return NextResponse.json(result);
    }

    // ═══ TRANSFER (for escrow release / split payout) ═══
    if (action === "create_transfer") {
      const res = await fetch(`${API_URL}/transfers`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          value: data.value,
          bankAccount: data.bankAccount || undefined,
          walletId: data.walletId || undefined,
          description: data.description || "Repasse FixIMOB",
        }),
      });
      const result = await res.json();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}