import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  Scissors, ChevronLeft, Check, Clock, MapPin,
  User, Calendar, Star, ChevronRight, MessageCircle
} from "lucide-react";

type Service = { id: number; name: string; price: number; duration: number; description: string | null };
type Barber = { id: number; name: string; photo: string | null; phone: string | null };

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Inline style constants
const GOLD = "#C9A96E";
const GOLD_L = "#E0CFA0";
const GOLD_D = "#A88B55";
const BG = "#0A0A0A";
const FG = "#F5F0EB";
const MUTED = "#7A7770";
const SURF = "#131313";

const btnGoldStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, #B8983F 0%, #D4B86A 40%, #E8D5A0 50%, #D4B86A 60%, #A88B55 100%)`,
  backgroundSize: "200% 200%",
  color: BG,
  fontWeight: 700,
  fontFamily: "'Inter', sans-serif",
  letterSpacing: "0.02em",
  boxShadow: `0 4px 20px rgba(201,169,110,0.25), 0 1px 3px rgba(0,0,0,0.4)`,
  border: "none",
  cursor: "pointer",
  position: "relative",
  overflow: "hidden",
};

const glassStyle: React.CSSProperties = {
  background: `linear-gradient(160deg, rgba(20,20,20,0.95) 0%, rgba(15,15,15,0.8) 100%)`,
  border: `1px solid rgba(255,255,255,0.04)`,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

const glassSelectedStyle: React.CSSProperties = {
  background: `linear-gradient(160deg, rgba(201,169,110,0.1) 0%, rgba(201,169,110,0.03) 100%)`,
  border: `1.5px solid rgba(201,169,110,0.5)`,
  boxShadow: `0 0 30px rgba(201,169,110,0.08), inset 0 1px 0 rgba(201,169,110,0.12)`,
};

const goldTextStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, ${GOLD_L}, ${GOLD}, ${GOLD_D})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"f"|"b">("f");
  const [anim, setAnim] = useState(false);
  const [selSvc, setSelSvc] = useState<Service[]>([]);
  const [selBarber, setSelBarber] = useState<Barber | null>(null);
  const [selDate, setSelDate] = useState("");
  const [selTime, setSelTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => { fetch("/api/admin/seed", { method: "POST" }).catch(() => {}); }, []);

  const { data: svcData } = useQuery({ queryKey: ["services"], queryFn: async () => (await api.services.$get()).json() });
  const { data: barbData } = useQuery({ queryKey: ["barbers"], queryFn: async () => (await api.barbers.$get()).json() });

  const dur = selSvc.reduce((s, v) => s + v.duration, 0);
  const price = selSvc.reduce((s, v) => s + v.price, 0);

  const { data: slotsData, isLoading: slotsLoad } = useQuery({
    queryKey: ["slots", selBarber?.id, selDate, dur],
    queryFn: async () => {
      if (!selBarber || !selDate) return { slots: [] };
      const r = await api.slots[":barberId"][":date"].$get({
        param: { barberId: String(selBarber.id), date: selDate },
        query: { duration: String(dur) },
      });
      return r.json();
    },
    enabled: !!selBarber && !!selDate,
  });

  const book = useMutation({
    mutationFn: async () => {
      const r = await api.appointments.$post({
        json: {
          barberId: selBarber!.id, clientName: name, clientPhone: phone,
          date: selDate, time: selTime,
          serviceIds: selSvc.map(s => s.id),
          totalDuration: dur, totalPrice: price,
          serviceNames: selSvc.map(s => s.name).join(", "),
        },
      });
      return r.json();
    },
    onSuccess: () => setDone(true),
  });

  const goTo = useCallback((t: number) => {
    if (anim) return;
    setDir(t > step ? "f" : "b");
    setAnim(true);
    setTimeout(() => { setStep(t); setAnim(false); }, 200);
  }, [step, anim]);

  const toggle = (svc: Service) => setSelSvc(p => p.find(s => s.id === svc.id) ? p.filter(s => s.id !== svc.id) : [...p, svc]);

  const fmtPhone = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 2) return n;
    if (n.length <= 7) return `(${n.slice(0,2)}) ${n.slice(2)}`;
    return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
  };

  const fmtDate = (d: string) => {
    const dt = new Date(d + "T12:00:00");
    return `${DAYS[dt.getDay()]}, ${dt.getDate()} de ${MONTHS[dt.getMonth()]}`;
  };

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  // Check circle component
  const Chk = ({ on }: { on: boolean }) => (
    <div style={{
      width: 22, height: 22, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.3s",
      ...(on ? {
        background: `linear-gradient(135deg, #D4B86A, #8B7340)`,
        boxShadow: `0 0 12px rgba(201,169,110,0.3)`,
      } : {
        border: "1.5px solid #333",
      }),
    }}>
      {on && <Check style={{ width: 12, height: 12, color: BG }} strokeWidth={3} />}
    </div>
  );

  // ═══ SUCCESS ═══
  if (done) {
    return (
      <Shell>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ textAlign: "center", maxWidth: 320, width: "100%" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: `linear-gradient(135deg, #D4B86A, #8B7340)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 32px",
              boxShadow: `0 0 50px rgba(201,169,110,0.3)`,
            }}>
              <Check style={{ width: 40, height: 40, color: BG }} strokeWidth={3} />
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 8, ...goldTextStyle }}>Agendado!</h1>
            <p style={{ color: MUTED, fontSize: 14, marginBottom: 32 }}>Seu horário foi reservado com sucesso</p>
            <div style={{ ...glassStyle, borderRadius: 16, padding: 20, textAlign: "left" }}>
              <SRow icon={<Scissors style={{ width: 16, height: 16 }} />} text={selSvc.map(s => s.name).join(", ")} />
              <SRow icon={<User style={{ width: 16, height: 16 }} />} text={selBarber?.name || ""} />
              <SRow icon={<Calendar style={{ width: 16, height: 16 }} />} text={fmtDate(selDate)} />
              <SRow icon={<Clock style={{ width: 16, height: 16 }} />} text={`${selTime} • ${dur}min`} />
              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(201,169,110,0.35), transparent)`, margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: MUTED, fontSize: 14 }}>Total</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, ...goldTextStyle }}>R$ {price.toFixed(2)}</span>
              </div>
            </div>
            {/* WhatsApp button */}
            {selBarber?.phone && (
              <a
                href={`https://wa.me/${selBarber.phone}?text=${encodeURIComponent(
                  `Olá ${selBarber.name}! 👋\n\nAgendei pelo site:\n\n✂️ ${selSvc.map(s => s.name).join(", ")}\n📅 ${fmtDate(selDate)}\n🕐 ${selTime}\n👤 ${name}\n💰 R$ ${price.toFixed(2)}\n\nAté lá! 🤝`
                )}`}
                target="_blank"
                rel="noopener"
                style={{
                  ...btnGoldStyle,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  width: "100%", padding: "16px 0", borderRadius: 16, fontSize: 15,
                  marginTop: 32, textDecoration: "none",
                  background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                  boxShadow: "0 4px 20px rgba(37,211,102,0.25), 0 1px 3px rgba(0,0,0,0.4)",
                }}
              >
                <MessageCircle style={{ width: 20, height: 20 }} /> Enviar pro {selBarber.name} via WhatsApp
              </a>
            )}
            <button
              onClick={() => { setStep(0); setSelSvc([]); setSelBarber(null); setSelDate(""); setSelTime(""); setName(""); setPhone(""); setDone(false); }}
              style={{ marginTop: 16, color: MUTED, fontSize: 13, fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
            >
              Novo agendamento
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // ═══ STEPS ═══
  const steps = [
    // 0 — Landing
    <div key="land" style={{ flex: 1, display: "flex", flexDirection: "column" as const }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
        {/* Logo */}
        <div style={{ marginBottom: 24, animation: "float 5s ease-in-out infinite" }}>
          <div style={{
            width: 140, height: 140, borderRadius: "50%", overflow: "hidden",
            boxShadow: `0 0 40px rgba(201,169,110,0.2)`,
            border: `1px solid rgba(255,255,255,0.08)`,
            background: BG,
          }}>
            <img src="/logo.png" alt="JP Barbearia" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>

        {/* Name */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 40,
          fontWeight: 700,
          lineHeight: 1,
          ...goldTextStyle,
        }}>
          JP Barbearia
        </h1>

        {/* Tagline */}
        <p style={{ fontSize: 11, color: `${GOLD}99`, textTransform: "uppercase" as const, letterSpacing: "0.35em", fontWeight: 500, marginTop: 8 }}>
          Estilo & Precisão
        </p>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: 128, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, rgba(201,169,110,0.25))` }} />
          <Scissors style={{ width: 12, height: 12, color: `${GOLD}66`, transform: "rotate(-45deg)" }} />
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, rgba(201,169,110,0.25), transparent)` }} />
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          <p style={{ color: MUTED, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <MapPin style={{ width: 14, height: 14, color: `${GOLD}80` }} />
            Araraquara, SP
          </p>
          <p style={{ color: MUTED, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Clock style={{ width: 14, height: 14, color: `${GOLD}80` }} />
            Seg–Sáb • 9h às 20h
          </p>
        </div>

        {/* Stars */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 16 }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} style={{ width: 14, height: 14, fill: GOLD, color: GOLD }} />
          ))}
          <span style={{ fontSize: 11, color: MUTED, marginLeft: 8 }}>5.0 • Google</span>
        </div>

        {/* CTA BUTTON */}
        <div style={{ width: "100%", maxWidth: 300, marginTop: 40 }}>
          <button
            onClick={() => goTo(1)}
            style={{ ...btnGoldStyle, width: "100%", padding: "16px 0", borderRadius: 16, fontSize: 15 }}
          >
            Agendar Horário
          </button>
        </div>

        {/* Logo footer */}
        <div style={{ marginTop: 32, opacity: 0.3 }}>
          <img src="/logo.png" alt="JP Barbearia" style={{ width: 40, height: 40, borderRadius: "50%" }} />
        </div>
      </div>
    </div>,

    // 1 — Serviços
    <div key="svc" style={{ flex: 1, display: "flex", flexDirection: "column" as const }}>
      <Header step={1} total={4} title="Serviços" onBack={() => goTo(0)} />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px", paddingBottom: 144 }}>
        <p style={{ fontSize: 10, color: `${MUTED}99`, textTransform: "uppercase" as const, letterSpacing: "0.25em", textAlign: "center", marginTop: 16, marginBottom: 12 }}>
          Selecione um ou mais serviços
        </p>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {(svcData?.services || []).map((svc: Service) => {
            const sel = !!selSvc.find(s => s.id === svc.id);
            return (
              <button
                key={svc.id}
                onClick={() => toggle(svc)}
                style={{
                  ...(sel ? glassSelectedStyle : glassStyle),
                  padding: 16, borderRadius: 16, textAlign: "left" as const,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: "pointer", transition: "all 0.3s", width: "100%",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 15, color: FG, margin: 0 }}>{svc.name}</p>
                  <p style={{ color: MUTED, fontSize: 11, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock style={{ width: 12, height: 12 }} /> {svc.duration} min
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, ...(sel ? goldTextStyle : { color: `${GOLD}B3` }) }}>
                    R${svc.price.toFixed(0)}
                  </span>
                  <Chk on={sel} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {selSvc.length > 0 && (
        <Bottom>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: MUTED }}>
              {selSvc.length} serviço{selSvc.length > 1 ? "s" : ""} • {dur}min
            </span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, ...goldTextStyle }}>R$ {price.toFixed(2)}</span>
          </div>
          <button onClick={() => goTo(2)} style={{ ...btnGoldStyle, width: "100%", padding: "14px 0", borderRadius: 16, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Escolher Barbeiro <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </Bottom>
      )}
    </div>,

    // 2 — Barbeiro
    <div key="barb" style={{ flex: 1, display: "flex", flexDirection: "column" as const }}>
      <Header step={2} total={4} title="Barbeiro" onBack={() => goTo(1)} />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px", paddingBottom: 144 }}>
        <p style={{ fontSize: 10, color: `${MUTED}99`, textTransform: "uppercase" as const, letterSpacing: "0.25em", textAlign: "center", marginTop: 16, marginBottom: 16 }}>
          Escolha seu profissional
        </p>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          {(barbData?.barbers || []).map((b: Barber) => {
            const sel = selBarber?.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => { setSelBarber(b); setSelDate(""); setSelTime(""); }}
                style={{
                  ...(sel ? glassSelectedStyle : glassStyle),
                  padding: 16, borderRadius: 16, display: "flex", alignItems: "center", gap: 16,
                  cursor: "pointer", transition: "all 0.3s", width: "100%", textAlign: "left" as const,
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                  border: `2px solid ${sel ? GOLD : "rgba(255,255,255,0.05)"}`,
                  boxShadow: sel ? `0 0 24px rgba(201,169,110,0.25)` : "none",
                  transition: "all 0.3s",
                }}>
                  {b.photo ? (
                    <img src={b.photo} alt={b.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: SURF, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User style={{ width: 24, height: 24, color: MUTED }} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 16, color: FG, margin: 0 }}>{b.name}</p>
                  <p style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>Barbeiro Profissional</p>
                </div>
                <Chk on={sel} />
              </button>
            );
          })}
        </div>
      </div>
      {selBarber && (
        <Bottom>
          <button onClick={() => goTo(3)} style={{ ...btnGoldStyle, width: "100%", padding: "14px 0", borderRadius: 16, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Escolher Horário <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </Bottom>
      )}
    </div>,

    // 3 — Data + Horário
    <div key="dt" style={{ flex: 1, display: "flex", flexDirection: "column" as const }}>
      <Header step={3} total={4} title="Data & Horário" onBack={() => goTo(2)} />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px", paddingBottom: 144 }}>
        {/* Dates */}
        <p style={{ fontSize: 10, color: `${MUTED}99`, textTransform: "uppercase" as const, letterSpacing: "0.25em", textAlign: "center", marginTop: 16, marginBottom: 12 }}>Dia</p>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16 }} className="no-scrollbar">
          {dates.map(d => {
            const dt = new Date(d + "T12:00:00");
            const sel = selDate === d;
            const today = d === new Date().toISOString().split("T")[0];
            return (
              <button
                key={d}
                onClick={() => { setSelDate(d); setSelTime(""); }}
                style={{
                  ...(sel ? glassSelectedStyle : glassStyle),
                  flexShrink: 0, width: 72, padding: "12px 0", borderRadius: 16,
                  textAlign: "center" as const, cursor: "pointer", transition: "all 0.3s",
                }}
              >
                <p style={{ fontSize: 9, textTransform: "uppercase" as const, letterSpacing: "0.1em", fontWeight: 500, color: sel ? GOLD : MUTED, margin: 0 }}>
                  {today ? "Hoje" : DAYS[dt.getDay()]}
                </p>
                <p style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", fontWeight: 700, marginTop: 2, ...(sel ? goldTextStyle : { color: FG }) }}>
                  {dt.getDate()}
                </p>
                <p style={{ fontSize: 9, color: sel ? `${GOLD}B3` : MUTED, margin: 0 }}>{MONTHS[dt.getMonth()]}</p>
              </button>
            );
          })}
        </div>

        {/* Times */}
        {selDate && (
          <>
            <p style={{ fontSize: 10, color: `${MUTED}99`, textTransform: "uppercase" as const, letterSpacing: "0.25em", textAlign: "center", marginTop: 8, marginBottom: 12 }}>Horário</p>
            {slotsLoad ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
                <div style={{
                  width: 32, height: 32, border: `2px solid ${GOLD}`, borderTopColor: "transparent",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                }} />
              </div>
            ) : (slotsData?.slots || []).length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0" }}>
                <Clock style={{ width: 32, height: 32, color: `${MUTED}33`, margin: "0 auto 12px" }} />
                <p style={{ color: MUTED, fontSize: 14 }}>Sem horários neste dia</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {(slotsData?.slots || []).map((slot: string) => (
                  <button
                    key={slot}
                    onClick={() => setSelTime(slot)}
                    style={{
                      ...(selTime === slot ? { ...btnGoldStyle, boxShadow: `0 0 24px rgba(201,169,110,0.2)` } : { ...glassStyle, color: `${FG}CC` }),
                      padding: "12px 0", borderRadius: 12, fontSize: 14, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.3s",
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {selTime && (
        <Bottom>
          <button onClick={() => goTo(4)} style={{ ...btnGoldStyle, width: "100%", padding: "14px 0", borderRadius: 16, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Confirmar Dados <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </Bottom>
      )}
    </div>,

    // 4 — Confirmação
    <div key="conf" style={{ flex: 1, display: "flex", flexDirection: "column" as const }}>
      <Header step={4} total={4} title="Confirmação" onBack={() => goTo(3)} />
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px", paddingBottom: 160 }}>
        <p style={{ fontSize: 10, color: `${MUTED}99`, textTransform: "uppercase" as const, letterSpacing: "0.25em", textAlign: "center", marginTop: 16, marginBottom: 12 }}>Resumo do agendamento</p>
        <div style={{ ...glassStyle, borderRadius: 16, padding: 20 }}>
          <SRow icon={<Scissors style={{ width: 16, height: 16 }} />} text={selSvc.map(s => s.name).join(", ")} />
          <SRow icon={<User style={{ width: 16, height: 16 }} />} text={selBarber?.name || ""} />
          <SRow icon={<Calendar style={{ width: 16, height: 16 }} />} text={selDate && fmtDate(selDate)} />
          <SRow icon={<Clock style={{ width: 16, height: 16 }} />} text={`${selTime} • ${dur}min`} />
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, rgba(201,169,110,0.35), transparent)`, margin: "12px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: MUTED, fontSize: 14 }}>Total</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, ...goldTextStyle }}>R$ {price.toFixed(2)}</span>
          </div>
        </div>

        <p style={{ fontSize: 10, color: `${MUTED}99`, textTransform: "uppercase" as const, letterSpacing: "0.25em", textAlign: "center", marginTop: 32, marginBottom: 12 }}>Seus dados</p>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ ...glassStyle, width: "100%", borderRadius: 16, padding: "16px", color: FG, fontSize: 15, outline: "none", boxSizing: "border-box" as const }}
          />
          <input
            type="tel"
            placeholder="(16) 99999-9999"
            value={phone}
            onChange={e => setPhone(fmtPhone(e.target.value))}
            style={{ ...glassStyle, width: "100%", borderRadius: 16, padding: "16px", color: FG, fontSize: 15, outline: "none", boxSizing: "border-box" as const }}
          />
        </div>
      </div>
      {name.length >= 2 && phone.length >= 14 && (
        <Bottom>
          <button
            onClick={() => book.mutate()}
            disabled={book.isPending}
            style={{ ...btnGoldStyle, width: "100%", padding: "16px 0", borderRadius: 16, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: book.isPending ? 0.5 : 1 }}
          >
            {book.isPending ? (
              <div style={{ width: 20, height: 20, border: `2px solid ${BG}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            ) : (
              <><Check style={{ width: 20, height: 20 }} /> Confirmar Agendamento</>
            )}
          </button>
        </Bottom>
      )}
    </div>,
  ];

  return (
    <Shell>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        ::placeholder{color:${MUTED}4D}
      `}</style>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column" as const,
        transition: "opacity 0.2s, transform 0.2s",
        opacity: anim ? 0 : 1,
        transform: anim ? (dir === "f" ? "translateX(16px)" : "translateX(-16px)") : "translateX(0)",
      }}>
        {steps[step]}
      </div>
    </Shell>
  );
}

// ═══ COMPONENTS ═══

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: BG, minHeight: "100dvh", display: "flex", flexDirection: "column" as const,
      maxWidth: 448, margin: "0 auto", position: "relative", color: FG,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Subtle grid pattern */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.025, pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(201,169,110,0.25) 60px,rgba(201,169,110,0.25) 61px),repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(201,169,110,0.25) 60px,rgba(201,169,110,0.25) 61px)`,
      }} />
      {/* Top glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 600px 300px at 50% -50px, rgba(201,169,110,0.07) 0%, transparent 100%)`,
      }} />
      {children}
    </div>
  );
}

function Header({ step, total, title, onBack }: { step: number; total: number; title: string; onBack: () => void }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 20,
      background: `${BG}E6`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", padding: "0 16px", height: 56 }}>
        <button onClick={onBack} style={{ padding: 8, marginLeft: -8, borderRadius: 12, background: "none", border: "none", cursor: "pointer", color: GOLD }}>
          <ChevronLeft style={{ width: 20, height: 20 }} />
        </button>
        <h2 style={{ flex: 1, textAlign: "center", fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 15, letterSpacing: "0.02em" }}>{title}</h2>
        <span style={{ fontSize: 10, color: `${MUTED}80`, width: 32, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{step}/{total}</span>
      </div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }}>
        <div style={{
          height: "100%", borderRadius: 1,
          background: `linear-gradient(90deg, #8B7340, ${GOLD}, ${GOLD_L})`,
          boxShadow: `0 0 8px rgba(201,169,110,0.5)`,
          transition: "width 0.7s ease-out",
          width: `${(step / total) * 100}%`,
        }} />
      </div>
    </div>
  );
}

function Bottom({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30 }}>
      <div style={{
        maxWidth: 448, margin: "0 auto",
        background: `${BG}F2`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        padding: "16px 16px max(16px, env(safe-area-inset-bottom))",
      }}>
        {children}
      </div>
    </div>
  );
}

function SRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0" }}>
      <span style={{ color: `${GOLD}99` }}>{icon}</span>
      <span style={{ fontSize: 14, color: `${FG}D9` }}>{text}</span>
    </div>
  );
}
