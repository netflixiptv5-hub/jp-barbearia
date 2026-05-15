import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { MapPin, Phone, Clock, Star, MessageCircle, Sparkles, Award, Flame, Heart, Zap, Coffee } from "lucide-react";

type Tenant = {
  slug: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  accentColor: string;
  tagline: string;
  servicesJson: string;
  hours: string;
  logoUrl: string;
  instagram: string;
  rating: string;
  reviews: string;
};

type Service = { name: string; price: number; duration: number };

type EnrichedData = {
  services: Service[];
  description: string;
  cta_text: string;
  ambiance: string;
  highlight_text: string;
};

const BG = "#0A0A0A";
const FG = "#F5F0EB";
const MUTED = "#7A7770";

const CAT_PT: Record<string, string> = {
  "Barber shop": "Barbearia", "Beauty salon": "Salão de Beleza", "Restaurant": "Restaurante",
  "Buffet restaurant": "Restaurante Buffet", "Pizza restaurant": "Pizzaria", "Pizza delivery": "Pizzaria Delivery",
  "Hamburger restaurant": "Hamburgueria", "Snack bar": "Lanchonete", "Cafe": "Cafeteria",
  "Coffee shop": "Café", "Bakery": "Padaria", "Ice cream shop": "Sorveteria",
  "Pet store": "Pet Shop", "Pet groomer": "Banho & Tosa", "Gym": "Academia",
  "Auto repair shop": "Oficina Mecânica", "Car repair and maintenance service": "Centro Automotivo",
  "Auto parts store": "Auto Peças", "Clothing store": "Loja de Roupas",
  "Women's clothing store": "Moda Feminina", "Florist": "Floricultura",
  "Butcher shop": "Casa de Carnes", "Butcher shop deli": "Casa de Carnes & Frios",
  "Optician": "Ótica", "Furniture store": "Loja de Móveis", "Sofa store": "Loja de Sofás",
  "Building materials store": "Material de Construção", "Stationery store": "Papelaria",
  "Cell phone store": "Loja de Celulares", "Phone repair service": "Assistência Técnica",
  "Mobile phone repair shop": "Assistência de Celulares", "Grocery store": "Mercearia",
  "Supermarket": "Supermercado", "Market": "Mercado", "Candy store": "Doceria",
  "Dessert shop": "Sobremesas", "Cake shop": "Confeitaria", "Pastry shop": "Salgaderia",
  "Pharmacy": "Farmácia", "Drug store": "Drogaria", "Store": "Loja",
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}
function darken(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0, r - amt)},${Math.max(0, g - amt)},${Math.max(0, b - amt)})`;
}
function lighten(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, r + amt)},${Math.min(255, g + amt)},${Math.min(255, b + amt)})`;
}

// Ambiance visual configs
type AmbianceConfig = {
  heroFont: string;
  heroWeight: number;
  heroLetterSpacing: string;
  cardRadius: number;
  cardBorder: string;
  heroDecoration: "none" | "underline" | "overline";
  sectionTitleStyle: "gradient" | "solid" | "outlined";
  serviceLayout: "list" | "grid" | "cards";
  bgPattern: string;
  accentGlowIntensity: number;
  iconStyle: "circle" | "square" | "pill";
  priceStyle: "gradient" | "solid" | "badge";
};

const AMBIANCE_CONFIGS: Record<string, AmbianceConfig> = {
  familiar: {
    heroFont: "'Georgia', serif",
    heroWeight: 700,
    heroLetterSpacing: "-0.01em",
    cardRadius: 16,
    cardBorder: "1px solid rgba(255,255,255,0.06)",
    heroDecoration: "none",
    sectionTitleStyle: "solid",
    serviceLayout: "list",
    bgPattern: "",
    accentGlowIntensity: 0.15,
    iconStyle: "circle",
    priceStyle: "solid",
  },
  aconchegante: {
    heroFont: "'Georgia', serif",
    heroWeight: 700,
    heroLetterSpacing: "-0.02em",
    cardRadius: 20,
    cardBorder: "1px solid rgba(255,255,255,0.04)",
    heroDecoration: "none",
    sectionTitleStyle: "gradient",
    serviceLayout: "cards",
    bgPattern: "radial-gradient(ellipse at 50% 0%, rgba(VAR,0.06) 0%, transparent 60%)",
    accentGlowIntensity: 0.2,
    iconStyle: "pill",
    priceStyle: "gradient",
  },
  descolado: {
    heroFont: "'Inter', sans-serif",
    heroWeight: 900,
    heroLetterSpacing: "-0.04em",
    cardRadius: 12,
    cardBorder: "1px solid rgba(255,255,255,0.08)",
    heroDecoration: "none",
    sectionTitleStyle: "outlined",
    serviceLayout: "grid",
    bgPattern: "linear-gradient(135deg, rgba(VAR,0.04) 0%, transparent 40%, rgba(VAR,0.03) 100%)",
    accentGlowIntensity: 0.3,
    iconStyle: "square",
    priceStyle: "badge",
  },
  moderno: {
    heroFont: "'Inter', sans-serif",
    heroWeight: 800,
    heroLetterSpacing: "-0.03em",
    cardRadius: 10,
    cardBorder: "1px solid rgba(255,255,255,0.1)",
    heroDecoration: "overline",
    sectionTitleStyle: "solid",
    serviceLayout: "list",
    bgPattern: "linear-gradient(180deg, rgba(VAR,0.05) 0%, transparent 30%)",
    accentGlowIntensity: 0.25,
    iconStyle: "square",
    priceStyle: "solid",
  },
  // fallback
  classico: {
    heroFont: "'Georgia', serif",
    heroWeight: 700,
    heroLetterSpacing: "0em",
    cardRadius: 14,
    cardBorder: "1px solid rgba(255,255,255,0.05)",
    heroDecoration: "none",
    sectionTitleStyle: "gradient",
    serviceLayout: "list",
    bgPattern: "",
    accentGlowIntensity: 0.15,
    iconStyle: "circle",
    priceStyle: "gradient",
  },
};

function getAmbianceConfig(ambiance: string): AmbianceConfig {
  return AMBIANCE_CONFIGS[ambiance] || AMBIANCE_CONFIGS.classico;
}

function parseServicesJson(raw: string): { services: Service[]; enriched: EnrichedData | null } {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { services: parsed, enriched: null };
    }
    // New enriched format
    return {
      services: parsed.services || [],
      enriched: {
        services: parsed.services || [],
        description: parsed.description || "",
        cta_text: parsed.cta_text || "",
        ambiance: parsed.ambiance || "",
        highlight_text: parsed.highlight_text || "",
      },
    };
  } catch {
    return { services: [], enriched: null };
  }
}

function getServicesTitle(category: string): string {
  if (["Restaurant", "Buffet restaurant", "Pizza restaurant", "Pizza delivery", "Hamburger restaurant", "Snack bar", "Cafe", "Coffee shop"].includes(category)) return "Cardápio";
  if (["Clothing store", "Women's clothing store", "Furniture store", "Sofa store", "Building materials store", "Auto parts store", "Cell phone store", "Stationery store", "Store"].includes(category)) return "Produtos";
  if (["Gym"].includes(category)) return "Planos";
  if (["Ice cream shop"].includes(category)) return "Sabores";
  if (["Bakery"].includes(category)) return "Nossos Produtos";
  return "Serviços";
}

function AmbianceIcon({ ambiance, color }: { ambiance: string; color: string }) {
  const size = 14;
  switch (ambiance) {
    case "aconchegante": return <Heart size={size} color={color} />;
    case "descolado": return <Zap size={size} color={color} />;
    case "moderno": return <Sparkles size={size} color={color} />;
    case "familiar": return <Coffee size={size} color={color} />;
    default: return <Award size={size} color={color} />;
  }
}

export default function DemoPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/tenant/${slug}`)
      .then((r) => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then((d: any) => { setTenant(d.tenant); setLoading(false); })
      .catch(() => { setError("Estabelecimento não encontrado"); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: MUTED, fontFamily: "'Inter', sans-serif", fontSize: 14 }}>Carregando...</div>
      </div>
    );
  }
  if (error || !tenant) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ color: FG, fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700 }}>404</div>
        <div style={{ color: MUTED, fontFamily: "'Inter', sans-serif", fontSize: 14 }}>{error || "Não encontrado"}</div>
      </div>
    );
  }

  const AC = tenant.accentColor || "#C9A96E";
  const rgb = hexToRgb(AC);
  const rgbStr = `${rgb.r},${rgb.g},${rgb.b}`;
  const { services, enriched } = parseServicesJson(tenant.servicesJson || "[]");
  const amb = getAmbianceConfig(enriched?.ambiance || "classico");
  const catPt = CAT_PT[tenant.category] || tenant.category;
  const ctaText = enriched?.cta_text || "Fale Conosco";
  const description = enriched?.description || "";
  const highlight = enriched?.highlight_text || "";
  const ambiance = enriched?.ambiance || "";
  const servicesTitle = getServicesTitle(tenant.category);

  const initials = tenant.name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const waPhone = (tenant.phone || "").replace(/\D/g, "");
  const waLink = waPhone ? `https://wa.me/${waPhone}?text=Oi, vi o site de voces e queria saber mais!` : "#";

  const bgPattern = amb.bgPattern.replace(/VAR/g, rgbStr);

  const accentGrad = `linear-gradient(135deg, ${lighten(AC, 30)}, ${AC}, ${darken(AC, 20)})`;
  const accentText: React.CSSProperties = {
    background: accentGrad,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  const cardBase: React.CSSProperties = {
    background: `linear-gradient(160deg, rgba(20,20,20,0.95) 0%, rgba(15,15,15,0.8) 100%)`,
    border: amb.cardBorder,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: amb.cardRadius,
  };

  const iconBox = (size: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: size, height: size,
      background: `rgba(${rgbStr},0.1)`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    };
    if (amb.iconStyle === "circle") base.borderRadius = "50%";
    else if (amb.iconStyle === "square") base.borderRadius = 6;
    else if (amb.iconStyle === "pill") base.borderRadius = size / 2;
    return base;
  };

  const btnStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${darken(AC, 30)} 0%, ${AC} 40%, ${lighten(AC, 30)} 50%, ${AC} 60%, ${darken(AC, 20)} 100%)`,
    backgroundSize: "200% 200%",
    color: BG, fontWeight: 700, fontFamily: "'Inter', sans-serif",
    letterSpacing: "0.02em",
    boxShadow: `0 4px 20px rgba(${rgbStr},0.25), 0 1px 3px rgba(0,0,0,0.4)`,
    border: "none", cursor: "pointer", borderRadius: amb.cardRadius > 16 ? 16 : 12,
    padding: "14px 24px", fontSize: 15, width: "100%",
    textDecoration: "none", display: "block", textAlign: "center" as const,
  };

  // Render price based on ambiance
  function renderPrice(price: number) {
    const formatted = price % 1 === 0 ? `R$ ${price}` : `R$ ${price.toFixed(2).replace(".", ",")}`;
    if (amb.priceStyle === "gradient") {
      return <span style={{ fontSize: 16, fontWeight: 700, ...accentText }}>{formatted}</span>;
    }
    if (amb.priceStyle === "badge") {
      return (
        <span style={{
          fontSize: 13, fontWeight: 700, color: BG,
          background: AC, borderRadius: 8, padding: "4px 10px",
          display: "inline-block",
        }}>{formatted}</span>
      );
    }
    // solid
    return <span style={{ fontSize: 16, fontWeight: 700, color: AC }}>{formatted}</span>;
  }

  // Section title rendering
  function renderSectionTitle(text: string) {
    if (amb.sectionTitleStyle === "gradient") {
      return <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, ...accentText }}>{text}</h2>;
    }
    if (amb.sectionTitleStyle === "outlined") {
      return (
        <h2 style={{
          fontSize: 20, fontWeight: 900, marginBottom: 16,
          color: "transparent", WebkitTextStroke: `1.5px ${AC}`,
          letterSpacing: "-0.02em",
        }}>{text}</h2>
      );
    }
    // solid
    return <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: AC }}>{text}</h2>;
  }

  // Service items by layout
  function renderServices() {
    if (services.length === 0) return null;

    if (amb.serviceLayout === "grid") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {services.map((svc, i) => (
            <div key={i} style={{
              ...cardBase, padding: "16px 14px",
              display: "flex", flexDirection: "column", gap: 8,
              position: "relative", overflow: "hidden",
            }}>
              {i === 0 && (
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  background: AC, color: BG,
                  fontSize: 9, fontWeight: 800, padding: "3px 10px",
                  borderBottomLeftRadius: 8, textTransform: "uppercase", letterSpacing: "0.05em",
                }}>TOP</div>
              )}
              <div style={{ fontSize: 14, fontWeight: 600, color: FG, lineHeight: 1.3 }}>{svc.name}</div>
              {svc.duration > 0 && <div style={{ fontSize: 11, color: MUTED }}>{svc.duration} min</div>}
              <div style={{ marginTop: "auto" }}>{renderPrice(svc.price)}</div>
            </div>
          ))}
        </div>
      );
    }

    if (amb.serviceLayout === "cards") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {services.map((svc, i) => (
            <div key={i} style={{
              ...cardBase, padding: "16px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderLeft: i === 0 ? `3px solid ${AC}` : undefined,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: FG }}>{svc.name}</div>
                {svc.duration > 0 && <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{svc.duration} min</div>}
              </div>
              {renderPrice(svc.price)}
            </div>
          ))}
        </div>
      );
    }

    // list (default)
    return (
      <div style={{
        ...cardBase, padding: "4px 0", overflow: "hidden",
      }}>
        {services.map((svc, i) => (
          <div key={i} style={{
            padding: "14px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: i < services.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: FG }}>{svc.name}</div>
              {svc.duration > 0 && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{svc.duration} min</div>}
            </div>
            {renderPrice(svc.price)}
          </div>
        ))}
      </div>
    );
  }

  // Logo style varies by ambiance
  function renderLogo() {
    if (ambiance === "descolado") {
      // Squared, bold
      return (
        <div style={{
          width: 80, height: 80, borderRadius: 14,
          background: `linear-gradient(135deg, ${AC}, ${darken(AC, 30)})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: `0 0 50px rgba(${rgbStr},${amb.accentGlowIntensity})`,
          border: `2px solid rgba(${rgbStr},0.3)`,
        }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: BG, letterSpacing: "-0.04em" }}>{initials}</span>
        </div>
      );
    }
    if (ambiance === "moderno") {
      // Clean, minimal
      return (
        <div style={{
          width: 72, height: 72, borderRadius: 8,
          background: "transparent",
          border: `2px solid ${AC}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: AC, letterSpacing: "-0.03em" }}>{initials}</span>
        </div>
      );
    }
    // aconchegante / familiar - circle
    return (
      <div style={{
        width: 90, height: 90, borderRadius: "50%",
        background: `linear-gradient(135deg, ${darken(AC, 20)}, ${AC})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
        boxShadow: `0 0 40px rgba(${rgbStr},${amb.accentGlowIntensity})`,
      }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: BG, letterSpacing: -1 }}>{initials}</span>
      </div>
    );
  }

  return (
    <div style={{
      background: BG, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: FG,
      backgroundImage: bgPattern || undefined,
    }}>
      {/* Google Fonts for serif ambiances */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 448, margin: "0 auto", padding: "0 16px 40px" }}>

        {/* ======= HERO ======= */}
        <div style={{ paddingTop: 48, paddingBottom: 24, textAlign: "center" }}>
          {renderLogo()}

          {/* Highlight badge */}
          {highlight && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 14px", borderRadius: 20,
              background: `rgba(${rgbStr},0.1)`,
              border: `1px solid rgba(${rgbStr},0.2)`,
              fontSize: 12, fontWeight: 600, color: AC,
              marginBottom: 14,
            }}>
              <Flame size={13} color={AC} />
              {highlight}
            </div>
          )}

          {/* Category */}
          <div style={{
            display: "inline-block", padding: "4px 14px", borderRadius: 20,
            background: `rgba(${rgbStr},0.08)`,
            border: `1px solid rgba(${rgbStr},0.15)`,
            fontSize: 11, fontWeight: 600, color: AC,
            letterSpacing: "0.05em", textTransform: "uppercase",
            marginBottom: 14,
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <AmbianceIcon ambiance={ambiance} color={AC} />
              {catPt}
            </span>
          </div>

          {/* Name */}
          {amb.heroDecoration === "overline" && (
            <div style={{
              width: 40, height: 3, background: AC,
              margin: "0 auto 12px", borderRadius: 2,
            }} />
          )}
          <h1 style={{
            fontSize: 30, fontWeight: amb.heroWeight,
            fontFamily: amb.heroFont,
            letterSpacing: amb.heroLetterSpacing,
            margin: "0 0 8px", lineHeight: 1.1,
            ...accentText,
          }}>{tenant.name}</h1>

          <p style={{ fontSize: 15, color: MUTED, margin: "0 0 0", lineHeight: 1.5, fontStyle: ambiance === "aconchegante" ? "italic" : "normal" }}>
            {tenant.tagline}
          </p>

          {/* Rating */}
          {tenant.rating && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 }}>
              <Star size={16} fill={AC} stroke={AC} />
              <span style={{ fontWeight: 700, color: FG, fontSize: 15 }}>{tenant.rating}</span>
              {tenant.reviews && <span style={{ color: MUTED, fontSize: 13 }}>({tenant.reviews} avaliações)</span>}
            </div>
          )}
        </div>

        {/* ======= DESCRIPTION (enriched only) ======= */}
        {description && (
          <div style={{
            ...cardBase, padding: "18px 20px", marginBottom: 20,
            borderLeft: ambiance === "aconchegante" ? `3px solid rgba(${rgbStr},0.4)` : undefined,
          }}>
            <p style={{
              fontSize: 14, color: "#B8B3AD", margin: 0, lineHeight: 1.65,
              fontStyle: ambiance === "aconchegante" ? "italic" : "normal",
            }}>
              {description}
            </p>
          </div>
        )}

        {/* ======= INFO CARDS ======= */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {tenant.address && (
            <div style={{ ...cardBase, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={iconBox(36)}><MapPin size={18} color={AC} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Endereço</div>
                <div style={{ fontSize: 13, color: FG, lineHeight: 1.4 }}>{tenant.address}</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            {tenant.phone && (
              <div style={{ ...cardBase, padding: "14px 16px", flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={iconBox(36)}><Phone size={18} color={AC} /></div>
                <div>
                  <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Telefone</div>
                  <div style={{ fontSize: 13, color: FG }}>{tenant.phone}</div>
                </div>
              </div>
            )}
            {tenant.hours && (
              <div style={{ ...cardBase, padding: "14px 16px", flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={iconBox(36)}><Clock size={18} color={AC} /></div>
                <div>
                  <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Horário</div>
                  <div style={{ fontSize: 13, color: FG }}>{tenant.hours}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======= SERVICES ======= */}
        {services.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            {renderSectionTitle(servicesTitle)}
            {renderServices()}
          </div>
        )}

        {/* ======= CTA BUTTON ======= */}
        <a href={waLink} target="_blank" rel="noopener noreferrer" style={btnStyle}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <MessageCircle size={18} />
            {ctaText}
          </span>
        </a>

        {/* ======= WHATSAPP FLOATING ======= */}
        {waPhone && (
          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
            position: "fixed", bottom: 20, right: 20, width: 56, height: 56, borderRadius: "50%",
            background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(37,211,102,0.3)", zIndex: 1000, textDecoration: "none",
          }}>
            <MessageCircle size={26} color="#fff" fill="#fff" />
          </a>
        )}

        {/* ======= FOOTER ======= */}
        <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
            Desenvolvido por <span style={{ fontWeight: 700, color: AC }}>Orion Digital</span>
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", margin: "4px 0 0" }}>Sites profissionais a partir de R$229/mes</p>
        </div>
      </div>
    </div>
  );
}
