import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import prisma from "@/lib/prisma";

// Initialize OpenAI client, ensuring it picks up OPENAI_BASE_URL
const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to send Telegram messages
async function sendTelegramMessage(chatId: string, text: string) {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  if (telegramToken) {
    try {
      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text })
      });
    } catch (e) {
      console.error("Failed to send message to telegram", e);
    }
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const payload = body as { message?: { text?: string; chat?: { id?: string | number } } };
    const message = payload.message;
    
    // Ignore invalid webhooks, but return 200 OK to stop retries
    if (!message || !message.text || !message.chat || !message.chat.id) {
      return NextResponse.json({ ok: true, status: "ignored" });
    }

    const chatId = message.chat.id.toString();
    const text = message.text;

    console.log(`[Webhook] Menerima pesan dari chatId ${chatId}: "${text}"`);

    // 1. AI Parsing
    const completion = await openai.chat.completions.create({
      model: "MiniMax-M2.7-highspeed",
      messages: [
        {
          role: "system",
          content: `Kamu adalah asisten pencatat keuangan pintar. Ekstrak data dari teks user ke dalam FORMAT JSON INI SAJA: {"amount": number, "type": "expense" | "income", "category": string, "merchant": string, "wallet_name": string}. JANGAN tambahkan teks percakapan apapun, hanya raw JSON. PENTING: Untuk 'amount', ubah angka gaul/singkatan jadi integer asli tanpa simbol (misal: '50rb' atau '50 ribu' menjadi 50000). Default wallet_name adalah "Main Wallet" jika tidak disebutkan.`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const parsedJsonStr = completion.choices[0].message.content;
    console.log(`[Webhook] Raw AI Response dari MiniMax:`, parsedJsonStr);

    let parsedData;
    try {
      if (!parsedJsonStr) throw new Error("Respons AI kosong");
      parsedData = JSON.parse(parsedJsonStr);
    } catch (err: unknown) {
      const parseError = err as Error;
      console.error("[Webhook] Gagal parsing respons AI:", parseError);
      await sendTelegramMessage(chatId, "⚠️ Maaf bos, AI gagal nangkep maksud lu. Coba tulis yang jelas ya!");
      return NextResponse.json({ ok: true, status: "ai_failed" });
    }
    
    console.log('AI Done');

    const amount = Number(parsedData.amount) || 0;
    const type = parsedData.type === "income" ? "income" : "expense";
    const category = parsedData.category || "Lainnya";
    const merchant = parsedData.merchant || "Tidak Diketahui";
    const wallet_name = parsedData.wallet_name || "Main Wallet";

    // 2. Prisma Database Operations
    let user;
    try {
      user = await prisma.user.upsert({
        where: { telegram_id: chatId },
        update: {},
        create: {
          telegram_id: chatId,
          monthly_budget: 1000,
          daily_income: 100,
          persona_mode: "Therapist"
        }
      });
      
      let wallet = await prisma.wallet.findFirst({
        where: { userId: user.id, wallet_name: wallet_name }
      });

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: { userId: user.id, wallet_name: wallet_name, current_balance: 0 }
        });
      }

      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount: amount,
          type: type,
          category: category,
          merchant: merchant
        }
      });

      const newBalance = type === "income" ? wallet.current_balance + amount : wallet.current_balance - amount;
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { current_balance: newBalance }
      });
      
    } catch (err: unknown) {
      const dbError = err as Error;
      console.error("[Webhook] Prisma Error:", dbError?.message);
      await sendTelegramMessage(chatId, `❌ Maaf bos, ada error database: ${dbError?.message}`);
      return NextResponse.json({ ok: true, status: "db_failed" });
    }
    
    console.log('Prisma Done');

    // 3. Send Telegram Confirmation
    const formattedAmount = new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    
    const replyText = `✅ Berhasil dicatat: ${formattedAmount} ke dompet ${wallet_name} (sebagai ${type === "income" ? "Pemasukan" : "Pengeluaran"} di ${merchant} - ${category})`;
    await sendTelegramMessage(chatId, replyText);
    
    console.log('Telegram Sent');

    // Return strictly at the absolute end
    return NextResponse.json({ ok: true, status: "success" });

  } catch (err: unknown) {
    const error = err as Error;
    console.error("Telegram Webhook Global Error:", error);
    return NextResponse.json({ ok: true, status: "internal_error" }); // Return ok true to prevent telegram endless loops
  }
}
