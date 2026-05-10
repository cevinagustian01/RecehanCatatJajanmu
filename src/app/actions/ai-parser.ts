"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseTransactionWithAI(text: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Mock parsing if no API key
      return {
        success: true,
        data: {
          amount: text.match(/\d+/)?.[0] || "",
          merchant: text.substring(0, 20),
          category: "others",
          date: new Date().toISOString().split('T')[0]
        }
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Extract transaction details from the text. Return JSON: { amount: number, category: string, merchant: string, date: string (YYYY-MM-DD), type: 'EXPENSE' | 'INCOME' }. Use IDR currency. Categories: food, transport, entertainment, bills, shopping, health, salary, freelance, investment, others."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return { success: true, data: result };
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return { success: false, message: "Gagal menganalisa teks." };
  }
}
