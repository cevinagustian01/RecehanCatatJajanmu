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

async function processWebhook(body: unknown) {
  const payload = body as { message?: { text?: string; chat?: { id?: string | number } } };
  const message = payload.message;
  if (!message || !message.text || !message.chat || !message.chat.id) return;

  const chatId = message.chat.id.toString();
  const text = message.text;

  console.log(`[Webhook] Menerima pesan dari chatId ${chatId}: "${text}"`);

  try {
    // Use OpenAI to parse the natural language text
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
      if (!parsedJsonStr) {
        throw new Error("Respons AI kosong");
      }
      parsedData = JSON.parse(parsedJsonStr);
    } catch (err: unknown) {
      const parseError = err as Error;
      console.error("[Webhook] Gagal parsing respons AI:", parseError);
      await sendTelegramMessage(chatId, "⚠️ Maaf bos, AI gagal nangkep maksud lu. Coba tulis yang jelas ya!");
      return;
    }

    const amount = Number(parsedData.amount) || 0;
    const type = parsedData.type === "income" ? "income" : "expense";
    const category = parsedData.category || "Lainnya";
    const merchant = parsedData.merchant || "Tidak Diketahui";
    const wallet_name = parsedData.wallet_name || "Main Wallet";

    // 1. Upsert User
    const userCreateData = {
      telegram_id: chatId,
      monthly_budget: 1000,
      daily_income: 100,
      persona_mode: "Therapist"
    };
    console.log('Final Data to Prisma (User Create):', userCreateData);
    
    let user;
    try {
      user = await prisma.user.upsert({
        where: { telegram_id: chatId },
        update: {},
        create: userCreateData
      });
    } catch (err: unknown) {
      const dbError = err as Error;
      console.error("[Webhook] Prisma Error User:", dbError?.message);
      await sendTelegramMessage(chatId, `❌ Maaf bos, ada error database (User): ${dbError?.message}`);
      return;
    }

    // 2. Find or Create Wallet
    let wallet;
    try {
      wallet = await prisma.wallet.findFirst({
        where: {
          userId: user.id,
          wallet_name: wallet_name
        }
      });

      if (!wallet) {
        const walletCreateData = {
          userId: user.id,
          wallet_name: wallet_name,
          current_balance: 0
        };
        console.log('Final Data to Prisma (Wallet Create):', walletCreateData);
        wallet = await prisma.wallet.create({
          data: walletCreateData
        });
      }
    } catch (err: unknown) {
      const dbError = err as Error;
      console.error("[Webhook] Prisma Error Wallet:", dbError?.message);
      await sendTelegramMessage(chatId, `❌ Maaf bos, ada error database (Wallet): ${dbError?.message}`);
      return;
    }

    // 3. Create Transaction
    const transactionCreateData = {
      walletId: wallet.id,
      amount: amount,
      type: type,
      category: category,
      merchant: merchant
    };
    console.log('Final Data to Prisma (Transaction Create):', transactionCreateData);
    
    try {
      await prisma.transaction.create({
        data: transactionCreateData
      });
    } catch (err: unknown) {
      const dbError = err as Error;
      console.error("[Webhook] Prisma Error Transaction:", dbError?.message);
      await sendTelegramMessage(chatId, `❌ Maaf bos, ada error database (Transaksi): ${dbError?.message}`);
      return;
    }

    // 4. Update Wallet Balance
    const newBalance = type === "income" 
      ? wallet.current_balance + amount 
      : wallet.current_balance - amount;
      
    const walletUpdateData = { current_balance: newBalance };
    console.log('Final Data to Prisma (Wallet Update):', walletUpdateData);
    
    try {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: walletUpdateData
      });
    } catch (err: unknown) {
      const dbError = err as Error;
      console.error("[Webhook] Prisma Error Wallet Update:", dbError?.message);
      await sendTelegramMessage(chatId, `❌ Maaf bos, ada error saat update saldo dompet: ${dbError?.message}`);
      return;
    }

    // 5. Send confirmation message back to Telegram
    const formattedAmount = new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    
    const replyText = `✅ Berhasil dicatat: ${formattedAmount} ke dompet ${wallet_name} (sebagai ${type === "income" ? "Pemasukan" : "Pengeluaran"} di ${merchant} - ${category})`;
    await sendTelegramMessage(chatId, replyText);

  } catch (err: unknown) {
    const error = err as Error;
    console.error("Telegram Webhook Processing Error:", error);
    await sendTelegramMessage(chatId, `❌ Maaf bos, ada error internal saat memproses datanya.`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Jalankan secara asynchronous tanpa await, agar Telegram tidak timeout dan ngeloop
    processWebhook(body).catch(console.error);

    // Langsung return 200 OK sesegera mungkin
    return NextResponse.json({ ok: true });

  } catch (err: unknown) {
    console.error("Invalid Webhook JSON:", err);
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }
}
