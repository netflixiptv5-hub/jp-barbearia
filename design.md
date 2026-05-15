# JP Barbearia — Design System

## Vibe
Dark, premium, masculino. Inspirado em theCut + Booksy. Limpo, sem poluição visual.

## Colors
- Background: #0A0A0B (quase preto)
- Surface: #141417 (cards)
- Surface elevated: #1C1C21
- Border: #2A2A30
- Primary/Accent: #C8A97E (dourado/gold) — botões, highlights
- Primary hover: #D4B98E
- Text primary: #F5F5F5
- Text secondary: #8A8A95
- Success: #4ADE80
- Error: #F87171

## Typography
- Font: "DM Sans" (Google Fonts) — clean, modern
- Headings: DM Sans Bold
- Body: DM Sans Regular
- Sizes: 14px body, 16px lead, 24px h2, 32px h1

## Layout
- Mobile-first, max-width 480px centered
- Full-screen wizard flow — no page navigation
- Steps flow left-to-right with smooth slide transitions
- Bottom sticky CTA button
- No scroll-to-top ever — each step is a contained view

## UX Flow (Cliente)
1. Landing — logo + "Agendar" CTA
2. Step 1: Escolher serviço(s) — lista com preços, multi-select
3. Step 2: Escolher barbeiro — cards horizontais com foto/nome
4. Step 3: Escolher data — calendário inline
5. Step 4: Escolher horário — grid de horários disponíveis
6. Step 5: Confirmar — resumo + nome + telefone → confirma
7. Confirmação — check animado + detalhes

## UX Flow (Admin /admin)
- Login simples (senha fixa por enquanto)
- Dashboard: agendamentos do dia
- CRUD barbeiros (nome, foto, horários)
- CRUD serviços (nome, preço, duração)
- Ver todos agendamentos

## Components
- Cards com border subtle, hover glow gold
- Buttons: gold bg com texto dark, pill shape
- Inputs: dark bg, border subtle, focus gold
- Calendar: custom dark, today highlight gold
- Time slots: grid pills, available gold outline, selected gold fill
