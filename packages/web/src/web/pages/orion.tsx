import { useState, useEffect, useCallback } from "react";
import { Search, ExternalLink, MessageCircle, Check, X, ChevronDown, RefreshCw, Filter, BarChart3, Send } from "lucide-react";

type Lead = {
  id: number;
  tenantSlug: string;
  businessName: string;
  phone: string;
  address: string;
  category: string;
  rating: string;
  reviews: string;
  googleUrl: string;
  status: string;
  priceOffered: number;
  msgSentAt: string | null;
  notes: string;
  createdAt: string;
};

type Stats = {
  total: number;
  new: number;
  msg_sent: number;
  replied: number;
  interested: number;
  closed: number;
  rejected: number;
};

const BG = "#0A0A0A";
const FG = "#F5F0EB";
const MUTED = "#7A7770";
const SURF = "#131313";
const AC = "#8B5CF6"; // Purple accent for Orion
const GREEN = "#22C55E";
const RED = "#EF4444";
const ORANGE = "#F59E0B";
const BLUE = "#3B82F6";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Novo", color: BLUE, bg: "rgba(59,130,246,0.12)" },
  msg_sent: { label: "Msg Enviada", color: ORANGE, bg: "rgba(245,158,11,0.12)" },
  replied: { label: "Respondeu", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
  interested: { label: "Interessado", color: GREEN, bg: "rgba(34,197,94,0.12)" },
  closed: { label: "Fechado", color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  rejected: { label: "Rejeitado", color: RED, bg: "rgba(239,68,68,0.12)" },
};

const CAT_PT: Record<string, string> = {
  "Barber shop": "Barbearia", "Beauty salon": "Salao", "Restaurant": "Restaurante",
  "Buffet restaurant": "Buffet", "Pizza restaurant": "Pizzaria", "Pizza delivery": "Pizza Delivery",
  "Hamburger restaurant": "Hamburgueria", "Snack bar": "Lanchonete", "Cafe": "Cafe",
  "Coffee shop": "Cafe", "Bakery": "Padaria", "Ice cream shop": "Sorveteria",
  "Pet store": "Pet Shop", "Pet groomer": "Pet", "Gym": "Academia",
  "Auto repair shop": "Oficina", "Auto parts store": "Auto Pecas", "Clothing store": "Roupas",
  "Women's clothing store": "Moda Fem", "Florist": "Floricultura", "Butcher shop": "Carnes",
  "Optician": "Otica", "Furniture store": "Moveis", "Building materials store": "Construcao",
  "Stationery store": "Papelaria", "Cell phone store": "Celulares",
  "Phone repair service": "Assist. Tecnica", "Supermarket": "Supermercado",
  "Market": "Mercado", "Pharmacy": "Farmacia", "Store": "Loja",
  "Sofa store": "Sofas", "Candy store": "Doceria", "Dessert shop": "Sobremesas",
  "Butcher shop deli": "Carnes/Frios", "Mobile phone repair shop": "Assist. Cel",
  "Car repair and maintenance service": "Centro Auto", "Drug store": "Drogaria",
  "Mediterranean restaurant": "Rest. Mediterr.", "Middle Eastern restaurant": "Rest. Arabe",
  "Cake shop": "Confeitaria", "Pastry shop": "Salgaderia", "Reptile store": "Pet Exoticos",
};

const DEMO_BASE = typeof window !== "undefined" ? window.location.origin : "";

export default function OrionPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [lr, sr] = await Promise.all([
      fetch("/api/orion/leads").then((r) => r.json()),
      fetch("/api/orion/stats").then((r) => r.json()),
    ]);
    setLeads(lr.leads || []);
    setStats(sr.stats || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchData();
  }, [authed, fetchData]);

  const login = async () => {
    const r = await fetch("/api/orion/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass }),
    });
    const d = await r.json();
    if (d.ok) setAuthed(true);
    else alert("Senha incorreta");
  };

  const updateLead = async (id: number, data: Record<string, any>) => {
    await fetch(`/api/orion/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchData();
  };

  const genWhatsAppLink = (lead: Lead) => {
    const phone = lead.phone.replace(/\D/g, "");
    const demoUrl = `${DEMO_BASE}/demo/${lead.tenantSlug}`;
    const name = lead.businessName.replace(/\s*[-–].*$/, "").trim();
    const text = `Boa tarde! Me chamo equipe Orion Digital. Encontrei o ${name} no Google e criei um site profissional como demonstracao gratuita para voces.

Veja como ficou: ${demoUrl}

Site com endereco, servicos, botao do WhatsApp e tudo personalizado. Planos a partir de R$229/mes.

Posso te explicar melhor?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  // Filter leads
  const filtered = leads.filter((l) => {
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (filterCat !== "all" && l.category !== filterCat) return false;
    if (search) {
      const s = search.toLowerCase();
      return l.businessName.toLowerCase().includes(s) || l.category.toLowerCase().includes(s) || l.tenantSlug.includes(s);
    }
    return true;
  });

  // Unique categories
  const categories = [...new Set(leads.map((l) => l.category))].sort();

  if (!authed) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ background: SURF, borderRadius: 16, padding: 32, width: 320, border: "1px solid rgba(255,255,255,0.05)" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: AC, margin: "0 0 4px", textAlign: "center" }}>Orion Digital</h1>
          <p style={{ fontSize: 12, color: MUTED, textAlign: "center", margin: "0 0 24px" }}>Painel de Prospeccao</p>
          <input
            type="password"
            placeholder="Senha"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: BG,
              color: FG,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <button
            onClick={login}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              background: AC,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
              marginTop: 12,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: FG }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 16px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: AC, margin: 0 }}>Orion Digital</h1>
            <p style={{ fontSize: 12, color: MUTED, margin: "2px 0 0" }}>Painel de Prospeccao</p>
          </div>
          <button
            onClick={fetchData}
            style={{ background: "transparent", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 8, padding: 8, cursor: "pointer", color: MUTED }}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
            {[
              { label: "Total", value: stats.total, color: FG },
              { label: "Novos", value: stats.new, color: BLUE },
              { label: "Enviados", value: stats.msg_sent, color: ORANGE },
              { label: "Fechados", value: stats.closed, color: GREEN },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: SURF,
                  borderRadius: 12,
                  padding: "12px 10px",
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)",
                background: SURF,
                color: FG,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: SURF,
              color: FG,
              fontSize: 13,
              outline: "none",
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
            }}
          >
            <option value="all">Todos Status</option>
            <option value="new">Novo</option>
            <option value="msg_sent">Msg Enviada</option>
            <option value="replied">Respondeu</option>
            <option value="interested">Interessado</option>
            <option value="closed">Fechado</option>
            <option value="rejected">Rejeitado</option>
          </select>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: SURF,
              color: FG,
              fontSize: 13,
              outline: "none",
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
            }}
          >
            <option value="all">Todas Categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CAT_PT[c] || c}
              </option>
            ))}
          </select>
        </div>

        {/* Count */}
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>
          {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
        </div>

        {/* Lead list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((lead) => {
            const st = STATUS_LABELS[lead.status] || STATUS_LABELS.new;
            const isExpanded = expanded === lead.id;
            return (
              <div
                key={lead.id}
                style={{
                  background: SURF,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.04)",
                  overflow: "hidden",
                }}
              >
                {/* Row */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : lead.id)}
                  style={{
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: FG, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lead.businessName.replace(/\s*[-–].*$/, "")}
                    </div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                      {CAT_PT[lead.category] || lead.category}
                      {lead.rating && ` · ${lead.rating}★`}
                      {lead.reviews && ` (${lead.reviews})`}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "3px 10px",
                      borderRadius: 8,
                      background: st.bg,
                      color: st.color,
                      fontSize: 11,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {st.label}
                  </div>
                  <ChevronDown
                    size={16}
                    color={MUTED}
                    style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s", flexShrink: 0 }}
                  />
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ padding: "0 14px 14px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      {/* Info */}
                      <div style={{ fontSize: 12, color: MUTED }}>
                        <div>Tel: <span style={{ color: FG }}>{lead.phone}</span></div>
                        {lead.address && <div style={{ marginTop: 2 }}>End: <span style={{ color: FG }}>{lead.address}</span></div>}
                        <div style={{ marginTop: 2 }}>Preco: <span style={{ color: GREEN }}>R$ {lead.priceOffered}/mes</span></div>
                        <div style={{ marginTop: 2 }}>Demo: <a href={`/demo/${lead.tenantSlug}`} target="_blank" style={{ color: AC }}>{lead.tenantSlug}</a></div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                        {/* View Demo */}
                        <a
                          href={`/demo/${lead.tenantSlug}`}
                          target="_blank"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: `rgba(139,92,246,0.12)`,
                            color: AC,
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <ExternalLink size={12} /> Ver Demo
                        </a>

                        {/* Send WhatsApp */}
                        <a
                          href={genWhatsAppLink(lead)}
                          target="_blank"
                          onClick={() => {
                            if (lead.status === "new") updateLead(lead.id, { status: "msg_sent" });
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: "rgba(37,211,102,0.12)",
                            color: "#25D366",
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <MessageCircle size={12} /> WhatsApp
                        </a>

                        {/* Status buttons */}
                        {lead.status !== "closed" && (
                          <button
                            onClick={() => updateLead(lead.id, { status: "interested" })}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "6px 12px",
                              borderRadius: 8,
                              background: "rgba(34,197,94,0.12)",
                              color: GREEN,
                              fontSize: 12,
                              fontWeight: 600,
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            <Check size={12} /> Interessado
                          </button>
                        )}

                        {lead.status === "interested" && (
                          <button
                            onClick={() => updateLead(lead.id, { status: "closed" })}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "6px 12px",
                              borderRadius: 8,
                              background: "rgba(16,185,129,0.15)",
                              color: "#10B981",
                              fontSize: 12,
                              fontWeight: 700,
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            <Check size={12} /> Fechar Venda
                          </button>
                        )}

                        <button
                          onClick={() => updateLead(lead.id, { status: "rejected" })}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: "rgba(239,68,68,0.12)",
                            color: RED,
                            fontSize: 12,
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          <X size={12} /> Rejeitar
                        </button>
                      </div>

                      {/* Notes */}
                      <textarea
                        placeholder="Anotacoes..."
                        defaultValue={lead.notes || ""}
                        onBlur={(e) => {
                          if (e.target.value !== (lead.notes || "")) {
                            updateLead(lead.id, { notes: e.target.value });
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: BG,
                          color: FG,
                          fontSize: 12,
                          outline: "none",
                          fontFamily: "'Inter', sans-serif",
                          resize: "vertical",
                          minHeight: 40,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: MUTED, fontSize: 14 }}>Nenhum lead encontrado</div>
        )}
      </div>
    </div>
  );
}
