import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { syncUser } from '@/lib/sync-user';

export async function POST(req: NextRequest) {
  try {
    const { code, telegramId } = await req.json();
    
    if (!code || !telegramId) {
      return NextResponse.json({ success: false, message: 'Missing code or telegramId' }, { status: 400 });
    }

    // Find pending verification with this code
    const verification = await prisma.telegramVerification.findFirst({
      where: {
        code,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!verification) {
      return NextResponse.json({ success: false, message: 'Invalid or expired code' }, { status: 400 });
    }

    // Update user's telegram_id and verified flag
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        telegram_id: telegramId.toString(),
        telegram_verified: true,
        connectTelegram: true
      }
    });

    // Clean up verification code
    await prisma.telegramVerification.deleteMany({
      where: { userId: verification.userId }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[Telegram Verify Error]:', e);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
