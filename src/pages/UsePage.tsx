import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  filialLogin,
  getFilialMe,
  getFilialHistory,
  useCardFilial,
  type FilialMe,
  type TabraCard,
} from "../api";

const TOKEN_KEY = "tabar_filial_token";

type FilialSection = "summary" | "use" | "history";

export default function UsePage() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [section, setSection] = useState<FilialSection>("use");
  const [loginCode, setLoginCode] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [me, setMe] = useState<FilialMe | null>(null);
  const [history, setHistory] = useState<TabraCard[]>([]);
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      getFilialMe(token)
        .then(setMe)
        .catch(() => setToken(null));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setMe(null);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      getFilialHistory(token)
        .then(setHistory)
        .catch(() => {});
    } else {
      setHistory([]);
    }
  }, [token, receiptNumber]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCode.trim() || !loginPassword) {
      setError("Daxil olma kodu və şifrə daxil edin.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await filialLogin(loginCode.trim(), loginPassword);
      setToken(result.token);
      setLoginCode("");
      setLoginPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Daxil olmaq mümkün olmadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setMe(null);
    setHistory([]);
    setReceiptNumber(null);
  };

  const handleUseCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const trimmedBarcode = barcode.replace(/\D/g, "").slice(0, 13);
    if (trimmedBarcode.length !== 13) {
      setError("Barkod tam 13 rəqəm olmalıdır.");
      return;
    }
    if (
      !customerFirstName.trim() ||
      !customerLastName.trim() ||
      !customerPhone.trim()
    ) {
      setError("Müştəri adı, soyadı və telefon daxil edin.");
      return;
    }
    setError("");
    setReceiptNumber(null);
    setLoading(true);
    try {
      const result = await useCardFilial(token, {
        barcode: trimmedBarcode,
        customerFirstName: customerFirstName.trim(),
        customerLastName: customerLastName.trim(),
        customerPhone: customerPhone.trim(),
        filial: me?.filial?.name ?? "",
      });
      setReceiptNumber(result.receiptNumber);
      setBarcode("");
      setCustomerFirstName("");
      setCustomerLastName("");
      setCustomerPhone("");
      if (me) {
        getFilialMe(token).then(setMe);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kart istifadə edilə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Layout title="" sidebarItems={[]} activeId="" onSelect={() => {}}>
        <div className="login-page">
          <div className="login-card">
            <div className="login-card-header">
              <h2 className="login-title">Fillial girişi</h2>
              <p className="login-subtitle">
                Daxil olma kodunuz və şifrənizlə daxil olun.
              </p>
            </div>
            <form onSubmit={handleLogin} className="login-form">
              <label className="login-label">
                Daxil olma kodu
                <input
                  type="text"
                  className="login-input"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  placeholder="Fillial daxil olma kodu"
                  autoComplete="username"
                />
              </label>
              <label className="login-label">
                Şifrə
                <input
                  type="password"
                  className="login-input"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>
              {error && <p className="login-error">{error}</p>}
              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? "Yüklənir..." : "Daxil ol"}
              </button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  const sidebarItems: { id: FilialSection; label: string }[] = [
    { id: "summary", label: "Xülasə" },
    { id: "use", label: "Hədiyyə kartı istifadə et" },
    { id: "history", label: "Satış keçmişi" },
  ];

  return (
    <Layout
      title=""
      sidebarItems={sidebarItems}
      activeId={section}
      onSelect={(id) => setSection(id as FilialSection)}
      headerRight={
        <span className="app-header-filial-name">
          {me?.filial?.name ?? "—"}
        </span>
      }
      sidebarFooter={
        <button
          type="button"
          className="app-sidebar-logout"
          onClick={handleLogout}
        >
          Çıxış
        </button>
      }
    >
      <div className="page filial-dashboard">
        {section === "summary" && (
          <section className="filial-stats">
            <h2>Xülasə</h2>
            <div className="stats-cards">
              <div className="stat-card">
                <span className="stat-value">{me?.totalStock ?? 0}</span>
                <span className="stat-label">Anbardakı ümumi kart sayı</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{me?.totalUsed ?? 0}</span>
                <span className="stat-label">İstifadə edilən kart sayı</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {me?.stock?.filter((s) => s.type.name !== "Varsayılan")
                    .length ?? 0}
                </span>
                <span className="stat-label">Anbardakı kart növləri</span>
              </div>
            </div>
            {me?.stock &&
              (() => {
                const stockList = me.stock.filter(
                  (s) => s.type.name !== "Varsayılan"
                );
                if (stockList.length === 0) return null;
                return (
                  <div className="stock-types-table-wrap">
                    <h3>Anbardakı kart növləri və məlumatları</h3>
                    <table className="stats-table stock-types-table">
                      <thead>
                        <tr>
                          <th>Kart növü</th>
                          <th>Fiskal kod</th>
                          <th>Qiymət</th>
                          <th>Anbardakı ədəd</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockList.map(({ type, quantity }) => (
                          <tr key={type.id}>
                            <td>{type.name}</td>
                            <td>
                              <code>{type.fiscalCodeName}</code>
                            </td>
                            <td>{type.price}</td>
                            <td>{quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            {me?.stock &&
              (() => {
                const stock = me.stock.filter(
                  ({ type }) => type.name !== "Varsayılan"
                );
                if (stock.length === 0) return null;
                const total = stock.reduce((s, x) => s + x.quantity, 0);
                const colors = [
                  "#1a1a2e",
                  "#2e7d32",
                  "#1565c0",
                  "#6a1b9a",
                  "#c62828",
                  "#ef6c00",
                  "#00838f",
                ];
                if (total === 0) {
                  return (
                    <div className="stock-donut-wrap">
                      <h3>Kart növünə görə anbar</h3>
                      <div className="donut-chart empty">
                        <span>0</span>
                      </div>
                      <div className="donut-legend">
                        {stock.map(({ type }, i) => (
                          <div key={type.id} className="donut-legend-item">
                            <span
                              className="dot"
                              style={{ background: colors[i % colors.length] }}
                            />
                            <span>{type.name}</span>
                            <span className="qty">0</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                let acc = 0;
                const segments = stock.map(({ type, quantity }, i) => {
                  const start = (acc / total) * 360;
                  acc += quantity;
                  const end = (acc / total) * 360;
                  return {
                    type,
                    quantity,
                    color: colors[i % colors.length],
                    start,
                    end,
                  };
                });
                const conic = segments
                  .map((s) => `${s.color} ${s.start}deg ${s.end}deg`)
                  .join(", ");
                return (
                  <div className="stock-donut-wrap">
                    <h3>Kart növünə görə anbar</h3>
                    <div
                      className="donut-chart"
                      style={{ background: `conic-gradient(${conic})` }}
                    >
                      <div className="donut-hole">
                        <span>{total}</span>
                        <span className="donut-total-label">cəmi</span>
                      </div>
                    </div>
                    <div className="donut-legend">
                      {segments.map(({ type, quantity, color }) => (
                        <div key={type.id} className="donut-legend-item">
                          <span className="dot" style={{ background: color }} />
                          <span>{type.name}</span>
                          <span className="qty">{quantity} ədəd</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
          </section>
        )}

        {section === "use" && (
          <section className="filial-sale">
            <h2>Hədiyyə kartı istifadə et</h2>
            <form onSubmit={handleUseCard} className="form use-form">
              <label>
                Müştəri adı
                <input
                  type="text"
                  value={customerFirstName}
                  onChange={(e) => setCustomerFirstName(e.target.value)}
                  placeholder="Ad"
                />
              </label>
              <label>
                Müştəri soyadı
                <input
                  type="text"
                  value={customerLastName}
                  onChange={(e) => setCustomerLastName(e.target.value)}
                  placeholder="Soyad"
                />
              </label>
              <label>
                Telefon
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                />
              </label>
              <label>
                Kart barkodu (13 rəqəm)
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={13}
                  value={barcode}
                  onChange={(e) =>
                    setBarcode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="1234567890123"
                />
              </label>
              <button type="submit" disabled={loading}>
                İstifadə et
              </button>
            </form>
            {error && <p className="error">{error}</p>}
            {receiptNumber && (
              <div className="receipt">
                <h3>Əməliyyat tamamlandı</h3>
                <p>
                  <strong>Fiş nömrəsi:</strong> <code>{receiptNumber}</code>
                </p>
                <p>Bu nömrəni müştəriyə verə bilərsiniz.</p>
              </div>
            )}
          </section>
        )}

        {section === "history" && (
          <section className="filial-history">
            <h2>Satış keçmişi (bu fillial)</h2>
            <p className="section-label">Saat, müştəri, kart növü, fiş no.</p>
            {history.length === 0 ? (
              <p>Hələ satış yoxdur.</p>
            ) : (
              <div className="card-list">
                <table>
                  <thead>
                    <tr>
                      <th>Tarix / Saat</th>
                      <th>Müştəri</th>
                      <th>Telefon</th>
                      <th>Kart növü</th>
                      <th>Fiş no</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((c) => (
                      <tr key={c.id}>
                        <td>
                          {c.usedAt
                            ? new Date(c.usedAt).toLocaleString("az-AZ")
                            : "–"}
                        </td>
                        <td>
                          {c.customerFirstName
                            ? `${c.customerFirstName} ${
                                c.customerLastName || ""
                              }`.trim()
                            : "–"}
                        </td>
                        <td>{c.customerPhone || "–"}</td>
                        <td>{c.tabraType?.name ?? "–"}</td>
                        <td>{c.receiptNumber || "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
}
