import { useState, useEffect } from "react";
import {
  LayoutDashboard, Calendar, Scissors, Users, DollarSign,
  LogOut, Plus, Trash2, Edit3, X, Check, Ban, Clock,
  TrendingUp, UserCheck, ChevronLeft, ChevronRight, Search,
  Eye, EyeOff, Save, AlertCircle
} from "lucide-react";

type Barber = { id: number; name: string; photo: string; pin: string; active: boolean; workDays: string; startTime: string; endTime: string; lunchStart: string; lunchEnd: string };
type Service = { id: number; name: string; price: number; duration: number; active: boolean; sortOrder: number };
type Appointment = { id: number; barberId: number; clientName: string; clientPhone: string; date: string; time: string; totalDuration: number; totalPrice: number; serviceNames: string; status: string };
type Stats = { todayAppointments: number; todayRevenue: number; monthAppointments: number; monthRevenue: number };

const API = "/api";
const TOKEN_KEY = "jp-admin-token";

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  if (!token) {
    return (
      <div className="bg-premium min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 ring-1 ring-[#C9A96E]/30">
              <img src="/logo.png" alt="JP" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gold-gradient">Painel Admin</h1>
            <p className="text-muted-foreground text-sm mt-1">JP Barbearia</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Senha do administrador</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setLoginError(""); }}
              onKeyDown={e => e.key === "Enter" && doLogin()}
              placeholder="••••••"
              className="input-premium w-full glass-card rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none mb-4"
            />
            {loginError && <p className="text-red-400 text-xs mb-3 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{loginError}</p>}
            <button onClick={doLogin} className="btn-gold w-full py-3 rounded-xl">
              Entrar
            </button>
          </div>
          <div className="text-center mt-6">
            <a href="/" className="text-xs text-muted-foreground/40 hover:text-muted-foreground/60 transition">Voltar ao agendamento</a>
          </div>
        </div>
      </div>
    );
  }

  async function doLogin() {
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
      } else {
        setLoginError("Senha incorreta");
      }
    } catch { setLoginError("Erro ao conectar"); }
  }

  return <AdminDashboard onLogout={() => { localStorage.removeItem(TOKEN_KEY); setToken(""); }} />;
}

// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"dash" | "agenda" | "services" | "barbers">("dash");

  const tabs = [
    { id: "dash" as const, icon: LayoutDashboard, label: "Dashboard" },
    { id: "agenda" as const, icon: Calendar, label: "Agenda" },
    { id: "services" as const, icon: Scissors, label: "Serviços" },
    { id: "barbers" as const, icon: Users, label: "Barbeiros" },
  ];

  return (
    <div className="bg-premium min-h-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-56 bg-surface border-r border-border flex flex-col z-30">
        <div className="p-5 flex items-center gap-3 border-b border-border">
          <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-[#C9A96E]/30">
            <img src="/logo.png" alt="JP" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold text-gold-gradient">JP Barbearia</h2>
            <p className="text-[10px] text-muted-foreground">Administrador</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                tab === t.id
                  ? "bg-[#C9A96E]/10 text-[#C9A96E] font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 p-8">
        {tab === "dash" && <DashTab />}
        {tab === "agenda" && <AgendaTab />}
        {tab === "services" && <ServicesTab />}
        {tab === "barbers" && <BarbersTab />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════

function DashTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    fetch(`${API}/admin/stats`).then(r => r.json()).then(setStats);
    const today = new Date().toISOString().split("T")[0];
    fetch(`${API}/admin/appointments?date=${today}`).then(r => r.json()).then(d => setTodayAppts(d.appointments));
    fetch(`${API}/admin/barbers`).then(r => r.json()).then(d => setBarbers(d.barbers));
  }, []);

  const barberName = (id: number) => barbers.find(b => b.id === id)?.name || "—";
  const API = "/api";

  const cards = [
    { label: "Agendamentos Hoje", value: stats?.todayAppointments ?? "—", icon: Calendar, color: "from-blue-500/20 to-blue-600/10" },
    { label: "Faturamento Hoje", value: stats ? `R$ ${stats.todayRevenue.toFixed(0)}` : "—", icon: DollarSign, color: "from-green-500/20 to-green-600/10" },
    { label: "Agendamentos Mês", value: stats?.monthAppointments ?? "—", icon: TrendingUp, color: "from-purple-500/20 to-purple-600/10" },
    { label: "Faturamento Mês", value: stats ? `R$ ${stats.monthRevenue.toFixed(0)}` : "—", icon: DollarSign, color: "from-[#C9A96E]/20 to-[#A88B55]/10" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className={`glass-card rounded-xl p-5 bg-gradient-to-br ${c.color}`}>
            <div className="flex items-center justify-between mb-3">
              <c.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-display font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#C9A96E]" />
          Agendamentos de Hoje
        </h2>
        {todayAppts.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">Nenhum agendamento para hoje</p>
        ) : (
          <div className="space-y-2">
            {todayAppts.map(a => (
              <div key={a.id} className={`flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-border/50 ${a.status === "cancelled" ? "opacity-40" : ""}`}>
                <div className="w-12 text-center">
                  <span className="text-sm font-bold text-[#C9A96E]">{a.time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.clientName}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.serviceNames}</p>
                </div>
                <div className="text-xs text-muted-foreground">{barberName(a.barberId)}</div>
                <div className="text-sm font-medium text-[#C9A96E]">R${a.totalPrice.toFixed(0)}</div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// AGENDA TAB
// ═══════════════════════════════════════════

function AgendaTab() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [filterBarber, setFilterBarber] = useState(0);

  const API = "/api";

  const load = () => {
    fetch(`${API}/admin/appointments?date=${date}`).then(r => r.json()).then(d => setAppts(d.appointments));
  };
  useEffect(() => { load(); }, [date]);
  useEffect(() => {
    fetch(`${API}/admin/barbers`).then(r => r.json()).then(d => setBarbers(d.barbers.filter((b: Barber) => b.active)));
  }, []);

  const filtered = filterBarber ? appts.filter(a => a.barberId === filterBarber) : appts;
  const barberName = (id: number) => barbers.find(b => b.id === id)?.name || "—";

  const updateStatus = async (id: number, status: string) => {
    await fetch(`${API}/admin/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const shiftDate = (days: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split("T")[0]);
  };

  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const dt = new Date(date + "T12:00:00");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Agenda</h1>

      {/* Date nav + filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 glass-card rounded-xl px-3 py-2">
          <button onClick={() => shiftDate(-1)} className="p-1 hover:bg-white/5 rounded-lg transition"><ChevronLeft className="w-4 h-4" /></button>
          <div className="text-center min-w-[160px]">
            <p className="text-sm font-medium">{dayNames[dt.getDay()]}, {dt.getDate()}/{dt.getMonth()+1}/{dt.getFullYear()}</p>
          </div>
          <button onClick={() => shiftDate(1)} className="p-1 hover:bg-white/5 rounded-lg transition"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="glass-card rounded-xl px-3 py-2 text-sm text-foreground bg-transparent focus:outline-none" />
        <select
          value={filterBarber}
          onChange={e => setFilterBarber(Number(e.target.value))}
          className="glass-card rounded-xl px-3 py-2.5 text-sm text-foreground bg-transparent focus:outline-none"
        >
          <option value={0}>Todos barbeiros</option>
          {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button
          onClick={() => setDate(new Date().toISOString().split("T")[0])}
          className="text-xs text-[#C9A96E] hover:text-[#DDBF8A] transition px-3 py-2"
        >Hoje</button>
      </div>

      {/* Appointments table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left p-4">Horário</th>
              <th className="text-left p-4">Cliente</th>
              <th className="text-left p-4">Telefone</th>
              <th className="text-left p-4">Serviços</th>
              <th className="text-left p-4">Barbeiro</th>
              <th className="text-left p-4">Valor</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-muted-foreground py-12 text-sm">Nenhum agendamento</td></tr>
            ) : filtered.map(a => (
              <tr key={a.id} className={`border-b border-border/30 hover:bg-white/[0.02] transition ${a.status === "cancelled" ? "opacity-40" : ""}`}>
                <td className="p-4 text-sm font-bold text-[#C9A96E]">{a.time}</td>
                <td className="p-4 text-sm">{a.clientName}</td>
                <td className="p-4 text-sm text-muted-foreground">{a.clientPhone}</td>
                <td className="p-4 text-sm text-muted-foreground max-w-[200px] truncate">{a.serviceNames}</td>
                <td className="p-4 text-sm">{barberName(a.barberId)}</td>
                <td className="p-4 text-sm font-medium">R${a.totalPrice.toFixed(0)}</td>
                <td className="p-4"><StatusBadge status={a.status} /></td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {a.status === "confirmed" && (
                      <>
                        <button onClick={() => updateStatus(a.id, "completed")} className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-400 transition" title="Concluir">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => updateStatus(a.id, "cancelled")} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition" title="Cancelar">
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {a.status === "cancelled" && (
                      <button onClick={() => updateStatus(a.id, "confirmed")} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-400 transition" title="Reativar">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SERVICES TAB
// ═══════════════════════════════════════════

function ServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const API = "/api";

  const load = () => fetch(`${API}/admin/services`).then(r => r.json()).then(d => setServices(d.services));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (isNew) {
      await fetch(`${API}/admin/services`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    } else {
      await fetch(`${API}/admin/services/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    }
    setEditing(null); setIsNew(false); load();
  };

  const remove = async (id: number) => {
    if (!confirm("Desativar este serviço?")) return;
    await fetch(`${API}/admin/services/${id}`, { method: "DELETE" });
    load();
  };

  const reactivate = async (s: Service) => {
    await fetch(`${API}/admin/services/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: true }) });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Serviços</h1>
        <button
          onClick={() => { setEditing({ name: "", price: 0, duration: 30, sortOrder: services.length + 1 }); setIsNew(true); }}
          className="btn-gold px-4 py-2 rounded-xl text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Serviço
        </button>
      </div>

      {/* Edit modal */}
      {editing && (
        <Modal onClose={() => { setEditing(null); setIsNew(false); }}>
          <h3 className="font-display text-lg font-semibold mb-4">{isNew ? "Novo Serviço" : "Editar Serviço"}</h3>
          <div className="space-y-3">
            <Field label="Nome" value={editing.name || ""} onChange={v => setEditing({ ...editing, name: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço (R$)" type="number" value={String(editing.price || 0)} onChange={v => setEditing({ ...editing, price: Number(v) })} />
              <Field label="Duração (min)" type="number" value={String(editing.duration || 30)} onChange={v => setEditing({ ...editing, duration: Number(v) })} />
            </div>
            <Field label="Ordem" type="number" value={String(editing.sortOrder || 0)} onChange={v => setEditing({ ...editing, sortOrder: Number(v) })} />
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 glass-card py-2.5 rounded-xl text-sm hover:bg-white/5 transition">Cancelar</button>
            <button onClick={save} className="flex-1 btn-gold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"><Save className="w-4 h-4" />Salvar</button>
          </div>
        </Modal>
      )}

      {/* Services grid */}
      <div className="grid grid-cols-2 gap-3">
        {services.map(s => (
          <div key={s.id} className={`glass-card rounded-xl p-5 ${!s.active ? "opacity-40" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm">{s.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration} min</p>
              </div>
              <span className="font-display font-bold text-lg text-[#C9A96E]">R${s.price.toFixed(0)}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(s); setIsNew(false); }} className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1">
                <Edit3 className="w-3 h-3" />Editar
              </button>
              {s.active ? (
                <button onClick={() => remove(s.id)} className="text-xs text-red-400/60 hover:text-red-400 transition flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />Desativar
                </button>
              ) : (
                <button onClick={() => reactivate(s)} className="text-xs text-green-400/60 hover:text-green-400 transition flex items-center gap-1">
                  <Check className="w-3 h-3" />Reativar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// BARBERS TAB
// ═══════════════════════════════════════════

function BarbersTab() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [editing, setEditing] = useState<Partial<Barber> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showPin, setShowPin] = useState<number | null>(null);

  const API = "/api";
  const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const load = () => fetch(`${API}/admin/barbers`).then(r => r.json()).then(d => setBarbers(d.barbers));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (isNew) {
      await fetch(`${API}/admin/barbers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    } else {
      await fetch(`${API}/admin/barbers/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    }
    setEditing(null); setIsNew(false); load();
  };

  const remove = async (id: number) => {
    if (!confirm("Desativar este barbeiro?")) return;
    await fetch(`${API}/admin/barbers/${id}`, { method: "DELETE" });
    load();
  };

  const toggleDay = (day: number) => {
    if (!editing) return;
    const days = (editing.workDays || "1,2,3,4,5,6").split(",").map(Number);
    const next = days.includes(day) ? days.filter(d => d !== day) : [...days, day].sort();
    setEditing({ ...editing, workDays: next.join(",") });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Barbeiros</h1>
        <button
          onClick={() => { setEditing({ name: "", pin: "0000", photo: "", workDays: "1,2,3,4,5,6", startTime: "09:00", endTime: "19:00", lunchStart: "12:00", lunchEnd: "13:00" }); setIsNew(true); }}
          className="btn-gold px-4 py-2 rounded-xl text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Barbeiro
        </button>
      </div>

      {/* Edit modal */}
      {editing && (
        <Modal onClose={() => { setEditing(null); setIsNew(false); }}>
          <h3 className="font-display text-lg font-semibold mb-4">{isNew ? "Novo Barbeiro" : "Editar Barbeiro"}</h3>
          <div className="space-y-3">
            <Field label="Nome" value={editing.name || ""} onChange={v => setEditing({ ...editing, name: v })} />
            <Field label="PIN (4 dígitos)" value={editing.pin || ""} onChange={v => setEditing({ ...editing, pin: v.replace(/\D/g, "").slice(0, 4) })} />
            <Field label="URL da foto" value={editing.photo || ""} onChange={v => setEditing({ ...editing, photo: v })} />

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Dias de trabalho</label>
              <div className="flex gap-1.5">
                {dayLabels.map((label, i) => {
                  const active = (editing.workDays || "").split(",").map(Number).includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className={`w-10 h-10 rounded-lg text-xs font-medium transition-all ${
                        active ? "bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40" : "glass-card text-muted-foreground"
                      }`}
                    >{label}</button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Início" type="time" value={editing.startTime || "09:00"} onChange={v => setEditing({ ...editing, startTime: v })} />
              <Field label="Fim" type="time" value={editing.endTime || "19:00"} onChange={v => setEditing({ ...editing, endTime: v })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Almoço início" type="time" value={editing.lunchStart || "12:00"} onChange={v => setEditing({ ...editing, lunchStart: v })} />
              <Field label="Almoço fim" type="time" value={editing.lunchEnd || "13:00"} onChange={v => setEditing({ ...editing, lunchEnd: v })} />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 glass-card py-2.5 rounded-xl text-sm hover:bg-white/5 transition">Cancelar</button>
            <button onClick={save} className="flex-1 btn-gold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"><Save className="w-4 h-4" />Salvar</button>
          </div>
        </Modal>
      )}

      {/* Barbers list */}
      <div className="space-y-3">
        {barbers.map(b => (
          <div key={b.id} className={`glass-card rounded-xl p-5 ${!b.active ? "opacity-40" : ""}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#C9A96E]/20">
                {b.photo ? <img src={b.photo} alt={b.name} className="w-full h-full object-cover" /> :
                  <div className="w-full h-full bg-surface-elevated flex items-center justify-center text-muted-foreground"><Users className="w-5 h-5" /></div>}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{b.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {b.workDays.split(",").map(Number).map(d => dayLabels[d]).join(", ")} • {b.startTime}–{b.endTime}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPin(showPin === b.id ? null : b.id)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 glass-card px-3 py-1.5 rounded-lg transition"
                >
                  {showPin === b.id ? <><EyeOff className="w-3 h-3" />PIN: {b.pin}</> : <><Eye className="w-3 h-3" />Ver PIN</>}
                </button>
                <button onClick={() => { setEditing(b); setIsNew(false); }} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition">
                  <Edit3 className="w-4 h-4" />
                </button>
                {b.active && (
                  <button onClick={() => remove(b.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════

const API = "/api";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  const labels: Record<string, string> = { confirmed: "Confirmado", completed: "Concluído", cancelled: "Cancelado" };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${styles[status] || styles.confirmed}`}>
      {labels[status] || status}
    </span>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-md mx-4 border border-[#C9A96E]/10" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-premium w-full glass-card rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
      />
    </div>
  );
}
