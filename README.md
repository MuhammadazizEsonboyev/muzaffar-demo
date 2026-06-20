# PumpGuard — Nasoslarni Monitoring va Prediktiv Texnik Xizmat Tizimi

Sanoat grunt nasoslarini real vaqtda kuzatuvchi, nosozliklarni avtomatik aniqlovchi va dispetcher/mexaniklarga (jumladan Telegram orqali) ogohlantirish yuboruvchi to'liq full-stack tizim.

## Texnologiyalar

**Frontend:** React 19 · Vite · Tailwind CSS · React Router · Recharts · Lucide Icons
**Backend:** Node.js · Express · TypeScript
**Database:** Supabase PostgreSQL · Realtime · Auth · RLS

## Struktura

```
pump-system/
├── database/
│   ├── 01_schema.sql        # Jadvallar, FK, index, constraint, RLS, realtime
│   └── 02_seed.sql          # Boshlang'ich ma'lumotlar
├── backend/
│   └── src/
│       ├── config/          # Supabase admin client
│       ├── services/        # diagnostics, ingestion, telegram
│       ├── controllers/     # API logika
│       ├── routes/          # REST endpointlar
│       ├── utils/           # simulator.ts
│       └── server.ts        # Express entry
└── frontend/
    └── src/
        ├── components/      # ui, layout, charts (reusable)
        ├── pages/           # Dashboard, Pumps, PumpDetail, Alerts, Maintenance, Inventory
        ├── hooks/           # useRealtimeReadings
        ├── lib/             # supabase client + API
        ├── utils/           # format helperlar
        └── types/           # TypeScript tiplar
```

## O'rnatish

### 1. Supabase
1. https://supabase.com da yangi loyiha yarating.
2. SQL Editor'da `database/01_schema.sql`, keyin `02_seed.sql` ni ishga tushiring.
3. Settings → API'dan `URL`, `anon key`, `service_role key` ni oling.
4. Auth → Realtime yoqilganligini tekshiring (schema migration `sensor_readings`, `alerts`, `pumps` ni publication'ga qo'shadi).

### 2. Telegram bot
1. @BotFather orqali bot yarating, `BOT_TOKEN` oling.
2. Botga xabar yozing, keyin `https://api.telegram.org/bot<TOKEN>/getUpdates` orqali `chat_id` ni aniqlang.

### 3. Backend
```bash
cd backend
cp .env.example .env     # qiymatlarni to'ldiring
npm install
npm run dev              # http://localhost:4000
```

### 4. Simulator (real-time ma'lumot generatsiyasi)
```bash
cd backend
npm run simulate         # har 4 soniyada sensorlar yangilanadi + alertlar yaratiladi
```

### 5. Frontend
```bash
cd frontend
cp .env.example .env     # Supabase URL/anon key, API URL
npm install
npm run dev              # http://localhost:5173
```

## Diagnostika qoidalari

| Qoida | Shart | Daraja |
|-------|-------|--------|
| Podshipnik qizishi | >65°C / >75°C | warning / critical |
| Kavitatsiya | inlet<0.1 va vibration>3.5 | high |
| Ishchi g'ildirak yeyilishi | outlet & flow >20% pasayish | high |
| Salnik sizishi | seal>75°C va flow >15% pasayish | high |
| Podshipnik yeyilishi | temp>70°C va vibration>3.0 | high |
| Vibratsiya | >4.5 / >7 | warning / critical |
| Yetarsiz oqim | flow<60 | medium |
| Dvigatel yuklanishi | current>110% va vibration yuqori | high |

Qoidalar `backend/src/services/diagnostics.ts` da. Health Score (0-100) shu yerda hisoblanadi:
80-100 yashil · 50-79 sariq · 0-49 qizil.

## Real-time oqim

`simulator` → `ingestReading()` sensor o'qishni `sensor_readings`'ga yozadi → Supabase Realtime INSERT eventi frontend'dagi `useRealtimeReadings` hook'iga yetadi → grafiklar avtomatik yangilanadi. Kritik diagnostika Telegram xabarini ishga tushiradi.

## API endpointlar

```
GET   /api/dashboard
GET   /api/pumps          GET /api/pumps/:id
GET   /api/readings       POST /api/readings
GET   /api/alerts         PATCH /api/alerts/:id
GET   /api/maintenance    POST /api/maintenance    PATCH /api/maintenance/:id
GET   /api/inventory      PATCH /api/inventory/:id
```

## Production build
```bash
cd frontend && npm run build     # dist/
cd backend  && npm run build && npm start
```

## Xavfsizlik eslatmasi
`service_role key` faqat backend'da ishlatiladi va RLS'ni chetlab o'tadi — uni hech qachon frontend'ga qo'ymang. Frontend faqat `anon key` ishlatadi va RLS policy'lariga bo'ysunadi.
