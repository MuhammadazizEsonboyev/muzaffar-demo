import { DiagnosticResult, Pump } from '../types/index.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Critical alert bo'lsa Telegram xabari yuboriladi:
 * Nasos nomi / Muammo / Qiymat / Vaqt / Xavf darajasi
 */
export async function sendTelegramAlert(pump: Pump, d: DiagnosticResult): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('[telegram] token/chat_id sozlanmagan — xabar yuborilmadi');
    return false;
  }

  const text =
    `🚨 *KRITIK OGOHLANTIRISH*\n\n` +
    `🔧 *Nasos:* ${escape(pump.name)} (${escape(pump.model)})\n` +
    `📍 *Joylashuv:* ${escape(pump.location ?? '—')}\n` +
    `⚠️ *Muammo:* ${escape(d.title)}\n` +
    `📊 *Qiymat:* ${d.value} (chegara: ${d.threshold})\n` +
    `🕒 *Vaqt:* ${new Date().toLocaleString('uz-UZ')}\n` +
    `🔴 *Xavf darajasi:* ${d.severity.toUpperCase()}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' }),
    });
    if (!res.ok) {
      console.error('[telegram] yuborishda xatolik:', await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[telegram] tarmoq xatosi:', err);
    return false;
  }
}

function escape(s: string): string {
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}
