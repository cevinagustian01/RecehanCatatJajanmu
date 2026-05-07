import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to send Telegram messages
async function sendTelegramMessage(chatId: string, text: string) {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!telegramToken) {
    console.warn("TELEGRAM_BOT_TOKEN is not defined");
    return;
  }
  
  try {
    await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" })
    });
  } catch (e) {
    console.error("Failed to send cron message to telegram", e);
  }
}

export async function GET(request: Request) {
  // Verifikasi token Vercel Cron (Opsional: tambahkan pengecekan CRON_SECRET di env)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ambil semua user beserta dompet-dompetnya
    const users = await prisma.user.findMany({
      include: {
        wallets: true
      }
    });

    for (const user of users) {
      if (!user.telegram_id || user.wallets.length === 0) continue;

      let totalBalance = 0;
      let walletsDetail = "";

      for (const wallet of user.wallets) {
        totalBalance += wallet.current_balance;
        const formattedWalletBal = new Intl.NumberFormat('id-ID', { 
          style: 'currency', 
          currency: 'IDR', 
          minimumFractionDigits: 0 
        }).format(wallet.current_balance);
        walletsDetail += `\n🔸 ${wallet.wallet_name}: ${formattedWalletBal}`;
      }

      const formattedTotal = new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
      }).format(totalBalance);

      const message = `Selamat Pagi! ☕\n\nIni rekap saldo lu hari ini bos:${walletsDetail}\n\n💰 *Total Semua Saldo: ${formattedTotal}*\n\nSemangat cari cuan hari ini! 🚀`;

      await sendTelegramMessage(user.telegram_id, message);
    }

    return NextResponse.json({ ok: true, status: "cron_executed_successfully" });
  } catch (error) {
    console.error("Daily Cron Error:", error);
    return NextResponse.json({ ok: false, status: "cron_failed" }, { status: 500 });
  }
}
