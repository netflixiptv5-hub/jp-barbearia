import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./database";
import * as schema from "./database/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

const ADMIN_PASS = "jp2026";

const app = new Hono()
  .basePath("api")
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true }))
  .get("/health", (c) => c.json({ status: "ok" }, 200))

  // ─── PUBLIC: services ───
  .get("/services", async (c) => {
    const rows = await db.select().from(schema.services).where(eq(schema.services.active, true)).orderBy(schema.services.sortOrder);
    return c.json({ services: rows }, 200);
  })

  // ─── PUBLIC: barbers ───
  .get("/barbers", async (c) => {
    const rows = await db.select().from(schema.barbers).where(eq(schema.barbers.active, true));
    return c.json({ barbers: rows }, 200);
  })

  // ─── PUBLIC: available slots ───
  .get("/slots/:barberId/:date", async (c) => {
    const barberId = parseInt(c.req.param("barberId"));
    const date = c.req.param("date");
    const duration = parseInt(c.req.query("duration") || "30");

    const barber = await db.select().from(schema.barbers).where(eq(schema.barbers.id, barberId)).get();
    if (!barber) return c.json({ slots: [] }, 200);

    const dayOfWeek = new Date(date + "T12:00:00").getDay();
    const workDays = barber.workDays.split(",").map(Number);
    if (!workDays.includes(dayOfWeek)) return c.json({ slots: [] }, 200);

    // Get existing appointments
    const existing = await db.select().from(schema.appointments)
      .where(and(
        eq(schema.appointments.barberId, barberId),
        eq(schema.appointments.date, date),
        eq(schema.appointments.status, "confirmed")
      ));

    // Get blocked slots
    const blocked = await db.select().from(schema.blockedSlots)
      .where(and(
        eq(schema.blockedSlots.barberId, barberId),
        eq(schema.blockedSlots.date, date)
      ));
    const blockedTimes = new Set(blocked.map(b => b.time));

    const slots: string[] = [];
    const [startH, startM] = barber.startTime.split(":").map(Number);
    const [endH, endM] = barber.endTime.split(":").map(Number);
    const [lunchSH, lunchSM] = (barber.lunchStart || "12:00").split(":").map(Number);
    const [lunchEH, lunchEM] = (barber.lunchEnd || "13:00").split(":").map(Number);

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;
    const lunchStart = lunchSH * 60 + lunchSM;
    const lunchEnd = lunchEH * 60 + lunchEM;

    while (current + duration <= end) {
      if (current >= lunchStart && current < lunchEnd) { current = lunchEnd; continue; }
      if (current + duration > lunchStart && current < lunchEnd) { current = lunchEnd; continue; }

      const timeStr = `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`;

      // Check blocked
      if (blockedTimes.has(timeStr)) { current += 30; continue; }

      // Check overlap with existing
      const hasConflict = existing.some((appt) => {
        const [ah, am] = appt.time.split(":").map(Number);
        const apptStart = ah * 60 + am;
        const apptEnd = apptStart + appt.totalDuration;
        const slotEnd = current + duration;
        return current < apptEnd && slotEnd > apptStart;
      });

      if (!hasConflict) {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        if (date === today) {
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          if (current > nowMinutes) slots.push(timeStr);
        } else {
          slots.push(timeStr);
        }
      }

      current += 30;
    }

    return c.json({ slots }, 200);
  })

  // ─── PUBLIC: create appointment ───
  .post("/appointments", async (c) => {
    const body = await c.req.json();
    const { barberId, clientName, clientPhone, date, time, serviceIds, totalDuration, totalPrice, serviceNames } = body;
    const [appt] = await db.insert(schema.appointments).values({
      barberId, clientName, clientPhone, date, time,
      serviceIds: JSON.stringify(serviceIds),
      serviceNames, totalDuration, totalPrice, status: "confirmed",
    }).returning();
    return c.json({ appointment: appt }, 201);
  })

  // ─── ADMIN: auth ───
  .post("/admin/login", async (c) => {
    const { password } = await c.req.json();
    if (password === ADMIN_PASS) return c.json({ ok: true, token: "jp-admin-2026" }, 200);
    return c.json({ ok: false, error: "Senha incorreta" }, 401);
  })

  // ─── ADMIN: all appointments ───
  .get("/admin/appointments", async (c) => {
    const date = c.req.query("date");
    if (date) {
      const rows = await db.select().from(schema.appointments).where(eq(schema.appointments.date, date)).orderBy(schema.appointments.time);
      return c.json({ appointments: rows }, 200);
    }
    const rows = await db.select().from(schema.appointments).orderBy(desc(schema.appointments.createdAt));
    return c.json({ appointments: rows }, 200);
  })

  // ─── ADMIN: update appointment status ───
  .patch("/admin/appointments/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    await db.update(schema.appointments).set({ status: body.status }).where(eq(schema.appointments.id, id));
    return c.json({ ok: true }, 200);
  })

  // ─── ADMIN: services CRUD ───
  .get("/admin/services", async (c) => {
    const rows = await db.select().from(schema.services).orderBy(schema.services.sortOrder);
    return c.json({ services: rows }, 200);
  })
  .post("/admin/services", async (c) => {
    const body = await c.req.json();
    const [svc] = await db.insert(schema.services).values(body).returning();
    return c.json({ service: svc }, 201);
  })
  .patch("/admin/services/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    await db.update(schema.services).set(body).where(eq(schema.services.id, id));
    return c.json({ ok: true }, 200);
  })
  .delete("/admin/services/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    await db.update(schema.services).set({ active: false }).where(eq(schema.services.id, id));
    return c.json({ ok: true }, 200);
  })

  // ─── ADMIN: barbers CRUD ───
  .get("/admin/barbers", async (c) => {
    const rows = await db.select().from(schema.barbers);
    return c.json({ barbers: rows }, 200);
  })
  .post("/admin/barbers", async (c) => {
    const body = await c.req.json();
    const [barber] = await db.insert(schema.barbers).values(body).returning();
    return c.json({ barber }, 201);
  })
  .patch("/admin/barbers/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    await db.update(schema.barbers).set(body).where(eq(schema.barbers.id, id));
    return c.json({ ok: true }, 200);
  })
  .delete("/admin/barbers/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    await db.update(schema.barbers).set({ active: false }).where(eq(schema.barbers.id, id));
    return c.json({ ok: true }, 200);
  })

  // ─── ADMIN: revenue stats ───
  .get("/admin/stats", async (c) => {
    const today = new Date().toISOString().split("T")[0];
    const month = today.slice(0, 7); // YYYY-MM

    const todayAppts = await db.select().from(schema.appointments)
      .where(and(eq(schema.appointments.date, today), eq(schema.appointments.status, "confirmed")));
    const monthAppts = await db.select().from(schema.appointments)
      .where(and(sql`${schema.appointments.date} LIKE ${month + '%'}`, eq(schema.appointments.status, "confirmed")));
    const completedMonth = await db.select().from(schema.appointments)
      .where(and(sql`${schema.appointments.date} LIKE ${month + '%'}`, eq(schema.appointments.status, "completed")));

    const todayRevenue = todayAppts.reduce((s, a) => s + a.totalPrice, 0);
    const monthRevenue = [...monthAppts, ...completedMonth].reduce((s, a) => s + a.totalPrice, 0);

    return c.json({
      todayAppointments: todayAppts.length,
      todayRevenue,
      monthAppointments: monthAppts.length + completedMonth.length,
      monthRevenue,
    }, 200);
  })

  // ─── BARBER: login with PIN ───
  .post("/barber/login", async (c) => {
    const { name, pin } = await c.req.json();
    const barber = await db.select().from(schema.barbers)
      .where(and(eq(schema.barbers.name, name), eq(schema.barbers.pin, pin), eq(schema.barbers.active, true)))
      .get();
    if (!barber) return c.json({ ok: false, error: "Nome ou PIN incorreto" }, 401);
    return c.json({ ok: true, barber: { id: barber.id, name: barber.name, photo: barber.photo } }, 200);
  })

  // ─── BARBER: get own schedule ───
  .get("/barber/:id/schedule", async (c) => {
    const id = parseInt(c.req.param("id"));
    const barber = await db.select().from(schema.barbers).where(eq(schema.barbers.id, id)).get();
    if (!barber) return c.json({ error: "Not found" }, 404);
    return c.json({ barber }, 200);
  })

  // ─── BARBER: update own schedule ───
  .patch("/barber/:id/schedule", async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const allowed = ["workDays", "startTime", "endTime", "lunchStart", "lunchEnd"];
    const update: Record<string, string> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    await db.update(schema.barbers).set(update).where(eq(schema.barbers.id, id));
    return c.json({ ok: true }, 200);
  })

  // ─── BARBER: get appointments ───
  .get("/barber/:id/appointments", async (c) => {
    const id = parseInt(c.req.param("id"));
    const date = c.req.query("date");
    if (date) {
      const rows = await db.select().from(schema.appointments)
        .where(and(eq(schema.appointments.barberId, id), eq(schema.appointments.date, date)))
        .orderBy(schema.appointments.time);
      return c.json({ appointments: rows }, 200);
    }
    const rows = await db.select().from(schema.appointments)
      .where(eq(schema.appointments.barberId, id))
      .orderBy(desc(schema.appointments.createdAt));
    return c.json({ appointments: rows }, 200);
  })

  // ─── BARBER: blocked slots ───
  .get("/barber/:id/blocked", async (c) => {
    const id = parseInt(c.req.param("id"));
    const date = c.req.query("date");
    if (date) {
      const rows = await db.select().from(schema.blockedSlots)
        .where(and(eq(schema.blockedSlots.barberId, id), eq(schema.blockedSlots.date, date)));
      return c.json({ blocked: rows }, 200);
    }
    const rows = await db.select().from(schema.blockedSlots).where(eq(schema.blockedSlots.barberId, id));
    return c.json({ blocked: rows }, 200);
  })

  // ─── BARBER: toggle block slot ───
  .post("/barber/:id/blocked", async (c) => {
    const id = parseInt(c.req.param("id"));
    const { date, time } = await c.req.json();
    // Check if already blocked
    const existing = await db.select().from(schema.blockedSlots)
      .where(and(
        eq(schema.blockedSlots.barberId, id),
        eq(schema.blockedSlots.date, date),
        eq(schema.blockedSlots.time, time)
      )).get();
    if (existing) {
      await db.delete(schema.blockedSlots).where(eq(schema.blockedSlots.id, existing.id));
      return c.json({ blocked: false }, 200);
    }
    await db.insert(schema.blockedSlots).values({ barberId: id, date, time });
    return c.json({ blocked: true }, 201);
  })

  // ─── ADMIN: seed initial data ───
  .post("/admin/seed", async (c) => {
    const existingServices = await db.select().from(schema.services);
    if (existingServices.length > 0) return c.json({ ok: true, message: "Already seeded" }, 200);

    await db.insert(schema.services).values([
      { name: "Corte Masculino", price: 45, duration: 30, sortOrder: 1 },
      { name: "Barba", price: 35, duration: 20, sortOrder: 2 },
      { name: "Corte + Barba", price: 70, duration: 50, sortOrder: 3 },
      { name: "Sobrancelha", price: 15, duration: 10, sortOrder: 4 },
      { name: "Corte Infantil", price: 35, duration: 25, sortOrder: 5 },
      { name: "Pigmentação", price: 80, duration: 40, sortOrder: 6 },
      { name: "Hidratação Capilar", price: 40, duration: 30, sortOrder: 7 },
      { name: "Corte + Barba + Sobrancelha", price: 80, duration: 60, sortOrder: 8 },
    ]);

    await db.insert(schema.barbers).values([
      { name: "JP", pin: "1234", photo: "https://api.dicebear.com/9.x/initials/svg?seed=JP&backgroundColor=c8a97e&textColor=0a0a0b", workDays: "1,2,3,4,5,6", startTime: "09:00", endTime: "20:00" },
      { name: "Rafael", pin: "5678", photo: "https://api.dicebear.com/9.x/initials/svg?seed=RF&backgroundColor=c8a97e&textColor=0a0a0b", workDays: "1,2,3,4,5,6", startTime: "09:00", endTime: "20:00" },
      { name: "Lucas", pin: "9012", photo: "https://api.dicebear.com/9.x/initials/svg?seed=LC&backgroundColor=c8a97e&textColor=0a0a0b", workDays: "1,2,3,5,6", startTime: "10:00", endTime: "19:00" },
    ]);

    return c.json({ ok: true, message: "Seeded" }, 201);
  });

export type AppType = typeof app;
export default app;
