import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { MapPin, Phone, Clock, Star, ChevronRight, MessageCircle, Instagram, ArrowLeft } from "lucide-react";

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

const BG = "#0A0A0A";
const FG = "#F5F0EB";
const MUTED = "#7A7770";
const SURF = "#131313";

// Category → translated name
const CAT_PT: Record<string, string> = {
  "Barber shop": "Barbearia",
  "Beauty salon": "Salão de Beleza",
  "Restaurant": "Restaurante",
  "Buffet restaurant": "Restaurante Buffet",
  "Pizza restaurant": "Pizzaria",
  "Pizza delivery": "Pizzaria Delivery",
  "Hamburger restaurant": "Hamburgueria",
  "Snack bar": "Lanchonete",
  "Cafe": "Cafeteria",
  "Coffee shop": "Café",
  "Bakery": "Padaria",
  "Ice cream shop": "Sorveteria",
  "Pet store": "Pet Shop",
  "Pet groomer": "Banho & Tosa",
  "Gym": "Academia",
  "Auto repair shop": "Oficina Mecânica",
  "Car repair and maintenance service": "Centro Automotivo",
  "Auto parts store": "Auto Peças",
  "Clothing store": "Loja de Roupas",
  "Women's clothing store": "Moda Feminina",
  "Florist": "Floricultura",
  "Butcher shop": "Casa de Carnes",
  "Butcher shop deli": "Casa de Carnes & Frios",
  "Optician": "Ótica",
  "Furniture store": "Loja de Móveis",
  "Sofa store": "Loja de Sofás",
  "Building materials store": "Material de Construção",
  "Stationery store": "Papelaria",
  "Cell phone store": "Loja de Celulares",
  "Phone repair service": "Assistência Técnica",
  "Mobile phone repair shop": "Assistência de Celulares",
  "Grocery store": "Mercearia",
  "Supermarket": "Supermercado",
  "Market": "Mercado",
  "Candy store": "Doceria",
  "Dessert shop": "Sobremesas",
  "Cake shop": "Confeitaria",
  "Pastry shop": "Salgaderia",
  "Pharmacy": "Farmácia",
  "Drug store": "Drogaria",
  "Reptile store": "Pet Exóticos",
  "Mediterranean restaurant": "Restaurante Mediterrâneo",
  "Middle Eastern restaurant": "Restaurante Árabe",
  "Store": "Loja",
};

// Category → appropriate CTA
const CAT_CTA: Record<string, string> = {
  "Barber shop": "Agendar Horário",
  "Beauty salon": "Agendar Horário",
  "Restaurant": "Ver Cardápio",
  "Buffet restaurant": "Ver Cardápio",
  "Pizza restaurant": "Fazer Pedido",
  "Pizza delivery": "Pedir Agora",
  "Hamburger restaurant": "Fazer Pedido",
  "Snack bar": "Fazer Pedido",
  "Cafe": "Ver Cardápio",
  "Coffee shop": "Ver Cardápio",
  "Bakery": "Ver Produtos",
  "Ice cream shop": "Ver Sabores",
  "Pet store": "Agendar Banho",
  "Pet groomer": "Agendar Banho",
  "Gym": "Conhecer Planos",
  "Auto repair shop": "Agendar Serviço",
  "Florist": "Ver Arranjos",
  "Butcher shop": "Ver Produtos",
  "Optician": "Agendar Consulta",
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function darken(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0, r - amt)}, ${Math.max(0, g - amt)}, ${Math.max(0, b - amt)})`;
}

function lighten(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, r + amt)}, ${Math.min(255, g + amt)}, ${Math.min(255, b + amt)})`;
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
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d: any) => {
        setTenant(d.tenant);
        setLoading(false);
      })
      .catch(() => {
        setError("Estabelecimento não encontrado");
        setLoading(false);
      });
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
  const services: Service[] = JSON.parse(tenant.servicesJson || "[]");
  const catPt = CAT_PT[tenant.category] || tenant.category;
  const cta = CAT_CTA[tenant.category] || "Fale Conosco";
  const initials = tenant.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const waPhone = (tenant.phone || "").replace(/\D/g, "");
  const waLink = waPhone ? `https://wa.me/${waPhone}?text=Oi, vi o site de voces e queria saber mais!` : "#";

  const glassStyle: React.CSSProperties = {
    background: `linear-gradient(160deg, rgba(20,20,20,0.95) 0%, rgba(15,15,15,0.8) 100%)`,
    border: `1px solid rgba(255,255,255,0.04)`,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  };

  const btnStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${darken(AC, 30)} 0%, ${AC} 40%, ${lighten(AC, 30)} 50%, ${AC} 60%, ${darken(AC, 20)} 100%)`,
    backgroundSize: "200% 200%",
    color: BG,
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "0.02em",
    boxShadow: `0 4px 20px rgba(${rgb.r},${rgb.g},${rgb.b},0.25), 0 1px 3px rgba(0,0,0,0.4)`,
    border: "none",
    cursor: "pointer",
    borderRadius: 12,
    padding: "14px 24px",
    fontSize: 15,
    width: "100%",
    textDecoration: "none",
    display: "block",
    textAlign: "center" as const,
  };

  const accentText: React.CSSProperties = {
    background: `linear-gradient(135deg, ${lighten(AC, 30)}, ${AC}, ${darken(AC, 20)})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: FG }}>
      <div style={{ maxWidth: 448, margin: "0 auto", padding: "0 16px 40px" }}>
        {/* Hero section */}
        <div style={{ paddingTop: 48, paddingBottom: 32, textAlign: "center" }}>
          {/* Logo circle */}
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${darken(AC, 20)}, ${AC})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: `0 0 40px rgba(${rgb.r},${rgb.g},${rgb.b},0.2)`,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 800, color: BG, letterSpacing: -1 }}>{initials}</span>
          </div>

          {/* Category badge */}
          <div
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: 20,
              background: `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`,
              border: `1px solid rgba(${rgb.r},${rgb.g},${rgb.b},0.25)`,
              fontSize: 11,
              fontWeight: 600,
              color: AC,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {catPt}
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", lineHeight: 1.1, ...accentText }}>{tenant.name}</h1>
          <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.5 }}>{tenant.tagline}</p>

          {/* Rating */}
          {tenant.rating && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 }}>
              <Star size={16} fill={AC} stroke={AC} />
              <span style={{ fontWeight: 700, color: FG, fontSize: 15 }}>{tenant.rating}</span>
              {tenant.reviews && <span style={{ color: MUTED, fontSize: 13 }}>({tenant.reviews} avaliações)</span>}
            </div>
          )}
        </div>

        {/* Info cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {tenant.address && (
            <div style={{ ...glassStyle, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${rgb.r},${rgb.g},${rgb.b},0.1)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MapPin size={18} color={AC} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Endereço</div>
                <div style={{ fontSize: 13, color: FG, lineHeight: 1.4 }}>{tenant.address}</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            {tenant.phone && (
              <div style={{ ...glassStyle, borderRadius: 14, padding: "14px 16px", flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${rgb.r},${rgb.g},${rgb.b},0.1)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Phone size={18} color={AC} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Telefone</div>
                  <div style={{ fontSize: 13, color: FG }}>{tenant.phone}</div>
                </div>
              </div>
            )}
            {tenant.hours && (
              <div style={{ ...glassStyle, borderRadius: 14, padding: "14px 16px", flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${rgb.r},${rgb.g},${rgb.b},0.1)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Clock size={18} color={AC} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Horário</div>
                  <div style={{ fontSize: 13, color: FG }}>{tenant.hours}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        {services.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, ...accentText }}>
              {["Restaurant", "Buffet restaurant", "Pizza restaurant", "Pizza delivery", "Hamburger restaurant", "Snack bar", "Cafe", "Coffee shop"].includes(tenant.category)
                ? "Cardápio"
                : ["Clothing store", "Women's clothing store", "Furniture store", "Sofa store", "Building materials store", "Auto parts store", "Cell phone store", "Stationery store"].includes(tenant.category)
                  ? "Produtos"
                  : ["Gym"].includes(tenant.category)
                    ? "Planos"
                    : "Serviços"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {services.map((svc, i) => (
                <div
                  key={i}
                  style={{
                    ...glassStyle,
                    borderRadius: 14,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: FG }}>{svc.name}</div>
                    {svc.duration > 0 && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{svc.duration} min</div>}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      ...accentText,
                    }}
                  >
                    R$ {svc.price.toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <a href={waLink} target="_blank" rel="noopener noreferrer" style={btnStyle}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <MessageCircle size={18} />
            {cta}
          </span>
        </a>

        {/* WhatsApp floating */}
        {waPhone && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "fixed",
              bottom: 20,
              right: 20,
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#25D366",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(37,211,102,0.3)",
              zIndex: 1000,
              textDecoration: "none",
            }}
          >
            <MessageCircle size={26} color="#fff" fill="#fff" />
          </a>
        )}

        {/* Footer: Powered by Orion Digital */}
        <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
            Desenvolvido por{" "}
            <span style={{ fontWeight: 700, color: AC }}>Orion Digital</span>
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", margin: "4px 0 0" }}>Sites profissionais a partir de R$229/mes</p>
        </div>
      </div>
    </div>
  );
}
