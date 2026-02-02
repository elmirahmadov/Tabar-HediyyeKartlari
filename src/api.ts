const API_BASE =
  (import.meta.env.VITE_API_URL &&
    `${import.meta.env.VITE_API_URL}/api/tabra`) ||
  "/api/tabra";

export type TabraType = {
  id: number;
  name: string;
  fiscalCodeName: string;
  price: string;
  createdAt: string;
  _count?: { cards: number };
};

export type TabraCard = {
  id: number;
  tabraTypeId: number;
  barcode: string;
  customerFirstName: string | null;
  customerLastName: string | null;
  customerPhone: string | null;
  filial: string | null;
  isUsed: boolean;
  receiptNumber: string | null;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tabraType?: TabraType;
  /** Kartın hazırda harada olduğu (köçürmədən sonra); null = mərkəz anbar */
  currentFilial?: { name: string } | null;
};

export type TabraStats = {
  byFilial: Record<string, { count: number; cards: Record<string, number> }>;
  byCard: Record<string, { count: number; price: string }>;
};

export type TabraFilial = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  _count?: { cardsInStock: number };
};

export type CentralStockItem = { type: TabraType; quantity: number };

export type FilialMe = {
  filial: { id: number; name: string; code: string } | null;
  totalStock: number;
  totalUsed: number;
  byCard: Record<string, { count: number; price: string }>;
  stock: { type: TabraType; quantity: number }[];
};

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text)
    throw new Error(
      "Sunucu boş yanıt verdi. Backend çalışıyor mu? (Port 5000)"
    );
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      res.ok ? "Geçersiz yanıt." : `Hata: ${res.status} ${res.statusText}`
    );
  }
}

export async function listTypes(): Promise<TabraType[]> {
  const res = await fetch(`${API_BASE}/types`);
  if (!res.ok)
    throw new Error(
      res.status === 404
        ? "Backend tapılmadı. Backendi işə salın (port 5000) və proxy/API ünvanını yoxlayın."
        : "Kart növləri yüklənə bilmədi."
    );
  return parseJson(res);
}

export async function createType(params: {
  name: string;
  fiscalCodeName: string;
  price: string;
  count: number;
}): Promise<{ type: TabraType; barcodes: string[]; count: number }> {
  const res = await fetch(`${API_BASE}/types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await parseJson<{
    type: TabraType;
    barcodes: string[];
    count: number;
    error?: string;
    detail?: string;
  }>(res);
  if (!res.ok)
    throw new Error(data?.error || data?.detail || "Oluşturulamadı.");
  return data as { type: TabraType; barcodes: string[]; count: number };
}

export async function getTypeCards(
  typeId: number,
  used?: boolean
): Promise<TabraCard[]> {
  const q = used !== undefined ? `?used=${used}` : "";
  const res = await fetch(`${API_BASE}/types/${typeId}/cards${q}`);
  if (!res.ok) throw new Error("Kartlar yüklənə bilmədi.");
  return parseJson(res);
}

export function exportTypeUrl(typeId: number): string {
  return `${API_BASE}/types/${typeId}/export`;
}

export async function deleteType(typeId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/types/${typeId}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await parseJson<{ error?: string }>(res);
    throw new Error(data?.error || "Növ silinə bilmədi.");
  }
}

export async function deleteCard(cardId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/cards/${cardId}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await parseJson<{ error?: string }>(res);
    throw new Error(data?.error || "Kart silinə bilmədi.");
  }
}

export async function getHistory(limit?: number): Promise<TabraCard[]> {
  const q = limit ? `?limit=${limit}` : "";
  const res = await fetch(`${API_BASE}/history${q}`);
  if (!res.ok) throw new Error("Keçmiş yüklənə bilmədi.");
  return parseJson(res);
}

export async function getStats(): Promise<TabraStats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error("Statistika yüklənə bilmədi.");
  return parseJson(res);
}

export type UseCardResult = { receiptNumber: string; card: TabraCard };

export async function useCard(params: {
  barcode: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  filial: string;
}): Promise<UseCardResult> {
  const res = await fetch(`${API_BASE}/use`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await parseJson<
    UseCardResult & { error?: string; detail?: string }
  >(res);
  if (!res.ok)
    throw new Error(
      data?.error || data?.detail || "Kart istifadə edilə bilmədi."
    );
  return data as UseCardResult;
}

export async function listFilials(): Promise<TabraFilial[]> {
  const res = await fetch(`${API_BASE}/filials`);
  if (!res.ok) throw new Error("Fillial siyahısı yüklənə bilmədi.");
  return parseJson(res);
}

export async function createFilial(params: {
  name: string;
  code: string;
  password: string;
}): Promise<TabraFilial> {
  const res = await fetch(`${API_BASE}/filials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await parseJson<TabraFilial & { error?: string }>(res);
  if (!res.ok) throw new Error(data?.error || "Fillial əlavə edilə bilmədi.");
  return data as TabraFilial;
}

export async function updateFilial(
  filialId: number,
  params: { name?: string; code?: string; password?: string }
): Promise<TabraFilial> {
  const res = await fetch(`${API_BASE}/filials/${filialId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await parseJson<TabraFilial & { error?: string }>(res);
  if (!res.ok) throw new Error(data?.error || "Fillial yenilənə bilmədi.");
  return data as TabraFilial;
}

export async function deleteFilial(filialId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/filials/${filialId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await parseJson<{ error?: string }>(res);
    throw new Error(data?.error || "Fillial silinə bilmədi.");
  }
}

export async function filialLogin(
  code: string,
  password: string
): Promise<{
  token: string;
  filial: { id: number; name: string; code: string };
}> {
  const res = await fetch(`${API_BASE}/auth/filial-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, password }),
  });
  const data = await parseJson<{
    token: string;
    filial: { id: number; name: string; code: string };
    error?: string;
  }>(res);
  if (!res.ok) throw new Error(data?.error || "Daxil olmaq mümkün olmadı.");
  return data as {
    token: string;
    filial: { id: number; name: string; code: string };
  };
}

export async function getCentralStock(): Promise<CentralStockItem[]> {
  const res = await fetch(`${API_BASE}/stock/central`);
  if (!res.ok) throw new Error("Mərkəz anbar yüklənə bilmədi.");
  return parseJson(res);
}

export async function getFilialStock(
  filialId: number
): Promise<CentralStockItem[]> {
  const res = await fetch(`${API_BASE}/filials/${filialId}/stock`);
  if (!res.ok) throw new Error("Fillial anbarı yüklənə bilmədi.");
  return parseJson(res);
}

export async function createTransfer(params: {
  toFilialId: number;
  tabraTypeId: number;
  quantity: number;
}): Promise<{ transferred: number; toFilial: string }> {
  const res = await fetch(`${API_BASE}/transfers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await parseJson<{
    transferred: number;
    toFilial: string;
    error?: string;
  }>(res);
  if (!res.ok) throw new Error(data?.error || "Köçürmə edilə bilmədi.");
  return data as { transferred: number; toFilial: string };
}

export async function createTransferByBarcode(params: {
  toFilialId: number;
  barcodes: string[];
}): Promise<{
  transferred: number;
  toFilial: string;
  byType?: Record<string, number>;
}> {
  const res = await fetch(`${API_BASE}/transfers/by-barcode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await parseJson<{
    transferred: number;
    toFilial: string;
    byType?: Record<string, number>;
    error?: string;
  }>(res);
  if (!res.ok) throw new Error(data?.error || "Köçürmə edilə bilmədi.");
  return data as {
    transferred: number;
    toFilial: string;
    byType?: Record<string, number>;
  };
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getFilialMe(token: string): Promise<FilialMe> {
  const res = await fetch(`${API_BASE}/filial/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Məlumat yüklənə bilmədi.");
  return parseJson(res);
}

export async function getFilialHistory(
  token: string,
  limit?: number
): Promise<TabraCard[]> {
  const q = limit ? `?limit=${limit}` : "";
  const res = await fetch(`${API_BASE}/filial/history${q}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Keçmiş yüklənə bilmədi.");
  return parseJson(res);
}

export async function useCardFilial(
  token: string,
  params: {
    barcode: string;
    customerFirstName: string;
    customerLastName: string;
    customerPhone: string;
    filial: string;
  }
): Promise<UseCardResult> {
  const res = await fetch(`${API_BASE}/filial/use`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(params),
  });
  const data = await parseJson<UseCardResult & { error?: string }>(res);
  if (!res.ok) throw new Error(data?.error || "Kart istifadə edilə bilmədi.");
  return data as UseCardResult;
}
