import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const barbers = sqliteTable("barbers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  photo: text("photo").default(""),
  phone: text("phone").default(""), // WhatsApp number e.g. 5516999999999
  pin: text("pin").notNull().default("0000"), // 4-digit PIN for barber login
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  workDays: text("work_days").notNull().default("1,2,3,4,5,6"), // 0=dom, 1=seg...6=sab
  startTime: text("start_time").notNull().default("09:00"),
  endTime: text("end_time").notNull().default("19:00"),
  lunchStart: text("lunch_start").default("12:00"),
  lunchEnd: text("lunch_end").default("13:00"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").default(""),
  price: real("price").notNull(),
  duration: integer("duration").notNull().default(30), // minutes
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  barberId: integer("barber_id").notNull().references(() => barbers.id),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  time: text("time").notNull(), // HH:MM
  totalDuration: integer("total_duration").notNull(), // minutes
  totalPrice: real("total_price").notNull(),
  serviceIds: text("service_ids").notNull(), // JSON array of ids
  serviceNames: text("service_names").notNull(), // human readable
  status: text("status").notNull().default("confirmed"), // confirmed, completed, cancelled
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const blockedSlots = sqliteTable("blocked_slots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  barberId: integer("barber_id").notNull().references(() => barbers.id),
  date: text("date").notNull(), // YYYY-MM-DD
  time: text("time").notNull(), // HH:MM
  reason: text("reason").default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ─── MULTI-TENANT (Orion Digital Prospecting) ───

export const tenants = sqliteTable("tenants", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default(""), // Restaurant, Barber, etc.
  address: text("address").default(""),
  phone: text("phone").default(""), // WhatsApp number
  accentColor: text("accent_color").notNull().default("#C9A96E"),
  tagline: text("tagline").default(""),
  servicesJson: text("services_json").notNull().default("[]"), // JSON array [{name, price, duration}]
  hours: text("hours").default("Seg–Sex 9h–18h"),
  logoUrl: text("logo_url").default(""),
  instagram: text("instagram").default(""),
  rating: text("rating").default(""),
  reviews: text("reviews").default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantSlug: text("tenant_slug").notNull(),
  businessName: text("business_name").notNull(),
  phone: text("phone").default(""),
  address: text("address").default(""),
  category: text("category").default(""),
  rating: text("rating").default(""),
  reviews: text("reviews").default(""),
  googleUrl: text("google_url").default(""),
  status: text("status").notNull().default("new"), // new, msg_sent, replied, interested, closed, rejected
  priceOffered: real("price_offered").default(229),
  msgSentAt: integer("msg_sent_at", { mode: "timestamp" }),
  notes: text("notes").default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
