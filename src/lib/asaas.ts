export async function asaasRequest(action: string, data: any) {
    const res = await fetch("/api/asaas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data }),
    });
    return res.json();
  }