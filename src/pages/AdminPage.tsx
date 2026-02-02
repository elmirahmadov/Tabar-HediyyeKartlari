import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import InputSelect from "../components/InputSelect";
import {
  listTypes,
  createType,
  getTypeCards,
  exportTypeUrl,
  getHistory,
  getStats,
  listFilials,
  createFilial,
  updateFilial,
  deleteFilial,
  getCentralStock,
  getFilialStock,
  createTransferByBarcode,
  deleteType,
  deleteCard,
  type TabraType,
  type TabraCard,
  type TabraStats,
  type TabraFilial,
  type CentralStockItem,
} from "../api";

const ADMIN_AUTH_KEY = "tabar_admin_auth";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "131202";

type AdminSection =
  | "create"
  | "types"
  | "history"
  | "stats"
  | "filials"
  | "transfer";

export default function AdminPage() {
  const [adminAuth, setAdminAuth] = useState(
    () => sessionStorage.getItem(ADMIN_AUTH_KEY) === "1"
  );
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [section, setSection] = useState<AdminSection>("create");
  const [types, setTypes] = useState<TabraType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [typeCards, setTypeCards] = useState<TabraCard[]>([]);
  const [cardFilter, setCardFilter] = useState<"all" | "used" | "unused">(
    "all"
  );
  const [history, setHistory] = useState<TabraCard[]>([]);
  const [stats, setStats] = useState<TabraStats | null>(null);

  const [name, setName] = useState("");
  const [fiscalCodeName, setFiscalCodeName] = useState("");
  const [price, setPrice] = useState("");
  const [count, setCount] = useState(50);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdTypeId, setCreatedTypeId] = useState<number | null>(null);

  const [filials, setFilials] = useState<TabraFilial[]>([]);
  const [filialName, setFilialName] = useState("");
  const [filialCode, setFilialCode] = useState("");
  const [filialPassword, setFilialPassword] = useState("");
  const [centralStock, setCentralStock] = useState<CentralStockItem[]>([]);
  const [transferFilialId, setTransferFilialId] = useState<number>(0);
  const [transferBarcodeInput, setTransferBarcodeInput] = useState("");
  const [transferBasket, setTransferBasket] = useState<string[]>([]);
  const [expandedFilialId, setExpandedFilialId] = useState<number | null>(null);
  const [filialStock, setFilialStock] = useState<CentralStockItem[]>([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [editingFilialId, setEditingFilialId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCode, setEditingCode] = useState("");
  const [editingPassword, setEditingPassword] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      adminUsername.trim() === ADMIN_USERNAME &&
      adminPassword === ADMIN_PASSWORD
    ) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, "1");
      setAdminAuth(true);
      setAdminUsername("");
      setAdminPassword("");
      setError("");
    } else {
      setError("İstifadəçi adı və ya şifrə səhvdir.");
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setAdminAuth(false);
    setError("");
  };

  const loadTypes = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await listTypes();
      setTypes(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklənə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  const loadTypeCards = async (typeId: number) => {
    setLoading(true);
    setError("");
    try {
      const used = cardFilter === "all" ? undefined : cardFilter === "used";
      const list = await getTypeCards(typeId, used);
      setTypeCards(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklənə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getHistory(200);
      setHistory(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklənə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getStats();
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklənə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  const loadFilials = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await listFilials();
      setFilials(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklənə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  const loadCentralStock = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getCentralStock();
      setCentralStock(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklənə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (section === "types") loadTypes();
    if (section === "history") loadHistory();
    if (section === "stats") loadStats();
    if (section === "filials") loadFilials();
    if (section === "transfer") {
      loadCentralStock();
      loadFilials();
      loadTypes();
    }
  }, [section]);

  useEffect(() => {
    if (selectedTypeId != null) loadTypeCards(selectedTypeId);
  }, [selectedTypeId, cardFilter]);

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fiscalCodeName.trim() || !price.trim() || count < 1) {
      setError("Bütün sahələri doldurun.");
      return;
    }
    setError("");
    setLoading(true);
    setCreatedTypeId(null);
    try {
      const result = await createType({
        name: name.trim(),
        fiscalCodeName: fiscalCodeName.trim(),
        price: price.trim(),
        count,
      });
      setCreatedTypeId(result.type.id);
      setName("");
      setFiscalCodeName("");
      setPrice("");
      setCount(50);
      loadTypes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yaradıla bilmədi");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = types.find((t) => t.id === selectedTypeId);

  const handleCreateFilial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filialName.trim() || !filialCode.trim() || !filialPassword) {
      setError("Fillial adı, daxil olma kodu və şifrə tələb olunur.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createFilial({
        name: filialName.trim(),
        code: filialCode.trim(),
        password: filialPassword,
      });
      setFilialName("");
      setFilialCode("");
      setFilialPassword("");
      loadFilials();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Əlavə edilə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  const startEditFilial = (f: TabraFilial) => {
    setEditingFilialId(f.id);
    setEditingName(f.name);
    setEditingCode(f.code);
    setEditingPassword("");
    setError("");
  };

  const handleUpdateFilial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFilialId == null) return;
    if (!editingName.trim() || !editingCode.trim()) {
      setError("Fillial adı və daxil olma kodu tələb olunur.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await updateFilial(editingFilialId, {
        name: editingName.trim(),
        code: editingCode.trim(),
        password: editingPassword || undefined,
      });
      setEditingFilialId(null);
      setEditingName("");
      setEditingCode("");
      setEditingPassword("");
      loadFilials();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yenilənə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFilial = async (f: TabraFilial) => {
    if (
      !window.confirm(
        `"${f.name}" fillialını silmək istədiyinizə əminsiniz? Anbardakı kartlar mərkəzə köçürüləcək.`
      )
    )
      return;
    setError("");
    setLoading(true);
    try {
      await deleteFilial(f.id);
      if (editingFilialId === f.id) setEditingFilialId(null);
      setExpandedFilialId((id) => (id === f.id ? null : id));
      loadFilials();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  const addBarcodeToBasket = () => {
    const raw = transferBarcodeInput.replace(/\D/g, "").trim();
    if (raw.length !== 13) return;
    setTransferBasket((prev) => (prev.includes(raw) ? prev : [...prev, raw]));
    setTransferBarcodeInput("");
    setError("");
  };

  const removeBarcodeFromBasket = (barcode: string) => {
    setTransferBasket((prev) => prev.filter((b) => b !== barcode));
  };

  const handleTransferByBarcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferFilialId || transferBasket.length === 0) {
      setError("Hədef fillial seçin və səbətə ən az bir barkod əlavə edin.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createTransferByBarcode({
        toFilialId: transferFilialId,
        barcodes: [...transferBasket],
      });
      setTransferBasket([]);
      loadCentralStock();
      if (section === "filials") loadFilials();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Köçürmə edilə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  if (!adminAuth) {
    return (
      <Layout title="" sidebarItems={[]} activeId="" onSelect={() => {}}>
        <div className="login-page">
          <div className="login-card">
            <div className="login-card-header">
              <h2 className="login-title">Admin girişi</h2>
              <p className="login-subtitle">
                Admin panelinə daxil olmaq üçün istifadəçi adı və şifrə daxil
                edin.
              </p>
            </div>
            <form onSubmit={handleAdminLogin} className="login-form">
              <label className="login-label">
                İstifadəçi adı
                <input
                  type="text"
                  className="login-input"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                />
              </label>
              <label className="login-label">
                Şifrə
                <input
                  type="password"
                  className="login-input"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>
              {error && <p className="login-error">{error}</p>}
              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? "Yüklənir..." : "Daxil ol"}
              </button>
            </form>
            <p className="login-admin-link">
              <Link to="/">Fillial səhifəsinə keç</Link>
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const sidebarItems: { id: AdminSection; label: string }[] = [
    { id: "create", label: "Yeni Kart Növü" },
    { id: "types", label: "Kart Növləri" },
    { id: "filials", label: "Fillial" },
    { id: "transfer", label: "Anbar / Köçürmə" },
    { id: "history", label: "Keçmiş" },
    { id: "stats", label: "Statistika" },
  ];

  return (
    <Layout
      title=""
      sidebarItems={sidebarItems}
      activeId={section}
      onSelect={(id) => setSection(id as AdminSection)}
      headerRight={
        <Link to="/" className="app-header-link">
          Fillial səhifəsi
        </Link>
      }
      sidebarFooter={
        <button
          type="button"
          className="app-sidebar-logout"
          onClick={handleAdminLogout}
        >
          Çıxış
        </button>
      }
    >
      <div className="page admin-page">
        {error && <p className="error">{error}</p>}

        {section === "create" && (
          <div className="admin-section">
            <form onSubmit={handleCreateType} className="form create-type-form">
              <label>
                Kart adı (məs: PremiumCard 50Manat)
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="PremiumCard 50Manat"
                />
              </label>
              <label>
                Fiskal kod adı
                <input
                  type="text"
                  value={fiscalCodeName}
                  onChange={(e) => setFiscalCodeName(e.target.value)}
                  placeholder="PREMIUM50"
                />
              </label>
              <label>
                Qiymət
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="50 Manat"
                />
              </label>
              <label>
                Barkod sayı
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value) || 50)}
                />
              </label>
              <button type="submit" disabled={loading}>
                {count} barkod yarat
              </button>
            </form>
            {createdTypeId != null && (
              <div className="export-success">
                <p>
                  Kart növü yaradıldı. Siyahını Excel/CSV olaraq endirə
                  bilərsiniz:
                </p>
                <a
                  href={exportTypeUrl(createdTypeId)}
                  download
                  className="btn-download"
                >
                  Excel / CSV Endir
                </a>
              </div>
            )}
          </div>
        )}

        {section === "filials" && (
          <div className="admin-section">
            <form
              onSubmit={handleCreateFilial}
              className="form create-type-form"
            >
              <label>
                Fillial adı
                <input
                  type="text"
                  value={filialName}
                  onChange={(e) => setFilialName(e.target.value)}
                  placeholder="Fillial adı"
                />
              </label>
              <label>
                Daxil olma kodu
                <input
                  type="text"
                  value={filialCode}
                  onChange={(e) => setFilialCode(e.target.value)}
                  placeholder="misal_fillial"
                />
              </label>
              <label>
                Şifrə
                <input
                  type="password"
                  value={filialPassword}
                  onChange={(e) => setFilialPassword(e.target.value)}
                  placeholder="Ən az 4 simvol"
                />
              </label>
              <button type="submit" disabled={loading}>
                Fillial əlavə et
              </button>
            </form>
            <p className="section-label">
              Qeydiyyatda olan fillialar (anbar təfərrüatı üçün "Anbar"a
              klikləyin):
            </p>
            {loading && filials.length === 0 ? (
              <p>Yüklənir...</p>
            ) : (
              <table className="stats-table filials-table">
                <thead>
                  <tr>
                    <th>Fillial adı</th>
                    <th>Daxil olma kodu</th>
                    <th>Anbardakı kart</th>
                    <th>Əməliyyat</th>
                  </tr>
                </thead>
                <tbody>
                  {filials.map((f) => (
                    <Fragment key={f.id}>
                      <tr>
                        <td>{f.name}</td>
                        <td>
                          <code>{f.code}</code>
                        </td>
                        <td>{f._count?.cardsInStock ?? 0}</td>
                        <td>
                          <div className="filial-actions">
                            <button
                              type="button"
                              className="btn-anbar-detail"
                              onClick={() => {
                                if (expandedFilialId === f.id) {
                                  setExpandedFilialId(null);
                                  return;
                                }
                                setExpandedFilialId(f.id);
                                setLoadingStock(true);
                                getFilialStock(f.id)
                                  .then(setFilialStock)
                                  .catch(() => setFilialStock([]))
                                  .finally(() => setLoadingStock(false));
                              }}
                            >
                              {expandedFilialId === f.id ? "Gizlət" : "Anbar"}
                            </button>
                            <button
                              type="button"
                              className="btn-edit-filial"
                              onClick={() => startEditFilial(f)}
                            >
                              Düzənlə
                            </button>
                            <button
                              type="button"
                              className="btn-delete-type"
                              onClick={() => handleDeleteFilial(f)}
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                      {editingFilialId === f.id && (
                        <tr className="filial-edit-row">
                          <td colSpan={4} className="filial-edit-cell">
                            <form
                              onSubmit={handleUpdateFilial}
                              className="form create-type-form filial-edit-form"
                            >
                              <label>
                                Fillial adı
                                <input
                                  type="text"
                                  value={editingName}
                                  onChange={(e) =>
                                    setEditingName(e.target.value)
                                  }
                                  placeholder="Fillial adı"
                                />
                              </label>
                              <label>
                                Daxil olma kodu
                                <input
                                  type="text"
                                  value={editingCode}
                                  onChange={(e) =>
                                    setEditingCode(e.target.value)
                                  }
                                  placeholder="misal_fillial"
                                />
                              </label>
                              <label>
                                Yeni şifrə (boş buraxın dəyişməsin)
                                <input
                                  type="password"
                                  value={editingPassword}
                                  onChange={(e) =>
                                    setEditingPassword(e.target.value)
                                  }
                                  placeholder="••••••••"
                                />
                              </label>
                              <button type="submit" disabled={loading}>
                                Saxla
                              </button>
                              <button
                                type="button"
                                className="btn-cancel-edit"
                                onClick={() => {
                                  setEditingFilialId(null);
                                  setEditingName("");
                                  setEditingCode("");
                                  setEditingPassword("");
                                  setError("");
                                }}
                              >
                                Ləğv et
                              </button>
                            </form>
                          </td>
                        </tr>
                      )}
                      {expandedFilialId === f.id && (
                        <tr key={`${f.id}-stock`} className="filial-stock-row">
                          <td colSpan={4} className="filial-stock-cell">
                            {loadingStock ? (
                              <p className="stock-loading">Yüklənir...</p>
                            ) : filialStock.length === 0 ? (
                              <p className="stock-empty">
                                Bu fillialın anbarında kart yoxdur.
                              </p>
                            ) : (
                              <table className="stock-detail-table">
                                <thead>
                                  <tr>
                                    <th>Kart növü</th>
                                    <th>Qiymət</th>
                                    <th>Ədəd</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filialStock.map(({ type, quantity }) => (
                                    <tr key={type.id}>
                                      <td>{type.name}</td>
                                      <td>{type.price}</td>
                                      <td>{quantity}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filials.length === 0 && <p>Hələ fillial yoxdur.</p>}
          </div>
        )}

        {section === "transfer" && (
          <div className="admin-section">
            <p className="section-label">
              Mərkəz anbar (yaradılan kartlar burada; fillialara köçürün):
            </p>
            {loading && centralStock.length === 0 ? (
              <p>Yüklənir...</p>
            ) : (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Kart növü</th>
                    <th>Qiymət</th>
                    <th>Mövcud ədəd</th>
                  </tr>
                </thead>
                <tbody>
                  {centralStock
                    .filter(({ type }) => type.name !== "Varsayılan")
                    .map(({ type, quantity }) => (
                      <tr key={type.id}>
                        <td>{type.name}</td>
                        <td>{type.price}</td>
                        <td>{quantity}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
            <h3>Köçürmə: Mərkəz anbar → Fillial (barkod ilə)</h3>
            <p className="section-label">
              Hədef fillial seçin, barkodu oxudun və ya yazın — səbətə əlavə
              olunacaq. Sonra &quot;Köçürməni tamamla&quot; ilə səbətdəki
              kartları göndərin.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addBarcodeToBasket();
              }}
              className="form transfer-by-barcode-form"
            >
              <InputSelect
                label="Hədef fillial"
                placeholder="Seçin"
                value={transferFilialId}
                onChange={setTransferFilialId}
                options={filials.map((f) => ({
                  value: f.id,
                  label: `${f.name} (${f.code})`,
                }))}
                disabled={loading}
              />
              <div className="barcode-input-row">
                <label className="barcode-single-label">
                  Barkod (13 rəqəm)
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={13}
                    value={transferBarcodeInput}
                    onChange={(e) =>
                      setTransferBarcodeInput(e.target.value.replace(/\D/g, ""))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addBarcodeToBasket();
                      }
                    }}
                    placeholder="Barkodu oxudun və ya yazın"
                    className="barcode-single-input"
                  />
                </label>
                <button
                  type="button"
                  className="btn-add-barcode"
                  onClick={addBarcodeToBasket}
                  disabled={
                    transferBarcodeInput.replace(/\D/g, "").trim().length !== 13
                  }
                >
                  Səbətə əlavə et
                </button>
              </div>
            </form>
            <div className="transfer-basket">
              <h4>Səbət ({transferBasket.length})</h4>
              {transferBasket.length === 0 ? (
                <p className="basket-empty">
                  Səbət boşdur. Barkod oxudun və ya yazın.
                </p>
              ) : (
                <ul className="basket-list">
                  {transferBasket.map((b) => (
                    <li key={b} className="basket-item">
                      <code>{b}</code>
                      <button
                        type="button"
                        className="btn-remove-barcode"
                        onClick={() => removeBarcodeFromBasket(b)}
                        title="Səbətdən çıxart"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <form
                onSubmit={handleTransferByBarcode}
                className="basket-submit-form"
              >
                <button
                  type="submit"
                  className="btn-transfer-complete"
                  disabled={
                    loading || !transferFilialId || transferBasket.length === 0
                  }
                >
                  Köçürməni tamamla
                </button>
              </form>
            </div>
          </div>
        )}

        {section === "types" && (
          <div className="admin-section">
            {loading && types.length === 0 ? (
              <p>Yüklənir...</p>
            ) : (
              <>
                <div className="types-list">
                  <p className="section-label">
                    Kart növünə klikləyin (istifadə olunan / olunmayan kartlar
                    və Excel endirmə):
                  </p>
                  {types.map((t) => (
                    <div
                      key={t.id}
                      className={`type-item ${
                        selectedTypeId === t.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedTypeId(t.id)}
                    >
                      <span className="type-name">{t.name}</span>
                      <span className="type-meta">
                        {t.fiscalCodeName} · {t.price} · {t._count?.cards ?? 0}{" "}
                        kart
                      </span>
                      <button
                        type="button"
                        className="btn-delete-type"
                        title="Kart növünü sil"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            !window.confirm(
                              "Bu kart növü və bütün kartlar silinəcək. Əminsiniz?"
                            )
                          )
                            return;
                          setLoading(true);
                          setError("");
                          deleteType(t.id)
                            .then(() => {
                              if (selectedTypeId === t.id)
                                setSelectedTypeId(null);
                              loadTypes();
                            })
                            .catch((err) =>
                              setError(
                                err instanceof Error
                                  ? err.message
                                  : "Silinə bilmədi"
                              )
                            )
                            .finally(() => setLoading(false));
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  ))}
                  {types.length === 0 && <p>Hələ kart növü yoxdur.</p>}
                </div>
                {selectedTypeId != null && selectedType && (
                  <div className="type-detail">
                    <h3>{selectedType.name}</h3>
                    <a
                      href={exportTypeUrl(selectedTypeId)}
                      download
                      className="btn-download small"
                    >
                      Excel / CSV Endir
                    </a>
                    <div className="filter">
                      <button
                        type="button"
                        className={cardFilter === "all" ? "active" : ""}
                        onClick={() => setCardFilter("all")}
                      >
                        Hamısı
                      </button>
                      <button
                        type="button"
                        className={cardFilter === "unused" ? "active" : ""}
                        onClick={() => setCardFilter("unused")}
                      >
                        İstifadə olunmayan
                      </button>
                      <button
                        type="button"
                        className={cardFilter === "used" ? "active" : ""}
                        onClick={() => setCardFilter("used")}
                      >
                        İstifadə olunan
                      </button>
                    </div>
                    <div className="card-list">
                      <table>
                        <thead>
                          <tr>
                            <th>Barkod</th>
                            <th>Vəziyyət</th>
                            <th>Müştəri</th>
                            <th>Fillial</th>
                            <th>Fiş no</th>
                            <th>İstifadə tarixi</th>
                            <th>Əməliyyat</th>
                          </tr>
                        </thead>
                        <tbody>
                          {typeCards.map((c) => (
                            <tr key={c.id}>
                              <td>
                                <code>{c.barcode}</code>
                              </td>
                              <td>
                                {c.isUsed
                                  ? "İstifadə edildi"
                                  : "İstifadə oluna bilər"}
                              </td>
                              <td>
                                {c.isUsed && c.customerFirstName
                                  ? `${c.customerFirstName} ${
                                      c.customerLastName || ""
                                    }`.trim()
                                  : "–"}
                              </td>
                              <td>
                                {c.isUsed
                                  ? c.filial || "–"
                                  : c.currentFilial?.name ?? "Mərkəz"}
                              </td>
                              <td>{c.receiptNumber || "–"}</td>
                              <td>
                                {c.usedAt
                                  ? new Date(c.usedAt).toLocaleString("az-AZ")
                                  : "–"}
                              </td>
                              <td>
                                {!c.isUsed && (
                                  <button
                                    type="button"
                                    className="btn-delete-card"
                                    title="Kartı sil"
                                    onClick={() => {
                                      if (
                                        !window.confirm(
                                          "Bu kart silinəcək. Əminsiniz?"
                                        )
                                      )
                                        return;
                                      setLoading(true);
                                      setError("");
                                      deleteCard(c.id)
                                        .then(() => {
                                          if (selectedTypeId != null)
                                            loadTypeCards(selectedTypeId);
                                        })
                                        .catch((err) =>
                                          setError(
                                            err instanceof Error
                                              ? err.message
                                              : "Silinə bilmədi"
                                          )
                                        )
                                        .finally(() => setLoading(false));
                                    }}
                                  >
                                    Sil
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {!loading && typeCards.length === 0 && (
                        <p>Bu filtrdə kart yoxdur.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {section === "history" && (
          <div className="admin-section">
            <p className="section-label">
              Kim hansı kartı nə vaxt istifadə etdi:
            </p>
            {loading && history.length === 0 ? (
              <p>Yüklənir...</p>
            ) : (
              <div className="card-list">
                <table>
                  <thead>
                    <tr>
                      <th>Tarix</th>
                      <th>Kart növü</th>
                      <th>Müştəri</th>
                      <th>Telefon</th>
                      <th>Fillial</th>
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
                        <td>{c.tabraType?.name ?? "–"}</td>
                        <td>
                          {c.customerFirstName
                            ? `${c.customerFirstName} ${
                                c.customerLastName || ""
                              }`.trim()
                            : "–"}
                        </td>
                        <td>{c.customerPhone || "–"}</td>
                        <td>{c.filial || "–"}</td>
                        <td>{c.receiptNumber || "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && history.length === 0 && (
                  <p>Hələ istifadə yoxdur.</p>
                )}
              </div>
            )}
          </div>
        )}

        {section === "stats" && (
          <div className="admin-section stats-section">
            {loading && !stats ? (
              <p>Yüklənir...</p>
            ) : stats ? (
              <>
                <h3>Fillial üzrə istifadə</h3>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Fillial</th>
                      <th>Ümumi istifadə</th>
                      <th>Kart növü paylanması</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.byFilial).map(([filial, data]) => (
                      <tr key={filial}>
                        <td>{filial}</td>
                        <td>{data.count}</td>
                        <td>
                          {Object.entries(data.cards)
                            .map(([card, n]) => `${card}: ${n}`)
                            .join(", ") || "–"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {Object.keys(stats.byFilial).length === 0 && (
                  <p>Hələ istifadə yoxdur.</p>
                )}
                <h3>Kart növü üzrə istifadə</h3>
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Kart növü</th>
                      <th>Qiymət</th>
                      <th>İstifadə sayı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.byCard).map(([card, data]) => (
                      <tr key={card}>
                        <td>{card}</td>
                        <td>{data.price}</td>
                        <td>{data.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {Object.keys(stats.byCard).length === 0 && (
                  <p>Hələ istifadə yoxdur.</p>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </Layout>
  );
}
