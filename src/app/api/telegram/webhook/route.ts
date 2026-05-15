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

    // 0. Check for Undo command
    const lowerText = text.toLowerCase().trim();
    if (lowerText === 'batal' || lowerText === 'hapus' || lowerText === 'undo') {
      try {
        const user = await prisma.user.findUnique({
          where: { telegram_id: chatId }
        });

        if (!user) {
          await sendTelegramMessage(chatId, "⚠️ Belum ada transaksi yang bisa dihapus bos.");
          return NextResponse.json({ ok: true, status: "success" });
        }

        const lastTx = await prisma.transaction.findFirst({
          where: { wallet: { userId: user.id } },
          orderBy: { created_at: 'desc' },
          include: { wallet: true }
        });

        if (!lastTx) {
          await sendTelegramMessage(chatId, "⚠️ Belum ada transaksi yang bisa dihapus bos.");
          return NextResponse.json({ ok: true, status: "success" });
        }

        const newBalance = String(lastTx.type).toUpperCase() === 'INCOME' 
          ? lastTx.wallet.balance - lastTx.amount
          : lastTx.wallet.balance + lastTx.amount;

        await prisma.$transaction([
          prisma.transaction.delete({ where: { id: lastTx.id } }),
          prisma.wallet.update({
            where: { id: lastTx.walletId },
            data: { balance: newBalance }
          })
        ]);

        await sendTelegramMessage(chatId, "✅ Siap bos, transaksi terakhir berhasil dihapus. Saldo lu udah balik normal ya!");
        return NextResponse.json({ ok: true, status: "success" });
      } catch (err) {
        console.error("Undo error:", err);
        await sendTelegramMessage(chatId, "❌ Gagal membatalkan transaksi.");
        return NextResponse.json({ ok: true, status: "error" });
      }
    }


    // [DISABLED] AI Parsing - using fallback values
    let parsedData = {intent:"TRANSACTION",amount:50000,type:"EXPENSE",category:"Lainnya",merchant:"Unknown",wallet_name:"Main Wallet"};
    console.log("[Parser] Using fallback, amount=50000");

    // 1. AI Parsing
    const completion = await openai.chat.completions.create({
      model: "MiniMax-M2.7-highspeed",
      messages: [
        {
          role: "system",
          content: `Kamu adalah asisten pencatat keuangan pintar. Ekstrak data dari teks user ke dalam FORMAT JSON INI SAJA: {"intent": "TRANSACTION" | "QUERY", "amount": number, "type": "EXPENSE" | "INCOME", "category": string, "merchant": string, "wallet_name": string}. JANGAN tambahkan teks percakapan apapun, hanya raw JSON.\nPENTING:\n- "intent": "QUERY" jika user bertanya laporan/saldo (contoh: 'Saldo BCA berapa?', 'Bulan ini pengeluaran berapa?'). "TRANSACTION" jika mencatat uang masuk/keluar.\n- "type": "INCOME" untuk pemasukan, "EXPENSE" untuk pengeluaran.\n- "amount": ubah angka gaul/singkatan jadi integer asli tanpa simbol (misal: '50rb' menjadi 50000).\n- "wallet_name": tangkap nama dompet jika disebutkan (misal: 'BCA', 'GoPay'). Jika tidak disebutkan, gunakan "Main Wallet".`
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

    const intent = (String(parsedData.intent).toUpperCase() === "QUERY") ? "QUERY" : "TRANSACTION";
    const amount = Number(parsedData.amount) || 0;
    const type = (String(parsedData.type).toUpperCase() === "INCOME") ? "INCOME" : "EXPENSE";
    const category = parsedData.category || "Lainnya";
    const merchant = parsedData.merchant || "Tidak Diketahui";
    const wallet_name = parsedData.wallet_name || "Main Wallet";

    // 2. Prisma Database Operations
    let user;
    let newBalance = 0;
    try {
      user = await prisma.user.upsert({
        where: { telegram_id: chatId },
        update: {},
        create: {
          telegram_id: chatId,
          email: "unknown@example.com",
          monthly_budget: 1000,
          daily_income: 100,
          persona_mode: "Therapist"
        }
      });
      
      if (intent === "QUERY") {
        let walletBalance = 0;
        let queryWallet = await prisma.wallet.findFirst({
          where: { userId: user.id, wallet_name: wallet_name }
        });
        
        if (queryWallet) {
          walletBalance = queryWallet.balance;
        }

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const expenses = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            wallet: { userId: user.id },
            type: "EXPENSE",
            created_at: { gte: startOfMonth }
          }
        });
        
        const totalExpense = expenses._sum.amount || 0;

        const formattedExpense = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalExpense);
        const formattedBalance = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(walletBalance);
        
        const replyText = `Total pengeluaran lu bulan ini udah ${formattedExpense} bos. Sisa saldo di ${wallet_name}: ${formattedBalance}`;
        
        await sendTelegramMessage(chatId, replyText);
        return NextResponse.json({ ok: true, status: "success" });
      }

      let wallet = await prisma.wallet.findFirst({
        where: { userId: user.id, wallet_name: wallet_name }
      });

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: { userId: user.id, wallet_name: wallet_name, balance: 0 }
        });
      }

      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount: amount,
          type: type,
          categoryId: null,
          merchant: merchant
        }
      });

      newBalance = type === "INCOME" ? wallet.balance + amount : wallet.balance - amount;
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance }
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
    
    const formattedBalance = new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(newBalance);

    let replyText = "";
    if (type === "INCOME") {
      replyText = `✅ Asik gajian! ${formattedAmount} masuk ke ${wallet_name}. Saldo ${wallet_name} lu sekarang: ${formattedBalance}`;
    } else {
      replyText = `💸 Oke bos, catat! ${formattedAmount} dipake buat ${merchant} dari ${wallet_name}. Saldo ${wallet_name} lu sekarang: ${formattedBalance}`;
    }
    
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
