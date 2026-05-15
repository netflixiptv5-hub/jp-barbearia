# Multi-Tenant Prospector System

## Architecture
- Same Turso DB, same Railway deploy
- `tenants` table stores config per business
- `leads` table stores prospecting status
- Frontend reads `:slug` from URL → loads tenant config → renders dynamic booking page
- JP Barbearia remains at `/` (backward compatible)
- Demo sites at `/demo/:slug`
- Orion admin at `/orion`
- API: `/api/t/:slug/*` for tenant-specific endpoints

## Tables to Add
1. `tenants` — slug, name, category, address, phone, accent_color, tagline, services_json, hours, logo_url, instagram, created_at
2. `leads` — tenant_slug (FK), status (new/msg_sent/replied/interested/closed/rejected), phone, msg_sent_at, notes, price_offered, created_at

## Build Order
- [x] 1. Schema: add tenants + leads tables
- [ ] 2. API: tenant CRUD + tenant-aware public endpoints  
- [ ] 3. Frontend: dynamic demo page component (reads tenant config)
- [ ] 4. Frontend: Orion admin dashboard
- [ ] 5. Script: demo generator (reads leads JSON → creates tenants)
- [ ] 6. Script: WhatsApp dispatcher
- [ ] 7. Deploy + test

## Key Decisions
- Services stored as JSON in tenant (no per-tenant services table for demos)
- Demo pages are read-only showcases (no actual booking for demos)
- Colors auto-generated per category
- Admin password: "orion2026"
