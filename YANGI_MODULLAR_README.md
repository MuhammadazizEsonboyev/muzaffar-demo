# YANGI MODULLAR — O'rnatish qo'llanmasi

Bu paketga AGMK miqyosidagi demo uchun quyidagi YANGI modullar qo'shildi.
Hammasi mavjud Supabase bazangiz bilan to'liq ishlaydi (haqiqiy qurilmasiz).

## Qo'shilgan modullar

1. **Korxona xaritasi (Mnemoschema)** — `/mnemoscheme`
   Sexlar va nasoslar rangli holat bilan (yashil/sariq/qizil). Har 5 soniyada yangilanadi.
   Kritik nasos qizil pulsatsiya bilan ko'rsatiladi. Nasos ustiga bossangiz — tafsilot sahifasi.

2. **Bosh injener paneli** — `/analytics`
   OEE (Mavjudlik × Samaradorlik × Sifat), KPI, sog'liq reytingi (e'tibor talab qiladiganlar tepada),
   model bo'yicha solishtirish, texxizmat xarajati, o'rtacha ta'mirlash vaqti.

3. **Ish-naryad tizimi (CMMS)** — `/work-orders`
   Ish-naryad yaratish, holatini o'zgartirish (ochiq → bajarilmoqda → bajarilgan),
   ombordan qism yechib qo'shish (avtomatik xarajat va ombor yangilanadi).

4. **Profilaktik jadval** — `/preventive`
   Ish soatlari bo'yicha avtomatik reja. Muddati o'tgan / yaqinlashayotgan nasoslar.

5. **Smena jurnali** — `/shift-logs`
   Smenalar orasidagi holat topshirig'i.

6. **Smena hisoboti (PDF)** — `/shift-report`
   "Chop etish / PDF saqlash" tugmasi — brauzer orqali PDF.

7. **Ombor tahlili** (mavjud Ombor sahifasiga qo'shildi) — `/inventory`
   Avtomatik buyurtma signali (kam qolgan qismlar) + eng ko'p ishlatilgan qismlar.

8. **Video wall (katta ekran)** — `/wall` (yangi tab'da ochiladi)
   Dispetcher xonasi devor ekrani uchun. Soat, KPI, sexlar, kritik banner.

9. **QR kod** — har nasos tafsilot sahifasida.
   Mexanik telefonda skanerlab shu sahifani ochadi.

---

## O'RNATISH (muhim — tartib bilan)

### 1-qadam: SQL migration
`MIGRATION_2.sql` faylini oching, butun mazmunini nusxalang,
Supabase Dashboard → SQL Editor → joylashtiring → **RUN** bosing.
Bu yangi jadvallar (work_orders, shift_logs...) va namuna ma'lumotlarni qo'shadi.

### 2-qadam: Backend
```
cd backend
npm install
npm run dev          # 1-terminal
npm run simulate     # 2-terminal (sensor ma'lumot generatori)
```

### 3-qadam: Frontend
```
cd frontend
npm install
npm run dev
```
Brauzer: http://localhost:5173

---

## ESLATMA — XAVFSIZLIK
`.env` fayllaringizdagi kalitlar oldin ochiq ko'rindi. Demo'dan keyin:
- Supabase service_role kalitni **rotate** qiling
- Telegram bot tokenni BotFather'da yangilang

## Keyingi bosqich (real tizim uchun)
- 3D digital twin, mobil ilova, 1C/ERP integratsiya, ML root-cause tahlil —
  bular haqiqiy qurilma/tashqi tizim talab qiladi, keyingi bosqichda qo'shiladi.
